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

  test('cloud-only catalog and SONEX tools close explicitly in local mode', async ({ page }) => {
    await page.goto('/app/fichas')
    await expect(page.getByText('Esta función necesita la base de datos y no está disponible en modo local.')).toBeVisible()

    await page.goto('/app/sonex')
    await expect(page.getByText('Esta función necesita la base de datos y no está disponible en modo local.')).toBeVisible()
  })

  test('budgets keep local editing available while catalog controls are closed', async ({ page }) => {
    await page.goto('/app/presupuestos')

    await expect(page.getByText('Nuevo presupuesto')).toBeVisible()
    await expect(page.getByText('Catálogo no disponible en modo local')).toBeVisible()
    await expect(page.getByRole('search')).toHaveCount(0)
  })

  test('budget catalog selection closes while editor remains locally reachable', async ({ page }) => {
    await page.goto('/app/presupuestos/seleccion')
    await expect(page.getByText('Esta función necesita la base de datos y no está disponible en modo local.')).toBeVisible()

    await page.goto('/app/presupuestos/editor')
    await expect(page.getByText('Función cloud no disponible')).toHaveCount(0)
  })
})
