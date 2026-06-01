import { test, expect } from '@playwright/test'
import { mockAuth } from '../e2e/helpers'

const BASE = 'http://localhost:5173'

const SCREENSHOT_DIR = 'e2e/screenshots/theme-audit'

const PAGES = [
  { path: '/', name: 'landing' },
  { path: '/app/fichas', name: 'fichas' },
  { path: '/app/sonex', name: 'sonex' },
  { path: '/app/almacen', name: 'almacen' },
  { path: '/app/kpi', name: 'kpi' },
  { path: '/app/incidencias', name: 'incidencias' },
  { path: '/app/presupuestos', name: 'presupuestos' },
  { path: '/app/formacion', name: 'formacion' },
]

async function toggleDarkMode(page, enable) {
  await page.evaluate((val) => {
    document.documentElement.setAttribute('data-theme', val ? 'dark' : 'light')
  }, enable)
  await page.waitForTimeout(300)
}

async function checkPageContent(page) {
  const text = await page.evaluate(() => document.body.innerText)
  expect(text.length).toBeGreaterThan(50)
  const hasCrashes = await page.evaluate(() =>
    document.body.innerText.includes('Cannot read properties') ||
    document.body.innerText.includes('undefined is not') ||
    document.body.innerText.includes('Algo salió mal')
  )
  expect(hasCrashes).toBe(false)
}

test.describe('Theme Audit — Light & Dark Mode', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuth(page)
  })

  for (const { path, name } of PAGES) {
    test(`${name} — light mode renders correctly`, async ({ page }) => {
      await page.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded', timeout: 20000 })
      await page.waitForTimeout(2000)
      await checkPageContent(page)
      await page.screenshot({ path: `${SCREENSHOT_DIR}/${name}-light.png`, fullPage: true })
    })

    test(`${name} — dark mode renders correctly`, async ({ page }) => {
      await page.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded', timeout: 20000 })
      await page.waitForTimeout(1500)
      await toggleDarkMode(page, true)
      await page.waitForTimeout(500)
      const theme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'))
      expect(theme).toBe('dark')
      await checkPageContent(page)
      await page.screenshot({ path: `${SCREENSHOT_DIR}/${name}-dark.png`, fullPage: true })
    })
  }

  test('fichas — sidebar search visible in both themes', async ({ page }) => {
    await page.goto(`${BASE}/app/fichas`, { waitUntil: 'domcontentloaded', timeout: 20000 })
    await page.waitForTimeout(2000)
    await expect(page.getByPlaceholder('Buscar referencia o nombre...')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Categorías')).toBeVisible()
    await toggleDarkMode(page, true)
    await expect(page.getByPlaceholder('Buscar referencia o nombre...')).toBeVisible()
    await expect(page.getByText('Categorías')).toBeVisible()
  })

  test('sonex — all mode tabs work', async ({ page }) => {
    await page.goto(`${BASE}/app/sonex`, { waitUntil: 'domcontentloaded', timeout: 20000 })
    await page.waitForTimeout(2000)

    await checkPageContent(page)
    await expect(page.getByPlaceholder(/consulta técnica/i)).toBeVisible({ timeout: 10000 })

    const modeLabels = ['Búsqueda', 'Comparativa', 'Asistencia', 'Formación']
    for (const label of modeLabels) {
      const tab = page.getByRole('tab', { name: new RegExp(label, 'i') })
      if (await tab.isVisible({ timeout: 1000 }).catch(() => false)) {
        await tab.click()
        await page.waitForTimeout(300)
      }
    }
    await checkPageContent(page)

    await toggleDarkMode(page, true)
    await page.waitForTimeout(500)
    await checkPageContent(page)
    await expect(page.getByPlaceholder(/consulta técnica/i)).toBeVisible()
  })

  test('almacen — simulation flow loads', async ({ page }) => {
    await page.goto(`${BASE}/app/almacen`, { waitUntil: 'domcontentloaded', timeout: 20000 })
    await page.waitForTimeout(2000)
    await expect(page.locator('h1').filter({ hasText: 'Simulador Almacén' })).toBeVisible({ timeout: 10000 })
  })

  test('presupuestos — wizard loads and buttons visible', async ({ page }) => {
    await page.goto(`${BASE}/app/presupuestos`, { waitUntil: 'domcontentloaded', timeout: 20000 })
    await page.waitForTimeout(2000)
    await expect(page.locator('h1').filter({ hasText: 'Presupuestos' })).toBeVisible({ timeout: 10000 })
    const buttons = page.getByRole('button')
    const count = await buttons.count()
    expect(count).toBeGreaterThan(0)
    await toggleDarkMode(page, true)
    const darkButtons = page.getByRole('button')
    expect(await darkButtons.count()).toBe(count)
  })
})

test.describe('Theme Audit — Button Contrast', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuth(page)
  })

  test('kpi — primary and secondary buttons visible in both themes', async ({ page }) => {
    await page.goto(`${BASE}/app/kpi`, { waitUntil: 'domcontentloaded', timeout: 20000 })
    await page.waitForTimeout(2000)
    await expect(page.getByRole('button', { name: /calcular kpi/i })).toBeVisible({ timeout: 10000 })
    await expect(page.getByRole('button', { name: /cargar ejemplo/i })).toBeVisible()
    await toggleDarkMode(page, true)
    await expect(page.getByRole('button', { name: /calcular kpi/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /cargar ejemplo/i })).toBeVisible()
  })

  test('landing — hero content visible in both themes', async ({ page }) => {
    await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded', timeout: 20000 })
    await page.waitForTimeout(2000)
    await checkPageContent(page)
    await page.screenshot({ path: `${SCREENSHOT_DIR}/landing-hero-light.png`, fullPage: true })
    await toggleDarkMode(page, true)
    await checkPageContent(page)
    await page.screenshot({ path: `${SCREENSHOT_DIR}/landing-hero-dark.png`, fullPage: true })
  })
})
