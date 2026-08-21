import { expect, test } from '@playwright/test'

test.describe('Supabase degraded mode', () => {
  test('landing renders immediately and describes local operation without DB metrics', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('link', { name: 'Acceder a la aplicación' })).toBeVisible()
    await expect(page.getByText('Cargando sesión…')).toHaveCount(0)
    await expect(page.getByText(/Modo local disponible/)).toBeVisible()
    await expect(page.getByText('Familias en DB')).toHaveCount(0)
  })

  test('anonymous user can enter the application locally and sees cloud status', async ({ page }) => {
    await page.goto('/app')

    await expect(page).toHaveURL(/\/app\/?$/)
    await expect(page.getByText('Modo local · Cloud desactivado')).toBeVisible()
  })

  test('login page offers local entry instead of a nonfunctional Google action', async ({ page }) => {
    await page.goto('/login')

    await expect(page.getByRole('button', { name: 'Entrar en modo local' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Continuar con Google' })).toHaveCount(0)

    await page.getByRole('button', { name: 'Entrar en modo local' }).click()
    await expect(page).toHaveURL(/\/app\/?$/)
  })
})
