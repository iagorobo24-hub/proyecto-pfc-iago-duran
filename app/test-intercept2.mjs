import { firefox } from 'playwright';
import { launchOptions } from 'camoufox-js';

const baseOptions = await launchOptions({ headless: true, geoip: false, humanize: true });
const browser = await firefox.launch(baseOptions);
const ctx = await browser.newContext({ locale: 'es-ES', viewport: { width: 1920, height: 1080 } });
const page = await ctx.newPage();

const allRequests = [];

// Capture ALL requests
page.on('response', async (resp) => {
  const url = resp.url();
  const ct = resp.headers()['content-type'] || '';
  if (ct.startsWith('image/') || url.includes('IoP') || url.includes('Image') || 
      url.includes('rendition') || url.includes('gallery') || url.includes('preview')) {
    allRequests.push({ url: url.substring(0, 250), status: resp.status(), ct });
  }
});

console.log('Navigating...');
await page.goto('https://www.se.com/es/es/product/A9F03102/', { waitUntil: 'domcontentloaded', timeout: 30000 });

// Wait longer and scroll to trigger lazy loading
console.log('Waiting for lazy load...');
await page.waitForTimeout(5000);
await page.evaluate(() => window.scrollTo(0, 500));
await page.waitForTimeout(3000);
await page.evaluate(() => window.scrollTo(0, 1000));
await page.waitForTimeout(3000);

// Check all images on page including data-src
const allImgs = await page.evaluate(() => {
  const imgs = document.querySelectorAll('img');
  return Array.from(imgs).map(img => ({
    src: img.src,
    dataSrc: img.getAttribute('data-src'),
    dataZoom: img.getAttribute('data-zoom-image'),
    className: img.className,
    alt: img.alt
  })).filter(i => i.src || i.dataSrc || i.dataZoom);
});

console.log('\nAll images on page:');
allImgs.forEach(i => console.log('  src:', i.src?.substring(0,120), '| dataSrc:', i.dataSrc?.substring(0,120), '| zoom:', i.dataZoom?.substring(0,120)));

console.log('\nCaptured network requests:');
allRequests.forEach(r => console.log(`  [${r.status}] ${r.ct} → ${r.url}`));

await browser.close();
