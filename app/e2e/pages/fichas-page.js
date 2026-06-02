import { BasePage } from './base-page.js'
import { expect } from '@playwright/test'

export class FichasPage extends BasePage {
  constructor(page) {
    super(page)
  }

  async goto() {
    await super.goto('/app/fichas')
  }

  // Navigators
  async clickCategory(name) {
    const btn = this.page.getByRole('button').filter({ hasText: name }).first()
    await expect(btn).toBeVisible()
    await btn.click()
    await this.page.waitForTimeout(1000)
  }

  async clickBrand(name) {
    const btn = this.page.getByRole('button').filter({ hasText: name }).first()
    await expect(btn).toBeVisible()
    await btn.click()
    await this.page.waitForTimeout(1000)
  }

  async clickGama(name) {
    const btn = this.page.getByRole('button').filter({ hasText: name }).first()
    await expect(btn).toBeVisible()
    await btn.click()
    await this.page.waitForTimeout(1000)
  }

  async clickTipo(name) {
    const btn = this.page.getByRole('button').filter({ hasText: name }).first()
    await expect(btn).toBeVisible()
    await btn.click()
    await this.page.waitForTimeout(1000)
  }

  // Search functionality
  async searchByReference(ref) {
    const input = this.page.getByPlaceholder(/buscar referen.*\.\.\./i)
    await expect(input).toBeVisible()
    await input.fill(ref)
    await this.page.locator('aside').getByRole('button', { name: 'Buscar' }).click()
    await this.page.waitForTimeout(2000)
  }

  async searchByText(text) {
    const input = this.page.getByPlaceholder(/buscar referen.*\.\.\./i)
    await expect(input).toBeVisible()
    await input.fill(text)
    await this.page.locator('aside').getByRole('button', { name: 'Buscar' }).click()
    await this.page.waitForTimeout(2000)
  }

  // Assertions
    async expectCategoryVisible() {
      await expect(this.page.getByText('Familias')).toBeVisible()
    }

    async waitForContent(timeout = 30000) {
    // Wait for the categories label first with longer timeout
    try {
      await this.page.getByText('Familias').waitFor({ state: 'visible', timeout: 10000 });
    } catch {
      // If label not found, wait for any button in the sidebar
      console.log('Label not found, waiting for buttons directly...');
      const buttons = this.page.locator('aside button');
      await buttons.first().waitFor({ state: 'visible', timeout: timeout });
    }
    
    // Wait for any button inside the categories nav
    const categoryButtons = this.page.locator('nav[aria-labelledby="categories-label"] button');
    await categoryButtons.first().waitFor({ state: 'visible', timeout: timeout - 10000 });
    
    // Extra wait for React to fully render
    await this.page.waitForTimeout(1000);
  }

    async expectSearchVisible() {
      await expect(this.page.getByPlaceholder(/buscar referen.*\\.\\.\\./i)).toBeVisible()
    }

  async expectReferenceInResults(ref) {
    const found = await this.page.getByText(ref).isVisible()
    expect(found).toBe(true)
  }

  async getNavigationHierarchy() {
    return {
      categories: await this.page.locator('nav [aria-labelledby="categories-label"] button').count(),
      brands: await this.page.locator('section button').count(),
      gamas: await this.page.locator('section button').count(),
      tipos: await this.page.locator('section button').count(),
      referencias: await this.page.locator('section button').count()
    }
  }
}