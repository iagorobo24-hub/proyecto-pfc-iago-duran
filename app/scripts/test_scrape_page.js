import { chromium } from 'playwright';
import fs from 'fs';

async function run() {
  console.log("Launching browser...");
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    locale: 'es-ES'
  });

  const ref = 'SR2A101BD';
  const url = `https://www.se.com/es/es/product/${ref}/`;
  console.log(`Navigating to: ${url}`);
  
  try {
    const res = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    console.log(`Page navigated. Status: ${res ? res.status() : 'N/A'}`);
    console.log(`Page title: "${await page.title()}"`);
    
    const html = await page.content();
    fs.writeFileSync('app/scripts/debug_page.html', html);
    console.log(`Saved page HTML to debug_page.html (size: ${html.length} bytes)`);
    
    // Check if page contains meta tags
    const metaTitle = await page.evaluate(() => {
      const el = document.querySelector('meta[name="product-name"], meta[property="og:title"], meta[name="description"]');
      return el ? el.outerHTML : 'no meta tag found';
    });
    console.log(`Meta tag sample: ${metaTitle}`);
  } catch (err) {
    console.error(`Navigation failed:`, err.message);
  }

  await browser.close();
}

run();
