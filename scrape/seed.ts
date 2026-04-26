/**
 * scrape/seed.ts — re-runnable, idempotent seeder for the Ansar School Strapi 5 CMS.
 *
 * Setup:
 *   1. Strapi must be running (default http://localhost:1337) and you must
 *      have completed the admin onboarding so an admin user exists.
 *   2. In Strapi → Settings → API Tokens → Create new (type: Full access),
 *      copy the token and put these in a `.env` at the repo root:
 *        STRAPI_URL=http://localhost:1337
 *        STRAPI_TOKEN=<your-full-access-token>
 *   3. Run from repo root:
 *        npx tsx scrape/seed.ts                # do everything
 *        npx tsx scrape/seed.ts --dry-run      # print payloads, no writes
 *        npx tsx scrape/seed.ts --only=pages   # only this stage
 *        npx tsx scrape/seed.ts --reset        # delete existing seeded entries first
 *
 *   --only accepts a comma-separated list of stage names:
 *     media, site, home, about, academics, admissions, pages, documents, publish
 *
 * Notes on Strapi 5:
 *   - Collection types are mutated by documentId (`/api/<plural>/<documentId>`),
 *     not numeric id.
 *   - Single types use the singular path: `/api/site-setting`, `/api/home-page`, …
 *   - All POSTs create a draft. We publish via `PUT /api/<plural>/<documentId>?status=published`
 *     and `PUT /api/<single>?status=published` for single types. If your Strapi
 *     build rejects that (some 5.x versions did), entries remain as drafts and the
 *     final report flags it.
 *   - Media dedupe primary key is the local cache file scrape/.seed-cache.json
 *     (gitignored). Secondary fallback: filename + size lookup against
 *     `/api/upload/files`.
 */

import { config as dotenvConfig } from 'dotenv';
import { readFile, readdir, writeFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// ---------- Types ----------

type Json = string | number | boolean | null | Json[] | { [k: string]: Json };
type StrapiData = Record<string, Json | undefined>;

interface StrapiResponseList<T = StrapiEntry> {
  data: T[];
  meta?: { pagination?: { page: number; pageSize: number; pageCount: number; total: number } };
}
interface StrapiResponseOne<T = StrapiEntry> {
  data: T;
}
interface StrapiEntry {
  id: number;
  documentId: string;
  [k: string]: unknown;
}
interface StrapiFile {
  id: number;
  documentId?: string;
  hash: string;
  name: string;
  size: number;
  url: string;
  ext: string;
  mime: string;
}

interface SeedCache {
  // localPathRel → file id
  uploads: Record<string, number>;
}

// Raw shape stored in scrape/nav.json by the crawler.
interface NavEntryRaw {
  text: string;
  href: string | null;
  children?: NavEntryRaw[];
}
interface NavJson {
  topNav: NavEntryRaw[] | null;
  footerNav: NavEntryRaw[] | null;
}
// Frontend-facing shape (matches frontend/src/lib/types.ts NavItem).
interface NavItem {
  label: string;
  href: string;
  children: NavItem[];
}

interface SitemapEntry {
  url: string;
  slug: string | null;
  title: string | null;
  depth: number;
  parent: string | null;
  kind: string;
  wordCount: number | null;
  status: number | null;
  pdfPath: string | null;
}

interface ImageManifestEntry {
  originalUrl: string;
  localPath: string | null;
  alt: string;
  width: number | null;
  height: number | null;
  pageSlugs: string[];
}

interface ContactJson {
  phones: string[];
  emails: string[];
  addressLines: string[];
  socialLinks: string[];
  mapEmbeds: string[];
}

interface PageMeta {
  slug: string;
  url: string;
  title: string;
  metaDescription: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogType: string;
  canonical: string;
  h1: string[];
  h2: string[];
  breadcrumbs: string[];
  iframeSrcs: string[];
  wordCount: number;
}

interface Frontmatter {
  slug: string;
  url: string;
  title: string;
  meta_description: string;
  og_image: string;
  canonical: string;
  h1: string[];
  depth: number;
  parent: string;
  word_count: number;
}

type Stage =
  | 'media'
  | 'site'
  | 'home'
  | 'about'
  | 'academics'
  | 'admissions'
  | 'pages'
  | 'documents'
  | 'publish';

interface Flags {
  dryRun: boolean;
  only: Set<Stage> | null;
  reset: boolean;
}

interface FailureRecord {
  url: string;
  status: number;
  body: string;
}

// ---------- Args + env ----------

function parseArgs(): Flags {
  const argv = process.argv.slice(2);
  const flags: Flags = { dryRun: false, only: null, reset: false };
  for (const a of argv) {
    if (a === '--dry-run') flags.dryRun = true;
    else if (a === '--reset') flags.reset = true;
    else if (a.startsWith('--only=')) {
      const list = a
        .slice('--only='.length)
        .split(',')
        .map((s) => s.trim().toLowerCase()) as Stage[];
      flags.only = new Set(list);
    } else if (a === '--help' || a === '-h') {
      console.log('Usage: npx tsx scrape/seed.ts [--dry-run] [--reset] [--only=stage,stage]');
      console.log('Stages: media, site, home, about, academics, admissions, pages, documents, publish');
      process.exit(0);
    } else {
      console.error(`unknown arg: ${a}`);
      process.exit(2);
    }
  }
  return flags;
}

// Load .env from the repo root (where cms/scripts/bootstrap.ts writes
// STRAPI_URL + STRAPI_TOKEN). Falls back to scrape/.env and process.env.
{
  const here = path.dirname(fileURLToPath(import.meta.url));
  const rootEnv = path.resolve(here, '..', '.env');
  const localEnv = path.join(here, '.env');
  dotenvConfig({ path: rootEnv });
  dotenvConfig({ path: localEnv });
}

const STRAPI_URL = (process.env.STRAPI_URL ?? 'http://localhost:1337').replace(/\/+$/, '');
const STRAPI_TOKEN = process.env.STRAPI_TOKEN;

if (!STRAPI_TOKEN) {
  console.error('STRAPI_TOKEN missing in env. Add it to .env at the repo root.');
  process.exit(2);
}
const TOKEN: string = STRAPI_TOKEN;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCRAPE = __dirname;
const PAGES = path.join(SCRAPE, 'pages');
const META = path.join(SCRAPE, 'meta');
const IMAGES = path.join(SCRAPE, 'images');
const PDFS = path.join(SCRAPE, 'pdfs');
const CACHE_FILE = path.join(SCRAPE, '.seed-cache.json');

const PLACEHOLDER_EMAIL_RX = /(^|[^a-z0-9])(example|test|lorem|noreply@)/i;

const failures: FailureRecord[] = [];

// ---------- HTTP ----------

function shouldRun(stage: Stage, flags: Flags): boolean {
  return flags.only === null || flags.only.has(stage);
}

async function api<T>(method: string, route: string, body?: unknown, query?: Record<string, string>): Promise<T> {
  const qs = query
    ? '?' +
      Object.entries(query)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
        .join('&')
    : '';
  const url = `${STRAPI_URL}${route}${qs}`;
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) {
    const trim = text.slice(0, 200);
    failures.push({ url: `${method} ${route}${qs}`, status: res.status, body: trim });
    throw new Error(`HTTP ${res.status} ${method} ${route}${qs} :: ${trim}`);
  }
  return text ? (JSON.parse(text) as T) : (undefined as T);
}

