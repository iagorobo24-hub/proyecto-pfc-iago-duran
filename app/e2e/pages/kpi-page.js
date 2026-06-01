import { BasePage } from './base-page.js'
import { expect } from '@playwright/test'

export class KpiPage extends BasePage {
  constructor(page) {
    super(page)
  }

  async goto() {
    await super.goto('/app/kpi')
  }

  // Form interactions - using label text and input index within form grid
  async fillPedidos(value) {
    // First input in the form grid - "PEDIDOS COMPLETADOS" is the first label
    const input = this.page.locator('input[type="number"]').first()
    await expect(input).toBeVisible({ timeout: 10000 })
    await input.fill(value)
  }

  async fillHoras(value) {
    // Second input - "HORAS DE TURNO"
    const input = this.page.locator('input[type="number"]').nth(1)
    await expect(input).toBeVisible({ timeout: 10000 })
    await input.fill(value)
  }

  async fillOperarios(value) {
    // Third input - "OPERARIOS EN TURNO"
    const input = this.page.locator('input[type="number"]').nth(2)
    await expect(input).toBeVisible({ timeout: 10000 })
    await input.fill(value)
  }

  async fillLineasExpedidas(value) {
    // Fourth input - "LÍNEAS EXPEDIDAS"
    const input = this.page.locator('input[type="number"]').nth(3)
    await expect(input).toBeVisible({ timeout: 10000 })
    await input.fill(value)
  }

  async fillErrores(value) {
    // Fifth input - "ERRORES DE PICKING"
    const input = this.page.locator('input[type="number"]').nth(4)
    await expect(input).toBeVisible({ timeout: 10000 })
    await input.fill(value)
  }

  async fillCampo(index, value) {
    const input = this.page.locator('input[type="number"]').nth(index)
    await expect(input).toBeVisible({ timeout: 10000 })
    await input.fill(value)
  }

  async clickLoadExample() {
    const btn = this.page.getByRole('button', { name: /cargar ejemplo/i })
    await expect(btn).toBeVisible()
    await btn.click()
    await this.page.waitForTimeout(1000)
  }

  async clickCalculate() {
    const btn = this.page.getByRole('button', { name: /calcular kpis?/i })
    await expect(btn).toBeVisible()
    await btn.click()
    await this.page.waitForTimeout(3000)
  }

  // Assertions - Verify actual calculations
  async expectResultsVisible() {
    const kpiCards = this.page.locator('.kpiCard, [class*="kpiCard"]')
    const count = await kpiCards.count()
    expect(count).toBeGreaterThan(0)
  }

  async getResultValues() {
    const values = []
    const elements = await this.page.locator('.kpiCard__value, [class*="kpiCard__value"]').all()
    for (const el of elements) {
      const text = await el.textContent()
      if (text) values.push(text.trim())
    }
    return values
  }

  async expectAllKpiLabelsVisible() {
    // Use specific kpiCard containers to avoid duplicate text matches
    const kpiCards = this.page.locator('.kpiCard, [class*="kpiCard"]')
    const count = await kpiCards.count()
    expect(count).toBeGreaterThanOrEqual(6)
    
    // Verify each expected KPI label exists within kpiCards
    const expectedLabels = ['Pedidos/hora', 'Error picking', 'Tiempo ciclo', 'Ocupación', 'Devoluciones', 'Productividad']
    
    for (const label of expectedLabels) {
      const labelInCard = kpiCards.filter({ hasText: new RegExp(label, 'i') })
      await expect(labelInCard.first()).toBeVisible()
    }
  }

  async verifyCalculationSanity() {
    // Verificar que los resultados no son valores inválidos
    const pageText = await this.page.content()
    const hasInvalidValues = pageText.includes('NaN') || pageText.includes('Infinity') || pageText.includes('null')
    expect(hasInvalidValues).toBe(false)
  }

  async expectKpiValue(kpiName) {
    const card = this.page.locator('.kpiCard').filter({ hasText: new RegExp(kpiName, 'i') })
    await expect(card).toBeVisible()
    const value = card.locator('.kpiCard__value, [class*="value"]')
    await expect(value).toBeVisible()
  }
}