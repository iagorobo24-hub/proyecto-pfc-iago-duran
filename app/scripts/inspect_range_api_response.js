import { chromium } from 'playwright';
import fs from 'fs';

async function run() {
  console.log("Launching browser...");
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    locale: 'es-ES'
  });

  console.log("Navigating to home page...");
  await page.goto('https://www.se.com/es/es/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  const rangeId = '531'; // Zelio Logic
  console.log(`Fetching range data for ID ${rangeId}...`);
  
  try {
    const data = await page.evaluate(async (rid) => {
      const url = `/ranges/${rid}/products?brand=se&country-code=es&language-code=es&No=0&Nrpp=5`;
      const resp = await fetch(url, { headers: { 'Accept': 'application/json' } });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      return await resp.json();
    }, rangeId);
    
    fs.writeFileSync('app/scripts/debug_range_api.json', JSON.stringify(data, null, 2));
    console.log("Saved full range API response to debug_range_api.json");
    
    if (data.recs && data.recs.length > 0) {
      console.log("Record sample keys:", Object.keys(data.recs[0]));
      console.log("Record sample data:", JSON.stringify(data.recs[0], null, 2));
    } else {
      console.log("No records found in recs.");
    }
  } catch (err) {
    console.error("Fetch failed:", err.message);
  }

  await browser.close();
}

run();