async function uploadFile(absPath: string): Promise<StrapiFile> {
  const buf = await readFile(absPath);
  const name = path.basename(absPath);
  const mime = guessMime(name);
  const fd = new FormData();
  // Strapi's `files` field accepts a Blob with a filename.
  fd.append('files', new Blob([buf], { type: mime }), name);
  const res = await fetch(`${STRAPI_URL}/api/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}` },
    body: fd,
  });
  const text = await res.text();
  if (!res.ok) {
    failures.push({ url: `POST /api/upload (${name})`, status: res.status, body: text.slice(0, 200) });
    throw new Error(`upload failed ${res.status} ${name}: ${text.slice(0, 200)}`);
  }
  const parsed = JSON.parse(text) as StrapiFile[];
  if (!Array.isArray(parsed) || parsed.length === 0) throw new Error(`upload returned no files for ${name}`);
  return parsed[0];
}

function guessMime(name: string): string {
  const ext = path.extname(name).toLowerCase();
  switch (ext) {
    case '.png': return 'image/png';
    case '.jpg':
    case '.jpeg': return 'image/jpeg';
    case '.gif': return 'image/gif';
    case '.webp': return 'image/webp';
    case '.svg': return 'image/svg+xml';
    case '.pdf': return 'application/pdf';
    default: return 'application/octet-stream';
  }
}

// ---------- Cache ----------

async function loadCache(): Promise<SeedCache> {
  if (!existsSync(CACHE_FILE)) return { uploads: {} };
  try {
    const raw = await readFile(CACHE_FILE, 'utf8');
    const parsed = JSON.parse(raw) as Partial<SeedCache>;
    return { uploads: parsed.uploads ?? {} };
  } catch {
    return { uploads: {} };
  }
}

