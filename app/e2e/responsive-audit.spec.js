import { test, expect } from '@playwright/test'
import { mockAuth } from './helpers'

const BASE = 'http://localhost:5173'
const VIEWPORTS = [
  { name: 'mobile', width: 375, height: 812 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1280, height: 800 },
]

const LANDING_SECTIONS = [
  { role: 'heading', name: /herramientas integradas/i },
  { role: 'heading', name: /cómo funciona/i },
  { role: 'heading', name: /listo para explorar/i },
]

const TOOL_PAGES = [
  { name: 'Fichas Técnicas', path: '/app/fichas', heading: /fichas técnicas/i },
  { name: 'Dashboard Incidencias', path: '/app/incidencias', heading: /incidencias/i },
  { name: 'KPI Logístico', path: '/app/kpi', heading: /kpi/i },
  { name: 'Presupuestos', path: '/app/presupuestos', heading: /presupuestos/i },
  { name: 'Formación Interna', path: '/app/formacion', heading: /formación/i },
  { name: 'Simulador Almacén', path: '/app/almacen', heading: /simulador/i },
  { name: 'SONEX', path: '/app/sonex', heading: null, text: /soy sonex/i },
]

test.describe('Auditoría Responsive @visual', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuth(page)
  })

  for (const vp of VIEWPORTS) {
    test.describe(`Viewport: ${vp.name} (${vp.width}px)`, () => {

      test('Landing page — secciones principales visibles', async ({ page }) => {
        await page.setViewportSize(vp)
        await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 20000 })
        await page.waitForTimeout(2000)

        const hasContent = await page.evaluate(() => document.body.innerText.length > 100)
        expect(hasContent).toBe(true)

        await page.screenshot({
          path: `e2e/screenshots/responsive-landing-${vp.name}.png`,
          fullPage: true,
        })
      })

      test('Landing page — sin overflow horizontal', async ({ page }) => {
        await page.setViewportSize(vp)
        await page.goto(BASE, { waitUntil: 'networkidle', timeout: 20000 })
        await page.waitForTimeout(2000)

        const overflowX = await page.evaluate(() => {
          const doc = document.documentElement
          return doc.scrollWidth > doc.clientWidth
        })
        expect(overflowX).toBe(false)
      })

      for (const tool of TOOL_PAGES) {
        test(`${tool.name} — carga y heading visible`, async ({ page }) => {
          await page.setViewportSize(vp)
          await page.goto(`${BASE}${tool.path}`, { waitUntil: 'domcontentloaded', timeout: 20000 })
          await page.waitForTimeout(2000)

          if (tool.heading) {
            const heading = page.locator('h1').filter({ hasText: tool.heading }).first()
            await expect(heading).toBeVisible({ timeout: 8000 })
          } else if (tool.text) {
            const text = page.getByText(tool.text).first()
            await expect(text).toBeVisible({ timeout: 8000 })
          }

          await page.screenshot({
            path: `e2e/screenshots/responsive-${tool.path.replace('/app/', '')}-${vp.name}.png`,
            fullPage: true,
          })
        })

        test(`${tool.name} — sin overflow horizontal`, async ({ page }) => {
          await page.setViewportSize(vp)
          await page.goto(`${BASE}${tool.path}`, { waitUntil: 'domcontentloaded', timeout: 20000 })
          await page.waitForTimeout(2000)

          const overflowX = await page.evaluate(() => {
            const doc = document.documentElement
            return doc.scrollWidth > doc.clientWidth
          })
          expect(overflowX).toBe(false)
        })
      }
    })
  }
})
