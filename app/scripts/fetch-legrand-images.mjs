/**
 * FETCH LEGRAND PRODUCT IMAGES
 *
 * Scrapes Legrand product pages to find product images and stores them in the DB.
 *
 * Uso: node scripts/fetch-legrand-images.mjs [--dry-run] [--resume]
 */

import { execSync } from 'child_process'
import fs from 'fs'

const SONEX_URL = 'https://fncmzrnmzmuhlullkrud.supabase.co'
const SONEX_KEY = process.env.SONEX_SUPABASE_KEY || ''
const HEADERS = { 'apikey': SONEX_KEY, 'Authorization': `Bearer ${SONEX_KEY}`, 'Content-Type': 'application/json' }
const DRY_RUN = process.argv.includes('--dry-run')
const RESUME = process.argv.includes('--resume')
const PROGRESS_FILE = '/tmp/legrand-img-progress.json'

const FC_DIR = '/home/abu/github_repos/proyecto-pfc-iago-duran/.firecrawl'

function scrapePage(url) {
  const tmpFile = `/tmp/fc-legrand-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.json`
  try {
    execSync(`firecrawl scrape "${url}" --format markdown --only-main-content -o "${tmpFile}" 2>/dev/null`, { timeout: 30000, stdio: 'pipe' })
    if (!fs.existsSync(tmpFile)) return null
    const content = fs.readFileSync(tmpFile, 'utf-8')
    const matches = content.match(/https:\/\/[^\s"']*ecat_assets[^\s"']*\.(jpg|png)/g)
    if (!matches || matches.length === 0) {
      if (content.includes('no-image.png')) return 'NO_IMAGE'
      return null
    }
    // Prefer full-size image (no product_slider, no media_library)
    const fullSize = matches.find(u => !u.includes('product_slider') && !u.includes('media_library'))
    return fullSize || matches[0]
  } catch (e) {
    return null
  } finally {
    try { fs.unlinkSync(tmpFile) } catch {}
  }
}

async function updateProductImage(id, imagenUrl) {
  const body = JSON.stringify({ imagen: imagenUrl })
  const res = await fetch(`${SONEX_URL}/rest/v1/products?id=eq.${id}`, {
    method: 'PATCH',
    headers: { ...HEADERS, 'Prefer': 'return=minimal' },
    body,
  })
  return res.ok
}

async function main() {
  console.log('📦 Loading Legrand products...')
  const productsRes = await fetch(`${SONEX_URL}/rest/v1/products?marca=eq.Legrand&select=id,ref_fabricante,name,familia,imagen&limit=1000`, { headers: HEADERS })
  let products = await productsRes.json()
  if (products.length >= 1000) {
    const more = await fetch(`${SONEX_URL}/rest/v1/products?marca=eq.Legrand&select=id,ref_fabricante,name,familia,imagen&limit=1000&offset=1000`, { headers: HEADERS })
    products = products.concat(await more.json())
  }
  console.log(`📋 ${products.length} products loaded`)

  const needImages = products.filter(p => !p.imagen)
  console.log(`🖼️  ${needImages.length} need images`)

  if (needImages.length === 0) { console.log('✨ All done.'); return }

  // Build URL index from map file
  const mapText = fs.readFileSync(`${FC_DIR}/legrand-all-products.json`, 'utf-8')
  const urlByRef = {}
  for (const url of mapText.split('\n')) {
    const m = url.match(/-(\d+)$/)
    if (m) urlByRef[m[1]] = url
  }

  const toScrape = needImages.filter(p => urlByRef[p.ref_fabricante])
  const noPage = needImages.filter(p => !urlByRef[p.ref_fabricante])

  console.log(`🔗 ${toScrape.length} have product pages, ${noPage.length} without pages`)

  if (noPage.length > 0) {
    console.log(`\n⚠️  ${noPage.length} products without individual pages — marking as NO_IMAGE`)
    if (!DRY_RUN) {
      let updated = 0
      for (let i = 0; i < noPage.length; i += 50) {
        const batch = noPage.slice(i, i + 50)
        const results = await Promise.all(batch.map(p => updateProductImage(p.id, '').then(ok => ok)))
        updated += results.filter(Boolean).length
      }
      console.log(`  ✅ ${updated} marked as no image`)
    }
  }

  // Load progress
  let progress = { results: [] }
  if (RESUME && fs.existsSync(PROGRESS_FILE)) {
    progress = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'))
    const doneRefs = new Set(progress.results.map(r => r.ref))
    const remaining = toScrape.filter(p => !doneRefs.has(p.ref_fabricante))
    console.log(`\n🔄 Resuming: ${progress.results.length} done, ${remaining.length} remaining`)
    toScrape.length = 0; toScrape.push(...remaining)
  }

  if (toScrape.length === 0) {
    if (noPage.length === 0) console.log('\n✨ All done.')
    return
  }

  console.log(`\n🚀 Scraping ${toScrape.length} product pages (2 concurrent)...\n`)
  const results = progress.results
  const startTime = Date.now()

  for (let i = 0; i < toScrape.length; i += 2) {
    const batch = toScrape.slice(i, i + 2)
    const batchResults = await Promise.all(batch.map(async p => {
      const url = urlByRef[p.ref_fabricante]
      const imgUrl = await scrapePage(url)
      const result = { ref: p.ref_fabricante, id: p.id, url, imgUrl, status: imgUrl && imgUrl !== 'NO_IMAGE' ? 'found' : imgUrl === 'NO_IMAGE' ? 'no_image' : 'error' }
      return result
    }))

    for (const r of batchResults) results.push(r)

    // Save every 20
    if (results.length % 20 === 0 || i + 2 >= toScrape.length)
      fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2))

    const found = results.filter(r => r.status === 'found').length
    const noImg = results.filter(r => r.status === 'no_image').length
    const errs = results.filter(r => r.status === 'error').length
    const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1)
    process.stdout.write(`\r  ${results.length}/${toScrape.length} | ✅ ${found} | ⚠️ ${noImg} | ❌ ${errs} | ⏱ ${elapsed}min`)
  }

  console.log('\n\n📊 RESULTS:')
  const found = results.filter(r => r.status === 'found')
  const noImage = results.filter(r => r.status === 'no_image')
  const errors = results.filter(r => r.status === 'error')
  console.log(`  ✅ Images found: ${found.length}`)
  console.log(`  ⚠️  No image: ${noImage.length}`)
  console.log(`  ❌ Errors: ${errors.length}`)

  fs.writeFileSync('/tmp/legrand-img-results.json', JSON.stringify(results, null, 2))
  console.log('\n📄 Results saved to /tmp/legrand-img-results.json')

  if (DRY_RUN) { console.log('\n🔷 DRY RUN — no DB changes.'); return }

  // Update DB
  console.log('\n💾 Updating DB...')
  let updated = 0
  let errCount = 0
  const toUpdate = found.concat(noImage.map(r => ({ ...r, imgUrl: '' })))

  for (let i = 0; i < toUpdate.length; i += 50) {
    const batch = toUpdate.slice(i, i + 50)
    const dbResults = await Promise.all(batch.map(r =>
      updateProductImage(r.id, r.imgUrl || '')
        .then(ok => ok ? 'ok' : 'fail')
        .catch(() => 'fail')
    ))
    updated += dbResults.filter(s => s === 'ok').length
    errCount += dbResults.filter(s => s === 'fail').length
    process.stdout.write(`\r  ${updated} ok, ${errCount} err (${Math.min(i + 50, toUpdate.length)}/${toUpdate.length})`)
  }

  const totalOk = updated + (noPage.length > 0 && !DRY_RUN ? noPage.length : 0)
  console.log(`\n\n✅ Total updated: ${totalOk} products`)
  if (errCount > 0) console.log(`❌ DB errors: ${errCount}`)
}

main().catch(console.error)
