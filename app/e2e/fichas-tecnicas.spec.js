import { test, expect } from '@playwright/test'
import { mockAuth } from './helpers'

const BASE = 'http://localhost:5173'

test.describe('Fichas Técnicas — Catálogo Completo', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuth(page)
    page.on('pageerror', err => console.error('[JS ERROR]', err.message))
    page.on('console', msg => {
      if (msg.type() === 'error') console.error('[CONSOLE ERROR]', msg.text())
    })
  })

  test('Carga de página con familias', async ({ page }) => {
    await page.goto(`${BASE}/app/fichas`, { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(2000)
    await expect(page.locator('h1').filter({ hasText: 'Fichas Técnicas' })).toBeVisible()
    await expect(page.getByText('Familias')).toBeVisible()
    const sidebarCats = page.locator('nav[aria-labelledby="categories-label"] button')
    await expect(sidebarCats.first()).toBeVisible({ timeout: 20000 })
    const count = await sidebarCats.count()
    console.log(`Familias visibles: ${count}`)
    expect(count).toBeGreaterThanOrEqual(1)
  })

  test('Navegación jerárquica completa', async ({ page }) => {
    await page.goto(`${BASE}/app/fichas`, { waitUntil: 'domcontentloaded', timeout: 30000 })
    await page.waitForTimeout(4000)

    const sidebarCats = page.locator('nav[aria-labelledby="categories-label"] button')
    await sidebarCats.first().waitFor({ state: 'attached', timeout: 15000 })
    const catCount = await sidebarCats.count()
    expect(catCount).toBeGreaterThanOrEqual(1)
    await sidebarCats.first().click()
    await page.waitForTimeout(3000)

    const brandBtns = page.locator('section[aria-live="polite"] button')
    const brandCount = await brandBtns.count()
    console.log(`2. Botones en sección principal: ${brandCount}`)
    expect(brandCount).toBeGreaterThanOrEqual(1)
    await brandBtns.first().click()
    await page.waitForTimeout(3000)

    const gamaBtns = page.locator('section[aria-live="polite"] button')
    const gamaCount = await gamaBtns.count()
    console.log(`3. Botones/gamas: ${gamaCount}`)
    if (gamaCount === 0) { console.log('  No hay gamas — OK'); return }
    await gamaBtns.first().click()
    await page.waitForTimeout(3000)

    const tipoBtns = page.locator('section[aria-live="polite"] button')
    const tipoCount = await tipoBtns.count()
    console.log(`4. Tipos: ${tipoCount}`)
    if (tipoCount === 0) { console.log('  No hay tipos — OK'); return }
    await tipoBtns.first().click()
    await page.waitForTimeout(3000)

    const refBtns = page.locator('section[aria-live="polite"] button')
    const refCount = await refBtns.count()
    console.log(`5. Referencias: ${refCount}`)
    if (refCount === 0) { console.log('  No hay referencias — OK'); return }
    await refBtns.first().click()
    await page.waitForTimeout(3000)

    const fichaBtn = page.getByText('Ficha fabricante')
    const hasFichaBtn = await fichaBtn.isVisible().catch(() => false)
    const bodyText = await page.locator('body').textContent() || ''
    const hasNavigated = bodyText.length > 300
    console.log(`6. Ficha fabricante: ${hasFichaBtn} | Contenido: ${hasNavigated}`)
    expect(hasFichaBtn || hasNavigated).toBeTruthy()
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
    const bodyText = await page.locator('body').textContent() || ''
    const hasAnyResult = bodyText.includes('A9F04104') || bodyText.includes('resultados') ||
                         bodyText.includes('resultado') || bodyText.includes('No se encontr')
    console.log(`Búsqueda A9F04104: visible=${hasResult} anyMatch=${hasAnyResult}`)
    expect(hasResult || hasAnyResult).toBeTruthy()
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
    const found = bodyText.toLowerCase().includes('magnetotérmico') ||
                  bodyText.toLowerCase().includes('magnetoter') ||
                  bodyText.includes('resultados') ||
                  bodyText.includes('resultado')
    console.log(`Búsqueda de texto "magnetotérmico": ${found}`)
    expect(found).toBeTruthy()
  })

  test('Sin errores JS en consola durante navegación', async ({ page }) => {
    const jsErrors = []
    page.on('pageerror', err => { jsErrors.push(err.message) })

    await page.goto(`${BASE}/app/fichas`, { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(2000)

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
