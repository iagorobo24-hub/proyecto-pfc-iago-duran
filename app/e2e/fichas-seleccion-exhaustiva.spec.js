import { test, expect } from '@playwright/test'
import { mockAuth } from './helpers'

const BASE = 'http://localhost:5173'

// Helper para esperar a que los cargadores y skeletons terminen de renderizar
async function waitForLoadingSettled(page) {
  // Esperar a que los elementos con aria-busy="true" se oculten o desvinculen
  await page.locator('[aria-busy="true"]').waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {})
  // Pequeña espera de cortesía para el renderizado del DOM
  await page.waitForTimeout(300)
}

test.describe('Fichas Técnicas — Matriz de Selección Exhaustiva', () => {
  let jsErrors = []

  test.beforeEach(async ({ page }) => {
    jsErrors = []
    await mockAuth(page)
    
    page.on('pageerror', err => {
      console.error('[CRITICAL JS ERROR]', err.message)
      jsErrors.push(err.message)
    })
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        const txt = msg.text()
        // Ignorar fallos de conexión externa con OpenRouter/Claude en pruebas locales
        if (!txt.includes('ECONNREFUSED') && !txt.includes('Failed to load resource')) {
          console.error('[CONSOLE ERROR]', txt)
        }
      }
    })
  })

  test('Verificar todas las combinaciones de Categorías y Marcas sin crashes', async ({ page }) => {
    test.setTimeout(240000) // Límite de 4 minutos

    // Primera navegación para descubrir las categorías disponibles en el panel lateral
    await page.goto(`${BASE}/app/fichas`, { waitUntil: 'domcontentloaded', timeout: 30000 })
    await waitForLoadingSettled(page)

    const sidebarCats = page.locator('nav[aria-labelledby="categories-label"] button')
    await sidebarCats.first().waitFor({ state: 'attached', timeout: 15000 })
    const catCount = await sidebarCats.count()
    
    const categoriesToTest = []
    for (let i = 0; i < catCount; i++) {
      const text = await sidebarCats.nth(i).innerText()
      categoriesToTest.push({ index: i, name: text.trim().replace(/\s+/g, ' ') })
    }

    console.log(`[Matriz] Total de categorías detectadas en la base de datos: ${categoriesToTest.length}`)

    // Iteramos por cada categoría
    for (const cat of categoriesToTest) {
      console.log(`\n==================================================`)
      console.log(`[Matriz] Probando Categoría: ${cat.name} (index: ${cat.index})`)
      console.log(`==================================================`)

      // Cargamos de forma limpia para obtener las marcas de esta categoría
      await page.goto(`${BASE}/app/fichas`, { waitUntil: 'domcontentloaded' })
      await waitForLoadingSettled(page)
      
      const cats = page.locator('nav[aria-labelledby="categories-label"] button')
      await cats.nth(cat.index).click()
      await waitForLoadingSettled(page)

      const brandBtns = page.locator('section[aria-live="polite"] button')
      const brandCount = await brandBtns.count()
      
      if (brandCount === 0) {
        console.log(`  [Información] No se detectaron marcas para la categoría "${cat.name}".`)
        continue
      }

      const brandsToTest = []
      for (let b = 0; b < brandCount; b++) {
        const text = await brandBtns.nth(b).innerText()
        const brandName = text.trim().replace(/\n/g, ' ').replace('Ver gamas', '').trim()
        brandsToTest.push({ index: b, name: brandName })
      }

      console.log(`  Marcas detectadas: ${brandsToTest.map(b => b.name).join(', ')}`)

      // Para cada marca dentro de la categoría, hacemos un drilldown hasta la ficha final
      for (const brand of brandsToTest) {
        console.log(`\n  -> Iniciando drilldown: Categoría "${cat.name}" › Marca "${brand.name}"`)
        
        // Carga limpia del flujo
        await page.goto(`${BASE}/app/fichas`, { waitUntil: 'domcontentloaded' })
        await waitForLoadingSettled(page)
        
        // Seleccionamos categoría
        const catsRetry = page.locator('nav[aria-labelledby="categories-label"] button')
        await catsRetry.nth(cat.index).click()
        await waitForLoadingSettled(page)

        // Seleccionamos marca (buscamos por texto exacto de marca)
        const currentBrands = page.locator('section[aria-live="polite"] button')
        let brandBtn = null
        const cbCount = await currentBrands.count()
        for (let i = 0; i < cbCount; i++) {
          const txt = await currentBrands.nth(i).innerText()
          if (txt.includes(brand.name)) {
            brandBtn = currentBrands.nth(i)
            break
          }
        }
        
        if (!brandBtn) {
          console.warn(`    [Advertencia] No se encontró el botón para la marca "${brand.name}".`)
          continue
        }

        await brandBtn.click()
        await waitForLoadingSettled(page)

        // Bucle de descenso hasta hoja/ficha final
        let safetyCounter = 0
        let reachedFicha = false
        
        while (safetyCounter < 15) {
          safetyCounter++

          // Verificar fallos de renderizado
          const bodyText = await page.locator('body').textContent() || ''
          const hasCrashText = bodyText.includes('crashed') ||
                              bodyText.includes('Cannot read properties') ||
                              bodyText.includes('TypeError') ||
                              bodyText.includes('ErrorBoundary') ||
                              bodyText.includes('undefined is not')
          
          expect(hasCrashText).toBeFalsy()
          expect(jsErrors.length).toBe(0)

          // Detección de paso
          const isFicha = await page.getByText('Ficha fabricante').first().isVisible().catch(() => false)
          
          const tableHeaderVisible = await page.locator('div[class*="tableHeader"]').first().isVisible().catch(() => false)
          const tableWrapVisible = await page.locator('div[class*="wrap"]').first().isVisible().catch(() => false)
          const refCardsVisible = await page.locator('button[class*="refCard"], div[class*="linearRefCard"]').first().isVisible().catch(() => false)
          const isReferences = tableHeaderVisible || tableWrapVisible || refCardsVisible

          const isSubStepReferences = await page.locator('div[class*="vistaSteps"]').first().isVisible().catch(() => false)

          if (isFicha) {
            console.log(`    [Éxito] Ficha de fabricante cargada sin errores.`)
            reachedFicha = true
            break
          }

          if (isReferences || isSubStepReferences) {
            console.log(`    [Referencias] Listado de referencias alcanzado.`)

            // Si es vista de selección de parámetros en referencias, elegimos el primero de cada paso
            if (isSubStepReferences) {
              let paramSafety = 0
              while (await page.locator('div[class*="vistaSteps"]').first().isVisible().catch(() => false) && paramSafety < 8) {
                paramSafety++
                const paramBtns = page.locator('section[aria-live="polite"] button')
                const paramBtnCount = await paramBtns.count()
                let clickedParam = false
                for (let i = 0; i < paramBtnCount; i++) {
                  const text = await paramBtns.nth(i).innerText()
                  if (!text.includes('Atrás') && !text.includes('Volver') && text.trim().length > 0) {
                    console.log(`      Clic en parámetro: "${text.trim().replace(/\s+/g, ' ')}"`)
                    await paramBtns.nth(i).click()
                    await waitForLoadingSettled(page)
                    clickedParam = true
                    break
                  }
                }
                if (!clickedParam) break
              }
            }

            // Hacer clic en el primer producto/referencia disponible
            const refButtons = page.locator('section[aria-live="polite"] button')
            const refBtnCount = await refButtons.count()
            let clickedProduct = false

            for (let i = 0; i < refBtnCount; i++) {
              const text = await refButtons.nth(i).innerText()
              if (!text.includes('Atrás') && !text.includes('Volver') && text.trim().length > 0) {
                console.log(`      Clic en producto/ref: "${text.trim().replace(/\s+/g, ' ')}"`)
                await refButtons.nth(i).click()
                await waitForLoadingSettled(page)
                clickedProduct = true
                break
              }
            }

            if (!clickedProduct) {
              console.log(`      [Información] Listado vacío de referencias. Terminamos camino.`)
              reachedFicha = true
              break
            }

            continue
          }

          // Paso intermedio: seleccionamos la primera opción que no sea volver
          const options = page.locator('section[aria-live="polite"] button')
          const optCount = await options.count()
          
          if (optCount === 0) {
            console.log(`    [Aviso] Paso intermedio sin opciones seleccionables.`)
            break
          }

          let optionToClick = null
          for (let i = 0; i < optCount; i++) {
            const text = await options.nth(i).innerText()
            if (!text.includes('Atrás') && !text.includes('Volver') && text.trim().length > 0) {
              optionToClick = options.nth(i)
              console.log(`    Clic en paso intermedio: "${text.trim().replace(/\s+/g, ' ')}"`)
              break
            }
          }

          if (!optionToClick) {
            console.log(`    [Aviso] No se encontró ninguna opción clicable en este paso.`)
            break
          }

          await optionToClick.click()
          await waitForLoadingSettled(page)
        }

        // Aserciones finales de seguridad
        const postCrashText = await page.locator('body').textContent() || ''
        const postCrash = postCrashText.includes('crashed') ||
                          postCrashText.includes('Cannot read properties') ||
                          postCrashText.includes('TypeError') ||
                          postCrashText.includes('ErrorBoundary')
        expect(postCrash).toBeFalsy()
        expect(jsErrors.length).toBe(0)

        if (reachedFicha) {
          console.log(`    [OK] Flujo validado correctamente para esta marca.`)
          // Captura de pantalla para validación visual
          const fileName = `exhaustivo-${cat.name.replace(/[^a-zA-Z0-9]/g, '')}-${brand.name.replace(/[^a-zA-Z0-9]/g, '')}.png`
          await page.screenshot({ path: `e2e/screenshots/${fileName}`, fullPage: true }).catch(() => {})
        } else {
          console.log(`    [Aviso] Se finalizó el camino antes de llegar a la ficha del producto.`)
        }
      }
    }
  })
})
