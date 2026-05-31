const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  const res = await page.goto('https://www.se.com/es/es/product/A9F03102/', { waitUntil: 'domcontentloaded', timeout: 15000 });
  console.log('Status:', res?.status());
  console.log('URL:', page.url());
  
  const title = await page.title();
  console.log('Title:', title);
  
  const bodyText = await page.textContent('body');
  console.log('Body length:', bodyText?.length);
  console.log('Body preview:', bodyText?.substring(0, 200));
  
  const imgs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('img')).map(e => ({
      src: (e.src || '').substring(0, 120),
      alt: (e.alt || '').substring(0, 50)
    }));
  });
  console.log('Images found:', imgs.length);
  imgs.slice(0, 10).forEach(i => console.log('  ', JSON.stringify(i)));
  
  await browser.close();
})();
