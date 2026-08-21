// @vitest-environment happy-dom

import React, { useState } from 'react'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  config: { enabled: true, configured: true, mode: 'cloud', missing: [] },
  getSession: vi.fn(),
  onAuthStateChange: vi.fn(),
  signInWithOAuth: vi.fn(),
  signOut: vi.fn(),
  migrate: vi.fn(),
}))

vi.mock('../supabase/config', () => ({ supabaseConfig: mocks.config }))
vi.mock('../supabase/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: mocks.getSession,
      onAuthStateChange: mocks.onAuthStateChange,
      signInWithOAuth: mocks.signInWithOAuth,
      signOut: mocks.signOut,
    },
  },
}))
vi.mock('../utils/migrateLocalStorage', () => ({
  migrateLocalStorageToSupabase: mocks.migrate,
}))

import { AuthProvider, useAuth } from '../contexts/AuthContext'

function StateProbe() {
  const auth = useAuth()
  return React.createElement('div', { 'data-testid': 'auth-state' }, `${auth.backendMode}:${auth.loading}`)
}

function LoginProbe() {
  const { loginWithGoogle } = useAuth()
  const [message, setMessage] = useState('')

  const handleLogin = async () => {
    try {
      await loginWithGoogle()
      setMessage('unexpected-success')
    } catch (error) {
      setMessage(error.message)
    }
  }

  return React.createElement(React.Fragment, null,
    React.createElement('button', { type: 'button', onClick: handleLogin }, 'try-login'),
    React.createElement('span', { 'data-testid': 'login-result' }, message),
  )
}

beforeEach(() => {
  mocks.config.enabled = true
  mocks.config.configured = true
  mocks.config.mode = 'cloud'
  mocks.config.missing = []
  mocks.getSession.mockReset().mockReturnValue(new Promise(() => {}))
  mocks.onAuthStateChange.mockReset().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } })
  mocks.signInWithOAuth.mockReset().mockResolvedValue({ data: {}, error: null })
  mocks.signOut.mockReset().mockResolvedValue({ error: null })
  mocks.migrate.mockReset().mockResolvedValue({ migrated: 0 })
})

afterEach(() => cleanup())

describe('AuthProvider degraded behavior', () => {
  it('renders public children immediately while a cloud session is still unresolved', () => {
    render(React.createElement(AuthProvider, null,
      React.createElement('div', null, 'landing-ready'),
      React.createElement(StateProbe),
    ))

    expect(screen.getByText('landing-ready')).toBeTruthy()
    expect(screen.getByTestId('auth-state').textContent).toBe('cloud:true')
  })

  it('does not initialize Supabase auth when runtime mode is local', async () => {
    mocks.config.enabled = false
    mocks.config.mode = 'local'

    render(React.createElement(AuthProvider, null,
      React.createElement(StateProbe),
    ))

    await waitFor(() => expect(screen.getByTestId('auth-state').textContent).toBe('local:false'))
    expect(mocks.getSession).not.toHaveBeenCalled()
    expect(mocks.onAuthStateChange).not.toHaveBeenCalled()
  })

  it('rejects cloud login immediately in local mode without starting OAuth', async () => {
    mocks.config.enabled = false
    mocks.config.mode = 'local'

    render(React.createElement(AuthProvider, null, React.createElement(LoginProbe)))
    fireEvent.click(screen.getByText('try-login'))

    await waitFor(() => expect(screen.getByTestId('login-result').textContent).toContain('modo local'))
    expect(mocks.signInWithOAuth).not.toHaveBeenCalled()
  })

  it('marks cloud auth unavailable after session initialization fails', async () => {
    mocks.getSession.mockRejectedValueOnce(new Error('backend offline'))

    render(React.createElement(AuthProvider, null, React.createElement(StateProbe)))

    await waitFor(() => expect(screen.getByTestId('auth-state').textContent).toBe('unavailable:false'))
  })
})
