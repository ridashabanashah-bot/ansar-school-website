// Rename underscore-cased policy slugs to hyphen-cased canonical form.
// Idempotent: if the new slug already exists, skip silently.
import { config as dotenvConfig } from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
dotenvConfig({ path: path.resolve(here, '..', '.env') });

const BASE = (process.env.STRAPI_URL ?? '').replace(/\/+$/, '');
const TOKEN = process.env.STRAPI_TOKEN;
if (!BASE || !TOKEN) { console.error('STRAPI_URL/STRAPI_TOKEN missing'); process.exit(2); }

const RENAMES = [
  { from: 'privacy_policy',      to: 'privacy-policy' },
  { from: 'terms_and_condition', to: 'terms-and-conditions' },
  { from: 'refund_policy',       to: 'refund-policy' },
  { from: 'cancellation_policy', to: 'cancellation-policy' },
  { from: 'principles-desk',     to: 'principals-desk' }
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function findBySlug(slug) {
  const res = await fetch(`${BASE}/api/pages?filters[slug][$eq]=${encodeURIComponent(slug)}&pagination[pageSize]=1`, {
    headers: { Authorization: `Bearer ${TOKEN}` }
  });
  if (!res.ok) throw new Error(`find ${slug}: HTTP ${res.status}`);
  const j = await res.json();
  return j.data?.[0] ?? null;
}

async function rename(from, to) {
  const oldEntry = await findBySlug(from);
  if (!oldEntry) {
    console.log(`  – ${from}: not present (skip)`);
    return;
  }
  const newEntry = await findBySlug(to);
  if (newEntry) {
    console.log(`  – ${from} → ${to}: already exists, skipping rename of source`);
    return;
  }
  const res = await fetch(`${BASE}/api/pages/${oldEntry.documentId}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: { slug: to } })
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`PUT ${from}→${to}: HTTP ${res.status} :: ${text.slice(0,200)}`);
  console.log(`  ✓ ${from} → ${to}`);

  // re-publish
  const pub = await fetch(`${BASE}/api/pages/${oldEntry.documentId}?status=published`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: {} })
  });
  if (!pub.ok) console.warn(`    ! publish ${to}: HTTP ${pub.status}`);
  await sleep(1500);
}

async function main() {
  for (const r of RENAMES) {
    try { await rename(r.from, r.to); }
    catch (e) { console.error(`  ! ${r.from}: ${e.message}`); }
  }
  // Verify
  console.log('\nverify:');
  for (const r of RENAMES) {
    const e = await findBySlug(r.to);
    console.log(`  ${r.to}: ${e ? 'OK' : 'MISSING'}`);
  }
}
main().catch((e) => { console.error('FATAL:', e); process.exit(1); });
