// @vitest-environment happy-dom

import React from 'react'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const readAppFile = path => readFileSync(resolve(appRoot, path), 'utf8')

const mocks = vi.hoisted(() => ({
  auth: { user: null, loading: false, backendMode: 'local', loginWithGoogle: vi.fn(), logout: vi.fn() },
  config: { enabled: false, configured: false, mode: 'local', missing: [] },
  catalogStats: vi.fn(),
  toastShow: vi.fn(),
}))

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => mocks.auth,
}))
vi.mock('../contexts/ToastContext', () => ({
  useToast: () => ({ toast: { show: mocks.toastShow } }),
}))
vi.mock('../supabase/config', () => ({
  supabaseConfig: mocks.config,
  canUseCatalog: backendMode => backendMode === 'cloud',
}))
vi.mock('../supabase/supabaseClient', () => ({
  supabase: { from: vi.fn() },
}))
vi.mock('../services/catalogService', () => ({
  default: { getCatalogStats: mocks.catalogStats },
}))
vi.mock('../components/layout/Topbar', () => ({ default: () => null }))
vi.mock('../components/layout/Sidebar', () => ({ default: () => null }))
vi.mock('../components/layout/KeyboardShortcutsOverlay', () => ({ default: () => null }))
vi.mock('../hooks/useKeyboardShortcuts', () => ({ default: () => {} }))
vi.mock('../hooks/useAnalytics', () => ({
  trackEvent: vi.fn(),
  trackPageView: vi.fn(),
}))

import LoginPage from '../components/auth/LoginPage'
import AppShell from '../components/layout/AppShell'
import HeroContent from '../components/HeroSection/HeroContent'
import StatsSection from '../components/HeroSection/StatsSection'

beforeEach(() => {
  mocks.auth.user = null
  mocks.auth.loading = false
  mocks.auth.backendMode = 'local'
  mocks.auth.loginWithGoogle.mockReset()
  mocks.catalogStats.mockReset().mockResolvedValue({
    totalProducts: 2400,
    totalFamilies: 7,
    totalBrands: 5,
  })
})

afterEach(() => cleanup())

describe('degraded UI contract', () => {
  it('offers local entry instead of Google OAuth on the login page', () => {
    render(React.createElement(MemoryRouter, null, React.createElement(LoginPage)))
    expect(screen.getByRole('button', { name: 'Entrar en modo local' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Continuar con Google' })).toBeNull()
  })

  it('marks the application shell as local without blocking its content', () => {
    render(React.createElement(MemoryRouter, null, React.createElement(AppShell)))
    expect(screen.getByText('Modo local · Cloud desactivado')).toBeTruthy()
  })

  it('describes local persistence on the landing hero', () => {
    render(React.createElement(MemoryRouter, null, React.createElement(HeroContent)))
    expect(screen.getByText(/Modo local disponible/)).toBeTruthy()
    expect(screen.queryByText(/persistencia cloud/)).toBeNull()
  })

  it('does not query or present database-derived landing metrics in local mode', () => {
    render(React.createElement(StatsSection))
    expect(mocks.catalogStats).not.toHaveBeenCalled()
    expect(screen.queryByText('Familias en DB')).toBeNull()
    expect(screen.getByText('Herramientas Integradas')).toBeTruthy()
  })

  it('gates catalog and SONEX routes behind a shared cloud feature boundary', () => {
    const appSource = readAppFile('src/App.jsx')
    expect(appSource).toContain("import CloudFeatureGate from './components/auth/CloudFeatureGate'")
    expect(appSource).toContain('<CloudFeatureGate><FichasTecnicasPage /></CloudFeatureGate>')
    expect(appSource).toContain('<CloudFeatureGate><SonexPage /></CloudFeatureGate>')
  })

  it('keeps budgets local while closing only its catalog controls', () => {
    const budgetsSource = readAppFile('src/components/presupuestos/PresupuestosLayout.jsx')
    expect(budgetsSource).toContain("const { backendMode } = useAuth()")
    expect(budgetsSource).toContain('Catálogo no disponible en modo local')
    expect(budgetsSource).toContain('canUseCatalog(backendMode)')
  })

  it('gates only the budget catalog-selection subroute while leaving local budget routes open', () => {
    const appSource = readAppFile('src/App.jsx')

    expect(appSource).toContain('<CloudFeatureGate><PresupuestosSeleccion /></CloudFeatureGate>')
    expect(appSource).toContain('<PresupuestosEditor />')
    expect(appSource).toContain('<PresupuestosGestion />')
    expect(appSource).toContain('<PresupuestosPdf />')
  })
})
