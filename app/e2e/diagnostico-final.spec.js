import { test, expect } from '@playwright/test'
import { mockAuth } from './helpers'

const BASE = 'http://localhost:5173'

test.describe('Diagnóstico Final', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuth(page)
  })

  test('Verifica todas las páginas con capturas', async ({ page }) => {
    const pages = [
      { name: 'Fichas Técnicas', path: '/app/fichas', title: /Fichas Técnicas|Cargando/i },
      { name: 'Simulador Almacén', path: '/app/almacen', title: /Simulador Almacén|Cargando/i },
      { name: 'Dashboard Incidencias', path: '/app/incidencias', title: /Incidencias|Cargando/i },
      { name: 'KPI Logístico', path: '/app/kpi', title: /KPI|Cargando/i },
      { name: 'Presupuestos', path: '/app/presupuestos', title: /Presupuestos|Cargando/i },
      { name: 'Formación Interna', path: '/app/formacion', title: /Formación|Cargando/i },
      { name: 'SONEX', path: '/app/sonex', title: /SONEX|Sonex|Cargando/i },
    ]

    console.log('\n' + '='.repeat(60))
    console.log('DIAGNÓSTICO FINAL')
    console.log('='.repeat(60))

    const results = []

    for (const p of pages) {
      let status = 'OK'
      let notes = ''

      try {
        await page.goto(`${BASE}${p.path}`, { waitUntil: 'domcontentloaded', timeout: 15000 })
        await page.waitForTimeout(2000)

        const check = await page.evaluate(() => ({
          bodyLen: document.body.innerText.length,
          hasTitle: !!document.querySelector('h1'),
          hasError: document.body.innerText.includes('Cannot read properties') ||
                   document.body.innerText.includes('undefined is not')
        }))

        if (check.bodyLen > 80 && !check.hasError) {
          status = 'OK'
        } else if (check.bodyLen > 30) {
          status = 'PARCIAL'
          notes = `chars: ${check.bodyLen}`
        } else {
          status = 'VACÍO'
          notes = `solo ${check.bodyLen} caracteres`
        }

        await page.screenshot({
          path: `e2e/screenshots/final-${p.path.replace('/app/', '')}.png`,
          fullPage: true,
          timeout: 10000
        })
      } catch (err) {
        status = 'CRASH'
        notes = err.message.substring(0, 60)
      }

      results.push({ name: p.name, status, notes })
      console.log(`${status.padEnd(10)} ${p.name.padEnd(22)} ${notes}`)
    }

    console.log('='.repeat(60))
    const ok = results.filter(r => r.status === 'OK').length
    const parcial = results.filter(r => r.status === 'PARCIAL').length
    const vacio = results.filter(r => r.status === 'VACÍO' || r.status === 'CRASH').length
    console.log(`RESUMEN: ${ok} OK | ${parcial} Parcial | ${vacio} Vacío/Error`)
    console.log('='.repeat(60))

    expect(ok + parcial).toBeGreaterThanOrEqual(6)
  })

  test('Navegación completa verifica URLs correctas', async ({ page }) => {
    await page.goto(`${BASE}/app/fichas`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(1000)

    const nav = [
      { name: 'Simulador Almacén', url: /\/app\/almacen/ },
      { name: 'Dashboard Incidencias', url: /\/app\/incidencias/ },
      { name: 'KPI Logístico', url: /\/app\/kpi/ },
      { name: 'Presupuestos', url: /\/app\/presupuestos/ },
      { name: 'Formación Interna', url: /\/app\/formacion/ },
      { name: 'Sonex', url: /\/app\/sonex/ },
    ]

    for (const item of nav) {
      await page.locator('[role="banner"] a', { hasText: item.name }).first().click()
      await expect(page).toHaveURL(item.url, { timeout: 5000 })
      await page.waitForTimeout(300)
    }
  })

  test('Diseño visual — Fichas Técnicas', async ({ page }) => {
    await page.goto(`${BASE}/app/fichas`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(2000)

    const hasCategories = await page.getByText('Categorías').isVisible()
    const hasSearch = await page.getByPlaceholder('Buscar referencia o nombre...').isVisible()
    const hasHeading = await page.locator('h1').filter({ hasText: 'Fichas Técnicas' }).isVisible()

    await page.screenshot({ path: 'e2e/screenshots/final-design-fichas.png', fullPage: true })

    expect(hasCategories).toBe(true)
    expect(hasSearch).toBe(true)
    expect(hasHeading).toBe(true)
    console.log('Fichas Técnicas — Categorías:', hasCategories, '| Buscador:', hasSearch, '| Título:', hasHeading)
  })

  test('Diseño visual — SONEX', async ({ page }) => {
    await page.goto(`${BASE}/app/sonex`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(2000)

    const hasSonexText = await page.getByText('En que puedo ayudarte').first().isVisible()
    const hasInput = await page.getByPlaceholder(/consulta|pregunta|escribe/i).isVisible()

    await page.screenshot({ path: 'e2e/screenshots/final-design-sonex.png', fullPage: true })

    expect(hasSonexText).toBe(true)
    expect(hasInput).toBe(true)
    console.log('SONEX — Texto:', hasSonexText, '| Input:', hasInput)
  })
})
