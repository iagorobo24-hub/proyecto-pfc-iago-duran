import fs from 'fs';

async function run() {
  const ref = 'SR2A101BD';
  const query = `Schneider ${ref}`;
  const url = `https://lite.duckduckgo.com/lite/`;
  
  console.log(`Searching DuckDuckGo Lite for: ${query}`);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      body: `q=${encodeURIComponent(query)}`
    });
    
    console.log(`Status: ${res.status}`);
    const html = await res.text();
    console.log(`HTML length: ${html.length}`);
    
    // Save to file for debugging
    fs.writeFileSync('scripts/debug_ddg.html', html);
    console.log(`Saved html to scripts/debug_ddg.html`);
    
    // Check if there are links containing se.com or names
    const results = [];
    const linkRegex = /<a[^>]*href="([^"]+)"[^>]*class="result-link"[^>]*>([\s\S]*?)<\/a>/g;
    let match;
    while ((match = linkRegex.exec(html)) !== null) {
      results.push({
        url: match[1],
        title: match[2].replace(/<[^>]*>/g, '').trim()
      });
    }
    
    console.log(`Results found: ${results.length}`);
    results.forEach((r, i) => {
      console.log(`  ${i+1}. Title: "${r.title}"`);
      console.log(`     URL: ${r.url}`);
    });
  } catch (err) {
    console.error("Fetch failed:", err.message);
  }
}

run();
