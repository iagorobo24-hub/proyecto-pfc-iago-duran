import { test, expect } from '@playwright/test'
import { primeAppState } from './helpers.js'

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

async function openSonexWithCatalogResult(page) {
  await primeAppState(page)
  await page.goto('/app/sonex')
  await expect(page.getByRole('heading', { name: 'SONEX' })).toBeVisible({ timeout: 15000 })

  const textarea = page.getByPlaceholder(/Escribe tu consulta técnica/i)
  await textarea.fill('Dime un magnetotérmico de la marca Schneider de 16 amperios 2 polos curva C')
  await page.getByLabel('Enviar consulta').click()

  const firstCard = page.getByTestId('sonex-product-card').first()
  await expect(firstCard).toBeVisible({ timeout: 30000 })
  const reference = (await firstCard.getByTestId('sonex-product-ref').textContent())?.trim()
  expect(reference).toBeTruthy()
  return { firstCard, reference }
}

async function openSonexWithRangeResult(page) {
  await primeAppState(page)
  await page.goto('/app/sonex')
  await expect(page.getByRole('heading', { name: 'SONEX' })).toBeVisible({ timeout: 15000 })

  const textarea = page.getByPlaceholder(/Escribe tu consulta técnica/i)
  await textarea.fill('Dame 10 referencias de la gama ic60n de schneider')
  await page.getByLabel('Enviar consulta').click()

  const firstCard = page.getByTestId('sonex-product-card').first()
  await expect(firstCard).toBeVisible({ timeout: 30000 })
  return { firstCard }
}

test.describe('SONEX product flow', () => {
  test('shows verified catalog cards for a product query', async ({ page }) => {
    const { firstCard } = await openSonexWithCatalogResult(page)

    await expect(page.getByRole('heading', { name: 'En catálogo' })).toBeVisible()
    await expect(firstCard.getByTestId('sonex-open-ficha')).toBeVisible()
    await expect(firstCard.getByTestId('sonex-add-budget')).toBeVisible()
  })

  test('shows catalog cards for a Schneider iC60N range request', async ({ page }) => {
    const { firstCard } = await openSonexWithRangeResult(page)

    await expect(page.getByTestId('sonex-product-card')).toHaveCount(10, { timeout: 30000 })
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
