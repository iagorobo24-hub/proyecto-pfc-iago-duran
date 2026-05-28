import { chromium } from 'playwright';

async function findApi() {
  const browser = await chromium.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-blink-features=AutomationControlled', '--window-size=1920,1080'],
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/125.0.0.0 Safari/537.36',
    viewport: { width: 1920, height: 1080 },
    locale: 'es-ES',
  });

  await context.addInitScript(() => {
    delete Object.getPrototypeOf(navigator).webdriver;
  });

  const page = await context.newPage();

  // Intercept ALL responses and capture bodies of JSON API calls
  const apiCalls = [];
  page.on('response', async (resp) => {
    const url = resp.url();
    const ct = resp.headers()['content-type'] || '';
    if (ct.includes('json') && resp.status() === 200) {
      try {
        const body = await resp.text();
        apiCalls.push({
          url: url.substring(0, 200),
          size: body.length,
          preview: body.substring(0, 300),
        });
      } catch {}
    }
  });

  const url = 'https://sieportal.siemens.com/es-es/products-services/detail/5sl61067cc?tree=CatalogTree';
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });

  // Wait for Angular to render
  await page.waitForTimeout(8000);

  // Check what's visible now
  const visible = await page.evaluate(() => {
    const walker = document.createTreeWalker(document.body, 4, null, Infinity);
    const texts = [];
    let node;
    let count = 0;
    while ((node = walker.nextNode()) && count < 30) {
      const t = node.textContent.trim();
      if (t.length > 5) { texts.push(t.substring(0, 100)); count++; }
    }
    return texts;
  });
  console.log('=== VISIBLE TEXT ===');
  visible.forEach(t => console.log(`  ${t}`));

  // Find API calls that contain product data
  console.log('\n=== JSON API CALLS (sorted by size) ===');
  apiCalls
    .sort((a, b) => b.size - a.size)
    .slice(0, 15)
    .forEach(c => {
      console.log(`\n[${c.size}B] ${c.url}`);
      if (c.size < 2000) console.log(`  ${c.preview}`);
    });

  await browser.close();
}

findApi().catch(err => { console.error(err); process.exit(1); });
