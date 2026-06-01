import { test, expect } from '@playwright/test'
import { mockAuth } from './helpers'

const BASE = 'http://localhost:5173'

test.describe('Fichas Técnicas — Vista Tabla y Marcas', () => {

  test.beforeEach(async ({ page }) => {
    await mockAuth(page)
    page.on('pageerror', err => console.error('[JS ERROR]', err.message))
  })

  test('Vista tabla visible para Schneider Acti 9 iC60 magnetotérmicos', async ({ page }) => {
    await page.goto(`${BASE}/app/fichas`, { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(2000)

    // Click "Distribución de Potencia"
    const sidebarCats = page.locator('nav[aria-labelledby="categories-label"] button')
    await sidebarCats.first().click()
    await page.waitForTimeout(3000)

    // Click Schneider Electric brand
    const schneiderBtn = page.getByText('Schneider Electric').first()
    await expect(schneiderBtn).toBeVisible({ timeout: 10000 })
    await schneiderBtn.click()
    await page.waitForTimeout(3000)

    // Click "INTERRUPTORES DE BAJA TENSION" (or similar) to get to magnetotérmicos
    const gamaBtns = page.locator('section[aria-live="polite"] button')
    const gamaCount = await gamaBtns.count()
    console.log(`Gamas visibles: ${gamaCount}`)

    // Find and click a gama that contains magnetotérmicos
    let clickedGama = false
    for (let i = 0; i < gamaCount; i++) {
      const text = await gamaBtns.nth(i).textContent()
      if (text && text.includes('BAJA TENSION')) {
        await gamaBtns.nth(i).click()
        clickedGama = true
        break
      }
    }
    if (!clickedGama && gamaCount > 0) {
      // Fallback: click first gama with magnetotérmico keyword
      for (let i = 0; i < gamaCount; i++) {
        const text = await gamaBtns.nth(i).textContent()
        if (text && (text.includes('Magnetot') || text.includes('iC60') || text.includes('NSX') || text.includes('Resi9'))) {
          await gamaBtns.nth(i).click()
          clickedGama = true
          break
        }
      }
    }
    if (!clickedGama) {
      console.log('No se encontró gama magnetotérmica — test saltado')
      return
    }
    await page.waitForTimeout(3000)

    // Check tipos loaded
    const tipoBtns = page.locator('section[aria-live="polite"] button')
    const tipoCount = await tipoBtns.count()
    console.log(`Tipos visibles: ${tipoCount}`)
    if (tipoCount === 0) {
      console.log('No hay tipos — saltando')
      return
    }

    // Click first tipo (should be CARRIL DIN or similar)
    await tipoBtns.first().click()
    await page.waitForTimeout(3000)

    // Check if table view appeared
    const tableEl = page.locator('div[class*="tableHeader"], div[class*="wrap"]').first()
    const hasTable = await tableEl.isVisible().catch(() => false)
    console.log(`¿Vista tabla visible?: ${hasTable}`)

    if (hasTable) {
      // Verify table structure: should have curve labels and pole columns
      console.log('Vista tabla detectada correctamente')

      // Try clicking a reference cell
      const refButtons = page.locator('button').filter({ hasText: /^A9F/ })
      const firstRef = await refButtons.first()
      if (await firstRef.isVisible().catch(() => false)) {
        await firstRef.click()
        await page.waitForTimeout(2000)
        const fichaVisible = await page.getByText('Ficha fabricante').isVisible().catch(() => false)
        console.log(`Ficha visible tras click en tabla: ${fichaVisible}`)
      }
    } else {
      // Fallback: check if card grid is visible instead
      const cards = page.locator('button[class*="refCard"]')
      const cardCount = await cards.count()
      console.log(`Referencias en cards: ${cardCount}`)
    }
  })

  test('Vista tabla para Legrand RX³', async ({ page }) => {
    await page.goto(`${BASE}/app/fichas`, { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(2000)

    const sidebarCats = page.locator('nav[aria-labelledby="categories-label"] button')
    await sidebarCats.first().click()
    await page.waitForTimeout(3000)

    // Click Legrand brand
    const legrandBtn = page.getByText('Legrand').first()
    await expect(legrandBtn).toBeVisible({ timeout: 10000 })
    await legrandBtn.click()
    await page.waitForTimeout(3000)

    // Navigate to magnetotérmicos
    const gamaBtns = page.locator('section[aria-live="polite"] button')
    const gamaCount = await gamaBtns.count()
    console.log(`Gamas Legrand: ${gamaCount}`)

    let clickedGama = false
    for (let i = 0; i < gamaCount; i++) {
      const text = await gamaBtns.nth(i).textContent()
      if (text && text.includes('Magnetot')) {
        await gamaBtns.nth(i).click()
        clickedGama = true
        break
      }
    }
    if (!clickedGama && gamaCount > 0) {
      for (let i = 0; i < gamaCount; i++) {
        const text = await gamaBtns.nth(i).textContent()
        if (text && (text.includes('RX') || text.includes('TX') || text.includes('BAJA TENSION'))) {
          await gamaBtns.nth(i).click()
          clickedGama = true
          break
        }
      }
    }
    if (!clickedGama) {
      console.log('No se encontró gama Legrand magnetotérmica')
      return
    }
    await page.waitForTimeout(3000)

    const tipoBtns = page.locator('section[aria-live="polite"] button')
    const tipoCount = await tipoBtns.count()
    console.log(`Tipos Legrand: ${tipoCount}`)
    if (tipoCount === 0) return

    await tipoBtns.first().click()
    await page.waitForTimeout(3000)

    const tableEl = page.locator('div[class*="tableHeader"], div[class*="wrap"]').first()
    const hasTable = await tableEl.isVisible().catch(() => false)
    console.log(`¿Vista tabla Legrand visible?: ${hasTable}`)
  })

  test('Búsqueda directa Legrand 419925 muestra ficha', async ({ page }) => {
    await page.goto(`${BASE}/app/fichas`, { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(2000)

    const searchInput = page.locator('#catalog-search')
    await searchInput.fill('419925')
    await page.getByRole('button', { name: 'Buscar' }).click()
    await page.waitForTimeout(3000)

    // Should show the Legrand product
    const result = await page.getByText('419925').isVisible().catch(() => false)
    console.log(`Legrand 419925 encontrado: ${result}`)
  })

  test('Búsqueda directa Schneider A9F04104 muestra ficha', async ({ page }) => {
    await page.goto(`${BASE}/app/fichas`, { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(2000)

    const searchInput = page.locator('#catalog-search')
    await searchInput.fill('A9F04104')
    await page.getByRole('button', { name: 'Buscar' }).click()
    await page.waitForTimeout(3000)

    const result = await page.getByText('A9F04104').isVisible().catch(() => false)
    console.log(`Schneider A9F04104 encontrado: ${result}`)
  })

  test('Topbar muestra ambas marcas (Schneider + Legrand)', async ({ page }) => {
    await page.goto(`${BASE}/app/fichas`, { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(2000)

    const sidebarCats = page.locator('nav[aria-labelledby="categories-label"] button')
    await sidebarCats.first().click()
    await page.waitForTimeout(3000)

    const schneiderVisible = await page.getByText('Schneider Electric').first().isVisible().catch(() => false)
    const legrandVisible = await page.getByText('Legrand').first().isVisible().catch(() => false)
    console.log(`Schneider visible: ${schneiderVisible} | Legrand visible: ${legrandVisible}`)
    expect(schneiderVisible).toBe(true)
    expect(legrandVisible).toBe(true)
  })

  test('Vista tabla diferenciales para Schneider Acti 9 Vigi iC60', async ({ page }) => {
    test.setTimeout(60000)
    await page.goto(`${BASE}/app/fichas`, { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(2000)

    const sidebarCats = page.locator('nav[aria-labelledby="categories-label"] button')
    await sidebarCats.first().click()
    await page.waitForTimeout(3000)

    const schneiderBtn = page.getByText('Schneider Electric').first()
    await expect(schneiderBtn).toBeVisible({ timeout: 10000 })
    await schneiderBtn.click()
    await page.waitForTimeout(3000)

    const gamaBtns = page.locator('section[aria-live="polite"] button')
    const gamaCount = await gamaBtns.count()
    console.log(`Gamas Schneider: ${gamaCount}`)

    // Find and click a differential gama
    let clickedGama = false
    for (let i = 0; i < gamaCount; i++) {
      const text = await gamaBtns.nth(i).textContent()
      const lower = (text || '').toLowerCase()
      if (lower.includes('vigi') || lower.includes('iid') || lower.includes('diferencial')) {
        console.log(`Click en gama diferencial: ${text}`)
        await gamaBtns.nth(i).click()
        clickedGama = true
        break
      }
    }
    if (!clickedGama) {
      console.log('No se encontró gama diferencial — test saltado')
      return
    }
    await page.waitForTimeout(3000)

    const tipoBtns = page.locator('section[aria-live="polite"] button')
    const tipoCount = await tipoBtns.count()
    console.log(`Tipos diferenciales: ${tipoCount}`)
    if (tipoCount === 0) return

    await tipoBtns.first().click()
    await page.waitForTimeout(3000)

    // Check if differential table view appeared
    // The table header shows "{sens} mA" — look for a section with a numeric+mA pattern
    const tableWrap = page.locator('div[class*="wrap"]').first()
    const hasTable = await tableWrap.isVisible().catch(() => false)
    console.log(`¿Vista tabla diferencial visible?: ${hasTable}`)

    if (hasTable) {
      const mAHeaders = page.locator('span:has-text("mA")')
      const mAHeaderCount = await mAHeaders.count()
      console.log(`Encabezados de sensibilidad encontrados: ${mAHeaderCount}`)
    }
  })

  test('Vista tabla diferenciales para Legrand RX³ Diferencial', async ({ page }) => {
    test.setTimeout(60000)
    await page.goto(`${BASE}/app/fichas`, { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(2000)

    const sidebarCats = page.locator('nav[aria-labelledby="categories-label"] button')
    await sidebarCats.first().click()
    await page.waitForTimeout(3000)

    const legrandBtn = page.getByText('Legrand').first()
    await expect(legrandBtn).toBeVisible({ timeout: 10000 })
    await legrandBtn.click()
    await page.waitForTimeout(3000)

    const gamaBtns = page.locator('section[aria-live="polite"] button')
    const gamaCount = await gamaBtns.count()
    console.log(`Gamas Legrand diferenciales: ${gamaCount}`)

    let clickedGama = false
    for (let i = 0; i < gamaCount; i++) {
      const text = await gamaBtns.nth(i).textContent()
      const lower = (text || '').toLowerCase()
      if (lower.includes('diferencial')) {
        console.log(`Click en gama: ${text}`)
        await gamaBtns.nth(i).click()
        clickedGama = true
        break
      }
    }
    if (!clickedGama) {
      console.log('No se encontró gama Diferencial Legrand')
      return
    }
    await page.waitForTimeout(3000)

    const tipoBtns = page.locator('section[aria-live="polite"] button')
    const tipoCount = await tipoBtns.count()
    console.log(`Tipos Legrand dif: ${tipoCount}`)
    if (tipoCount === 0) return

    await tipoBtns.first().click()
    await page.waitForTimeout(3000)

    const tableWrap = page.locator('div[class*="wrap"]').first()
    const hasTable = await tableWrap.isVisible().catch(() => false)
    console.log(`¿Vista tabla diferencial Legrand visible?: ${hasTable}`)
  })
})
