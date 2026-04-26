/**
 * cms/scripts/bootstrap.ts
 *
 * One-shot, idempotent local setup for this Strapi 5 project. Run via:
 *
 *     npm run bootstrap            # in cms/
 *     # or:
 *     npm run fresh-setup          # install + build + bootstrap
 *
 * What it does:
 *   1. Ensures cms/.env exists. If missing, generates all required secrets
 *      with crypto.randomBytes(32).base64.
 *   2. Spawns `strapi start` in the background (production mode against
 *      cms/dist/) and polls /_health until the admin server is reachable.
 *   3. Tries to register the super-admin via POST /admin/register-admin.
 *      If a super-admin already exists, the registration call returns 400
 *      and we fall back to POST /admin/login using the cached credentials
 *      from cms/.tokens/admin-creds.txt.
 *   4. Creates a full-access API token named "seed" via POST /admin/api-tokens.
 *      If one already exists with that name, deletes and recreates it so
 *      we can recover the plaintext accessKey (Strapi only returns it on
 *      creation).
 *   5. Writes the token to cms/.tokens/seed-token.txt and admin creds to
 *      cms/.tokens/admin-creds.txt (chmod 600).
 *   6. Updates STRAPI_URL + STRAPI_TOKEN in the repo-root .env, preserving
 *      any other keys.
 *   7. Stops the background Strapi process and exits cleanly.
 *
 * Re-running is safe: existing admin user is preserved, existing API token
 * is rotated, repo-root .env keeps non-managed keys.
 *
 * The HTTP route is used (instead of the programmatic createStrapi) because
 * Strapi 5's ESM entry has resolution quirks under Node 24 + tsx, making
 * direct in-process boot fragile.
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync, chmodSync } from 'node:fs';
import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

// ---------- Paths ----------

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CMS_DIR = path.resolve(__dirname, '..');
const REPO_ROOT = path.resolve(CMS_DIR, '..');
const CMS_ENV = path.join(CMS_DIR, '.env');
const ROOT_ENV = path.join(REPO_ROOT, '.env');
const TOKENS_DIR = path.join(CMS_DIR, '.tokens');
const SEED_TOKEN_FILE = path.join(TOKENS_DIR, 'seed-token.txt');
const ADMIN_CREDS_FILE = path.join(TOKENS_DIR, 'admin-creds.txt');
// Use the strapi.js entrypoint via the current node binary directly. This
// avoids spawning a Windows .cmd shim, which on win32 + Node 24 either hits
// EINVAL or leaks the underlying node process when we try to kill it.
const STRAPI_JS = path.join(CMS_DIR, 'node_modules', '@strapi', 'strapi', 'bin', 'strapi.js');

const STRAPI_URL = process.env.STRAPI_LOCAL_URL ?? 'http://localhost:1337';
const ADMIN_EMAIL = (process.env.BOOTSTRAP_ADMIN_EMAIL ?? 'admin@ansarschoolpdi.local').trim();

// ---------- Types ----------

interface AdminCreds {
  email: string;
  password: string;
}
interface RegisterAdminResponse {
  data?: { token: string; user: { email: string } };
  error?: { name: string; message: string };
}
interface LoginResponse {
  data?: { token: string; user: { email: string } };
  error?: { name: string; message: string; status?: number };
}
interface ApiTokenResponse {
  data?: { id: number; name: string; accessKey?: string };
  error?: { name: string; message: string };
}
interface ApiTokenListResponse {
  data?: { id: number; name: string }[];
}

// ---------- Helpers ----------

function rand32(): string {
  return crypto.randomBytes(32).toString('base64');
}

function randPassword(): string {
  // Strapi accepts most passwords ≥8 chars; this satisfies upper/lower/digit/special.
  return 'Aa1!' + crypto.randomBytes(18).toString('base64').replace(/[+/=]/g, 'x');
}

function writeFileMode600(file: string, contents: string): void {
  writeFileSync(file, contents, 'utf8');
  try { chmodSync(file, 0o600); } catch { /* best-effort on Windows */ }
}

function parseEnvText(text: string): Map<string, string> {
  const out = new Map<string, string>();
  for (const line of text.split(/\r?\n/)) {
    if (!line || /^\s*#/.test(line)) continue;
    const m = line.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/i);
    if (!m) continue;
    out.set(m[1], m[2]);
  }
  return out;
}

