import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const OUT = '/tmp/alabaster-ref';

async function captureAtViewport(browser, label, width, height) {
  const ctx = await browser.newContext({ viewport: { width, height } });
  const page = await ctx.newPage();
  await page.goto('https://alabasterjarproject.org/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  try { await page.waitForLoadState('load', { timeout: 10000 }); } catch {}
  await page.waitForTimeout(4500);
  // Dismiss the Mailchimp/newsletter popup only by clicking its close button.
  for (let k = 0; k < 4; k++) {
    const closed = await page.evaluate(() => {
      // Look for an explicit close button inside a visible popup-ish element.
      const candidates = document.querySelectorAll('button[aria-label*="close" i], button.mc-modal-bar-close, .mc-closeModal, [data-mc-modal-close], button[class*="close" i]');
      for (const c of candidates) {
        const r = c.getBoundingClientRect();
        if (r.width > 0 && r.height > 0) {
          (c).click();
          return true;
        }
      }
      return false;
    });
    if (!closed) break;
    await page.waitForTimeout(400);
  }
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);

  const totalHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  console.log(`${label}: total height ${totalHeight}px`);
  const step = label === 'desktop' ? 800 : 700;
  let i = 1;
  for (let y = 0; y < totalHeight; y += step) {
    await page.evaluate((y) => window.scrollTo(0, y), y);
    await page.waitForTimeout(700);
    await page.screenshot({ path: path.join(OUT, `${label}-${i}.png`), fullPage: false });
    i++;
    if (i > 16) break;
  }
  if (label === 'desktop') {
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(OUT, 'desktop-full.png'), fullPage: true });
    await writeFile(path.join(OUT, 'alabaster.html'), await page.content(), 'utf8');
  }
  await ctx.close();
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch();
  try {
    await captureAtViewport(browser, 'desktop', 1440, 900);
    await captureAtViewport(browser, 'mobile', 390, 844);
  } finally { await browser.close(); }
  console.log('done');
}
main().catch((e) => { console.error('FATAL:', e); process.exit(1); });
