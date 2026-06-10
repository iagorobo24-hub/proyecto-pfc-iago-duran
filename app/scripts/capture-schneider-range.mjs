import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    locale: 'es-ES'
  });
  const page = await context.newPage();

  console.log('Listening for network requests...');
  page.on('request', req => {
    const url = req.url();
    if (req.isNavigationRequest()) {
      console.log(`[NAV-REQ] ${req.method()} ${url}`);
    }
  });

  page.on('response', async res => {
    const url = res.url();
    if (res.request().isNavigationRequest()) {
      console.log(`[NAV-RESP] ${res.status()} ${url}`);
    }
  });

  console.log('Loading range page...');
  await page.goto('https://www.se.com/ww/en/product-range/64295-harmony-st6/', { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(e => console.log('Goto error:', e.message));
  await page.waitForTimeout(3000);
  console.log('Final Page URL:', page.url());

  await browser.close();
}

main().catch(console.error);
