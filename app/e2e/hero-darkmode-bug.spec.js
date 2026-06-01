import { test, expect } from '@playwright/test'
import { mockAuth } from './helpers.js'

const BASE = 'http://localhost:5173'

test.describe('Test de Bug Hero en Modo Oscuro — Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuth(page)
  })

  test('Dark mode toggle funciona en landing page', async ({ page }) => {
    await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 30000 })
    await page.waitForTimeout(2000)

    await expect(page.locator('body')).toBeVisible()

    const lightBg = await page.evaluate(() => {
      return window.getComputedStyle(document.documentElement).backgroundColor ||
             window.getComputedStyle(document.body).backgroundColor
    })
    console.log('Light mode background:', lightBg)

    const toggle = page.locator('button[title*="oscuro" i], button[title*="dark" i]').first()
    if (await toggle.isVisible().catch(() => false)) {
      await toggle.click()
      await page.waitForTimeout(2000)

      const isDark = await page.evaluate(() =>
        document.documentElement.getAttribute('data-theme') === 'dark'
      )
      console.log('Dark mode active:', isDark)
      expect(isDark).toBe(true)

      const darkBg = await page.evaluate(() => {
        return window.getComputedStyle(document.documentElement).backgroundColor ||
               window.getComputedStyle(document.body).backgroundColor
      })
      console.log('Dark mode background:', darkBg)

      await page.screenshot({ path: 'e2e/screenshots/hero-darkmode-bug.png', fullPage: true })
    } else {
      console.warn('Toggle not found')
    }
  })

  test('Hero content visible in dark mode', async ({ page }) => {
    await page.goto(BASE, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(2000)

    const toggle = page.locator('button[title*="oscuro" i], button[title*="dark" i]').first()
    if (await toggle.isVisible().catch(() => false)) {
      await toggle.click()
      await page.waitForTimeout(3000)

      const mainHeading = page.locator('h1, h2').first()
      const hasVisibleText = await mainHeading.isVisible().catch(() => false)
      expect(hasVisibleText).toBe(true)

      await page.screenshot({ path: 'e2e/screenshots/hero-animation-complete.png', fullPage: true })
    } else {
      console.warn('Toggle not found, skipping')
    }
  })

  test('Dark mode changes page appearance', async ({ page }) => {
    await page.goto(BASE, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(2000)

    const lightTheme = await page.evaluate(() =>
      document.documentElement.getAttribute('data-theme')
    )
    console.log('Initial theme:', lightTheme)

    const toggle = page.locator('button[title*="oscuro" i], button[title*="dark" i]').first()
    if (await toggle.isVisible().catch(() => false)) {
      await toggle.click()
      await page.waitForTimeout(2000)

      const darkTheme = await page.evaluate(() =>
        document.documentElement.getAttribute('data-theme')
      )
      console.log('After toggle theme:', darkTheme)
      expect(darkTheme).toBe('dark')

      const bodyBrightness = await page.evaluate(() => {
        const bg = window.getComputedStyle(document.documentElement).backgroundColor
        const match = bg.match(/\d+/g)
        if (!match) return 200
        const [r, g, b] = match.map(Number)
        return (r + g + b) / 3
      })
      console.log('Body brightness:', bodyBrightness)
      expect(bodyBrightness).toBeLessThan(100)
    }
  })
})
