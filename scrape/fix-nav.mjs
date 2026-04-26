// Replace site-setting.navigation + footerNavigation with clean values that
// resolve to real Next.js routes. Preserves every other field.
import { config as dotenvConfig } from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
dotenvConfig({ path: path.resolve(here, '..', '.env') });

const URL_BASE = (process.env.STRAPI_URL ?? '').replace(/\/+$/, '');
const TOKEN = process.env.STRAPI_TOKEN;
if (!URL_BASE || !TOKEN) {
  console.error('STRAPI_URL or STRAPI_TOKEN missing in .env');
  process.exit(2);
}

const navigation = [
  { label: 'Home', href: '/', children: [] },
  { label: 'About', href: '/about', children: [
    { label: 'Vision & Mission', href: '/about/vision-mission', children: [] },
    { label: "Principal's Desk", href: '/about', children: [] },
    { label: 'Our Campus', href: '/about/our-campus', children: [] }
  ] },
  { label: 'Academics', href: '/academics', children: [
    { label: 'Attendance', href: '/academics/attendance', children: [] },
    { label: 'Examinations', href: '/academics/examination', children: [] },
    { label: 'Classwise Strength', href: '/academics/classwise-strength', children: [] },
    { label: 'Teaching Staff', href: '/academics/teaching-staff', children: [] }
  ] },
  { label: 'Admissions', href: '/admissions', children: [] },
  { label: 'News', href: '/news', children: [] },
  { label: 'Gallery', href: '/gallery', children: [] },
  { label: 'Staff', href: '/staff', children: [] },
  { label: 'Documents', href: '/documents', children: [] },
  { label: 'Contact', href: '/contact', children: [] }
];

const footerNavigation = [
  { label: 'About', href: '/about' },
  { label: 'Academics', href: '/academics' },
  { label: 'Admissions', href: '/admissions' },
  { label: 'News', href: '/news' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Staff', href: '/staff' },
  { label: 'Documents', href: '/documents' },
  { label: 'Contact', href: '/contact' }
];

async function main() {
  console.log('PUT /api/site-setting (navigation + footerNavigation)…');
  const res = await fetch(`${URL_BASE}/api/site-setting`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ data: { navigation, footerNavigation } })
  });
  const text = await res.text();
  if (!res.ok) {
    console.error(`HTTP ${res.status}: ${text.slice(0, 400)}`);
    process.exit(1);
  }
  console.log('updated. publishing…');

  // Try publish via status query (Strapi 5)
  const pub = await fetch(`${URL_BASE}/api/site-setting?status=published`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ data: {} })
  });
  console.log('publish PUT status:', pub.status);
  console.log('done');
}

main().catch((e) => { console.error('FATAL:', e.message); process.exit(1); });
