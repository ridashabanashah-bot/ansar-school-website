// Create the MVP page entries for the agreed sitemap.
// Idempotent: skips slugs that already exist; creates as published.
import { config as dotenvConfig } from 'dotenv';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
dotenvConfig({ path: path.resolve(here, '..', '.env') });

const BASE = (process.env.STRAPI_URL ?? '').replace(/\/+$/, '');
const TOKEN = process.env.STRAPI_TOKEN;
if (!BASE || !TOKEN) { console.error('STRAPI_URL/STRAPI_TOKEN missing'); process.exit(2); }

const SCRAPE_PAGES = path.join(here, 'pages');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const THROTTLE = 2500;

async function pageBody(slug) {
  const file = path.join(SCRAPE_PAGES, `${slug}.md`);
  if (!existsSync(file)) return null;
  const raw = await readFile(file, 'utf8');
  return raw.replace(/^---[\s\S]*?---\n?/, '').trim();
}

async function findBySlug(slug) {
  const res = await fetch(`${BASE}/api/pages?filters[slug][$eq]=${encodeURIComponent(slug)}&pagination[pageSize]=1`, {
    headers: { Authorization: `Bearer ${TOKEN}` }
  });
  if (!res.ok) throw new Error(`find ${slug}: HTTP ${res.status}`);
  const j = await res.json();
  return j.data?.[0] ?? null;
}

const REPORT = { created: [], skipped: [], needsEditor: [] };

