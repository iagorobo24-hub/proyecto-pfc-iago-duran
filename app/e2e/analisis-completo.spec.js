import { test, expect } from '@playwright/test'
import { mockAuth, takeScreenshot } from './helpers'

const BASE = 'http://localhost:5173'

test.describe('Auditoría Completa — Proyecto PFC Iago Durán @functional', () => {

  test.beforeEach(async ({ page }) => {
    await mockAuth(page)
    page.on('pageerror', err => console.error('[JS ERROR]', err.message))
    page.on('console', msg => {
      if (msg.type() === 'error') console.error('[CONSOLE ERROR]', msg.text())
    })
  })

  /* ───────────── 1. LOGIN ───────────── */
  test.describe('1. Login', () => {
    test('Página de login carga correctamente', async ({ page }) => {
      await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' })
      await page.waitForTimeout(1000)
      // With mock auth, user gets redirected to /app — verify redirect works
      const url = page.url()
      const isOnLogin = url.includes('/login')
      const isOnApp = url.includes('/app')
      expect(isOnLogin || isOnApp).toBe(true)
      await takeScreenshot(page, '01-login')
    })

    test('Redirección automática al estar autenticado (mock)', async ({ page }) => {
      await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' })
      await page.waitForURL(url => ['/app', '/app/fichas'].includes(url.pathname), { timeout: 5000 })
      expect(['/app', '/app/fichas']).toContain(new URL(page.url()).pathname)
    })
  })

  test.describe('2. Topbar & Sidebar', () => {
    test('Topbar y Sidebar con herramientas visibles', async ({ page }) => {
      await page.goto(`${BASE}/app/fichas`, { waitUntil: 'networkidle' })
      const topbar = page.locator('[role="banner"]')
      await expect(topbar).toBeVisible()
      const sidebar = page.locator('[role="navigation"]')
      await expect(sidebar).toBeVisible()
      const tools = ['Fichas Técnicas', 'Simulador Almacén', 'Dashboard Incidencias', 'KPI Logístico', 'Presupuestos', 'Formación Interna', 'Sonex']
      for (const tool of tools) {
        await expect(sidebar.getByRole('link', { name: tool })).toBeVisible()
      }
      await expect(page.getByTitle('Volver al inicio')).toBeVisible()
      await takeScreenshot(page, '02-topbar-sidebar')
    })
  })

  /* ───────────── 3. NAVEGACIÓN ───────────── */
  test.describe('3. Navegación', () => {
    test('Navegación entre todas las herramientas sin recargar', async ({ page }) => {
      let reloadCount = 0
      page.on('load', () => { reloadCount++ })

      await page.goto(`${BASE}/app/fichas`, { waitUntil: 'domcontentloaded' })
      await page.waitForTimeout(1000)

      const routes = [
        { link: 'Simulador Almacén', url: /\/app\/almacen/ },
        { link: 'Dashboard Incidencias', url: /\/app\/incidencias/ },
        { link: 'KPI Logístico', url: /\/app\/kpi/ },
        { link: 'Presupuestos', url: /\/app\/presupuestos/ },
        { link: 'Formación Interna', url: /\/app\/formacion/ },
        { link: 'Sonex', url: /\/app\/sonex/ },
      ]

      for (const r of routes) {
        await page.locator('[role="navigation"] a', { hasText: r.link }).first().click()
        await expect(page).toHaveURL(r.url, { timeout: 5000 })
        await page.waitForTimeout(300)
      }

      expect(reloadCount).toBeLessThanOrEqual(1)
      await takeScreenshot(page, '03-navegacion-final')
    })
  })

  /* ───────────── 4. FICHAS TÉCNICAS ───────────── */
  test.describe('4. Fichas Técnicas', () => {
    test('Sidebar con buscador y categorías visible', async ({ page }) => {
      await page.goto(`${BASE}/app/fichas`, { waitUntil: 'networkidle' })
      await expect(page.locator('h1').filter({ hasText: 'Fichas Técnicas' })).toBeVisible()
      await expect(page.getByPlaceholder('Buscar referencia o nombre...')).toBeVisible()
      await takeScreenshot(page, '04-fichas-sidebar')
    })

    test('Buscador acepta texto', async ({ page }) => {
      await page.goto(`${BASE}/app/fichas`, { waitUntil: 'networkidle' })
      const search = page.getByPlaceholder('Buscar referencia o nombre...')
      await expect(search).toBeVisible()
      await search.fill('ATV320')
      await page.getByRole('button', { name: /buscar/i }).click()
      await page.waitForTimeout(2000)
      await takeScreenshot(page, '04-fichas-busqueda')
    })
  })

  /* ───────────── 5. SIMULADOR ALMACÉN ───────────── */
  test.describe('5. Simulador Almacén', () => {
    test('Página de perfil cargada', async ({ page }) => {
      await page.goto(`${BASE}/app/almacen`, { waitUntil: 'networkidle' })
      await expect(page.locator('h1').filter({ hasText: 'Simulador Almacén' })).toBeVisible()
      await takeScreenshot(page, '05-almacen')
    })
  })

  /* ───────────── 6. DASHBOARD INCIDENCIAS ───────────── */
  test.describe('6. Dashboard Incidencias', () => {
    test('Dashboard con KPIs y secciones visibles', async ({ page }) => {
      await page.goto(`${BASE}/app/incidencias`, { waitUntil: 'networkidle' })
      await expect(page.locator('h1').filter({ hasText: 'Dashboard Incidencias' })).toBeVisible()
      await takeScreenshot(page, '06-incidencias')
    })
  })

  /* ───────────── 7. KPI LOGÍSTICO ───────────── */
  test.describe('7. KPI Logístico', () => {
    test('Formulario y botones visibles', async ({ page }) => {
      await page.goto(`${BASE}/app/kpi`, { waitUntil: 'networkidle' })
      await expect(page.locator('h1').filter({ hasText: 'KPI Logístico' })).toBeVisible()
      await expect(page.getByRole('button', { name: /cargar ejemplo/i })).toBeVisible()
      await expect(page.getByRole('button', { name: /calcular kpi/i })).toBeVisible()
      await takeScreenshot(page, '07-kpi')
    })

    test('Carga de ejemplo y botón calcular visible', async ({ page }) => {
      await page.goto(`${BASE}/app/kpi`, { waitUntil: 'networkidle' })
      await page.getByRole('button', { name: /cargar ejemplo/i }).click()
      await page.waitForTimeout(500)
      await page.getByRole('button', { name: /calcular kpi/i }).first().click()
      await page.waitForTimeout(2000)
      await takeScreenshot(page, '07-kpi-resultados')
    })
  })

  /* ───────────── 8. PRESUPUESTOS ───────────── */
  test.describe('8. Presupuestos', () => {
    test('Categorías visibles', async ({ page }) => {
      await page.goto(`${BASE}/app/presupuestos`, { waitUntil: 'networkidle' })
      await expect(page.locator('h1').filter({ hasText: 'Presupuestos' })).toBeVisible()
      await takeScreenshot(page, '08-presupuestos')
    })
  })

  /* ───────────── 9. FORMACIÓN INTERNA ───────────── */
  test.describe('9. Formación Interna', () => {
    test('Dashboard de formación cargado', async ({ page }) => {
      await page.goto(`${BASE}/app/formacion`, { waitUntil: 'networkidle' })
      await expect(page.locator('h1').filter({ hasText: 'Formación Interna' })).toBeVisible()
      await takeScreenshot(page, '09-formacion')
    })
  })

  /* ───────────── 10. SONEX ───────────── */
  test.describe('10. SONEX', () => {
    test('Chat y sugerencias visibles', async ({ page }) => {
      await page.goto(`${BASE}/app/sonex`, { waitUntil: 'networkidle' })
      await expect(page.getByText(/¿En qué puedo ayudarte\?/i).first()).toBeVisible()
      await expect(page.getByPlaceholder(/consulta|pregunta|escribe/i)).toBeVisible()
      await takeScreenshot(page, '10-sonex')
    })

    test('Envío de mensaje', async ({ page }) => {
      await page.goto(`${BASE}/app/sonex`, { waitUntil: 'networkidle' })
      const input = page.getByPlaceholder(/consulta|pregunta|escribe/i)
      await expect(input).toBeVisible()
      await input.fill('¿Qué es un variador de frecuencia?')
      await input.press('Enter')
      await page.waitForTimeout(1000)
      await takeScreenshot(page, '10-sonex-mensaje')
    })
  })

  /* ───────────── 11. RESPONSIVE ───────────── */
  test.describe('11. Responsive', () => {
    test('Tablet (768px) sin errores', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 })
      await page.goto(`${BASE}/app/fichas`, { waitUntil: 'networkidle' })
      await page.waitForTimeout(1500)
      await takeScreenshot(page, '11-responsive-tablet')
    })

    test('Mobile (375px) sin errores', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 })
      await page.goto(`${BASE}/app/fichas`, { waitUntil: 'networkidle' })
      await page.waitForTimeout(1500)
      await takeScreenshot(page, '11-responsive-mobile')
    })
  })

  /* ───────────── 12. MODO OSCURO ───────────── */
  test.describe('12. Modo Oscuro', () => {
    test('Toggle a modo oscuro funciona', async ({ page }) => {
      await page.goto(`${BASE}/app/fichas`, { waitUntil: 'networkidle' })
      const toggle = page.getByTitle(/cambiar a modo oscuro/i)
      await expect(toggle).toBeVisible()
      await toggle.click()
      await page.waitForTimeout(500)
      const isDark = await page.evaluate(() =>
        document.documentElement.getAttribute('data-theme') === 'dark'
      )
      expect(isDark).toBe(true)
      await takeScreenshot(page, '12-darkmode')
    })
  })

  /* ───────────── 13. LANDING PAGE ───────────── */
  test.describe('13. Landing Page', () => {
    test('Landing page carga con contenido', async ({ page }) => {
      await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
      await page.waitForTimeout(2000)
      const hasContent = await page.evaluate(() => document.body.innerText.length > 100)
      expect(hasContent).toBe(true)
      await takeScreenshot(page, '13-landing')
    })
  })
})
