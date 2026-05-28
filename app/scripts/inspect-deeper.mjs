import { chromium } from 'playwright';

async function deeper() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-blink-features=AutomationControlled']
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/125.0.0.0 Safari/537.36',
    locale: 'es-ES',
    viewport: { width: 1920, height: 1080 },
  });

  await context.addInitScript(() => {
    delete Object.getPrototypeOf(navigator).webdriver;
  });

  const page = await context.newPage();

  // Capturar TODAS las respuestas
  const responses = [];
  page.on('response', async (resp) => {
    responses.push({
      url: resp.url().substring(0, 250),
      status: resp.status(),
      type: resp.request().resourceType(),
    });
    if (resp.status() === 200 && (resp.url().includes('api') || resp.url().includes('product'))) {
      try {
        const text = await resp.text();
        if (text.length < 5000) {
          console.log(`\n📦 BODY from ${resp.url().substring(0, 100)}`);
          console.log(text.substring(0, 1000));
        }
      } catch {}
    }
  });

  const url = 'https://sieportal.siemens.com/es-es/products-services/detail/5sl61067cc?tree=CatalogTree';
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(5000);

  console.log('\n=== ALL NETWORK RESPONSES ===');
  const seen = new Set();
  responses.forEach(r => {
    const key = `${r.status}-${r.type}-${r.url.substring(0, 100)}`;
    if (!seen.has(key)) {
      seen.add(key);
      console.log(`  ${r.status} [${r.type}] ${r.url.substring(0, 150)}`);
    }
  });

  // HTML de la página
  const html = await page.content();
  console.log('\n=== TITLE ===');
  console.log(await page.title());
  console.log('\n=== BODY TEXT (first 1000) ===');
  const text = await page.evaluate(() => document.body?.innerText?.substring(0, 1000) || '');
  console.log(text);
  console.log('\n=== SCRIPTS loading ===');
  const scripts = await page.evaluate(() =>
    Array.from(document.querySelectorAll('script[src]')).map(s => s.src).filter(Boolean)
  );
  scripts.forEach(s => console.log(`  ${s}`));

  await browser.close();
}

deeper().catch(err => { console.error(err); process.exit(1); });
