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
    await expect(page.getByRole('heading', { name: 'Fichas Técnicas' }).first()).toBeVisible()

    await page.getByRole('link', { name: 'Sonex' }).click()
    await page.waitForTimeout(500)
    await expect(page).toHaveURL(/\/app\/sonex/)

    await page.getByRole('link', { name: 'KPI' }).click()
    await page.waitForTimeout(500)
    await expect(page).toHaveURL(/\/app\/kpi/)

    await page.getByRole('link', { name: 'Incidencias' }).click()
    await page.waitForTimeout(500)
    await expect(page).toHaveURL(/\/app\/incidencias/)

    await page.getByRole('link', { name: 'Fichas Técnicas' }).click()
    await page.waitForTimeout(500)
    await expect(page).toHaveURL(/\/app\/fichas/)

    expect(reloadCount).toBeLessThanOrEqual(1)
    console.log('Navegación completada con', reloadCount, 'recargas')
  })
})
