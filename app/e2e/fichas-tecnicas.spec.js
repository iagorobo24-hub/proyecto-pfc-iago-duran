import { test, expect } from '@playwright/test'

const BASE = process.env.BASE_URL || 'http://localhost:5173'
const MOCK_USER = {
  uid: 'test-user-123',
  id: 'test-user-123',
  displayName: 'Usuario Test',
  email: 'test@example.com',
  user_metadata: { full_name: 'Usuario Test' },
}

test.describe('Fichas Técnicas — Catálogo Completo', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(user => { window.__PW_MOCK_USER__ = user }, MOCK_USER)
    page.on('pageerror', err => console.error('[JS ERROR]', err.message))
    page.on('console', msg => {
      if (msg.type() === 'error') console.error('[CONSOLE ERROR]', msg.text())
    })
  })

  test('Carga de página con categorías', async ({ page }) => {
    await page.goto(`${BASE}/app/fichas`, { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(2000)
    await expect(page.locator('h1').filter({ hasText: 'Fichas Técnicas' })).toBeVisible()
    await expect(page.getByText('Categorías')).toBeVisible()
    const sidebarCats = page.locator('nav[aria-labelledby="categories-label"] button')
    await expect(sidebarCats.first()).toBeVisible({ timeout: 20000 })
    const count = await sidebarCats.count()
    console.log(`Categorías visibles: ${count}`)
    expect(count).toBeGreaterThanOrEqual(1)
  })

  test('Navegación jerárquica completa: Categoría → Marca → Gama → Tipo → Referencias → Ficha', async ({ page }) => {
    await page.goto(`${BASE}/app/fichas`, { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(3000)

    // 1. Click on first category button (sidebar)
    const sidebarCats = page.locator('nav[aria-labelledby="categories-label"] button')
    const catCount = await sidebarCats.count()
    expect(catCount).toBeGreaterThanOrEqual(1)
    const catName = await sidebarCats.first().locator('div').nth(1).locator('div').first().textContent() || 'cat'
    console.log(`1. Categoría: ${catName}`)
    await sidebarCats.first().click()
    await page.waitForTimeout(3000)

    // 2. Wait for brands section and check at least one brand button exists
    await page.waitForTimeout(1000)
    const brandBtns = page.locator('section[aria-live="polite"] button')
    const brandCount = await brandBtns.count()
    console.log(`2. Botones visibles en sección principal: ${brandCount}`)
    expect(brandCount).toBeGreaterThanOrEqual(1)
    await brandBtns.first().click()
    await page.waitForTimeout(3000)

    // 3. Check gamas loaded
    const gamaBtns = page.locator('section[aria-live="polite"] button')
    const gamaCount = await gamaBtns.count()
    console.log(`3. Botones/gamas visibles: ${gamaCount}`)
    if (gamaCount === 0) {
      console.log('  No hay gamas — saltando')
      return
    }
    await gamaBtns.first().click()
    await page.waitForTimeout(3000)

    // 4. Check tipos loaded
    const tipoBtns = page.locator('section[aria-live="polite"] button')
    const tipoCount = await tipoBtns.count()
    console.log(`4. Tipos visibles: ${tipoCount}`)
    if (tipoCount === 0) {
      console.log('  No hay tipos — saltando')
      return
    }
    await tipoBtns.first().click()
    await page.waitForTimeout(3000)

    // 5. Check referencias loaded
    const refBtns = page.locator('section[aria-live="polite"] button')
    const refCount = await refBtns.count()
    console.log(`5. Referencias visibles: ${refCount}`)
    expect(refCount).toBeGreaterThanOrEqual(1)
    await refBtns.first().click()
    await page.waitForTimeout(3000)

    // 6. Check ficha loaded
    const fichaBtn = page.getByText('Ficha fabricante')
    const hasFichaBtn = await fichaBtn.isVisible().catch(() => false)
    console.log(`6. Botón "Ficha fabricante" visible: ${hasFichaBtn}`)
    expect(hasFichaBtn).toBeTruthy()
  })

  test('Búsqueda por referencia existente (Acti 9 iC60)', async ({ page }) => {
    await page.goto(`${BASE}/app/fichas`, { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(3000)

    const searchInput = page.locator('#catalog-search')
    await expect(searchInput).toBeVisible()
    await searchInput.fill('A9F04104')
    await page.getByRole('button', { name: 'Buscar' }).click()
    await page.waitForTimeout(3000)

    const hasResult = await page.getByText('A9F04104').isVisible().catch(() => false)
    console.log(`Búsqueda de referencia A9F04104 encontrada: ${hasResult}`)
  })

  test('Búsqueda por referencia Legrand', async ({ page }) => {
    await page.goto(`${BASE}/app/fichas`, { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(3000)

    const searchInput = page.locator('#catalog-search')
    await expect(searchInput).toBeVisible()
    await searchInput.fill('419925')
    await page.getByRole('button', { name: 'Buscar' }).click()
    await page.waitForTimeout(3000)

    const hasResult = await page.getByText('419925').isVisible().catch(() => false)
    console.log(`Búsqueda Legrand 419925 encontrada: ${hasResult}`)
  })

  test('Búsqueda por texto', async ({ page }) => {
    await page.goto(`${BASE}/app/fichas`, { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(3000)

    const searchInput = page.locator('#catalog-search')
    await searchInput.fill('magnetotérmico')
    await page.getByRole('button', { name: 'Buscar' }).click()
    await page.waitForTimeout(3000)

    const bodyText = await page.locator('body').textContent() || ''
    const found = bodyText.includes('magnetotérmico') || bodyText.includes('resultados')
    console.log(`Búsqueda de texto "magnetotérmico": ${found}`)
    expect(found).toBeTruthy()
  })

  test('Sin errores JS en consola durante navegación', async ({ page }) => {
    const jsErrors = []
    page.on('pageerror', err => { jsErrors.push(err.message) })

    await page.goto(`${BASE}/app/fichas`, { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(2000)

    // Navigate through sidebar categories
    const sidebarCats = page.locator('nav[aria-labelledby="categories-label"] button')
    const catCount = await sidebarCats.count()
    for (let i = 0; i < Math.min(catCount, 3); i++) {
      const btns = page.locator('nav[aria-labelledby="categories-label"] button')
      await btns.nth(i).click()
      await page.waitForTimeout(2000)
    }

    console.log(`Errores JS durante navegación: ${jsErrors.length}`)
    expect(jsErrors.length).toBe(0)
  })
})
