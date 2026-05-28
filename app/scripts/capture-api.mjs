import { firefox } from 'playwright';
import { launchOptions } from 'camoufox-js';

async function captureApi() {
  const baseOptions = await launchOptions({ headless: true, geoip: true, humanize: true });

  const browser = await firefox.launch(baseOptions);
  const context = await browser.newContext({ locale: 'es-ES', viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  const ref = '5SL61067CC';
  const url = `https://sieportal.siemens.com/es-es/products-services/detail/${ref.toLowerCase()}?tree=CatalogTree`;

  // Capture the product info API response
  let productData = null;
  page.on('response', async (resp) => {
    if (resp.url().includes('GetEngineeringData') && resp.status() === 200) {
      try {
        productData = await resp.json();
      } catch {}
    }
  });

  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForTimeout(8000);

  if (productData) {
    console.log('=== PRODUCT API RESPONSE ===');
    console.log(JSON.stringify(productData, null, 2).substring(0, 5000));
  } else {
    console.log('No product API data captured');

    // Try fetching it manually
    console.log('\nTrying direct API fetch...');
    const apiResp = await page.evaluate(async () => {
      const r = await fetch('/api/mall/ProductInformation/GetEngineeringData?ArticleNumber=5sl61067cc&RegionId=es&CountryCode=es&Language=es&SapAccountId=');
      const data = await r.json();
      return JSON.stringify(data).substring(0, 5000);
    });
    console.log(apiResp);
  }

  // Also get all image URLs from the page
  const allImgs = await page.evaluate(() =>
    Array.from(document.querySelectorAll('img[src*="siemens"]'))
      .map(i => i.src)
      .filter(src => !src.includes('sieportal.siemens.com/assets'))
  );
  console.log('\n=== PRODUCT IMAGES ===');
  allImgs.forEach(i => console.log(`  ${i}`));

  await browser.close();
}

captureApi().catch(err => { console.error(err); process.exit(1); });
