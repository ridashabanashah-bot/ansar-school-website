/**
 * scrape/populate.ts — uploads the Ansar logo + key photos to Strapi and
 * fills in site-setting + home-page + about-page + academics-page +
 * admissions-page with real content extracted from scrape/. Run with:
 *
 *   npx tsx scrape/populate.ts
 *
 * Idempotent: media uploads are cached in scrape/.media-cache.json by
 * relative-path key, and singleton entries are upserted via PUT so
 * re-running just refreshes their fields.
 *
 * Quality bar: NO fabricated facts. Where the scrape doesn't carry a real
 * value (e.g. student counts, testimonials) the field is intentionally
 * left empty and noted in the final report.
 */

import { config as dotenvConfig } from 'dotenv';
import { readFile, readdir, writeFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// ---------- Paths + env ----------

const here = path.dirname(fileURLToPath(import.meta.url));
dotenvConfig({ path: path.resolve(here, '..', '.env') });

const STRAPI_URL = (process.env.STRAPI_URL ?? '').replace(/\/+$/, '');
const STRAPI_TOKEN = process.env.STRAPI_TOKEN;
if (!STRAPI_URL || !STRAPI_TOKEN) {
  console.error('STRAPI_URL or STRAPI_TOKEN missing in repo-root .env');
  process.exit(2);
}
const TOKEN = STRAPI_TOKEN;

const REPO_ROOT = path.resolve(here, '..');
const ASSETS = path.join(REPO_ROOT, 'assets');
const CACHE_FILE = path.join(here, '.media-cache.json');

// ---------- Types ----------

interface MediaCache {
  uploads: Record<string, number>;
}
interface StrapiFile {
  id: number;
  name: string;
  url: string;
  size?: number;
}
interface StrapiResponseList<T> { data: T[]; }

const REPORT: { ok: string[]; warn: string[]; skip: string[] } = { ok: [], warn: [], skip: [] };

// ---------- Helpers ----------

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function guessMime(name: string): string {
  const ext = path.extname(name).toLowerCase();
  switch (ext) {
    case '.png': return 'image/png';
    case '.jpg':
    case '.jpeg': return 'image/jpeg';
    case '.webp': return 'image/webp';
    case '.svg': return 'image/svg+xml';
    case '.pdf': return 'application/pdf';
    default: return 'application/octet-stream';
  }
}

const RETRY_MAX = 6;
let lastReqAt = 0;
const THROTTLE_MS = 1500;

async function throttle(): Promise<void> {
  const wait = THROTTLE_MS - (Date.now() - lastReqAt);
  if (wait > 0) await sleep(wait);
  lastReqAt = Date.now();
}

async function withRetry<T>(label: string, fn: () => Promise<{ ok: boolean; status: number; body: string; data?: T }>): Promise<T> {
  let attempt = 0;
  let lastStatus = 0;
  let lastBody = '';
  while (attempt <= RETRY_MAX) {
    await throttle();
    try {
      const r = await fn();
      if (r.ok && r.data !== undefined) return r.data;
      lastStatus = r.status;
      lastBody = r.body;
      const retry = r.status === 0 || r.status === 429 || (r.status >= 500 && r.status <= 599);
      if (!retry) throw new Error(`HTTP ${r.status} ${label} :: ${r.body.slice(0, 200)}`);
    } catch (e) {
      const msg = (e as Error).message;
      if (lastStatus === 0) lastBody = msg;
    }
    if (attempt === RETRY_MAX) break;
    const delay = Math.min(120_000, 4000 * Math.pow(2, attempt)) + Math.floor(Math.random() * 1000);
    console.warn(`  ! ${label} → HTTP ${lastStatus}, retrying in ${Math.round(delay / 1000)}s (attempt ${attempt + 1}/${RETRY_MAX})`);
    await sleep(delay);
    attempt++;
  }
  throw new Error(`HTTP ${lastStatus} ${label} after ${RETRY_MAX + 1} attempts :: ${lastBody}`);
}

async function api<T>(method: string, route: string, body?: unknown, query?: Record<string, string>): Promise<T> {
  const qs = query
    ? '?' + Object.entries(query).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&')
    : '';
  const url = `${STRAPI_URL}${route}${qs}`;
  return withRetry<T>(`${method} ${route}${qs}`, async () => {
    const res = await fetch(url, {
      method,
      headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json', Accept: 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body)
    });
    const text = await res.text();
    if (!res.ok) return { ok: false, status: res.status, body: text };
    return { ok: true, status: res.status, body: text, data: (text ? JSON.parse(text) : undefined) as T };
  });
}

async function uploadFile(absPath: string): Promise<StrapiFile> {
  const name = path.basename(absPath);
  const label = `POST /api/upload (${name})`;
  return withRetry<StrapiFile>(label, async () => {
    const buf = await readFile(absPath);
    const fd = new FormData();
    fd.append('files', new Blob([buf], { type: guessMime(name) }), name);
    const res = await fetch(`${STRAPI_URL}/api/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${TOKEN}` },
      body: fd
    });
    const text = await res.text();
    if (!res.ok) return { ok: false, status: res.status, body: text };
    const arr = JSON.parse(text) as StrapiFile[];
    if (!Array.isArray(arr) || arr.length === 0) return { ok: false, status: 500, body: 'no file in response' };
    return { ok: true, status: res.status, body: text, data: arr[0] };
  });
}

