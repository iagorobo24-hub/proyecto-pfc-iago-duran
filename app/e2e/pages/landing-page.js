import { BasePage } from './base-page.js'
import { expect } from '@playwright/test'

export class LandingPage extends BasePage {
  constructor(page) {
    super(page)
  }

  async goto() {
    await super.goto('/')
  }

  // Hero-specific interactions
  async expectHeroVisible() {
    const hero = this.page.locator('.hero, [class*="hero"], #hero, section.hero')
    await expect(hero.first()).toBeVisible({ timeout: 10000 })
  }

  async expectHeroAnimationComplete() {
    // Wait for animations to settle
    await this.page.waitForTimeout(2000)
    
    // Check that hero is fully rendered
    const heroContent = this.page.locator('.hero-content, [class*="heroContent"], .hero-section')
    await expect(heroContent.first()).toBeVisible()
  }

  async getHeroBackgroundColor() {
    const hero = this.page.locator('.hero, [class*="HeroVisual"], #hero').first()
    const style = await hero.evaluate((el) => {
      const computed = window.getComputedStyle(el)
      return {
        background: computed.background,
        backgroundColor: computed.backgroundColor,
        backgroundImage: computed.backgroundImage
      }
    })
    return style
  }

  async checkDarkModeHeroBackground() {
    // Check if hero background changes in dark mode
    const heroElements = this.page.locator('.hero, [class*="Hero"], section[class*="hero"]')
    const count = await heroElements.count()
    
    if (count === 0) return { ok: false, message: 'No hero element found' }
    
    const hero = heroElements.first()
    const isDark = await hero.evaluate((el) => {
      const computed = window.getComputedStyle(el)
      const bg = computed.background || computed.backgroundColor
      // Check for dark colors
      return bg.includes('#1') || bg.includes('#0') || 
             bg.includes('rgb(1') || bg.includes('rgb(0') ||
             bg.includes('var(--dark') || bg.includes('var(--background)')
    })
    
    return { ok: isDark, isDark }
  }

  async expectHeroElementsVisible() {
    await expect(this.page.getByText(new RegExp('Suite|Herramientas|PFC|Proyecto', 'i'))).toBeVisible()
    await expect(this.page.locator('h1, h2')).first().toBeVisible()
  }
}