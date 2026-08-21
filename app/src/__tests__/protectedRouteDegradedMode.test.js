// @vitest-environment happy-dom

import React from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

const authState = vi.hoisted(() => ({
  value: { user: null, loading: false, backendMode: 'cloud' },
}))

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => authState.value,
}))

import ProtectedRoute from '../components/auth/ProtectedRoute'

function renderProtected() {
  return render(
    React.createElement(MemoryRouter, { initialEntries: ['/app'] },
      React.createElement(Routes, null,
        React.createElement(Route, {
          path: '/app',
          element: React.createElement(ProtectedRoute, null, React.createElement('div', null, 'app-ready')),
        }),
        React.createElement(Route, {
          path: '/login',
          element: React.createElement('div', null, 'login-page'),
        }),
      ),
    ),
  )
}

afterEach(() => cleanup())

describe('ProtectedRoute degraded policy', () => {
  it('allows anonymous local-mode access to the application', () => {
    authState.value = { user: null, loading: false, backendMode: 'local' }
    renderProtected()
    expect(screen.getByText('app-ready')).toBeTruthy()
  })

  it('allows local-capable access when cloud auth is unavailable', () => {
    authState.value = { user: null, loading: false, backendMode: 'unavailable' }
    renderProtected()
    expect(screen.getByText('app-ready')).toBeTruthy()
  })

  it('keeps anonymous users behind login in cloud mode', () => {
    authState.value = { user: null, loading: false, backendMode: 'cloud' }
    renderProtected()
    expect(screen.getByText('login-page')).toBeTruthy()
  })

  it('keeps the cloud session loader for unresolved cloud auth', () => {
    authState.value = { user: null, loading: true, backendMode: 'cloud' }
    renderProtected()
    expect(screen.getByText('Cargando sesión…')).toBeTruthy()
  })
})