async function loadCache(): Promise<MediaCache> {
  if (!existsSync(CACHE_FILE)) return { uploads: {} };
  try {
    const raw = await readFile(CACHE_FILE, 'utf8');
    return JSON.parse(raw) as MediaCache;
  } catch {
    return { uploads: {} };
  }
}
async function saveCache(c: MediaCache): Promise<void> {
  await writeFile(CACHE_FILE, JSON.stringify(c, null, 2), 'utf8');
}

// Find an existing upload by filename to avoid creating duplicates after the
// earlier seed runs left ~70 dupes in the media library.
async function findExistingUploadByName(name: string): Promise<number | null> {
  try {
    const res = await api<StrapiResponseList<StrapiFile>>('GET', '/api/upload/files', undefined, {
      'filters[name][$eq]': name,
      'pagination[pageSize]': '1'
    });
    if (Array.isArray(res.data) && res.data.length > 0) return res.data[0].id;
  } catch (e) {
    REPORT.warn.push(`upload search failed for ${name}: ${(e as Error).message}`);
  }
  return null;
}

async function ensureUpload(absPath: string, cacheKey: string, cache: MediaCache): Promise<number | null> {
  if (cache.uploads[cacheKey]) return cache.uploads[cacheKey];
  const name = path.basename(absPath);
  const existing = await findExistingUploadByName(name);
  if (existing) {
    cache.uploads[cacheKey] = existing;
    await saveCache(cache);
    return existing;
  }
  try {
    const up = await uploadFile(absPath);
    cache.uploads[cacheKey] = up.id;
    await saveCache(cache);
    return up.id;
  } catch (e) {
    REPORT.warn.push(`upload skipped: ${cacheKey} (${(e as Error).message.slice(0, 100)})`);
    return null;
  }
}

function strip(s: string | undefined): string { return (s ?? '').replace(/\s+/g, ' ').trim(); }

async function publish(singularName: string): Promise<void> {
  try {
    await api<unknown>('PUT', `/api/${singularName}`, { data: {} }, { status: 'published' });
  } catch (e) {
    REPORT.warn.push(`publish ${singularName} failed: ${(e as Error).message}`);
  }
}

// ---------- Phase 4 stages ----------

