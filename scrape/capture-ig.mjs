import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const OUT = '/tmp/ig-ref';
const URL = 'https://www.instagram.com/ansar_schoolpdi/?hl=en';

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  try {
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    try { await page.waitForLoadState('load', { timeout: 8000 }); } catch {}
    await page.waitForTimeout(3000);
    const finalUrl = page.url();
    const title = await page.title();
    const bodyText = await page.evaluate(() => document.body.innerText.slice(0, 1500));
    await page.screenshot({ path: path.join(OUT, 'ig.png'), fullPage: false });
    await writeFile(path.join(OUT, 'ig-summary.txt'), `URL: ${URL}\nFinal: ${finalUrl}\nTitle: ${title}\n\n--- Body (first 1.5KB) ---\n${bodyText}\n`, 'utf8');
    console.log('IG captured');
    console.log('Final URL:', finalUrl);
    console.log('Title:', title);
  } catch (e) {
    console.log('IG capture failed:', e.message);
  } finally {
    await ctx.close();
    await browser.close();
  }
}
main().catch((e) => { console.error('FATAL:', e); process.exit(1); });
