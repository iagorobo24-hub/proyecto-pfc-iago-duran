import { chromium } from 'playwright';

async function run() {
  console.log("Launching browser...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    locale: 'es-ES'
  });
  
  const page = await context.newPage();
  
  // Bypassing webdriver detection
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', {
      get: () => undefined
    });
  });

  const ref = 'SR2A101BD';
  const url = `https://www.se.com/es/es/product/${ref}/`;
  console.log(`Navigating to: ${url}`);
  
  try {
    const res = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    console.log(`Page navigated. Status: ${res ? res.status() : 'N/A'}`);
    console.log(`Page title: "${await page.title()}"`);
    
    if (res && res.status() === 200) {
      const title = await page.evaluate(() => {
        const getMeta = (name) => {
          const el = document.querySelector(`meta[name*="${name}" i], meta[property*="${name}" i]`);
          return el?.getAttribute('content') || '';
        };
        return getMeta('product-name') || getMeta('name') || document.title;
      });
      console.log(`Successfully scraped real title: "${title}"`);
    }
  } catch (err) {
    console.error(`Navigation failed:`, err.message);
  }

  await browser.close();
}

run();
