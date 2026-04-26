// Polite BFS crawler for https://ansarschoolpdi.in/
// Renders each page with Playwright (chromium), extracts metadata + main
// content as markdown, saves raw HTML, downloads images + PDFs, and writes
// sitemap/contact/nav/summary artifacts.

import { chromium } from 'playwright';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import TurndownService from 'turndown';
import { writeFile, mkdir, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const ORIGIN = 'https://ansarschoolpdi.in';
const START = ORIGIN + '/';
const MAX_DEPTH = 4;
const REQ_INTERVAL_MS = 1000;
const NAV_TIMEOUT_MS = 30000;
const UA =
  'AnsarSchoolMigrationCrawler/1.0 (+migration to Strapi 5; contact ridashabanashah@gmail.com)';

const OUT = __dirname;
const PAGES_DIR = path.join(OUT, 'pages');
const IMAGES_DIR = path.join(OUT, 'images');
const META_DIR = path.join(OUT, 'meta');
const PDFS_DIR = path.join(OUT, 'pdfs');

const SKIP_PATTERNS = [
  /\/wp-admin(\/|$)/i,
  /\/wp-login/i,
  /\/feed(\/|$)/i,
  /\/wp-json(\/|$)/i,
  /[?&]attachment_id=/i,
];

const IMG_EXT = /\.(png|jpe?g|gif|webp|svg|avif|bmp|ico)(\?|#|$)/i;
const PDF_EXT = /\.pdf(\?|#|$)/i;
// Asset/media extensions we never want to enqueue as a page.
const ASSET_EXT = /\.(png|jpe?g|gif|webp|svg|avif|bmp|ico|css|js|mjs|map|woff2?|ttf|otf|eot|mp4|mp3|webm|ogg|wav|zip|rar|7z)(\?|#|$)/i;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function normaliseUrl(rawHref, baseUrl) {
  try {
    const u = new URL(rawHref, baseUrl);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
    if (u.hostname.replace(/^www\./, '') !== 'ansarschoolpdi.in') return null;
    u.hash = '';
    // collapse trailing /index.php to /
    if (/\/index\.php$/i.test(u.pathname)) {
      u.pathname = u.pathname.replace(/\/index\.php$/i, '/');
    }
    // remove trailing slash for non-root, for stable dedupe
    if (u.pathname.length > 1 && u.pathname.endsWith('/')) {
      u.pathname = u.pathname.slice(0, -1);
    }
    return u.toString();
  } catch {
    return null;
  }
}

function slugForUrl(url) {
  const u = new URL(url);
  let p = u.pathname;
  if (p === '/' || p === '' || /^\/index\.php$/i.test(p)) return 'home';
  p = p.replace(/^\/+/, '').replace(/\/+$/, '');
  p = p.replace(/\.php$/i, '');
  p = p.replace(/\//g, '-');
  p = p.replace(/[^a-z0-9._-]+/gi, '-').toLowerCase();
  return p || 'home';
}

function shouldSkip(url) {
  if (SKIP_PATTERNS.some((rx) => rx.test(url))) return true;
  // bare email mistyped as href ("info@ansarschoolpdi.in") resolves to a path
  // segment containing '@' — never a real page on this site
  try {
    const u = new URL(url);
    if (/@/.test(u.pathname)) return true;
    if (ASSET_EXT.test(u.pathname) && !PDF_EXT.test(u.pathname)) return true;
  } catch {}
  return false;
}

async function ensureDirs() {
  for (const d of [PAGES_DIR, IMAGES_DIR, META_DIR, PDFS_DIR]) {
    if (!existsSync(d)) await mkdir(d, { recursive: true });
  }
}

function shortHash(s) {
  return createHash('sha1').update(s).digest('hex').slice(0, 8);
}

function safeFilename(name) {
  return name.replace(/[^a-z0-9._-]+/gi, '_').slice(0, 80);
}

// ---------- Image / PDF download ----------

const imageManifest = new Map(); // url -> { localPath, alt, width, height, pageSlugs:Set }
const pdfManifest = new Map(); // url -> { localPath, pageSlugs:Set }

async function downloadBinary(absUrl, destDir, kind) {
  const u = new URL(absUrl);
  const baseName = safeFilename(decodeURIComponent(path.basename(u.pathname)) || kind);
  const hash = shortHash(absUrl);
  const ext = path.extname(baseName) || '';
  const stem = ext ? baseName.slice(0, -ext.length) : baseName;
  const finalName = `${stem || kind}-${hash}${ext}`;
  const dest = path.join(destDir, finalName);
  if (existsSync(dest)) {
    return path.relative(OUT, dest).replaceAll('\\', '/');
  }
  try {
    const res = await fetch(absUrl, { headers: { 'User-Agent': UA } });
    if (!res.ok) {
      console.warn(`  ! ${kind} ${res.status} ${absUrl}`);
      return null;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    await writeFile(dest, buf);
    return path.relative(OUT, dest).replaceAll('\\', '/');
  } catch (e) {
    console.warn(`  ! ${kind} fetch failed ${absUrl}: ${e.message}`);
    return null;
  }
}

// ---------- Markdown conversion ----------

const turndown = new TurndownService({
  headingStyle: 'atx',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
  emDelimiter: '_',
});
turndown.remove(['script', 'style', 'noscript']);

function htmlToMarkdown(html, pageUrl) {
  // Resolve relative links/imgs to absolute first.
  const dom = new JSDOM(html, { url: pageUrl });
  const doc = dom.window.document;

  // Strip nav/footer/skip-to-content/cookie banners.
  const stripSelectors = [
    'header', 'footer', 'nav',
    '.header_top', '.wrapper.container', '.nav-links',
    '.cookie', '.cookie-banner', '#cookie', '[class*="cookie"]',
    '[class*="skip-to"]', '.skip-link',
    '.top_menu',
    'script', 'style', 'noscript',
    'iframe',
  ];
  for (const sel of stripSelectors) {
    doc.querySelectorAll(sel).forEach((n) => n.remove());
  }

  // Try Readability for main content first.
  let mainHtml = '';
  try {
    const article = new Readability(doc.cloneNode(true)).parse();
    if (article && article.content && article.content.length > 200) {
      mainHtml = article.content;
    }
  } catch {}
  if (!mainHtml) {
    const main =
      doc.querySelector('main') ||
      doc.querySelector('#content') ||
      doc.querySelector('.main-content') ||
      doc.querySelector('section') ||
      doc.body;
    mainHtml = main ? main.innerHTML : doc.body.innerHTML;
  }

  return turndown.turndown(mainHtml).trim();
}

// ---------- Per-page extraction (runs inside the browser context) ----------

const EXTRACT_FN = () => {
  const txt = (el) => (el ? el.textContent.trim() : '');
  const attr = (el, a) => (el ? el.getAttribute(a) : null);

  const meta = (name) =>
    attr(document.querySelector(`meta[name="${name}" i]`), 'content') ||
    attr(document.querySelector(`meta[property="${name}" i]`), 'content') ||
    null;

  const h1 = [...document.querySelectorAll('h1')].map((e) => e.textContent.trim()).filter(Boolean);
  const h2 = [...document.querySelectorAll('h2')].map((e) => e.textContent.trim()).filter(Boolean);

  const imgs = [...document.querySelectorAll('img')]
    .map((i) => ({
      src: i.currentSrc || i.src || i.getAttribute('data-src') || '',
      alt: i.getAttribute('alt') || '',
      width: i.naturalWidth || null,
      height: i.naturalHeight || null,
    }))
    .filter((i) => i.src);

  const iframeSrcs = [...document.querySelectorAll('iframe')]
    .map((f) => f.src)
    .filter(Boolean);

  const allLinks = [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href'));

  const phones = [...new Set(
    [...document.querySelectorAll('a[href^="tel:"]')]
      .map((a) => a.getAttribute('href').replace(/^tel:/i, '').trim())
  )];
  const emails = [...new Set(
    [...document.querySelectorAll('a[href^="mailto:"]')]
      .map((a) => a.getAttribute('href').replace(/^mailto:/i, '').trim())
  )];

  // Heuristic address: look for tags containing "Padinjarangadi" or "Kerala" or pin-like
  const text = document.body ? document.body.innerText : '';
  const addrMatches = [];
  text.split('\n').forEach((line) => {
    const l = line.trim();
    if (!l) return;
    if (/Padinjarangadi|Padhinjarangadi|Malappuram|Kerala|\b6\d{5}\b/i.test(l)) {
      addrMatches.push(l);
    }
  });

  const breadcrumbs = [...document.querySelectorAll('.breadcrumb, [class*="breadcrumb"] a, nav[aria-label="breadcrumb"] a')]
    .map((a) => a.textContent.trim())
    .filter(Boolean);

  // Top nav structure (best-effort: ul.nav-links li > a)
  const topNav = [...document.querySelectorAll('ul.nav-links > li')].map((li) => {
    const a = li.querySelector(':scope > a');
    const sub = [...li.querySelectorAll('ul.drop-menu > li > a')].map((x) => ({
      text: x.textContent.trim(),
      href: x.getAttribute('href'),
    }));
    return {
      text: a ? a.textContent.trim() : '',
      href: a ? a.getAttribute('href') : null,
      children: sub,
    };
  });

  const footerNav = [...document.querySelectorAll('footer a[href]')].map((a) => ({
    text: a.textContent.trim(),
    href: a.getAttribute('href'),
  }));

  return {
    title: document.title || '',
    metaDescription: meta('description'),
    canonical: attr(document.querySelector('link[rel="canonical"]'), 'href'),
    ogTitle: meta('og:title'),
    ogDescription: meta('og:description'),
    ogImage: meta('og:image'),
    ogType: meta('og:type'),
    h1, h2,
    imgs,
    iframeSrcs,
    allLinks,
    phones,
    emails,
    addressLines: [...new Set(addrMatches)].slice(0, 8),
    breadcrumbs,
    topNav,
    footerNav,
  };
};

// ---------- Main crawler ----------

async function main() {
  await ensureDirs();
  console.log('UA:', UA);
  console.log('Origin:', ORIGIN);

  const browser = await chromium.launch();
  const context = await browser.newContext({
    userAgent: UA,
    locale: 'en-IN',
  });
  const page = await context.newPage();

  const queue = [{ url: START, depth: 0, parent: null }];
  const visited = new Map(); // url -> record
  const errors = [];
  const broken = []; // { url, status, foundOn }
  const pdfs = []; // { url, localPath, parent }
  const navCaptured = { topNav: null, footerNav: null };
  const contactAccum = { phones: new Set(), emails: new Set(), addressLines: new Set() };
  const socialLinks = new Set();
  const mapEmbeds = new Set();

  let lastReqAt = 0;
  let homeHash = null;
  const softNotFound = []; // urls that returned the home page (SPA-fallback)
  while (queue.length) {
    const { url, depth, parent } = queue.shift();
    const norm = normaliseUrl(url, ORIGIN);
    if (!norm || visited.has(norm)) continue;
    if (shouldSkip(norm)) continue;

    // PDF: download, do not render.
    if (PDF_EXT.test(norm)) {
      const local = await downloadBinary(norm, PDFS_DIR, 'doc');
      if (local) pdfs.push({ url: norm, localPath: local, parent });
      visited.set(norm, { url: norm, depth, parent, kind: 'pdf', localPath: local });
      await sleep(REQ_INTERVAL_MS);
      continue;
    }

    // throttle
    const wait = REQ_INTERVAL_MS - (Date.now() - lastReqAt);
    if (wait > 0) await sleep(wait);
    lastReqAt = Date.now();

    console.log(`[${depth}] ${norm}`);

    let resp;
    try {
      resp = await page.goto(norm, {
        waitUntil: 'domcontentloaded',
        timeout: NAV_TIMEOUT_MS,
      });
      // Give late JS/images a brief window, but don't block on networkidle.
      try {
        await page.waitForLoadState('load', { timeout: 8000 });
      } catch {}
      await sleep(800);
    } catch (e) {
      errors.push({ url: norm, error: 'timeout/nav: ' + e.message, parent });
      visited.set(norm, { url: norm, depth, parent, kind: 'error', error: e.message });
      continue;
    }
    const status = resp ? resp.status() : 0;
    if (!resp || !resp.ok()) {
      broken.push({ url: norm, status, foundOn: parent });
      visited.set(norm, { url: norm, depth, parent, kind: 'broken', status });
      continue;
    }

    const html = await page.content();
    let extracted;
    try {
      extracted = await page.evaluate(EXTRACT_FN);
    } catch (e) {
      errors.push({ url: norm, error: 'extract: ' + e.message, parent });
      extracted = null;
    }

    // Markdown first, so we can detect SPA-fallback (soft 404s) before
    // touching disk.
    const md = htmlToMarkdown(html, norm);
    const wordCount = md.split(/\s+/).filter(Boolean).length;
    const bodyHash = createHash('sha1').update(md).digest('hex');
    const isHome = new URL(norm).pathname === '/';
    if (isHome) {
      homeHash = bodyHash;
    } else if (homeHash && bodyHash === homeHash) {
      softNotFound.push({ url: norm, parent });
      visited.set(norm, { url: norm, depth, parent, kind: 'soft-404' });
      continue;
    }

    const slug = slugForUrl(norm);
    let finalSlug = slug;
    if ([...visited.values()].some((v) => v.slug === finalSlug)) {
      finalSlug = `${slug}-${shortHash(norm).slice(0, 4)}`;
    }

    // Save raw HTML
    await writeFile(path.join(PAGES_DIR, `${finalSlug}.html`), html, 'utf8');

    // capture nav once (from home)
    if (extracted && !navCaptured.topNav && extracted.topNav.length) {
      navCaptured.topNav = extracted.topNav;
      navCaptured.footerNav = extracted.footerNav;
    }
    // contact accumulation
    if (extracted) {
      extracted.phones.forEach((p) => contactAccum.phones.add(p));
      extracted.emails.forEach((e) => contactAccum.emails.add(e));
      extracted.addressLines.forEach((a) => contactAccum.addressLines.add(a));
      extracted.iframeSrcs.forEach((s) => {
        if (/google\.com\/maps|maps\.google/i.test(s)) mapEmbeds.add(s);
      });
      extracted.allLinks.forEach((l) => {
        if (!l) return;
        if (/facebook\.com|instagram\.com|youtube\.com|youtu\.be|x\.com|twitter\.com|linkedin\.com|wa\.me|whatsapp/i.test(l)) {
          try {
            const abs = new URL(l, norm).toString();
            socialLinks.add(abs);
          } catch {}
        }
      });
    }

    // Image accounting
    if (extracted) {
      for (const i of extracted.imgs) {
        let abs;
        try { abs = new URL(i.src, norm).toString(); } catch { continue; }
        if (!IMG_EXT.test(abs) && !/^data:image/i.test(abs)) continue;
        if (/^data:image/i.test(abs)) continue;
        const rec = imageManifest.get(abs) || {
          originalUrl: abs,
          localPath: null,
          alt: i.alt || '',
          width: i.width || null,
          height: i.height || null,
          pageSlugs: new Set(),
        };
        rec.pageSlugs.add(finalSlug);
        if (!rec.alt && i.alt) rec.alt = i.alt;
        if (!rec.width && i.width) rec.width = i.width;
        if (!rec.height && i.height) rec.height = i.height;
        imageManifest.set(abs, rec);
      }
    }

    // Frontmatter + body
    const frontmatter = [
      '---',
      `slug: ${finalSlug}`,
      `url: ${norm}`,
      `title: ${JSON.stringify(extracted?.title || '')}`,
      `meta_description: ${JSON.stringify(extracted?.metaDescription || '')}`,
      `og_image: ${JSON.stringify(extracted?.ogImage || '')}`,
      `canonical: ${JSON.stringify(extracted?.canonical || '')}`,
      `h1: ${JSON.stringify(extracted?.h1 || [])}`,
      `depth: ${depth}`,
      `parent: ${JSON.stringify(parent || '')}`,
      `word_count: ${wordCount}`,
      '---',
      '',
    ].join('\n');
    await writeFile(path.join(PAGES_DIR, `${finalSlug}.md`), frontmatter + md + '\n', 'utf8');

    // Per-page meta json
    await writeFile(
      path.join(META_DIR, `${finalSlug}.json`),
      JSON.stringify({
        slug: finalSlug,
        url: norm,
        title: extracted?.title || '',
        metaDescription: extracted?.metaDescription || '',
        ogTitle: extracted?.ogTitle || '',
        ogDescription: extracted?.ogDescription || '',
        ogImage: extracted?.ogImage || '',
        ogType: extracted?.ogType || '',
        canonical: extracted?.canonical || '',
        h1: extracted?.h1 || [],
        h2: extracted?.h2 || [],
        breadcrumbs: extracted?.breadcrumbs || [],
        iframeSrcs: extracted?.iframeSrcs || [],
        wordCount,
      }, null, 2),
      'utf8'
    );

    visited.set(norm, {
      url: norm,
      slug: finalSlug,
      title: extracted?.title || '',
      depth,
      parent,
      kind: 'page',
      wordCount,
      empty: wordCount < 20,
    });

    // Enqueue children
    if (depth < MAX_DEPTH && extracted) {
      for (const href of extracted.allLinks) {
        if (!href) continue;
        const abs = normaliseUrl(href, norm);
        if (!abs || visited.has(abs) || shouldSkip(abs)) continue;
        // PDFs allowed regardless of depth (cheap)
        queue.push({ url: abs, depth: depth + 1, parent: norm });
      }
    }
  }

  // Download images
  console.log(`\nDownloading ${imageManifest.size} unique images…`);
  for (const [absUrl, rec] of imageManifest) {
    const local = await downloadBinary(absUrl, IMAGES_DIR, 'img');
    rec.localPath = local;
    await sleep(150); // light throttle on assets
  }

  await browser.close();

  // ---- Build sitemap.json ----
  const sitemap = [...visited.values()].map((v) => ({
    url: v.url,
    slug: v.slug || null,
    title: v.title || null,
    depth: v.depth,
    parent: v.parent,
    kind: v.kind,
    wordCount: v.wordCount ?? null,
    status: v.status ?? null,
    pdfPath: v.kind === 'pdf' ? v.localPath : null,
  }));
  await writeFile(path.join(OUT, 'sitemap.json'), JSON.stringify(sitemap, null, 2), 'utf8');

  // ---- images/manifest.json ----
  const imgManifestArr = [...imageManifest.values()].map((r) => ({
    originalUrl: r.originalUrl,
    localPath: r.localPath,
    alt: r.alt,
    width: r.width,
    height: r.height,
    pageSlugs: [...r.pageSlugs],
  }));
  await writeFile(
    path.join(IMAGES_DIR, 'manifest.json'),
    JSON.stringify(imgManifestArr, null, 2),
    'utf8'
  );

  // ---- contact.json ----
  const contact = {
    phones: [...contactAccum.phones],
    emails: [...contactAccum.emails],
    addressLines: [...contactAccum.addressLines],
    socialLinks: [...socialLinks],
    mapEmbeds: [...mapEmbeds],
  };
  await writeFile(path.join(OUT, 'contact.json'), JSON.stringify(contact, null, 2), 'utf8');

  // ---- nav.json ----
  await writeFile(
    path.join(OUT, 'nav.json'),
    JSON.stringify(navCaptured, null, 2),
    'utf8'
  );

  // ---- summary.md ----
  const pages = sitemap.filter((s) => s.kind === 'page');
  const empties = pages.filter((p) => (p.wordCount ?? 0) < 20);
  const top10 = [...pages].sort((a, b) => (b.wordCount || 0) - (a.wordCount || 0)).slice(0, 10);

  const summary = [
    '# Ansar School scrape — summary',
    '',
    `- Source: ${ORIGIN}`,
    `- Crawled at: ${new Date().toISOString()}`,
    `- Total URLs visited: ${sitemap.length}`,
    `- HTML pages saved: ${pages.length}`,
    `- PDFs saved: ${pdfs.length}`,
    `- Unique images referenced: ${imageManifest.size}`,
    `- Images downloaded: ${imgManifestArr.filter((i) => i.localPath).length}`,
    `- Pages with <20 words of content: ${empties.length}`,
    `- Broken links (non-2xx): ${broken.length}`,
    `- Pages with errors/timeouts: ${errors.length}`,
    `- Soft-404s (URLs that returned the home page): ${softNotFound.length}`,
    '',
    '## Top 10 pages by word count',
    '',
    ...top10.map((p, i) => `${i + 1}. **${p.title || p.slug}** — ${p.wordCount} words — ${p.url}`),
    '',
    '## Pages with little/no extracted text',
    '',
    ...(empties.length
      ? empties.map((p) => `- ${p.url} (slug: ${p.slug}, words: ${p.wordCount})`)
      : ['_(none)_']),
    '',
    '## Broken links',
    '',
    ...(broken.length
      ? broken.map((b) => `- ${b.url} → HTTP ${b.status} (linked from ${b.foundOn || 'n/a'})`)
      : ['_(none)_']),
    '',
    '## Errors / timeouts',
    '',
    ...(errors.length
      ? errors.map((e) => `- ${e.url} — ${e.error}`)
      : ['_(none)_']),
    '',
    '## Soft-404s (returned home page content)',
    '',
    ...(softNotFound.length
      ? softNotFound.map((s) => `- ${s.url} (linked from ${s.parent || 'n/a'})`)
      : ['_(none)_']),
    '',
    '## PDFs',
    '',
    ...(pdfs.length
      ? pdfs.map((p) => `- ${p.url} → ${p.localPath}`)
      : ['_(none)_']),
    '',
  ].join('\n');

  await writeFile(path.join(OUT, 'summary.md'), summary, 'utf8');

  console.log('\n=========== summary.md ===========\n');
  console.log(summary);
  console.log('\n==================================\n');
  console.log(`Pages: ${pages.length}  |  Images: ${imageManifest.size}  |  PDFs: ${pdfs.length}`);
}

main().catch((e) => {
  console.error('FATAL:', e);
  process.exit(1);
});