async function saveCache(cache: SeedCache): Promise<void> {
  await writeFile(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf8');
}

// ---------- Frontmatter parsing ----------

function parseFrontmatter(md: string): { fm: Frontmatter; body: string } {
  const m = md.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) {
    return {
      fm: {
        slug: '', url: '', title: '', meta_description: '', og_image: '',
        canonical: '', h1: [], depth: 0, parent: '', word_count: 0,
      },
      body: md,
    };
  }
  const fmRaw = m[1];
  const body = m[2];
  const fm: Frontmatter = {
    slug: '', url: '', title: '', meta_description: '', og_image: '',
    canonical: '', h1: [], depth: 0, parent: '', word_count: 0,
  };
  for (const line of fmRaw.split(/\r?\n/)) {
    const km = line.match(/^([a-z_]+):\s*(.*)$/i);
    if (!km) continue;
    const key = km[1] as keyof Frontmatter;
    const val = km[2];
    if (key === 'h1') {
      try {
        fm.h1 = JSON.parse(val) as string[];
      } catch {
        fm.h1 = [];
      }
    } else if (key === 'depth' || key === 'word_count') {
      fm[key] = Number.parseInt(val, 10) || 0;
    } else if (
      key === 'slug' || key === 'url' || key === 'title' ||
      key === 'meta_description' || key === 'og_image' ||
      key === 'canonical' || key === 'parent'
    ) {
      // strip surrounding JSON quotes if present
      try {
        if (val.startsWith('"')) fm[key] = JSON.parse(val) as string;
        else fm[key] = val;
      } catch {
        fm[key] = val;
      }
    }
  }
  return { fm, body };
}

// ---------- Markdown helpers ----------

function firstHeading(body: string, level: number): string | null {
  const prefix = '#'.repeat(level);
  const rx = new RegExp(`^${prefix}\\s+(.+)$`, 'm');
  const m = body.match(rx);
  return m ? m[1].trim() : null;
}

function firstParagraph(body: string): string | null {
  const stripped = body.replace(/^---[\s\S]*?---/m, '').trim();
  for (const block of stripped.split(/\n\s*\n/)) {
    const t = block.trim();
    if (!t) continue;
    if (t.startsWith('#')) continue;
    if (t.startsWith('![')) continue;
    if (t.startsWith('[')) continue;
    return t.replace(/\s+/g, ' ');
  }
  return null;
}

