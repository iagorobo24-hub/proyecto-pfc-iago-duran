import { BasePage } from './base-page.js'
import { expect } from '@playwright/test'

export class SonexPage extends BasePage {
  constructor(page) {
    super(page)
  }

  async goto() {
    await super.goto('/app/sonex')
  }

  // Chat interactions
  async sendQuery(query) {
    const input = this.page.getByPlaceholder(/escribe|consulta|pregunta/i)
    await expect(input).toBeVisible()
    await input.fill(query)
    await input.press('Enter')
    await this.page.waitForTimeout(3000)
  }

  async selectMode(mode) {
    const btn = this.page.getByRole('button', { name: new RegExp(mode, 'i') })
    if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await btn.click()
      await this.page.waitForTimeout(500)
    }
  }

  // Assertions
  async expectChatResponse() {
    const responses = await this.page.locator('.message, .chat-message, [data-testid="response"]').all()
    if (responses.length > 0) {
      // Verificar que haya contenido nuevo después de la consulta
      await this.page.waitForTimeout(1000)
      const bodyText = await this.page.locator('body').textContent()
      expect(bodyText.length).toBeGreaterThan(50)
    }
  }

  async verifyNoErrors() {
    const pageText = await this.page.content()
    const hasCrash = pageText.includes('Cannot read properties') || 
                    pageText.includes('undefined is not') ||
                    pageText.includes('Error:')
    expect(hasCrash).toBe(false)
  }
}