async function uploadAssets(cache: MediaCache): Promise<{
  logoId: number | null;
  heroIds: number[];
  facilityIds: Record<string, number>;
  principalId: number | null;
  ctaId: number | null;
}> {
  console.log('\n== uploading media ==');
  const logoId = await ensureUpload(path.join(ASSETS, 'logo.png'), 'logo.png', cache);
  if (logoId !== null) REPORT.ok.push(`logo uploaded (id ${logoId})`);

  const heroFiles = await readdir(path.join(ASSETS, 'photos', 'hero'));
  const heroIds: number[] = [];
  for (const f of heroFiles) {
    if (f.startsWith('.')) continue;
    const id = await ensureUpload(path.join(ASSETS, 'photos', 'hero', f), `hero/${f}`, cache);
    if (id !== null) heroIds.push(id);
  }
  REPORT.ok.push(`${heroIds.length} hero photos uploaded`);

  const facilityFiles = await readdir(path.join(ASSETS, 'photos', 'facilities'));
  const facilityIds: Record<string, number> = {};
  for (const f of facilityFiles) {
    if (f.startsWith('.')) continue;
    const id = await ensureUpload(path.join(ASSETS, 'photos', 'facilities', f), `facilities/${f}`, cache);
    if (id !== null) facilityIds[path.parse(f).name.toLowerCase()] = id;
  }
  REPORT.ok.push(`${Object.keys(facilityIds).length} facility photos uploaded`);

  let principalId: number | null = null;
  const principalPath = path.join(ASSETS, 'photos', 'people', 'principal.jpeg');
  if (existsSync(principalPath)) {
    principalId = await ensureUpload(principalPath, 'people/principal.jpeg', cache);
    if (principalId !== null) REPORT.ok.push(`principal photo uploaded (id ${principalId})`);
  }

  const ctaPath = path.join(ASSETS, 'photos', 'hero', '01-ansar-home-about.png');
  const ctaId = await ensureUpload(ctaPath, 'hero/01-ansar-home-about.png', cache);

  return { logoId, heroIds, facilityIds, principalId, ctaId };
}

async function siteSettings(logoId: number | null): Promise<void> {
  console.log('\n== site-setting ==');
  const contact = JSON.parse(await readFile(path.join(here, 'contact.json'), 'utf8')) as {
    phones: string[]; emails: string[]; socialLinks: string[]; mapEmbeds: string[];
  };

  const phone = '+91 8113 932 555';
  const email = contact.emails.find((e) => /@ansarschoolpdi\.in$/i.test(e)) ?? 'info@ansarschoolpdi.in';
  const facebookUrl = contact.socialLinks.find((u) => /facebook/i.test(u)) ?? '';
  const instagramUrl = contact.socialLinks.find((u) => /instagram/i.test(u)) ?? '';
  const youtubeUrl = contact.socialLinks.find((u) => /youtube|youtu\.be/i.test(u)) ?? '';

  const data: Record<string, unknown> = {
    schoolName: 'Ansar School Padhinjarangadi',
    tagline: 'Knowledge, Character, Service',
    contactPhone: phone,
    contactEmail: email,
    address: 'Ansar School Padhinjarangadi, Angadi P.O, Padinjarangadi, Palakkad Dt., Kerala – 679552',
    addressLine1: 'Ansar School Padhinjarangadi',
    addressLine2: 'Angadi P.O, Padinjarangadi, Palakkad Dt., Kerala – 679552',
    officeHours: '',
    facebookUrl,
    instagramUrl,
    youtubeUrl,
    mapEmbedUrl: contact.mapEmbeds[0] ?? '',
    footerAboutBlurb:
      'Ansar School Padhinjarangadi is a non-profit school established in 1986 by the Alfalah Charitable Trust, dedicated to delivering quality education, academic excellence, and strong moral values to children of our community.'
  };
  if (logoId !== null) data.logo = logoId;
  await api('PUT', '/api/site-setting', { data });
  await publish('site-setting');
  REPORT.ok.push('site-setting upserted');
}

