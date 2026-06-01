import { BasePage } from './base-page.js'
import { expect } from '@playwright/test'

export class AlmacenPage extends BasePage {
  constructor(page) {
    super(page)
  }

  async goto() {
    await super.goto('/app/almacen')
  }

  // Wait for simulation to be ready
  async waitForSimulationReady() {
    await this.waitForContent(5000)
    // Wait for any loading states to complete
    await this.page.waitForSelector('.simulador-loaded, [class*="loaded"], body', { timeout: 5000 })
  }

  // Form interactions - for perfil screen
  async fillOperarioNombre(nombre) {
    const input = this.page.getByLabel('Nombre')
    if (await input.count() > 0) {
      await expect(input.first()).toBeVisible()
      await input.first().fill(nombre)
    } else {
      // Fallback: find input near "Nombre" text
      const label = this.page.getByText('Nombre', { exact: true })
      const input = label.locator('..').locator('input')
      await expect(input).toBeVisible()
      await input.fill(nombre)
    }
  }

  async selectOperarioTipo(tipo) {
    const select = this.page.getByLabel('Tipo')
    if (await select.count() > 0) {
      await expect(select.first()).toBeVisible()
      await select.first().selectOption(tipo)
    }
  }

  async clickGuardarPerfil() {
    const btn = this.page.getByRole('button', { name: /guardar|continuar|siguiente/i })
    await btn.first().click()
    await this.page.waitForTimeout(1000)
  }

  // Simulation interactions
  async clickIniciarPedido() {
    const btn = this.page.getByRole('button', { name: /iniciar|comenzar|empezar|pedido/i })
    if (await btn.count() > 0) {
      await btn.first().click()
      await this.page.waitForTimeout(1500)
    }
  }

  async clickAvanzarEtapa() {
    const btn = this.page.getByRole('button', { name: /avanzar|continuar|siguiente|etapa/i })
    if (await btn.count() > 0) {
      await btn.first().click()
      await this.page.waitForTimeout(1000)
    }
  }

  async clickSimular() {
    const btn = this.page.getByRole('button', { name: /simular|calcular|x|comenzar/i })
    await expect(btn.first()).toBeVisible()
    await btn.first().click()
    await this.page.waitForTimeout(2000)
  }

  async responderIncidencia(opcionCorrecta) {
    const btns = this.page.getByRole('button')
    const count = await btns.count()
    if (count > 0) {
      const btn = btns.nth(opcionCorrecta ? 0 : 1) // Assume first is correct
      await btn.click()
      await this.page.waitForTimeout(1000)
    }
  }

  // Assertions
  async expectPerfilVisible() {
    await expect(this.page.getByText(/nombre|operario|perfil/i)).toBeVisible()
  }

  async expectSimulacionVisible() {
    await expect(this.page.locator('.simulacion, [class*="simulacion"], .etapa, h2')).first().toBeVisible()
  }

  async expectResultadosVisible() {
    const resultados = this.page.locator('.resultados, [class*="resultados"], .puntuacion, h2')
    await resultados.first().toBeVisible()
  }

  async getSimulationStats() {
    const stats = await this.page.evaluate(() => {
      const text = document.body.innerText
      return {
        hasStats: text.length > 200,
        hasScore: /puntuación|puntos|\d+\s*pts/i.test(text),
        hasTime: /\d+:\d+|\d+\s*s|\d+\s*seg/i.test(text)
      }
    })
    return stats
  }

  async verifySimulationCompleted() {
    const pageText = await this.page.content()
    
    // Check for completion indicators
    const hasCompletion = pageText.includes('puntuación') || 
                         pageText.includes('puntos') ||
                         pageText.includes('tiempo total') ||
                         pageText.includes('finalizar') ||
                         /resultados/i.test(pageText)
    
    expect(hasCompletion).toBe(true)
  }
}