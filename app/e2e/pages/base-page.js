import { expect } from '@playwright/test'

export class BasePage {
  constructor(page) {
    this.page = page
  }

  async goto(path) {
    await this.page.goto(`http://localhost:5173${path}`, { waitUntil: 'networkidle', timeout: 30000 })
  }

  async waitForContent(timeout = 5000) {
    await expect(this.page.locator('body')).toBeVisible({ timeout })
    // Esperar a que haya contenido real, no solo loading
    await this.page.waitForFunction(() => document.body.innerText.length > 100, { timeout })
  }

  async checkNoJsErrors() {
    const errors = []
    this.page.on('pageerror', err => errors.push(err.message))
    this.page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    return errors
  }

  async takeScreenshot(name) {
    await this.page.screenshot({ path: `e2e/screenshots/${name}.png`, fullPage: true })
  }
}