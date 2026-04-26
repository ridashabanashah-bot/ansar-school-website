// Capture reference screenshots + HTML of https://tist.school for design study.
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const OUT = '/tmp/tist-ref';

async function dismissPopup(page) {
  // Try common close-button selectors for lead-capture popups.
  const selectors = ['button[aria-label="Close" i]', 'button.close', '.modal .close', '[class*="close" i] svg', '[role="dialog"] button'];
  for (const sel of selectors) {
    try {
      const btn = await page.$(sel);
      if (btn) { await btn.click({ timeout: 1000 }).catch(() => {}); }
    } catch {}
  }
  // Also try clicking the × button by xpath text "✕" or "×"
  try {
    await page.evaluate(() => {
      const els = document.querySelectorAll('button, a, span, div');
      for (const el of els) {
        const t = (el.textContent || '').trim();
        if (t === '×' || t === '✕' || t === 'X' || t === 'x') {
          el.click();
          break;
        }
      }
      // Also force-hide any visible modal
      document.querySelectorAll('[role="dialog"], .modal, .popup, [class*="Popup"], [class*="popup"]').forEach((m) => {
        m.style.display = 'none';
      });
      document.querySelectorAll('.modal-backdrop, [class*="backdrop"], [class*="overlay"]').forEach((m) => {
        m.style.display = 'none';
      });
    });
  } catch {}
}

async function captureAtViewport(browser, label, width, height) {
  const ctx = await browser.newContext({ viewport: { width, height } });
  const page = await ctx.newPage();
  await page.goto('https://tist.school/', { waitUntil: 'domcontentloaded', timeout: 45000 });
  try { await page.waitForLoadState('load', { timeout: 8000 }); } catch {}
  await page.waitForTimeout(3000); // wait for popup to appear
  await dismissPopup(page);
  await page.waitForTimeout(500);
  await dismissPopup(page);

  const totalHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  console.log(`${label}: total height ${totalHeight}px`);

  const step = label === 'desktop' ? 800 : 700;
  let i = 1;
  for (let y = 0; y < totalHeight; y += step) {
    await page.evaluate((y) => window.scrollTo(0, y), y);
    await page.waitForTimeout(700);
    await dismissPopup(page);
    const file = path.join(OUT, `${label}-${i}.png`);
    await page.screenshot({ path: file, fullPage: false });
    console.log(`  saved ${file}`);
    i++;
    if (i > 16) break;
  }

  if (label === 'desktop') {
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    await dismissPopup(page);
    await page.screenshot({ path: path.join(OUT, 'desktop-full.png'), fullPage: true });
    const html = await page.content();
    await writeFile(path.join(OUT, 'tist.html'), html, 'utf8');
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