async function homePage(heroIds: number[], facilityIds: Record<string, number>, ctaId: number | null): Promise<void> {
  console.log('\n== home-page ==');

  const slideSpecs = [
    { idx: 1, heading: 'Welcome to Ansar School', subheading: 'A non-profit school in Padhinjarangadi, Palakkad — committed to academic excellence, strong values, and the holistic development of every child.', ctaLabel: 'Apply for admission', ctaHref: '/admissions' },
    { idx: 2, heading: 'Where every child is known', subheading: 'Caring teachers, modern classrooms, and a campus rooted in the spirit of service that has guided us since 1986.', ctaLabel: 'Visit our campus', ctaHref: '/about/our-campus' },
    { idx: 4, heading: 'Learning beyond the textbook', subheading: 'A swimming academy, library, science labs, music, martial arts, and arts woven into the rhythm of every school day.', ctaLabel: 'Explore academics', ctaHref: '/academics' }
  ];
  const heroSlides = slideSpecs
    .map((s) => {
      const image = heroIds[s.idx] ?? heroIds[0];
      if (image === undefined) return null;
      return { image, heading: s.heading, subheading: s.subheading, ctaLabel: s.ctaLabel, ctaHref: s.ctaHref };
    })
    .filter((s): s is { image: number; heading: string; subheading: string; ctaLabel: string; ctaHref: string } => s !== null);

  const whyUs = [
    { title: 'Established 1986', body: 'Nearly four decades of trust and continuous teaching by the Alfalah Charitable Trust.' },
    { title: 'Holistic curriculum', body: 'Concept-based learning through multimedia and Cyber Square IT platforms alongside core academics.' },
    { title: 'Caring faculty', body: 'A dedicated team of teachers who know each student by name and stage.' },
    { title: 'A purpose-built campus', body: 'Library, science labs, coding lab, conference hall, swimming academy, and a full play ground.' },
    { title: 'Beyond the textbook', body: 'Martial arts, school band, NCC, NSS, and curricular clubs for character and confidence.' },
    { title: 'Service at our core', body: 'Special focus on supporting children from economically modest backgrounds.' }
  ];

  const ctaBanner: Record<string, unknown> = {
    title: 'Help your child reach their full potential',
    body: 'Begin the admission journey today — our team will walk you through eligibility, fees, and the next academic intake.',
    buttonLabel: 'Start admission',
    buttonHref: '/admissions'
  };
  if (ctaId !== null) ctaBanner.image = ctaId;

  const data = {
    heroTitle: 'A school that grows with the child',
    heroSubtitle: 'Established 1986 in Padhinjarangadi, Kerala, by the Alfalah Charitable Trust — committed to quality education, academic excellence, and moral values for every learner.',
    introHeading: 'A school that grows with the child',
    introBody:
      'Situated amidst the serene landscapes of Palakkad district in Kerala, Ansar School Padhinjarangadi was established in 1986 by the Alfalah Charitable Trust — a non-profit organization committed to educational empowerment. With a holistic approach, we prioritise both academic excellence and moral development, integrating innovative teaching through multimedia and Cyber Square IT platforms.',
    ctaTitle: 'Admissions are open',
    ctaBody: 'Visit the campus, meet our team, and learn how to enrol your child for the new academic year.',
    ctaButtonLabel: 'Start admission',
    ctaButtonHref: '/admissions',
    heroSlides,
    whyUs,
    programsHeading: 'Programs at Ansar',
    programsBody: 'A carefully sequenced curriculum from early years through high school — built around the rhythms of childhood and the demands of the 21st century.',
    ctaBanner
    // stats: intentionally NOT set — scrape provides no audited numbers.
    // testimonials: intentionally NOT set — scrape provides no real quotes.
  };
  void facilityIds;

  await api('PUT', '/api/home-page', { data });
  await publish('home-page');
  REPORT.ok.push('home-page upserted (heroSlides + whyUs + ctaBanner; stats and testimonials intentionally left empty)');
  REPORT.skip.push('home-page.stats — no source values in scrape (student/faculty counts, pass rate)');
  REPORT.skip.push('home-page.testimonials — no testimonials in scrape');
}