function splitBySections(body: string): { heading: string; body: string }[] {
  const lines = body.split(/\r?\n/);
  const out: { heading: string; body: string }[] = [];
  let current: { heading: string; body: string } | null = null;
  for (const line of lines) {
    const m = line.match(/^#{2,4}\s+(.+)$/);
    if (m) {
      if (current) out.push(current);
      current = { heading: m[1].trim(), body: '' };
    } else if (current) {
      current.body += line + '\n';
    }
  }
  if (current) out.push(current);
  return out.map((s) => ({ heading: s.heading, body: s.body.trim() }));
}

function titleize(slug: string): string {
  return slug
    .replace(/[-_]+/g, ' ')
    .replace(/\.\w+$/, '')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

// ---------- Cleaners ----------

function cleanLabel(s: string): string {
  return s.replace(/\s+/g, ' ').trim();
}

function cleanNav(nav: NavEntryRaw[] | null | undefined): NavItem[] {
  if (!nav) return [];
  return nav
    .map((n) => ({
      label: cleanLabel(n.text || ''),
      href: n.href ? cleanLabel(n.href) : '',
      children: n.children ? cleanNav(n.children) : [],
    }))
    .filter((n) => n.label && n.href);
}

function isPlaceholderEmail(e: string): boolean {
  return PLACEHOLDER_EMAIL_RX.test(e) || e.toLowerCase() === 'example@mail.com';
}

// ---------- Section mapping ----------

function sectionForSlug(slug: string): 'about' | 'academics' | 'admissions' | 'facilities' | 'policy' | 'info' | 'other' {
  const s = slug.toLowerCase();
  if (/^(privacy_policy|terms_and_condition|refund_policy|cancellation_policy)$/.test(s)) return 'policy';
  if (/^(examination|attendance|classwise-strength|teaching-staff|transfer_certificate|school-days-hours|school-timing|working-hours|academics)$/.test(s)) return 'academics';
  if (/^career$/.test(s)) return 'info';
  if (/^(vision-mission|principles-desk|about|our-campus|contact)$/.test(s)) return 'about';
  if (/^(facilities|our-campus|activities|curricular-activities)$/.test(s)) return 'facilities';
  if (/^(admission|gallery|news-and-events)$/.test(s)) return 'info';
  return 'other';
}

function categoryForFile(filename: string): 'certificate' | 'policy' | 'fees' | 'calendar' | 'sample-tc' | 'other' {
  const f = filename.toLowerCase();
  // Strip the trailing -<8 hex>.pdf hash suffix the crawler appends.
  const stem = filename.replace(/-[a-f0-9]{8}\.pdf$/i, '').replace(/\.pdf$/i, '');
  // Keyword categories first — these win over the all-caps name fallback.
  if (/sample.*tc|tc[-_]\d+/.test(f)) return 'sample-tc';
  if (/academic[-_]?calendar|^calendar|year-plan/.test(f)) return 'calendar';
  if (/fee[-_ ]?structure|fee_structure/.test(f)) return 'fees';
  if (/privacy|terms|refund|cancellation/.test(f)) return 'policy';
  if (/deo|noc|affiliation|recognition|fire|safety|land|building|pta|compound|self.?declaration|non-properitery/.test(f)) return 'certificate';
  // Student-name TCs: original filename was ALL-CAPS, no other category keyword
  // matched (NAZA_FARIN_GAFOOR, RITHAL_1_, ABHAM_KOTTAMPARA_1_, …).
  if (/^[A-Z][A-Z0-9_]+(_\d_?)?$/.test(stem)) return 'sample-tc';
  return 'other';
}

const CATEGORY_ORDER: Record<string, number> = {
  certificate: 1, policy: 2, fees: 3, calendar: 4, 'sample-tc': 5, other: 6,
};

// ---------- Single-type upsert ----------

async function upsertSingle(
  singularName: string,
  payload: StrapiData,
  flags: Flags
): Promise<{ documentId: string | null }> {
  if (flags.dryRun) {
    printDry(`PUT /api/${singularName}`, { data: payload });
    return { documentId: null };
  }
  // Strapi 5: PUT /api/<single> upserts the single type.
  const res = await api<StrapiResponseOne>('PUT', `/api/${singularName}`, { data: payload });
  return { documentId: res.data.documentId };
}

async function publishSingle(singularName: string, flags: Flags): Promise<void> {
  if (flags.dryRun) return;
  try {
    // No-op publish via PUT with status=published (works in Strapi 5.6+).
    await api<StrapiResponseOne>('PUT', `/api/${singularName}`, { data: {} }, { status: 'published' });
  } catch {
    /* leave as draft, reported in failures */
  }
}

// ---------- Collection upsert by slug ----------

async function findBySlug(plural: string, slug: string): Promise<StrapiEntry | null> {
  const res = await api<StrapiResponseList>(
    'GET',
    `/api/${plural}`,
    undefined,
    {
      'filters[slug][$eq]': slug,
      'pagination[pageSize]': '1',
      // include both draft + published in matches so we don't double-create
      'status': 'draft',
    }
  );
  return res.data[0] ?? null;
}

async function upsertCollectionBySlug(
  plural: string,
  payload: StrapiData & { slug: string },
  flags: Flags
): Promise<{ documentId: string | null; created: boolean }> {
  if (flags.dryRun) {
    printDry(`UPSERT /api/${plural} (slug=${payload.slug})`, { data: payload });
    return { documentId: null, created: false };
  }
  const existing = await findBySlug(plural, payload.slug);
  if (existing) {
    const upd = await api<StrapiResponseOne>('PUT', `/api/${plural}/${existing.documentId}`, {
      data: payload,
    });
    return { documentId: upd.data.documentId, created: false };
  }
  const created = await api<StrapiResponseOne>('POST', `/api/${plural}`, { data: payload });
  return { documentId: created.data.documentId, created: true };
}

async function publishCollectionEntry(plural: string, documentId: string, flags: Flags): Promise<void> {
  if (flags.dryRun) return;
  try {
    await api<StrapiResponseOne>('PUT', `/api/${plural}/${documentId}`, { data: {} }, { status: 'published' });
  } catch {
    /* leave draft */
  }
}

async function deleteAllInCollection(plural: string, flags: Flags): Promise<number> {
  if (flags.dryRun) {
    console.log(`[dry-run] would DELETE all /api/${plural}`);
    return 0;
  }
  let removed = 0;
  // page through and delete
  for (let page = 1; page <= 50; page++) {
    const res = await api<StrapiResponseList>('GET', `/api/${plural}`, undefined, {
      'pagination[pageSize]': '100',
      'pagination[page]': String(page),
      'status': 'draft',
    });
    if (res.data.length === 0) break;
    for (const entry of res.data) {
      await api('DELETE', `/api/${plural}/${entry.documentId}`);
      removed++;
    }
  }
  return removed;
}

// ---------- Logging helpers ----------

function printDry(label: string, payload: unknown): void {
  let s = JSON.stringify(payload, null, 2);
  if (s.length > 2000) s = s.slice(0, 2000) + `\n…[truncated, total ${s.length} chars]`;
  console.log(`\n[dry-run] ${label}\n${s}`);
}

// ---------- Stage: media ----------

interface MediaResult {
  imageMap: Record<string, number>; // filename → strapi file id
  pdfMap: Record<string, number>;   // pdfs/<filename> → strapi file id
  uploaded: number;
  reused: number;
}

async function stageMedia(flags: Flags, cache: SeedCache): Promise<MediaResult> {
  console.log('\n== media ==');
  const result: MediaResult = { imageMap: {}, pdfMap: {}, uploaded: 0, reused: 0 };

  const pairs: { dir: string; relPrefix: string; targetMap: Record<string, number> }[] = [
    { dir: IMAGES, relPrefix: 'images', targetMap: result.imageMap },
    { dir: PDFS, relPrefix: 'pdfs', targetMap: result.pdfMap },
  ];

  for (const { dir, relPrefix, targetMap } of pairs) {
    if (!existsSync(dir)) continue;
    const files = (await readdir(dir)).filter((f) => !f.startsWith('.') && f !== 'manifest.json');
    for (const f of files) {
      const abs = path.join(dir, f);
      const relKey = `${relPrefix}/${f}`;

      const cached = cache.uploads[relKey];
      if (cached) {
        targetMap[f] = cached;
        result.reused++;
        continue;
      }

      if (flags.dryRun) {
        console.log(`[dry-run] upload ${relKey}`);
        targetMap[f] = -1;
        continue;
      }

      // secondary: try to find by exact filename in Strapi
      let fileId: number | null = null;
      try {
        const found = await api<StrapiResponseList<StrapiFile>>(
          'GET',
          '/api/upload/files',
          undefined,
          { 'filters[name][$eq]': f, 'pagination[pageSize]': '1' }
        );
        if (Array.isArray(found.data) && found.data.length > 0 && typeof found.data[0].id === 'number') {
          const candidate = found.data[0];
          const localSize = (await stat(abs)).size;
          if (candidate.size && Math.abs((candidate.size as unknown as number) * 1024 - localSize) < localSize * 0.05) {
            // Strapi reports size in KB-ish floats; tolerate 5% diff.
            fileId = candidate.id;
          } else {
            fileId = candidate.id;
          }
        }
      } catch {
        /* search failed; fall through to upload */
      }

      if (fileId === null) {
        try {
          const up = await uploadFile(abs);
          fileId = up.id;
          result.uploaded++;
        } catch (e) {
          console.error(`  ! upload failed: ${relKey}: ${(e as Error).message}`);
          continue;
        }
      } else {
        result.reused++;
      }

      targetMap[f] = fileId;
      cache.uploads[relKey] = fileId;
      await saveCache(cache);
    }
  }

  console.log(`media: ${result.uploaded} uploaded, ${result.reused} reused`);
  return result;
}

// ---------- Stage: site-setting ----------

async function stageSite(flags: Flags, contact: ContactJson, nav: NavJson): Promise<void> {
  console.log('\n== site-setting ==');
  const phones = [...new Set(contact.phones.map(cleanLabel))].filter(Boolean);
  const emails = [...new Set(contact.emails.map((e) => e.trim()))]
    .filter((e) => !!e && !isPlaceholderEmail(e));
  const social = contact.socialLinks;
  const facebookUrl = social.find((u) => /facebook\.com/i.test(u)) ?? '';
  const instagramUrl = social.find((u) => /instagram\.com/i.test(u)) ?? '';
  const youtubeUrl = social.find((u) => /youtube\.com|youtu\.be/i.test(u)) ?? '';

  const address = pickAddress(contact.addressLines);
  const mapEmbedUrl = contact.mapEmbeds[0] ?? '';

  const payload: StrapiData = {
    schoolName: 'Ansar School Padinjarangadi',
    contactPhone: phones[0] ?? '',
    contactEmail: emails[0] ?? '',
    address,
    facebookUrl,
    instagramUrl,
    youtubeUrl,
    mapEmbedUrl,
    navigation: pruneNav(cleanNav(nav.topNav)) as unknown as Json,
    footerNavigation: pruneNav(cleanNav(nav.footerNav)) as unknown as Json,
  };

  await upsertSingle('site-setting', payload, flags);
  console.log('site-setting: upserted');
}

function pickAddress(lines: string[]): string {
  // Pick short, all-caps-ish address fragments (place names, district, PIN)
  // and join them with commas. Skip prose paragraphs.
  const fragments = lines
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && l.length <= 80)
    .filter((l) => /^[A-Z0-9][A-Z0-9\s,.&\-]+$/.test(l) || /\bPIN\b/i.test(l));
  if (fragments.length === 0) {
    return normalizeAddress(lines.find((l) => /Padinjarangadi/i.test(l)) ?? '');
  }
  const joined = fragments.join(', ');
  return normalizeAddress(joined);
}

function normalizeAddress(raw: string): string {
  if (!raw) return '';
  const collapsed = raw.replace(/\s+/g, ' ').trim();
  const parts = collapsed.split(/,\s*/).map((s) => s.trim()).filter(Boolean);
  const seen = new Set<string>();
  return parts
    .filter((p) => {
      const k = p.toLowerCase();
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    })
    .join(', ');
}

function isDocumentLink(href: string): boolean {
  return /\.pdf(\?|$)/i.test(href) || /\/(uploads|documents)\//i.test(href);
}

function pruneNav(items: NavItem[]): NavItem[] {
  return items
    .map((it) => ({
      ...it,
      children: it.children ? pruneNav(it.children) : [],
    }))
    .filter((it) => !isDocumentLink(it.href))
    .filter((it) => (it.children?.length ?? 0) > 0 || (!!it.href && it.href !== '#'));
}

// ---------- Page loaders ----------

async function loadPageMd(slug: string): Promise<{ fm: Frontmatter; body: string } | null> {
  const p = path.join(PAGES, `${slug}.md`);
  if (!existsSync(p)) return null;
  return parseFrontmatter(await readFile(p, 'utf8'));
}

async function loadPageHtml(slug: string): Promise<string | null> {
  const p = path.join(PAGES, `${slug}.html`);
  if (!existsSync(p)) return null;
  return readFile(p, 'utf8');
}

async function loadMeta(slug: string): Promise<PageMeta | null> {
  const p = path.join(META, `${slug}.json`);
  if (!existsSync(p)) return null;
  return JSON.parse(await readFile(p, 'utf8')) as PageMeta;
}

// ---------- Stage: home-page ----------

async function stageHome(flags: Flags): Promise<void> {
  console.log('\n== home-page ==');
  const home = await loadPageMd('home');
  if (!home) {
    console.warn('home.md not found, skipping');
    return;
  }
  const sections = splitBySections(home.body);
  const heroTitle = firstHeading(home.body, 2) ?? 'Welcome to Ansar School Padinjarangadi';
  const heroSubtitle = firstParagraph(home.body) ?? '';
  const intro = sections.find((s) => /^our vision$|^vision$|welcome/i.test(s.heading));
  const introHeading = intro?.heading ?? sections[0]?.heading ?? '';
  const introBody = intro?.body ?? sections[0]?.body ?? '';

  const payload: StrapiData = {
    heroTitle,
    heroSubtitle,
    introHeading,
    introBody,
    ctaTitle: 'Apply for Admission',
    ctaBody: 'We welcome admission inquiries throughout the academic year.',
    ctaButtonLabel: 'Start your application',
    ctaButtonHref: '/admissions',
  };
  await upsertSingle('home-page', payload, flags);
  console.log('home-page: upserted');
}

// ---------- Stage: about-page ----------

async function stageAbout(flags: Flags): Promise<void> {
  console.log('\n== about-page ==');
  const about = await loadPageMd('about');
  const principal = await loadPageMd('principles-desk');
  if (!about) {
    console.warn('about.md missing, skipping');
    return;
  }
  const sections = splitBySections(about.body);
  let vision = '';
  let mission = '';
  let history = '';
  for (const s of sections) {
    const h = s.heading.toLowerCase();
    if (h.includes('vision')) vision = s.body;
    else if (h.includes('mission')) mission = s.body;
    else history += (history ? '\n\n' : '') + (s.heading ? `## ${s.heading}\n\n` : '') + s.body;
  }
  if (!vision && !mission && !history) {
    history = about.body.trim();
  }

  const payload: StrapiData = {
    title: 'About Our School',
    vision,
    mission,
    history,
    principalName: principal?.fm.title ? 'Principal' : 'Principal',
    principalMessage: principal?.body ?? '',
  };
  await upsertSingle('about-page', payload, flags);
  console.log('about-page: upserted');
}

// ---------- Stage: academics-page ----------

async function stageAcademics(flags: Flags): Promise<void> {
  console.log('\n== academics-page ==');
  const facilities = await loadPageMd('facilities');
  if (!facilities) {
    console.warn('facilities.md missing, skipping academics-page');
    return;
  }
  const intro = firstParagraph(facilities.body) ?? '';

  const payload: StrapiData = {
    title: 'Academics & Facilities',
    intro,
  };
  await upsertSingle('academics-page', payload, flags);
  console.log('academics-page: upserted (programs/facilities components left empty for editorial fill)');
}

// ---------- Stage: admissions-page ----------

async function stageAdmissions(flags: Flags): Promise<void> {
  console.log('\n== admissions-page ==');
  const payload: StrapiData = {
    title: 'Admissions',
    intro: 'Admission inquiries are welcome throughout the academic year. Please contact the school office for application forms and eligibility details.',
    ageEligibility: '',
    feeNote: '',
  };
  await upsertSingle('admissions-page', payload, flags);
  console.log('admissions-page: upserted');
}

// ---------- Stage: pages collection ----------

const COVERED_BY_SINGLES = new Set([
  'home', 'about', 'principles-desk', 'admission', 'facilities',
]);

async function stagePages(
  flags: Flags,
  sitemap: SitemapEntry[],
  imgManifest: ImageManifestEntry[],
  media: MediaResult
): Promise<{ created: number; updated: number; thin: string[]; documentIds: string[] }> {
  console.log('\n== pages collection ==');
  const counts = { created: 0, updated: 0 };
  const thin: string[] = [];
  const documentIds: string[] = [];

  const pageFiles = (await readdir(PAGES)).filter((f) => f.endsWith('.md'));
  for (const f of pageFiles) {
    const slug = f.replace(/\.md$/, '');
    if (COVERED_BY_SINGLES.has(slug)) continue;

    const md = await loadPageMd(slug);
    if (!md) continue;
    const html = await loadPageHtml(slug);
    const meta = await loadMeta(slug);

    const sourceUrl = sitemap.find((s) => s.slug === slug)?.url ?? md.fm.url;
    const heading = (meta?.h2 ?? []).find((h) => h.trim().length > 1) ?? null;
    const title = heading ?? titleize(slug);

    // Hero image: pick first image referenced from this page that's also in our uploads.
    let heroImageId: number | null = null;
    const onPage = imgManifest.filter((i) => i.pageSlugs.includes(slug));
    for (const img of onPage) {
      if (!img.localPath) continue;
      const filename = path.basename(img.localPath);
      const id = media.imageMap[filename];
      if (typeof id === 'number' && id > 0) {
        heroImageId = id;
        break;
      }
    }

    // Attachments: PDFs whose filename starts with the slug or matches a heuristic.
    const attachIds: number[] = [];
    for (const [pdfName, id] of Object.entries(media.pdfMap)) {
      const lower = pdfName.toLowerCase();
      if (lower.startsWith(slug.toLowerCase())) attachIds.push(id);
      else if (slug === 'classwise-strength' && /fee[-_ ]?structure/.test(lower)) attachIds.push(id);
      else if (slug === 'transfer_certificate' && /sample.?tc|^[a-z]+_\d/.test(lower)) attachIds.push(id);
    }

    const wordCount = md.fm.word_count;
    const isThin = wordCount < 20;
    if (isThin) thin.push(slug);

    const payload: StrapiData & { slug: string } = {
      title,
      slug,
      section: sectionForSlug(slug),
      body: md.body.trim(),
      rawHtml: html ?? '',
      sourceUrl,
      order: 0,
    };
    if (heroImageId !== null && heroImageId > 0) {
      payload.heroImage = heroImageId;
    }
    if (attachIds.length > 0) {
      payload.attachments = attachIds;
    }

    const r = await upsertCollectionBySlug('pages', payload, flags);
    if (r.created) counts.created++;
    else counts.updated++;
    if (r.documentId) documentIds.push(r.documentId);
  }

  // Stash admission form HTML (the original form-only page) on a `page` entry
  // so nothing is lost.
  const admissionHtml = await loadPageHtml('admission');
  if (admissionHtml) {
    const slug = 'admissions-form';
    const payload: StrapiData & { slug: string } = {
      title: 'Admissions Form (legacy)',
      slug,
      section: 'admissions',
      body: '',
      rawHtml: admissionHtml,
      sourceUrl: 'https://ansarschoolpdi.in/admission.php',
      order: 100,
    };
    const r = await upsertCollectionBySlug('pages', payload, flags);
    if (r.created) counts.created++;
    else counts.updated++;
    if (r.documentId) documentIds.push(r.documentId);
    thin.push(slug);
  }

  console.log(`pages: ${counts.created} created, ${counts.updated} updated; ${thin.length} thin/raw-html-only`);
  return { ...counts, thin, documentIds };
}

// ---------- Stage: documents collection ----------

async function stageDocuments(
  flags: Flags,
  media: MediaResult
): Promise<{ created: number; updated: number; documentIds: string[] }> {
  console.log('\n== documents collection ==');
  const counts = { created: 0, updated: 0 };
  const documentIds: string[] = [];

  const entries = Object.entries(media.pdfMap);
  // sort: category order, then filename order
  entries.sort(([a], [b]) => {
    const ca = categoryForFile(a);
    const cb = categoryForFile(b);
    const oa = CATEGORY_ORDER[ca] ?? 99;
    const ob = CATEGORY_ORDER[cb] ?? 99;
    if (oa !== ob) return oa - ob;
    return a.localeCompare(b);
  });

  let i = 0;
  for (const [pdfName, fileId] of entries) {
    const stem = pdfName.replace(/-[a-f0-9]{8}\.pdf$/i, '').replace(/\.pdf$/i, '');
    const title = titleize(stem);
    const slug = stem
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const category = categoryForFile(pdfName);
    const sortOrder = (CATEGORY_ORDER[category] ?? 99) * 10 + i;
    i++;

    const payload: StrapiData & { slug: string } = {
      title,
      slug,
      category,
      file: fileId,
      sortOrder,
    };
    const r = await upsertCollectionBySlug('documents', payload, flags);
    if (r.created) counts.created++;
    else counts.updated++;
    if (r.documentId) documentIds.push(r.documentId);
  }

  console.log(`documents: ${counts.created} created, ${counts.updated} updated`);
  return { ...counts, documentIds };
}

// ---------- Main ----------

async function main(): Promise<void> {
  const flags = parseArgs();
  console.log(`STRAPI_URL = ${STRAPI_URL}`);
  console.log(`flags: dryRun=${flags.dryRun}, reset=${flags.reset}, only=${flags.only ? [...flags.only].join(',') : '(all)'}`);

  // Sanity-check: Strapi reachable.
  if (!flags.dryRun) {
    try {
      const res = await fetch(`${STRAPI_URL}/api/site-setting`, {
        headers: { Authorization: `Bearer ${TOKEN}` },
      });
      if (!res.ok && res.status !== 404) {
        throw new Error(`HTTP ${res.status}`);
      }
    } catch (e) {
      console.error(`Cannot reach Strapi at ${STRAPI_URL}: ${(e as Error).message}`);
      process.exit(1);
    }
  }

  const cache = await loadCache();

  const sitemap = JSON.parse(await readFile(path.join(SCRAPE, 'sitemap.json'), 'utf8')) as SitemapEntry[];
  const contact = JSON.parse(await readFile(path.join(SCRAPE, 'contact.json'), 'utf8')) as ContactJson;
  const nav = JSON.parse(await readFile(path.join(SCRAPE, 'nav.json'), 'utf8')) as NavJson;
  const imgManifest = JSON.parse(await readFile(path.join(IMAGES, 'manifest.json'), 'utf8')) as ImageManifestEntry[];

  if (flags.reset) {
    if (shouldRun('pages', flags)) {
      const removed = await deleteAllInCollection('pages', flags);
      console.log(`reset: removed ${removed} from /api/pages`);
    }
    if (shouldRun('documents', flags)) {
      const removed = await deleteAllInCollection('documents', flags);
      console.log(`reset: removed ${removed} from /api/documents`);
    }
  }

  const media: MediaResult = shouldRun('media', flags)
    ? await stageMedia(flags, cache)
    : { imageMap: {}, pdfMap: {}, uploaded: 0, reused: 0 };

  if (shouldRun('site', flags)) await stageSite(flags, contact, nav);
  if (shouldRun('home', flags)) await stageHome(flags);
  if (shouldRun('about', flags)) await stageAbout(flags);
  if (shouldRun('academics', flags)) await stageAcademics(flags);
  if (shouldRun('admissions', flags)) await stageAdmissions(flags);

  const pageResult = shouldRun('pages', flags)
    ? await stagePages(flags, sitemap, imgManifest, media)
    : { created: 0, updated: 0, thin: [], documentIds: [] };

  const docResult = shouldRun('documents', flags)
    ? await stageDocuments(flags, media)
    : { created: 0, updated: 0, documentIds: [] };

  if (shouldRun('publish', flags) && !flags.dryRun) {
    console.log('\n== publish ==');
    await publishSingle('site-setting', flags);
    await publishSingle('home-page', flags);
    await publishSingle('about-page', flags);
    await publishSingle('academics-page', flags);
    await publishSingle('admissions-page', flags);
    for (const id of pageResult.documentIds) await publishCollectionEntry('pages', id, flags);
    for (const id of docResult.documentIds) await publishCollectionEntry('documents', id, flags);
    console.log('publish: attempted on all upserted entries');
  }

  // ---- Final report ----
  console.log('\n=========== SEED REPORT ===========');
  console.log('SEEDED:');
  console.log(`  site-setting:    ${shouldRun('site', flags) ? 'upserted' : 'skipped'}`);
  console.log(`  home-page:       ${shouldRun('home', flags) ? 'upserted' : 'skipped'}`);
  console.log(`  about-page:      ${shouldRun('about', flags) ? 'upserted' : 'skipped'}`);
  console.log(`  academics-page:  ${shouldRun('academics', flags) ? 'upserted' : 'skipped'}`);
  console.log(`  admissions-page: ${shouldRun('admissions', flags) ? 'upserted' : 'skipped'}`);
  console.log(`  pages:           ${pageResult.created} created, ${pageResult.updated} updated`);
  console.log(`  documents:       ${docResult.created} created, ${docResult.updated} updated`);
  console.log(`  media files:     ${media.uploaded} uploaded, ${media.reused} reused from cache`);
  if (pageResult.thin.length) {
    console.log('\nSKIPPED / WARNINGS — thin pages (rawHtml only, need editorial review in Strapi):');
    for (const s of pageResult.thin) console.log(`  - ${s}`);
  }
  if (failures.length) {
    console.log(`\nFAILURES (${failures.length}):`);
    for (const f of failures) console.log(`  - ${f.url} → ${f.status} :: ${f.body}`);
    process.exit(1);
  }
  console.log('===================================\n');
}

main().catch((e: unknown) => {
  console.error('FATAL:', (e as Error).message);
  if (failures.length) {
    console.error(`\nFAILURES (${failures.length}):`);
    for (const f of failures) console.error(`  - ${f.url} → ${f.status} :: ${f.body}`);
  }
  process.exit(1);
});
