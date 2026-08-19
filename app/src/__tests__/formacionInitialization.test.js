// @vitest-environment happy-dom
import React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render } from '@testing-library/react'

const saveEmpleados = vi.fn()
const saveModulos = vi.fn()
const saveProgresos = vi.fn()
const saveFechas = vi.fn()

const persistedEmployee = { id: 'e-stored', nombre: 'Persistido', rol: 'Técnico', departamento: 'Técnico' }
const persistedModule = { id: 'm-stored', nombre: 'Módulo persistido', area: 'Técnico', horas: 2, obligatorio: false }

vi.mock('../hooks/useUserData', () => ({
  default: vi.fn((module, field) => {
    const values = {
      empleados: { data: [persistedEmployee], loading: false, save: saveEmpleados },
      modulos: { data: [persistedModule], loading: false, save: saveModulos },
      progresos: { data: { 'e-stored': { 'm-stored': 'completado' } }, loading: false, save: saveProgresos },
      fechas: { data: {}, loading: false, save: saveFechas },
    }
    return values[field]
  }),
}))

vi.mock('../contexts/ToastContext', () => ({
  useToast: () => ({ show: vi.fn(), toast: { show: vi.fn() } }),
}))

import FormacionInterna from '../tools/FormacionInterna'

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('FormacionInterna initialization', () => {
  it('does not overwrite persisted training data with defaults on mount', () => {
    render(React.createElement(FormacionInterna))

    expect(saveEmpleados).not.toHaveBeenCalled()
    expect(saveModulos).not.toHaveBeenCalled()
    expect(saveProgresos).not.toHaveBeenCalled()
    expect(saveFechas).not.toHaveBeenCalled()
  })
})
