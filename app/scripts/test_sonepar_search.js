import { chromium } from 'playwright';

async function run() {
  console.log("Launching browser...");
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    locale: 'es-ES'
  });

  const ref = 'SR2A101BD';
  const url = `https://www.sonepar.es/search?q=${ref}`;
  console.log(`Navigating to Sonepar: ${url}`);
  
  try {
    const res = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    console.log(`Page navigated. Status: ${res ? res.status() : 'N/A'}`);
    await page.waitForTimeout(5000);
    
    console.log(`Page title: "${await page.title()}"`);
    
    // Check if there are product card titles on the page
    const productTitle = await page.evaluate(() => {
      // Common selectors for product titles in Sonepar
      const selectors = [
        '.product-name',
        '.product-title',
        'h1',
        'h2',
        '.card-title',
        '[class*="title"]',
        '[class*="name"]'
      ];
      
      for (const sel of selectors) {
        const el = document.querySelector(sel);
        if (el && el.textContent.trim().length > 10) {
          return `${sel}: "${el.textContent.trim()}"`;
        }
      }
      return 'No product title elements found';
    });
    console.log(`Product title: ${productTitle}`);
    
    // Print first 500 chars of body text
    const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 500));
    console.log(`Body text preview:`, bodyText);
  } catch (err) {
    console.error(`Sonepar navigation failed:`, err.message);
  }

  await browser.close();
}

run();