async function createPage(spec) {
  const existing = await findBySlug(spec.slug);
  if (existing) {
    console.log(`  – ${spec.slug}: already exists, skipping`);
    REPORT.skipped.push(spec.slug);
    return;
  }
  const data = {
    title: spec.title,
    slug: spec.slug,
    section: spec.section,
    body: spec.body,
    order: spec.order,
    sourceUrl: '',
    seo: {
      metaTitle: `${spec.title} — Ansar School Padhinjarangadi`,
      metaDescription: spec.metaDescription
    }
  };
  const res = await fetch(`${BASE}/api/pages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ data })
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`POST ${spec.slug}: HTTP ${res.status} :: ${text.slice(0, 250)}`);
  const json = JSON.parse(text);
  // publish
  const pub = await fetch(`${BASE}/api/pages/${json.data.documentId}?status=published`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: {} })
  });
  if (!pub.ok) console.warn(`    ! publish ${spec.slug}: HTTP ${pub.status}`);
  console.log(`  ✓ ${spec.slug}`);
  REPORT.created.push(spec.slug);
  if (spec.needsEditor) REPORT.needsEditor.push({ slug: spec.slug, reason: spec.needsEditor });
  await sleep(THROTTLE);
}

// ---------- spec builders ----------

async function buildSpecs() {
  const aboutMd = await pageBody('about');
  const principalMd = await pageBody('principles-desk');
  const facilitiesMd = await pageBody('facilities');

  // Extract vision + mission paragraphs from about.md (heading-based).
  let visionMission = '';
  if (aboutMd) {
    const sections = aboutMd.split(/\n##\s+/);
    const find = (name) => {
      const s = sections.find((x) => new RegExp(`^${name}\\b`, 'i').test(x));
      return s ? s.replace(/^[^\n]+\n/, '').trim() : '';
    };
    const v = find('Vision');
    const m = find('Mission');
    if (v) visionMission += `## Vision\n\n${v}\n\n`;
    if (m) visionMission += `## Mission\n\n${m}`;
  }
  if (!visionMission) {
    visionMission = '## Vision\n\nOur vision is to create a learning community that empowers students to become confident, compassionate, and creative individuals — equipped with the knowledge, skills, and values to succeed in an ever-changing world.\n\n## Mission\n\nOur mission is to provide a safe, nurturing, and inclusive learning environment that fosters academic excellence, personal growth, and social responsibility.';
  }

  // History paragraphs from about.md (everything before Vision/Mission headings).
  let history = '';
  if (aboutMd) {
    const before = aboutMd.split(/\n##\s+(?:Vision|Mission)/i)[0];
    history = before
      .replace(/^##\s+About[^\n]*\n+/i, '')
      .trim();
  }
  if (!history) history = '_Add the school\'s history here._';

  // Campus description — first paragraph of facilities.md (campus-y), or our-campus.md fallback.
  let campusBlurb = '';
  const ourCampusMd = await pageBody('our-campus');
  if (ourCampusMd) {
    campusBlurb = ourCampusMd.replace(/^##\s+[^\n]+\n+/, '').trim();
  } else if (facilitiesMd) {
    campusBlurb = facilitiesMd.split(/\n+/).slice(0, 4).join(' ').trim();
  }
  if (!campusBlurb) campusBlurb = 'Perched amidst the serene landscapes of Padhinjarangadi, our campus is a vibrant hub of learning with modern facilities, lush green spaces, and innovative learning environments.';

  // Curriculum overview — first paragraph from facilities.md.
  let curriculum = '';
  if (facilitiesMd) {
    // Grab the first non-image paragraph that talks about curriculum/learning.
    const paras = facilitiesMd.split(/\n{2,}/).map((s) => s.trim()).filter((s) => s && !s.startsWith('!') && !s.startsWith('#'));
    if (paras.length > 0) curriculum = paras.slice(0, 2).join('\n\n');
  }
  if (!curriculum) curriculum = 'Our curriculum follows the CBSE framework, supplemented by concept-based learning through multimedia resources and Cyber Square Information Technology platforms. We integrate languages, mathematics, science, social studies, and the arts into every stage from Lower Primary through High School.';

  return [
    // ---- about ----
    {
      section: 'about', slug: 'our-history', title: 'Our History', order: 10,
      body: history,
      metaDescription: 'A short history of Ansar School Padhinjarangadi — established 1986 by the Alfalah Charitable Trust.'
    },
    {
      section: 'about', slug: 'principals-desk', title: "Principal's Desk", order: 20,
      body: principalMd ?? "## Principal's Desk\n\n_The principal's message will appear here._",
      metaDescription: 'A welcome note from the principal of Ansar School Padhinjarangadi.'
    },
    {
      section: 'about', slug: 'accreditations', title: 'Accreditations', order: 30,
      body: 'Ansar School Padhinjarangadi is affiliated to the Central Board of Secondary Education (CBSE). Our affiliation, recognition, and statutory certificates — including DEO certification, NOC, fire & safety, and building safety — are available on the [Documents](/documents) page.\n\n_Editor: please confirm current affiliation number, year of latest renewal, and any additional accreditations the school holds._',
      metaDescription: 'Affiliation, recognition, and statutory certificates for Ansar School Padhinjarangadi.',
      needsEditor: 'confirm affiliation number, latest renewal year, additional accreditations'
    },
    // ---- academics ----
    {
      section: 'academics', slug: 'curriculum', title: 'Curriculum', order: 10,
      body: curriculum,
      metaDescription: 'An overview of the curriculum and learning approach at Ansar School.'
    },
    {
      section: 'academics', slug: 'results', title: 'Results', order: 20,
      body: 'Board examination results from recent years will be published here.\n\n_Editor: please add Class 10 board pass percentages, distinctions, and notable individual results for the latest academic years. Do not invent figures — use the school office\'s official records._',
      metaDescription: 'Board examination results from recent academic years at Ansar School.',
      needsEditor: 'official board pass percentages, distinctions, notable results — never fabricate'
    },
    {
      section: 'academics', slug: 'co-curricular', title: 'Co-curricular Activities', order: 30,
      body: 'Co-curricular activities at Ansar School include martial arts, school band, swimming, NCC, NSS, nature club, film club, and curricular activities woven into the rhythm of every school week. They build discipline, character, and confidence alongside academic study.\n\n_Editor: please expand with the current schedule, club lead names, and recent achievements._',
      metaDescription: 'Co-curricular programmes at Ansar School — sports, music, clubs, and service.',
      needsEditor: 'current schedule, club leads, recent achievements'
    },
    // ---- admissions ----
    {
      section: 'admissions', slug: 'faqs', title: 'Frequently Asked Questions', order: 10,
      body: [
        '## When does admission open?',
        'Admission inquiries are welcome year-round. Most new admissions happen between February and May for the upcoming academic year. Contact the school office for the current intake.',
        '',
        '## What is the age requirement for Class 1?',
        'Children completing 5 years by 1 June of the academic year are typically eligible for Class 1. Contact the school office for current details.',
        '',
        '## Which curriculum does the school follow?',
        'Ansar School follows the Central Board of Secondary Education (CBSE) curriculum, complemented by concept-based learning through multimedia and IT platforms.',
        '',
        '## What languages are taught?',
        'The medium of instruction is English. Malayalam is taught as a regional language; additional languages may be offered depending on the class. Contact the school office for current details.',
        '',
        '## What is the fee structure?',
        'Fees vary by class. Please contact the school office for the current fee schedule, or refer to the fee structure documents on the [Documents](/documents) page.',
        '',
        '## What documents are needed for admission?',
        'Birth certificate, Aadhaar card (parent and child), previous school transfer certificate (if applicable), most recent report card (if applicable), and two passport-size photographs of the child.',
        '',
        '## Does the school provide transport?',
        'Transport details are confirmed during admission. Please contact the school office for current routes and fees. _Editor: please add current transport route map and contact._',
        '',
        '## What is the school uniform?',
        'The school uniform specifications are available from the school office. _Editor: please add the uniform reference here or attach the uniform PDF from the Documents library._'
      ].join('\n'),
      metaDescription: 'Common questions about admission, fees, age, curriculum, transport, and uniform at Ansar School.',
      needsEditor: 'transport routes, uniform reference'
    },
    {
      section: 'admissions', slug: 'documents-required', title: 'Documents Required', order: 20,
      body: '## Documents required for admission\n\n- Birth certificate (copy)\n- Aadhaar card (parent and child)\n- Previous school transfer certificate (if applicable)\n- Most recent report card (if applicable)\n- Two passport-size photographs of the child\n\nPlease bring originals for verification on the day of admission.',
      metaDescription: 'Documents to bring on the day of admission to Ansar School.'
    },
    // ---- life ----
    {
      section: 'life', slug: 'overview', title: 'Life at Ansar', order: 10,
      body: 'A school day at Ansar Padhinjarangadi begins with a morning assembly that brings together every class — a few minutes of stillness before the rhythm of lessons, labs, and activities. Days are structured around the CBSE timetable but woven through with sports periods, library visits, music, and clubs.\n\nThroughout the year, the calendar is shaped by celebrations — Onam, Annual Day, Sports Day, Independence Day, the Science Exhibition, and student presentations in our open auditorium. Whether it\'s the school band rehearsing for Annual Day, swimmers training before the bell, or a Class 8 project at the conference hall, Ansar life is hands-on and full of small traditions.\n\n_Editor: please replace this lead paragraph with your own voice — what makes a day at Ansar particular to your community._',
      metaDescription: 'A look at daily life, traditions, and celebrations at Ansar School Padhinjarangadi.',
      needsEditor: 'replace overview with the school\'s own voice'
    },
    {
      section: 'life', slug: 'sports', title: 'Sports', order: 20,
      body: 'Sports at Ansar include daily PE periods, our swimming academy, and a martial arts programme led by professional mentors. The school also fields teams in regional events and uses our open play ground for inter-house games and Sports Day.\n\n_Editor: please list current teams, coaches, and notable inter-school results._',
      metaDescription: 'Sports programmes at Ansar School — PE, swimming, martial arts, and inter-house games.',
      needsEditor: 'list current teams, coaches, recent results'
    },
    {
      section: 'life', slug: 'arts', title: 'Arts & Music', order: 30,
      body: 'Arts and music at Ansar centre on our school band, the open auditorium, and dedicated practice for cultural events through the year. Students train under professional band instructors and contribute to Annual Day and seasonal celebrations.\n\n_Editor: please add current music staff, cultural club leads, and a note on arts curriculum integration._',
      metaDescription: 'Arts and music at Ansar School — school band, cultural events, and creative practice.',
      needsEditor: 'staff, club leads, curriculum integration'
    },
    {
      section: 'life', slug: 'celebrations', title: 'Celebrations', order: 40,
      body: 'Onam, Annual Day, Sports Day, and Independence Day anchor the school\'s calendar. The campus comes alive with pookalam, performances by the school band, and student presentations across the open auditorium and conference hall.\n\n_Editor: please add specific dates, photos, and a 1-line note for each celebration._',
      metaDescription: 'Celebrations and traditions at Ansar School — Onam, Annual Day, Sports Day.',
      needsEditor: 'add dates and per-event highlights'
    }
  ];
}

async function main() {
  const specs = await buildSpecs();
  for (const s of specs) {
    try { await createPage(s); }
    catch (e) { console.error(`  ! ${s.slug}: ${e.message}`); }
  }
  console.log('\n========== CREATE-PAGES REPORT ==========');
  console.log(`Created (${REPORT.created.length}): ${REPORT.created.join(', ')}`);
  console.log(`Skipped (${REPORT.skipped.length}): ${REPORT.skipped.join(', ') || '(none)'}`);
  console.log(`Needs editor input (${REPORT.needsEditor.length}):`);
  for (const n of REPORT.needsEditor) console.log(`  – ${n.slug}: ${n.reason}`);
  console.log('=========================================');
}
main().catch((e) => { console.error('FATAL:', e); process.exit(1); });
