import { test, expect } from '@playwright/test'
import { mockAuth } from '../e2e/helpers'

const BASE = 'http://localhost:5173'

test.describe('Verificación Visual Completa', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuth(page)
  })

  test('1. Landing page carga con título visible', async ({ page }) => {
    await page.goto(BASE, { waitUntil: 'networkidle' })
    await page.waitForTimeout(2000)
    const hasContent = await page.evaluate(() => document.body.innerText.length > 100)
    expect(hasContent).toBe(true)
  })

  test('2. Fichas Técnicas — sidebar con buscador', async ({ page }) => {
    await page.goto(`${BASE}/app/fichas`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(2000)

    await expect(page.getByPlaceholder('Buscar referencia o nombre...')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Categorías')).toBeVisible()
  })

  test('3. KPI Logístico — botones calcular y cargar ejemplo visibles', async ({ page }) => {
    await page.goto(`${BASE}/app/kpi`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(2000)

    await expect(page.getByRole('button', { name: /calcular kpi/i })).toBeVisible({ timeout: 10000 })
    await expect(page.getByRole('button', { name: /cargar ejemplo/i })).toBeVisible()
  })

  test('4. Simulador Almacén — página cargada', async ({ page }) => {
    await page.goto(`${BASE}/app/almacen`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(2000)
    await expect(page.locator('h1').filter({ hasText: 'Simulador Almacén' })).toBeVisible({ timeout: 10000 })
  })

  test('5. Dashboard Incidencias — página cargada', async ({ page }) => {
    await page.goto(`${BASE}/app/incidencias`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(2000)
    await expect(page.locator('h1').filter({ hasText: 'Dashboard Incidencias' })).toBeVisible({ timeout: 10000 })
  })

  test('6. Presupuestos — página cargada', async ({ page }) => {
    await page.goto(`${BASE}/app/presupuestos`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(2000)
    await expect(page.locator('h1').filter({ hasText: 'Presupuestos' })).toBeVisible({ timeout: 10000 })
  })

  test('7. Formación Interna — página cargada', async ({ page }) => {
    await page.goto(`${BASE}/app/formacion`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(2000)
    await expect(page.locator('h1').filter({ hasText: 'Formación Interna' })).toBeVisible({ timeout: 10000 })
  })

  test('8. SONEX — chat e input visibles', async ({ page }) => {
    await page.goto(`${BASE}/app/sonex`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(3000)
    const hasContent = await page.evaluate(() => document.body.innerText.length > 100)
    expect(hasContent).toBe(true)
    const hasInput = await page.getByPlaceholder(/consulta|escribe/i).isVisible().catch(() => false)
    expect(hasInput).toBe(true)
  })
})