function serializeEnv(map: Map<string, string>): string {
  const lines: string[] = [];
  for (const [k, v] of map) lines.push(`${k}=${v}`);
  return lines.join('\n') + '\n';
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

// ---------- Step 1: ensure cms/.env ----------

function ensureCmsEnv(): void {
  if (existsSync(CMS_ENV)) {
    console.log('[bootstrap] cms/.env exists, leaving as-is');
    return;
  }
  const lines = [
    'HOST=0.0.0.0',
    'PORT=1337',
    `APP_KEYS=${rand32()},${rand32()}`,
    `API_TOKEN_SALT=${rand32()}`,
    `ADMIN_JWT_SECRET=${rand32()}`,
    `TRANSFER_TOKEN_SALT=${rand32()}`,
    `JWT_SECRET=${rand32()}`,
    `ENCRYPTION_KEY=${rand32()}`,
    'DATABASE_CLIENT=sqlite',
    'DATABASE_FILENAME=.tmp/data.db',
    ''
  ];
  writeFileMode600(CMS_ENV, lines.join('\n'));
  console.log('[bootstrap] generated cms/.env with fresh secrets');
}

// ---------- Step 2: start strapi + wait for /_health ----------

interface StrapiHandle {
  child: ChildProcessWithoutNullStreams;
  stop(): Promise<void>;
}

async function startStrapi(): Promise<StrapiHandle> {
  if (!existsSync(STRAPI_JS)) {
    throw new Error(`strapi.js not found at ${STRAPI_JS} — run \`npm install\` first`);
  }
  if (!existsSync(path.join(CMS_DIR, 'dist'))) {
    throw new Error('cms/dist not found — run `npm run build` before bootstrap');
  }

  // Strapi's local upload provider refuses to start without public/uploads/.
  const uploadsDir = path.join(CMS_DIR, 'public', 'uploads');
  if (!existsSync(uploadsDir)) {
    mkdirSync(uploadsDir, { recursive: true });
    writeFileSync(path.join(uploadsDir, '.gitkeep'), '');
  }

  console.log('[bootstrap] starting Strapi (background, mode=start)…');
  const child = spawn(process.execPath, [STRAPI_JS, 'start'], {
    cwd: CMS_DIR,
    env: { ...process.env, NODE_ENV: 'production' },
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: false
  });

  let logBuffer = '';
  child.stdout.on('data', (d: Buffer) => { logBuffer += d.toString(); });
  child.stderr.on('data', (d: Buffer) => { logBuffer += d.toString(); });

  const stop = async (): Promise<void> => {
    if (child.exitCode !== null || child.pid === undefined) return;
    if (process.platform === 'win32') {
      // taskkill /T /F kills the whole tree; child.kill() on Windows only
      // sends SIGKILL to the launcher, not its descendants.
      const pidStr = String(child.pid);
      const killer = spawn('taskkill', ['/PID', pidStr, '/T', '/F'], { stdio: 'ignore' });
      await new Promise<void>((resolve) => {
        killer.once('exit', () => resolve());
        setTimeout(resolve, 5000);
      });
    } else {
      child.kill('SIGTERM');
    }
    await new Promise<void>((resolve) => {
      const timer = setTimeout(() => {
        try { child.kill('SIGKILL'); } catch { /* */ }
        resolve();
      }, 5000);
      if (child.exitCode !== null) { clearTimeout(timer); resolve(); return; }
      child.once('exit', () => { clearTimeout(timer); resolve(); });
    });
  };

  // Poll for readiness.
  const deadline = Date.now() + 90_000;
  let ready = false;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(`Strapi exited early (code ${child.exitCode}). Last logs:\n${logBuffer.slice(-1000)}`);
    }
    try {
      const r = await fetch(`${STRAPI_URL}/admin/init`, { method: 'GET' });
      if (r.status >= 200 && r.status < 500) {
        ready = true;
        break;
      }
    } catch {
      /* not up yet */
    }
    await sleep(1000);
  }
  if (!ready) {
    await stop();
    throw new Error(`Strapi failed to become ready within 90s. Last logs:\n${logBuffer.slice(-1500)}`);
  }
  console.log('[bootstrap] Strapi is reachable');
  return { child, stop };
}

// ---------- Step 3: ensure admin (register or login) ----------

async function ensureAdminCreds(): Promise<{ token: string; creds: AdminCreds; created: boolean }> {
  // Try to register.
  const password = (process.env.BOOTSTRAP_ADMIN_PASSWORD ?? randPassword()).trim();
  const registerBody = {
    email: ADMIN_EMAIL,
    password,
    firstname: 'Admin',
    lastname: 'User'
  };
  const regRes = await fetch(`${STRAPI_URL}/admin/register-admin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(registerBody)
  });
  const regJson = (await regRes.json().catch(() => ({}))) as RegisterAdminResponse;
  if (regRes.ok && regJson.data?.token) {
    console.log(`[bootstrap] registered super-admin: ${ADMIN_EMAIL}`);
    return {
      token: regJson.data.token,
      creds: { email: ADMIN_EMAIL, password },
      created: true
    };
  }

  // Already-registered path: log in using cached creds.
  if (!existsSync(ADMIN_CREDS_FILE)) {
    throw new Error(
      `Admin already exists but cms/.tokens/admin-creds.txt is missing. ` +
      `Set BOOTSTRAP_ADMIN_EMAIL + BOOTSTRAP_ADMIN_PASSWORD env vars and re-run, ` +
      `or delete cms/.tmp/data.db to start clean.`
    );
  }
  const cached = readFileSync(ADMIN_CREDS_FILE, 'utf8').trim().split(/\r?\n/);
  if (cached.length < 2) throw new Error('cms/.tokens/admin-creds.txt is malformed');
  const cachedEmail = cached[0].trim();
  const cachedPassword = cached[1].trim();
  const loginRes = await fetch(`${STRAPI_URL}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: cachedEmail, password: cachedPassword })
  });
  const loginJson = (await loginRes.json().catch(() => ({}))) as LoginResponse;
  if (!loginRes.ok || !loginJson.data?.token) {
    throw new Error(
      `Login failed for cached admin (${cachedEmail}): HTTP ${loginRes.status} — ${loginJson.error?.message ?? 'unknown error'}`
    );
  }
  console.log(`[bootstrap] logged in as existing admin: ${cachedEmail}`);
  return {
    token: loginJson.data.token,
    creds: { email: cachedEmail, password: cachedPassword },
    created: false
  };
}

