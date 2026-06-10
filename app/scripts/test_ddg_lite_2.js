import fs from 'fs';

function parseDDGLite(html) {
  const results = [];
  const linkRegex = /<a[^>]*href=["']([^"']+)["'][^>]*class=['"]result-link['"][^>]*>([\s\S]*?)<\/a>/g;
  
  let match;
  while ((match = linkRegex.exec(html)) !== null) {
    const href = match[1];
    const rawTitle = match[2];
    const cleanTitle = rawTitle.replace(/<[^>]*>/g, '').trim().replace(/\s+/g, ' ');
    
    // Find snippet by searching forward for the next result-snippet
    const searchStartIndex = html.indexOf(rawTitle, match.index);
    const snippetIndex = html.indexOf("class='result-snippet'", searchStartIndex);
    const snippetIndex2 = html.indexOf('class="result-snippet"', searchStartIndex);
    
    let useIndex = -1;
    if (snippetIndex !== -1 && snippetIndex2 !== -1) {
      useIndex = Math.min(snippetIndex, snippetIndex2);
    } else if (snippetIndex !== -1) {
      useIndex = snippetIndex;
    } else if (snippetIndex2 !== -1) {
      useIndex = snippetIndex2;
    }
    
    let snippet = '';
    if (useIndex !== -1 && useIndex - searchStartIndex < 2000) {
      const endTd = html.indexOf('</td>', useIndex);
      if (endTd !== -1) {
        const snippetHtml = html.substring(useIndex + 22, endTd);
        snippet = snippetHtml.replace(/<[^>]*>/g, '').trim().replace(/\s+/g, ' ');
      }
    }
    
    const backwardCheck = html.substring(Math.max(0, match.index - 250), match.index);
    const isSponsored = backwardCheck.includes('result-sponsored');
    
    results.push({
      url: href,
      title: cleanTitle,
      snippet: snippet,
      isSponsored: isSponsored
    });
  }
  return results;
}

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
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      body: `q=${encodeURIComponent(query)}&kl=es-es`
    });
    
    console.log(`Status: ${res.status}`);
    const html = await res.text();
    
    const results = parseDDGLite(html);
    console.log(`Results found: ${results.length}`);
    results.forEach((r, i) => {
      console.log(`  ${i+1}. Title: "${r.title}"`);
      console.log(`     URL: ${r.url}`);
      console.log(`     Snippet: "${r.snippet}"`);
      console.log(`     Sponsored: ${r.isSponsored}`);
    });
  } catch (err) {
    console.error("Fetch failed:", err.message);
  }
}

run();
