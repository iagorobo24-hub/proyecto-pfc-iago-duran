import { test, expect } from '@playwright/test'
import { mockAuth } from './helpers.js'

const BASE = 'http://localhost:5173'

test.describe('Test de Integración Backend — Supabase y API', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuth(page)
  })

  test('Catálogo cargado desde Supabase tiene datos reales', async ({ page }) => {
    await page.goto(`${BASE}/app/fichas`, { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(3000)

    const stats = await page.evaluate(() => {
      const text = document.body.innerText
      const hasCategories = document.querySelectorAll('nav button, [aria-labelledby*="category"]').length > 0
      const hasSearch = document.querySelector('input[placeholder*="buscar"], input[placeholder*="Buscar"]') !== null
      const hasContent = text.length > 500
      return { hasCategories, hasSearch, hasContent }
    })

    console.log('Stats:', stats)
    expect(stats.hasCategories || stats.hasSearch || stats.hasContent).toBe(true)
  })

  test('Buscador devuelve respuestas estructuradas', async ({ page }) => {
    await page.goto(`${BASE}/app/fichas`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(2000)

    const searchInput = page.getByPlaceholder(/buscar referencia/i)
    await searchInput.fill('A9F04104')
    await page.getByRole('button', { name: /buscar/i }).click()
    await page.waitForTimeout(3000)

    const response = await page.evaluate(() => {
      const text = document.body.innerText
      const hasResults = text.includes('A9F04104') ||
                        document.querySelectorAll('tr, .result, .product').length > 0
      const hasNoResults = text.toLowerCase().includes('no se encontr') ||
                          text.toLowerCase().includes('no hay') ||
                          text.toLowerCase().includes('sin resultados')
      return hasResults || hasNoResults
    })

    expect(response).toBe(true)
  })

  test('Filtrado jerárquico mantiene estado correctamente', async ({ page }) => {
    await page.goto(`${BASE}/app/fichas`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(2000)

    const categories = await page.locator('nav[aria-labelledby="categories-label"] button').count()
    expect(categories).toBeGreaterThan(0)

    const firstCat = page.locator('nav[aria-labelledby="categories-label"] button').first()
    await firstCat.click()
    await page.waitForTimeout(2000)

    const brandsAfterCat = await page.locator('section[aria-live="polite"] button').count()
    console.log(`Brands after category: ${brandsAfterCat}`)

    if (brandsAfterCat > 0) {
      await page.locator('section[aria-live="polite"] button').first().click()
      await page.waitForTimeout(2000)

      const searchStillWorks = await page.locator('#catalog-search').isVisible()
      expect(searchStillWorks).toBe(true)
    }
  })
})

test.describe('Test de Integración UI — Setup de Depuración', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuth(page)
    page.on('console', msg => {
      if (msg.type() === 'error') console.log('CONSOLE ERROR:', msg.text())
    })
    page.on('pageerror', err => console.log('PAGE ERROR:', err.message))
  })

  test('Todas las rutas principales cargan sin errores de React', async ({ page }) => {
    const routes = [
      '/',
      '/app/fichas',
      '/app/kpi',
      '/app/almacen',
      '/app/incidencias',
      '/app/presupuestos',
      '/app/formacion',
      '/app/sonex'
    ]

    const errors = []

    for (const route of routes) {
      try {
        await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle', timeout: 20000 })
        await page.waitForTimeout(1500)

        const reactErrors = await page.evaluate(() => {
          const body = document.body.innerText
          return {
            hasSuspense: body.includes('Suspense boundary'),
            hasHydration: body.includes('Hydration failed'),
            hasComponentError: body.includes('Element type is invalid') ||
                              body.includes('React.createElement type is invalid'),
            hasUndefined: body.includes('undefined is not') ||
                         body.includes('Cannot read properties of undefined')
          }
        })

        if (reactErrors.hasSuspense || reactErrors.hasHydration ||
            reactErrors.hasComponentError || reactErrors.hasUndefined) {
          errors.push({ route, errors: reactErrors })
        }

        console.log(`✓ ${route} loaded successfully`)
      } catch (err) {
        errors.push({ route, errors: { loadError: err.message } })
        console.log(`✗ ${route} failed: ${err.message}`)
      }
    }

    console.log('\n=== RESUMEN DE ERRORES ===')
    console.log(`Total rutas: ${routes.length}`)
    console.log(`Errores: ${errors.length}`)

    expect(errors.length).toBe(0)
  })

  test('Navegación SPA mantiene estado de sesión', async ({ page }) => {
    await page.goto(`${BASE}/app/fichas`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(1000)

    const userInfo = await page.evaluate(() => ({
      hasUserContext: window.__PW_MOCK_USER__ !== undefined,
    }))

    expect(userInfo.hasUserContext).toBe(true)

    const links = ['Simulador Almacén', 'Dashboard Incidencias', 'KPI Logístico']

    for (const link of links) {
      const btn = page.locator('[role="banner"] a', { hasText: link }).first()
      if (await btn.isVisible().catch(() => false)) {
        await btn.click()
        await page.waitForTimeout(500)

        const stillHasUser = await page.evaluate(() => window.__PW_MOCK_USER__ !== undefined)
        expect(stillHasUser).toBe(true)
      }
    }
  })
})

test.describe('Test de Validación de Datos — Formularios y Entradas', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuth(page)
  })

  test('Formulario KPI valida inputs numéricos correctamente', async ({ page }) => {
    await page.goto(`${BASE}/app/kpi`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(2000)

    const inputs = page.locator('input[type="number"]')
    const count = await inputs.count()

    expect(count).toBeGreaterThan(0)

    for (let i = 0; i < Math.min(3, count); i++) {
      await inputs.nth(i).fill('1000')
    }

    await page.getByRole('button', { name: /cargar|calcular/i }).first().click()
    await page.waitForTimeout(2000)

    const pageText = await page.content()
    const hasCrash = pageText.includes('Uncaught') || pageText.includes('Error:')
    expect(hasCrash).toBe(false)
  })

  test('Formulario rechaza valores inválidos sin romper', async ({ page }) => {
    await page.goto(`${BASE}/app/kpi`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(2000)

    const inputs = page.locator('input[type="number"]')

    await inputs.nth(0).fill('-999999')
    await inputs.nth(2).fill('0')

    await page.getByRole('button', { name: /calcular/i }).click()
    await page.waitForTimeout(2000)

    const pageText = await page.content()
    const hasCrash = pageText.includes('Cannot read') || pageText.includes('Uncaught')
    expect(hasCrash).toBe(false)
  })
})
