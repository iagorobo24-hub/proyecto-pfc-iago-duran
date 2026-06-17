import { expect, test } from '@playwright/test'
import { BASE, mockAuth } from './helpers.js'

async function mockAi(page) {
  await page.route('**/api/ai', async route => {
    const body = JSON.parse(route.request().postData() || '{}')
    if (body.stream) {
      await route.fulfill({
        status: 200,
        headers: { 'content-type': 'text/event-stream' },
        body: [
          'data: {"content":"He encontrado referencias verificadas en el catálogo."}',
          '',
          'data: {"done":true}',
          '',
        ].join('\n'),
      })
      return
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        text: JSON.stringify({
          caracteristicas: ['Referencia verificada en catálogo'],
          aplicaciones: ['Selección técnica'],
          normas: ['IEC'],
          url_manual: '',
          consejo_tecnico: 'Revisar calibre y curva antes de instalar.',
        }),
      }),
    })
  })
}

async function openSonexWithCatalogResult(page) {
  await mockAuth(page)
  await mockAi(page)
  await page.goto(`${BASE}/app/sonex`, { waitUntil: 'domcontentloaded' })
  await page.getByLabel('Consulta técnica para SONEX').fill('Necesito magnetotérmico 2P curva C 16A')
  await page.getByLabel('Enviar consulta').click()

  const firstCard = page.getByTestId('sonex-product-card').first()
  await expect(firstCard).toBeVisible({ timeout: 30000 })
  const reference = (await firstCard.getByTestId('sonex-product-ref').textContent()).trim()
  expect(reference.length).toBeGreaterThan(3)
  return { firstCard, reference }
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

test.describe('SONEX product flow', () => {
  test('shows verified catalog cards for a product query', async ({ page }) => {
    const { firstCard } = await openSonexWithCatalogResult(page)

    await expect(page.getByText('En catálogo')).toBeVisible()
    await expect(firstCard.getByTestId('sonex-open-ficha')).toBeVisible()
    await expect(firstCard.getByTestId('sonex-add-budget')).toBeVisible()
  })

  test('opens Fichas Tecnicas with direct reference from a card', async ({ page }) => {
    const { firstCard, reference } = await openSonexWithCatalogResult(page)

    await firstCard.getByTestId('sonex-open-ficha').click()
    await expect(page).toHaveURL(new RegExp(`/app/fichas\\?ref=${escapeRegExp(reference)}`), { timeout: 15000 })
    await expect(page.locator('body')).toContainText(reference, { timeout: 30000 })
  })

  test('creates a clean budget line from a card', async ({ page }) => {
    const { firstCard, reference } = await openSonexWithCatalogResult(page)

    await firstCard.getByTestId('sonex-add-budget').click()
    await expect(page).toHaveURL(/\/app\/presupuestos\/editor/, { timeout: 15000 })
    await expect(page.locator('body')).toContainText(reference, { timeout: 15000 })
  })
})
