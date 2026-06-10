import { chromium } from 'playwright';

const refs = ['SR2A101BD', 'TM241CE40T', 'ATV630D22M3'];

async function run() {
  console.log("Launching browser...");
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    locale: 'es-ES'
  });

  console.log("Navigating to home page to warm up session...");
  await page.goto('https://www.se.com/es/es/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  for (const ref of refs) {
    console.log(`\n=================== Testing reference: ${ref} ===================`);
    try {
      const data = await page.evaluate(async (refId) => {
        const primaryUrl = `/products-card/primary?brand=se&country-code=es&language-code=es&ids=${refId}`;
        const secondaryUrl = `/products-card/secondary?brand=se&country-code=es&language-code=es&ids=${refId}`;
        
        const resPrimary = await fetch(primaryUrl, { headers: { 'Accept': 'application/json' } });
        let primaryData = null;
        if (resPrimary.ok) {
          primaryData = await resPrimary.json();
        }
        
        const resSecondary = await fetch(secondaryUrl, { headers: { 'Accept': 'application/json' } });
        let secondaryData = null;
        if (resSecondary.ok) {
          secondaryData = await resSecondary.json();
        }
        
        return { primaryData, secondaryData, primaryStatus: resPrimary.status, secondaryStatus: resSecondary.status };
      }, ref);
      
      console.log(`Primary status: ${data.primaryStatus}`);
      if (data.primaryData) {
        console.log(`Primary data:`, JSON.stringify(data.primaryData).substring(0, 500));
      }
      
      console.log(`Secondary status: ${data.secondaryStatus}`);
      if (data.secondaryData) {
        console.log(`Secondary data:`, JSON.stringify(data.secondaryData).substring(0, 500));
      }
    } catch (e) {
      console.error(`Error in evaluate:`, e.message);
    }
  }

  await browser.close();
}

run();
