// PUT site-setting.navigation + footerNavigation per the Phase 4 sitemap.
import { config as dotenvConfig } from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
dotenvConfig({ path: path.resolve(here, '..', '.env') });

const BASE = (process.env.STRAPI_URL ?? '').replace(/\/+$/, '');
const TOKEN = process.env.STRAPI_TOKEN;
if (!BASE || !TOKEN) { console.error('STRAPI_URL/STRAPI_TOKEN missing'); process.exit(2); }

const navigation = [
  { label: 'Home', href: '/', children: [] },
  { label: 'About', href: '/about', children: [
    { label: 'Vision & Mission', href: '/about/vision-mission', children: [] },
    { label: "Principal's Desk", href: '/about/principals-desk', children: [] },
    { label: 'Our History', href: '/about/our-history', children: [] },
    { label: 'Our Campus', href: '/about/our-campus', children: [] },
    { label: 'Accreditations', href: '/about/accreditations', children: [] }
  ] },
  { label: 'Academics', href: '/academics', children: [
    { label: 'Curriculum', href: '/academics/curriculum', children: [] },
    { label: 'Examinations', href: '/academics/examination', children: [] },
    { label: 'Attendance', href: '/academics/attendance', children: [] },
    { label: 'Results', href: '/academics/results', children: [] },
    { label: 'Co-curricular', href: '/academics/co-curricular', children: [] }
  ] },
  { label: 'Admissions', href: '/admissions', children: [
    { label: 'Process', href: '/admissions', children: [] },
    { label: 'FAQs', href: '/admissions/faqs', children: [] }
  ] },
  { label: 'Life at Ansar', href: '/life', children: [] },
  { label: 'News', href: '/news', children: [] },
  { label: 'Gallery', href: '/gallery', children: [] },
  { label: 'Contact', href: '/contact', children: [] }
];

const footerNavigation = [
  { label: 'About', href: '/about' },
  { label: 'Academics', href: '/academics' },
  { label: 'Admissions', href: '/admissions' },
  { label: 'Life at Ansar', href: '/life' },
  { label: 'News', href: '/news' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Documents', href: '/documents' },
  { label: 'Contact', href: '/contact' }
];

async function main() {
  console.log('PUT /api/site-setting (navigation + footerNavigation)…');
  const res = await fetch(`${BASE}/api/site-setting`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: { navigation, footerNavigation } })
  });
  const text = await res.text();
  if (!res.ok) { console.error(`HTTP ${res.status}: ${text.slice(0, 400)}`); process.exit(1); }
  console.log('updated. publishing…');

  const pub = await fetch(`${BASE}/api/site-setting?status=published`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: {} })
  });
  console.log('publish status:', pub.status);
  console.log('done');
}
main().catch((e) => { console.error('FATAL:', e.message); process.exit(1); });
