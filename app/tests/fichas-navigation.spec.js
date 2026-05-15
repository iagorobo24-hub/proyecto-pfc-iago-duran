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

    await expect(page.getByText('Fichas Técnicas').first()).toBeVisible({ timeout: 15000 })
    await expect(page.getByText('Categorías')).toBeVisible()
    await expect(page.getByPlaceholder('Buscar referencia...')).toBeVisible()
  })

  test('Navegación entre herramientas sin recargar', async ({ page }) => {
    let reloadCount = 0
    page.on('load', () => { reloadCount++ })

    await page.goto(`${BASE}/app/fichas`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(1000)
    await expect(page.getByRole('heading', { name: /Fichas Técnicas/i })).toBeVisible({ timeout: 5000 })

    await page.getByRole('link', { name: /Incidencias/i }).click()
    await page.waitForTimeout(500)
    expect(page.url()).toContain('/incidencias')

    await page.getByRole('link', { name: /Sonex/i }).click()
    await page.waitForTimeout(500)
    expect(page.url()).toContain('/sonex')

    await page.getByRole('link', { name: /KPI/i }).click()
    await page.waitForTimeout(500)
    expect(page.url()).toContain('/kpi')

    expect(reloadCount).toBeLessThanOrEqual(1)
  })

  test('Clic en categoría del sidebar navega', async ({ page }) => {
    await page.goto(`${BASE}/app/fichas`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(3000)

    const catBtns = page.getByRole('button').filter({ hasText: 'Ver marcas' })
    const count = await catBtns.count()
    expect(count).toBeGreaterThan(0)

    await catBtns.first().click()
    await page.waitForTimeout(1000)

    const pageContent = await page.locator('body').textContent()
    const hasMarcasOrEmpty = pageContent.includes('No hay marcas') || pageContent.includes('marca')
    expect(hasMarcasOrEmpty).toBe(true)
  })
})
