import { firefox } from 'playwright';
import { launchOptions } from 'camoufox-js';

async function captureApi() {
  const baseOptions = await launchOptions({ headless: true, geoip: true, humanize: true });

  const browser = await firefox.launch(baseOptions);
  const context = await browser.newContext({ locale: 'es-ES', viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  const ref = '5SL61067CC';
  const url = `https://sieportal.siemens.com/es-es/products-services/detail/${ref.toLowerCase()}?tree=CatalogTree`;

  let productData = null;

  page.on('response', async (resp) => {
    const rurl = resp.url();
    if (rurl.includes('GetEngineeringData') && resp.status() === 200) {
      try {
        const text = await resp.text();
        if (text && text.length > 100) {
          productData = { url: rurl, body: text.substring(0, 8000) };
          console.log(`\n📦 CAPTURED API (${text.length}B): ${rurl}`);
        }
      } catch (e) {
        console.log(`Error capturing API: ${e.message}`);
      }
    }

    // Also check for product info
    if (rurl.includes('GetProductsAndPrices') && resp.status() === 200) {
      try {
        const text = await resp.text();
        if (text && text.length > 100) {
          console.log(`\n💰 PRICES API (${text.length}B): ${text.substring(0, 500)}`);
        }
      } catch {}
    }
  });

  console.log(`Navigating to ${url}...`);
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
  
  console.log('Waiting for API calls...');
  // Wait longer since the page needs to auth first
  for (let i = 0; i < 12; i++) {
    await page.waitForTimeout(5000);
    if (productData) break;
    process.stdout.write(`.`);
  }

  if (productData) {
    console.log('\n=== PRODUCT DATA (first 4000 chars) ===');
    console.log(productData.body.substring(0, 4000));
  } else {
    console.log('\n⚠️ No product API data captured');

    // Check current page URL
    const currentUrl = page.url();
    console.log(`Current URL: ${currentUrl}`);

    // Take screenshot
    await page.screenshot({ path: '/tmp/camoufox-api.png' });
    console.log('Screenshot saved');
  }

  // Get images
  const imgs = await page.evaluate(() =>
    Array.from(document.querySelectorAll('img[src*="static.siemens"]'))
      .map(i => i.getAttribute('src'))
      .filter(Boolean)
  );
  console.log(`\nProduct images: ${imgs.length}`);
  imgs.forEach(i => console.log(`  ${i}`));

  await browser.close();
}

captureApi().catch(err => { console.error(err); process.exit(1); });
