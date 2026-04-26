// Capture screenshots of the new design (running locally via next start).
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const OUT = '/tmp/ansar-after';
const BASE = process.env.ANSAR_BASE_URL ?? 'http://localhost:3000';
const PATHS = ['/', '/about', '/academics', '/admissions'];

async function captureAtViewport(browser, label, width, height) {
  const ctx = await browser.newContext({ viewport: { width, height } });
  const page = await ctx.newPage();
  for (const p of PATHS) {
    const url = BASE + p;
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      try { await page.waitForLoadState('load', { timeout: 6000 }); } catch {}
      await page.waitForTimeout(800);
      const safeName = p === '/' ? 'home' : p.slice(1).replace(/\//g, '-');
      const file = path.join(OUT, `${label}-${safeName}.png`);
      await page.screenshot({ path: file, fullPage: true });
      console.log(`  saved ${file}`);
    } catch (e) {
      console.warn(`  ! ${url} failed: ${e.message}`);
    }
  }
  await ctx.close();
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch();
  try {
    await captureAtViewport(browser, 'desktop', 1440, 900);
    await captureAtViewport(browser, 'mobile', 390, 844);
  } finally {
    await browser.close();
  }
  console.log('done');
}

main().catch((e) => { console.error('FATAL:', e); process.exit(1); });
