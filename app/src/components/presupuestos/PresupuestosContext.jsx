import { createContext, useContext } from 'react'

const PresupuestosContext = createContext(null)

export function usePresupuestosContext() {
  const ctx = useContext(PresupuestosContext)
  if (!ctx) throw new Error('usePresupuestosContext must be used within PresupuestosLayout')
  return ctx
}

export default PresupuestosContext
