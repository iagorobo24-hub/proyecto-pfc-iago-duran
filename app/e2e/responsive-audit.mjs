import { chromium } from '@playwright/test'
import fs from 'fs'

const BASE = 'http://localhost:5173'
const OUT = 'e2e/screenshots/responsive-audit'
fs.mkdirSync(OUT, { recursive: true })

const MOCK_USER = {
  uid: 'test-user-123',
  id: 'test-user-123',
  displayName: 'Usuario Test',
  email: 'test@example.com',
  user_metadata: { full_name: 'Usuario Test' },
}

const VIEWPORTS = [
  { name: 'mobile-375', width: 375, height: 812 },
  { name: 'mobile-390', width: 390, height: 844 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'tablet-1024', width: 1024, height: 768 },
  { name: 'desktop-1280', width: 1280, height: 800 },
]

const PAGES = [
  { name: '00-landing', path: '/' },
  { name: '01-login', path: '/login' },
  { name: '02-fichas', path: '/app/fichas' },
  { name: '03-almacen', path: '/app/almacen' },
  { name: '04-incidencias', path: '/app/incidencias' },
  { name: '05-kpi', path: '/app/kpi' },
  { name: '06-presupuestos', path: '/app/presupuestos' },
  { name: '07-formacion', path: '/app/formacion' },
  { name: '08-sonex', path: '/app/sonex' },
]

const browser = await chromium.launch({ headless: true })

for (const vp of VIEWPORTS) {
  const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } })
  const page = await context.newPage()

  await page.addInitScript(user => { window.__PW_MOCK_USER__ = user }, MOCK_USER)

  for (const p of PAGES) {
    try {
      await page.goto(`${BASE}${p.path}`, { waitUntil: 'networkidle', timeout: 20000 })
      await page.waitForTimeout(2000)
      const filename = `${OUT}/${vp.name}_${p.name}.png`
      await page.screenshot({ path: filename, fullPage: true })
      console.log(`  ${filename}`)
    } catch (err) {
      console.log(`  ❌ ${vp.name}_${p.name}: ${err.message.slice(0, 60)}`)
    }
  }

  await context.close()
}

await browser.close()
console.log('\nDone — screenshots in', OUT)
