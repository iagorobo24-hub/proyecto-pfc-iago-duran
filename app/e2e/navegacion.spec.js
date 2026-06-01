import { test, expect } from '@playwright/test'
import { mockAuth } from './helpers'

const BASE = 'http://localhost:5173'

test.describe('Navegación entre Herramientas', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuth(page)
  })

  test('Navegación correcta sin recargar — ruta completa', async ({ page }) => {
    let reloadCount = 0
    page.on('load', () => { reloadCount++ })

    await page.goto(`${BASE}/app/fichas`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(1000)
    await expect(page).toHaveURL(/\/app\/fichas/)
    await expect(page.locator('h1').filter({ hasText: 'Fichas Técnicas' })).toBeVisible()

    await page.locator('[role="banner"] a', { hasText: 'Sonex' }).first().click()
    await page.waitForTimeout(500)
    await expect(page).toHaveURL(/\/app\/sonex/)

    await page.locator('[role="banner"] a', { hasText: 'KPI Logístico' }).first().click()
    await page.waitForTimeout(500)
    await expect(page).toHaveURL(/\/app\/kpi/)

    await page.locator('[role="banner"] a', { hasText: 'Dashboard Incidencias' }).first().click()
    await page.waitForTimeout(500)
    await expect(page).toHaveURL(/\/app\/incidencias/)

    await page.locator('[role="banner"] a', { hasText: 'Fichas Técnicas' }).first().click()
    await page.waitForTimeout(500)
    await expect(page).toHaveURL(/\/app\/fichas/)

    expect(reloadCount).toBeLessThanOrEqual(1)
    console.log('Navegación completada con', reloadCount, 'recargas')
  })
})