// ---------- Step 4: create (or rotate) seed API token ----------

async function ensureSeedToken(jwt: string): Promise<string> {
  // List existing tokens; delete any named "seed" to rotate.
  const listRes = await fetch(`${STRAPI_URL}/admin/api-tokens`, {
    headers: { Authorization: `Bearer ${jwt}` }
  });
  if (listRes.ok) {
    const listJson = (await listRes.json().catch(() => ({}))) as ApiTokenListResponse;
    const existing = listJson.data?.find((t) => t.name === 'seed');
    if (existing) {
      console.log('[bootstrap] rotating existing "seed" token');
      const delRes = await fetch(`${STRAPI_URL}/admin/api-tokens/${existing.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${jwt}` }
      });
      if (!delRes.ok) {
        throw new Error(`Failed to delete existing seed token: HTTP ${delRes.status}`);
      }
    }
  }

  const createBody = {
    name: 'seed',
    description: 'Used by scrape/seed.ts',
    type: 'full-access',
    lifespan: null,
    permissions: []
  };
  const createRes = await fetch(`${STRAPI_URL}/admin/api-tokens`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${jwt}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(createBody)
  });
  const createJson = (await createRes.json().catch(() => ({}))) as ApiTokenResponse;
  if (!createRes.ok || !createJson.data?.accessKey) {
    throw new Error(
      `Failed to create seed API token: HTTP ${createRes.status} — ${createJson.error?.message ?? 'unknown'}`
    );
  }
  return createJson.data.accessKey;
}

// ---------- Step 5: write tokens + update root .env ----------

function writeTokenFiles(token: string, creds: AdminCreds, savePassword: boolean): void {
  if (!existsSync(TOKENS_DIR)) mkdirSync(TOKENS_DIR, { recursive: true });
  writeFileMode600(SEED_TOKEN_FILE, token + '\n');
  if (savePassword) {
    writeFileMode600(ADMIN_CREDS_FILE, `${creds.email}\n${creds.password}\n`);
  }
}

function updateRootEnv(token: string): void {
  const map = existsSync(ROOT_ENV) ? parseEnvText(readFileSync(ROOT_ENV, 'utf8')) : new Map<string, string>();
  map.set('STRAPI_URL', STRAPI_URL);
  map.set('STRAPI_TOKEN', token);
  writeFileMode600(ROOT_ENV, serializeEnv(map));
  console.log('[bootstrap] wrote STRAPI_URL + STRAPI_TOKEN to repo-root .env');
}

// ---------- Main ----------

async function main(): Promise<void> {
  ensureCmsEnv();

  const handle = await startStrapi();
  let admin: { token: string; creds: AdminCreds; created: boolean };
  let seedToken: string;
  try {
    admin = await ensureAdminCreds();
    seedToken = await ensureSeedToken(admin.token);
  } finally {
    await handle.stop();
  }

  writeTokenFiles(seedToken, admin.creds, admin.created);
  updateRootEnv(seedToken);

  const tail = seedToken.slice(-4);
  console.log('\n[bootstrap] DONE');
  console.log(`  admin user: ${admin.creds.email}${admin.created ? ' (newly created)' : ' (already existed)'}`);
  console.log(`  api token:  …${tail} (saved to cms/.tokens/seed-token.txt)`);
  if (admin.created) {
    console.log(`  password:   ${admin.creds.password}`);
    console.log('              (also saved to cms/.tokens/admin-creds.txt — keep it private)');
  } else {
    console.log('  password:   (admin already existed, password unchanged)');
  }
}

main().catch((err: unknown) => {
  console.error('[bootstrap] FATAL:', err instanceof Error ? err.message : err);
  if (err instanceof Error && err.stack) console.error(err.stack.split('\n').slice(0, 6).join('\n'));
  process.exit(1);
});
