// Phase 1 — fetch woodhousegrove.co.uk and extract design fingerprints.
// No Playwright; plain Node fetch + cheerio-free string parsing.
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const OUT = '/tmp/wg-source';
const BASE = 'https://www.woodhousegrove.co.uk';
const UA = 'Mozilla/5.0 (compatible; AnsarSchoolDesignReference/1.0)';

async function get(url) {
  const r = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'text/html,text/css,*/*' } });
  if (!r.ok) throw new Error(`HTTP ${r.status} ${url}`);
  return await r.text();
}

function uniq(arr) { return [...new Set(arr)]; }

function extractStylesheetUrls(html) {
  const out = [];
  const linkRx = /<link[^>]+rel=["']stylesheet["'][^>]*>/gi;
  for (const m of html.matchAll(linkRx)) {
    const tag = m[0];
    const hrefM = tag.match(/href=["']([^"']+)["']/i);
    if (hrefM) out.push(hrefM[1]);
  }
  return out;
}

function extractInlineStyles(html) {
  const out = [];
  const rx = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  for (const m of html.matchAll(rx)) out.push(m[1]);
  return out;
}

function abs(url) {
  if (url.startsWith('//')) return 'https:' + url;
  if (url.startsWith('http')) return url;
  if (url.startsWith('/')) return BASE + url;
  return BASE + '/' + url;
}

function safeName(url) {
  return url.replace(/^https?:\/\//, '').replace(/[^a-z0-9._-]+/gi, '_').slice(0, 120);
}

function findFontFaces(css) {
  const out = [];
  const rx = /@font-face\s*\{[^}]+\}/g;
  for (const m of css.matchAll(rx)) {
    const block = m[0];
    const family = (block.match(/font-family:\s*['"]?([^'";]+)['"]?/i) ?? [])[1];
    const srcs = [...block.matchAll(/url\(['"]?([^'")]+)['"]?\)/gi)].map((x) => x[1]);
    out.push({ family: family?.trim(), srcs });
  }
  return out;
}

function findFamilyRules(css) {
  const out = [];
  const rx = /([a-z0-9_*\-#.\[\]:>~+\s,]+)\{[^}]*?font-family\s*:\s*([^;}]+)[;}]/gi;
  for (const m of css.matchAll(rx)) {
    const sel = m[1].trim().slice(0, 80);
    const fam = m[2].trim();
    out.push({ sel, fam });
  }
  return out.slice(0, 200);
}

function findColorValues(css) {
  const hex = uniq([...css.matchAll(/#([0-9a-f]{6}|[0-9a-f]{3})\b/gi)].map((m) => m[0].toLowerCase()));
  const rgb = uniq([...css.matchAll(/rgba?\([^)]+\)/gi)].map((m) => m[0].toLowerCase()));
  const freq = {};
  for (const c of [...css.matchAll(/#[0-9a-f]{6}/gi)]) freq[c[0].toLowerCase()] = (freq[c[0].toLowerCase()] ?? 0) + 1;
  const top = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 20);
  return { uniqueHex: hex.slice(0, 30), rgb: rgb.slice(0, 20), topByFrequency: top };
}

function bodySectionShape(html) {
  const sections = [];
  const rx = /<(section|main|header|footer|article|div)[^>]*class=["']([^"']+)["'][^>]*>/gi;
  let count = 0;
  for (const m of html.matchAll(rx)) {
    if (count > 50) break;
    const tag = m[1];
    const cls = m[2];
    if (tag === 'section' || /hero|banner|grid|cards?|news|stats|testimonial|cta|highlight|quote|gallery/i.test(cls)) {
      sections.push({ tag, cls: cls.slice(0, 120) });
      count++;
    }
  }
  return sections.slice(0, 30);
}

function findHeroBlock(html) {
  // Very rough — first <section> or <div class*="hero">
  const m = html.match(/<(section|div)[^>]*class=["'][^"']*hero[^"']*["'][^>]*>([\s\S]{0,2000}?)<\/\1>/i);
  return m ? m[2].slice(0, 800).replace(/\s+/g, ' ') : null;
}

async function main() {
  await mkdir(OUT, { recursive: true });
  console.log('Fetching home…');
  const html = await get(BASE + '/');
  await writeFile(path.join(OUT, 'home.html'), html, 'utf8');
  console.log(`  saved home.html (${html.length} bytes)`);

  const cssUrls = uniq(extractStylesheetUrls(html));
  console.log(`Found ${cssUrls.length} stylesheet links`);
  const cssBlobs = [];
  for (const u of cssUrls) {
    const url = abs(u);
    try {
      const text = await get(url);
      const file = path.join(OUT, 'css_' + safeName(url));
      await writeFile(file, text, 'utf8');
      cssBlobs.push({ url, text });
      console.log(`  fetched ${url} (${text.length} bytes)`);
    } catch (e) {
      console.warn(`  ! ${url} failed: ${e.message}`);
    }
  }
  const inline = extractInlineStyles(html);
  if (inline.length) {
    await writeFile(path.join(OUT, 'inline.css'), inline.join('\n\n/* --- */\n\n'), 'utf8');
    cssBlobs.push({ url: '(inline)', text: inline.join('\n') });
  }

  // Combined for easier grep
  const combined = cssBlobs.map((b) => `/* ${b.url} */\n${b.text}`).join('\n\n');
  await writeFile(path.join(OUT, 'combined.css'), combined, 'utf8');

  const fontFaces = findFontFaces(combined);
  const familyRules = findFamilyRules(combined);
  const colors = findColorValues(combined);
  const heroBlock = findHeroBlock(html);
  const sections = bodySectionShape(html);

  const summary = {
    pageBytes: html.length,
    stylesheets: cssUrls,
    fontFaces,
    familyRulesSample: familyRules.slice(0, 60),
    colors,
    heroBlock,
    topSections: sections
  };
  await writeFile(path.join(OUT, 'summary.json'), JSON.stringify(summary, null, 2), 'utf8');

  console.log('\n--- SUMMARY ---');
  console.log('font-faces:', fontFaces.length);
  for (const f of fontFaces) console.log(`  ${f.family} ← ${f.srcs[0]?.slice(0, 100) ?? '(no src)'}`);
  console.log('\nfont-family rules (first 12):');
  familyRules.slice(0, 12).forEach((r) => console.log(`  ${r.sel} → ${r.fam.slice(0, 80)}`));
  console.log('\ntop colors by frequency:');
  colors.topByFrequency.slice(0, 12).forEach(([c, n]) => console.log(`  ${c}  (${n})`));
  console.log('\nhero block sample:', heroBlock ? heroBlock.slice(0, 400) : '(no hero class found)');
  console.log('\ntop sections:');
  sections.slice(0, 10).forEach((s) => console.log(`  <${s.tag} class="${s.cls.slice(0, 80)}">`));
}

main().catch((e) => { console.error('FATAL:', e); process.exit(1); });
