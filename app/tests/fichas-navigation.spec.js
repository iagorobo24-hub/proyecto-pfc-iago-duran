import { test, expect } from '@playwright/test'
import { mockAuth } from '../e2e/helpers'

const BASE = 'http://localhost:5173'

test.describe('Fichas Técnicas — Funcionalidad', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuth(page)
  })

  test('Sidebar con categorías y buscador visibles', async ({ page }) => {
    await page.goto(`${BASE}/app/fichas`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(2000)

    await expect(page.locator('h1').filter({ hasText: 'Fichas Técnicas' })).toBeVisible({ timeout: 15000 })
    await expect(page.getByText('Categorías')).toBeVisible()
    await expect(page.getByPlaceholder('Buscar referencia o nombre...')).toBeVisible()
  })

  test('Navegación entre herramientas sin recargar', async ({ page }) => {
    let reloadCount = 0
    page.on('load', () => { reloadCount++ })

    await page.goto(`${BASE}/app/fichas`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(1000)
    await expect(page.locator('h1').filter({ hasText: 'Fichas Técnicas' })).toBeVisible({ timeout: 5000 })

    await page.locator('[role="banner"] a', { hasText: 'Dashboard Incidencias' }).first().click()
    await page.waitForTimeout(500)
    expect(page.url()).toContain('/incidencias')

    await page.locator('[role="banner"] a', { hasText: 'Sonex' }).first().click()
    await page.waitForTimeout(500)
    expect(page.url()).toContain('/sonex')

    await page.locator('[role="banner"] a', { hasText: 'KPI Logístico' }).first().click()
    await page.waitForTimeout(500)
    expect(page.url()).toContain('/kpi')

    expect(reloadCount).toBeLessThanOrEqual(1)
  })

  test('Clic en categoría del sidebar navega', async ({ page }) => {
    await page.goto(`${BASE}/app/fichas`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(3000)

    const catBtns = page.locator('nav[aria-labelledby="categories-label"] button')
    const count = await catBtns.count()
    expect(count).toBeGreaterThan(0)

    await catBtns.first().click()
    await page.waitForTimeout(1000)

    const pageContent = await page.locator('body').textContent()
    const hasContent = pageContent.includes('marca') || pageContent.includes('Marca') ||
                       pageContent.includes('No hay') || pageContent.includes('gama') ||
                       pageContent.includes('Gama')
    expect(hasContent).toBe(true)
  })
})