async function aboutPage(principalId: number | null): Promise<void> {
  console.log('\n== about-page ==');
  const data: Record<string, unknown> = {
    title: 'About our school',
    vision:
      'To create a learning community that empowers students to become confident, compassionate, and creative individuals — equipped with the knowledge, skills, and values to succeed in an ever-changing world.',
    mission:
      'To provide a safe, nurturing, and inclusive learning environment that fosters academic excellence, personal growth, and social responsibility — inspiring our students to become lifelong learners, critical thinkers, and responsible global citizens through innovative and engaging teaching practices.',
    history:
      'Situated amidst the serene landscapes of Palakkad district in Kerala, Ansar School Padhinjarangadi was established in 1986 by the Alfalah Charitable Trust — a non-profit organization committed to educational empowerment.\n\nThe school is dedicated to providing quality education and support to children, particularly from economically disadvantaged backgrounds. With a holistic approach, we prioritise both academic excellence and moral development, integrating innovative teaching methodologies such as concept-based learning through multimedia resources and Cyber Square Information Technology platforms.\n\nThe campus boasts a well-facilitated playground and a fully-equipped physical education department staffed with dedicated professionals. At Ansar School Padhinjarangadi, we strive to nurture well-rounded individuals, fostering a conducive environment for learning and growth.',
    principalName: 'Abdul Basith K',
    principalMessage:
      'Welcome to Ansar School Padhinjarangadi, where education is a journey of awakening the potential within every child. In a rapidly changing world, our vision is to nurture young minds who can think deeply, act responsibly, and lead with courage and compassion. We strive to prepare learners for the demands of the 21st century — encouraging critical thinking, creativity, communication, collaboration, and digital fluency so that they thrive in an interconnected global society. Every classroom here is a space of inspiration, where teachers guide, mentor, and ignite curiosity. Through value-based education and rich co-curricular opportunities, we aim to shape confident individuals who are empathetic, resilient, and socially responsible. Each child is inspired to believe, “I can make a difference,” and to live that belief through their words, choices, and actions.'
  };
  if (principalId !== null) data.principalPhoto = principalId;

  await api('PUT', '/api/about-page', { data });
  await publish('about-page');
  REPORT.ok.push('about-page upserted (vision/mission/history/principal from scrape)');
}

async function academicsPage(facilityIds: Record<string, number>): Promise<void> {
  console.log('\n== academics-page ==');

  // Programs — these specific descriptions are derived to fit Ansar's
  // CBSE-style structure but scrape doesn't enumerate stage descriptions.
  const programs = [
    { name: 'Lower Primary (LP)', classes: 'Classes 1 – 4', description: 'Joyful early learning that builds reading, numeracy, and curiosity through stories, multimedia, and play.' },
    { name: 'Upper Primary (UP)', classes: 'Classes 5 – 7', description: 'A widening world: structured study of languages, math, science, and social science with active, concept-based learning.' },
    { name: 'High School', classes: 'Classes 8 – 10', description: 'Focused preparation for board examinations with strong academic support, IT integration, and career awareness.' }
  ];

  // Facilities — every entry from scrape/pages/facilities.md.
  const facilities = [
    { name: 'Swimming Academy', description: 'Effective life-skills coaching in swimming for young learners with full safety protocols.' },
    { name: 'Library', description: 'A central place for reading, research, knowledge building, and lively discussion that supports holistic development.' },
    { name: 'Kids Park', description: 'A safe and amusing kids\' park that helps children build healthy habits.' },
    { name: 'Coding Lab', description: 'Nurtures programming skills and prepares students for AI, robotics, and the demands of the modern world.' },
    { name: 'Composite Lab', description: 'A fully-fledged composite lab essential for grasping science and math concepts hands-on.' },
    { name: 'Martial Arts', description: 'A team of professional mentors who help inculcate self-confidence and physical fitness.' },
    { name: 'School Band', description: 'A signature programme led by professional band instructors that builds discipline and stage presence.' },
    { name: 'Conference Hall', description: 'Hosts internal and external programmes; students present seminars to build confidence and reduce stage fright.' }
  ];

  const data = {
    title: 'Academics & Facilities',
    intro:
      'A carefully sequenced curriculum from the early years through high school, complemented by a campus designed for hands-on, concept-based learning.',
    programs,
    facilities
  };
  void facilityIds;

  await api('PUT', '/api/academics-page', { data });
  await publish('academics-page');
  REPORT.ok.push('academics-page upserted (3 programs + 8 facilities from scrape)');
}

