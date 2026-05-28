import { chromium } from 'playwright';

async function inspect() {
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

  // Capturar peticiones de red
  const requests = [];
  page.on('response', resp => {
    if (resp.url().includes('image') || resp.url().includes('api') || resp.url().includes('product')) {
      requests.push({ url: resp.url().substring(0, 200), status: resp.status() });
    }
  });

  const url = 'https://sieportal.siemens.com/es-es/products-services/detail/5sl61067cc?tree=CatalogTree';
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

  // Esperar un poco más a que cargue JS
  await page.waitForTimeout(3000);

  console.log('=== ALL IMG TAGS ===');
  const allImgs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('img')).map(img => ({
      src: img.src,
      alt: img.alt,
      className: (img.className || '').substring(0, 60),
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      complete: img.complete,
    }));
  });
  console.log(JSON.stringify(allImgs, null, 2));

  console.log('\n=== BACKGROUND IMAGES (CSS) ===');
  const bgImgs = await page.evaluate(() => {
    const el = document.querySelector('[style*="background"]');
    if (el) return el.outerHTML.substring(0, 500);
    return 'none found';
  });
  console.log(bgImgs);

  console.log('\n=== NETWORK REQUESTS (relevant) ===');
  requests.forEach(r => console.log(`  ${r.status} ${r.url.substring(0, 180)}`));

  console.log('\n=== PAGE SOURCE SNIPPET ===');
  const html = await page.content();
  // Buscar referencias a mall.industry o collaterals
  const matches = html.match(/mall\.industry[^\s"')]+/g);
  if (matches) {
    console.log('CDN URLs found:', matches.slice(0, 5));
  } else {
    console.log('No CDN URLs in HTML');
    // Buscar API calls
    const apiCalls = html.match(/\/api\/[^\s"')]+/g);
    if (apiCalls) console.log('API calls:', apiCalls.slice(0, 10));
  }

  await browser.close();
}

inspect().catch(err => { console.error(err); process.exit(1); });
