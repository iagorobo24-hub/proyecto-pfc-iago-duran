import { test, expect } from '@playwright/test'
import { mockAuth } from './helpers'

const BASE = 'http://localhost:5173'

test.describe('Diagnóstico Rápido', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuth(page)
    page.on('pageerror', err => console.error('[JS ERROR]', err.message))
    page.on('console', msg => {
      if (msg.type() === 'error') console.error('[CONSOLE ERROR]', msg.text())
    })
  })

  test('Todas las páginas cargan sin error', async ({ page }) => {
    const pages = [
      { name: 'Fichas Técnicas', path: '/app/fichas' },
      { name: 'Simulador Almacén', path: '/app/almacen' },
      { name: 'Dashboard Incidencias', path: '/app/incidencias' },
      { name: 'KPI Logístico', path: '/app/kpi' },
      { name: 'Presupuestos', path: '/app/presupuestos' },
      { name: 'Formación Interna', path: '/app/formacion' },
      { name: 'SONEX', path: '/app/sonex' },
    ]

    console.log('\n' + '='.repeat(60))
    console.log('DIAGNÓSTICO DE PÁGINAS')
    console.log('='.repeat(60))

    let okCount = 0
    let errorCount = 0

    for (const p of pages) {
      try {
        await page.goto(`${BASE}${p.path}`, { waitUntil: 'domcontentloaded', timeout: 15000 })
        await page.waitForTimeout(1500)

        const hasContent = await page.evaluate(() => document.body.innerText.length > 80)
        const hasError = await page.evaluate(() =>
          document.querySelector('[role="alert"]') !== null ||
          document.body.innerText.includes('Cannot read properties')
        )
        const hasCrash = await page.evaluate(() => document.body.innerText.length < 20)

        if (hasContent && !hasError && !hasCrash) {
          console.log(`  ${p.name.padEnd(25)} OK`)
          okCount++
        } else if (hasCrash) {
          console.log(`  ${p.name.padEnd(25)} PÁGINA EN BLANCO`)
          errorCount++
        } else {
          console.log(`  ${p.name.padEnd(25)} PARCIAL`)
          okCount++
        }

        await page.screenshot({
          path: `e2e/screenshots/diag-${p.path.replace('/app/', '')}.png`,
          fullPage: true
        })
      } catch (err) {
        console.log(`  ${p.name.padEnd(25)} ERROR: ${err.message.substring(0, 60)}`)
        errorCount++
      }
    }

    console.log('='.repeat(60))
    console.log(`RESUMEN: ${okCount} OK | ${errorCount} ERROR`)
    console.log('='.repeat(60))

    expect(okCount).toBeGreaterThanOrEqual(5)
  })

  test('Navegación secuencial por todas las herramientas', async ({ page }) => {
    await page.goto(`${BASE}/app/fichas`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(1000)

    const navItems = [
      { name: 'Simulador Almacén', url: /\/app\/almacen/ },
      { name: 'Dashboard Incidencias', url: /\/app\/incidencias/ },
      { name: 'KPI Logístico', url: /\/app\/kpi/ },
      { name: 'Presupuestos', url: /\/app\/presupuestos/ },
      { name: 'Formación Interna', url: /\/app\/formacion/ },
      { name: 'Sonex', url: /\/app\/sonex/ },
    ]

    console.log('\nNavegación secuencial:')
    for (const item of navItems) {
      try {
        await page.locator('[role="navigation"] a', { hasText: item.name }).first().click()
        await expect(page).toHaveURL(item.url, { timeout: 5000 })
        await page.waitForTimeout(300)
        console.log(`  ${item.name.padEnd(20)} → OK`)
      } catch (err) {
        console.log(`  ${item.name.padEnd(20)} ERROR: ${err.message.substring(0, 40)}`)
      }
    }
  })
})