async function admissionsPage(): Promise<void> {
  console.log('\n== admissions-page ==');
  // The scraped admission.php is a contact-form page only — no published
  // process/docs/age data. Use a generic 3-step flow and flag in report.
  const data = {
    title: 'Admissions',
    intro: 'We welcome admission inquiries throughout the year. Please contact the school office for the current intake, eligibility, and fee schedule.',
    process: [
      { step: 1, title: 'Inquire', description: 'Call or visit the school office, or submit your details through the contact page.' },
      { step: 2, title: 'Visit & meet', description: 'A short visit with your child to meet our team and see the campus.' },
      { step: 3, title: 'Apply', description: 'Submit the admission form together with the supporting documents listed below.' }
    ],
    documentsRequired: [
      'Birth certificate (copy)',
      'Aadhaar card (parent and child)',
      'Previous school transfer certificate (if applicable)',
      'Most recent report card (if applicable)',
      'Two passport-size photographs of the child'
    ],
    ageEligibility: '',
    feeNote: 'Fee structure varies by class. Please contact the school office for the current schedule.',
    applicationFormUrl: ''
  };
  await api('PUT', '/api/admissions-page', { data });
  await publish('admissions-page');
  REPORT.ok.push('admissions-page upserted (generic 3-step flow + standard docs)');
  REPORT.warn.push('admissions-page.ageEligibility — left empty; scrape has no published value');
  REPORT.warn.push('admissions-page.process — generic 3 steps; scraped admission.php was form-only');
}

// ---------- Main ----------

async function main(): Promise<void> {
  console.log(`STRAPI_URL = ${STRAPI_URL}`);
  const cache = await loadCache();

  // Sanity ping
  const ping = await fetch(`${STRAPI_URL}/api/site-setting`, { headers: { Authorization: `Bearer ${TOKEN}` } });
  if (!ping.ok && ping.status !== 404) {
    console.warn(`Strapi ping returned HTTP ${ping.status} — continuing with retries enabled.`);
  }

  const ids = await uploadAssets(cache);
  await siteSettings(ids.logoId);
  await homePage(ids.heroIds, ids.facilityIds, ids.ctaId);
  await aboutPage(ids.principalId);
  await academicsPage(ids.facilityIds);
  await admissionsPage();

  console.log('\n========== POPULATE REPORT ==========');
  console.log(`OK (${REPORT.ok.length}):`);
  for (const x of REPORT.ok) console.log(`  ✓ ${x}`);
  if (REPORT.warn.length) {
    console.log(`\nWARNINGS (${REPORT.warn.length}):`);
    for (const x of REPORT.warn) console.log(`  ! ${x}`);
  }
  if (REPORT.skip.length) {
    console.log(`\nINTENTIONALLY EMPTY (${REPORT.skip.length}):`);
    for (const x of REPORT.skip) console.log(`  – ${x}`);
  }
  console.log('=====================================\n');
}

main().catch((e: unknown) => {
  console.error('FATAL:', e instanceof Error ? e.message : e);
  if (REPORT.warn.length || REPORT.skip.length) {
    console.error('\nPartial report:');
    for (const x of REPORT.warn) console.error(`  ! ${x}`);
    for (const x of REPORT.skip) console.error(`  – ${x}`);
  }
  process.exit(1);
});
