import { useState, useEffect, useReducer, useCallback } from 'react'
import { Outlet, useSearchParams, useNavigate } from 'react-router-dom'
import { useToast } from '../../contexts/ToastContext'
import usePresupuestos from '../../hooks/usePresupuestos'
import useMemoriaUsuario from '../../hooks/useMemoriaUsuario'
import PresupuestosContext from './PresupuestosContext'
import styles from '../../tools/Presupuestos.module.css'

const genNum = () => {
  const d = new Date()
  return `SNP-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 900) + 100)}`
}

export default function PresupuestosLayout() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [searchParams] = useSearchParams()

  const hook = usePresupuestos()
  const memoria = useMemoriaUsuario()
  const [historial, setHistorial] = memoria.presupuestos.historial.use()
  const [numPresupuesto, setNumPresupuesto] = useState(genNum())

  useEffect(() => {
    const producto = searchParams.get('producto')
    const referencia = searchParams.get('referencia')
    const precio = searchParams.get('precio')
    if (producto && referencia) {
      hook.dispatchPartidas({ type: 'ADD_FROM_CATALOG', ref: referencia, desc: producto, precio: parseFloat(precio) || 0 })
      navigate('editor', { replace: true })
    }
  }, [])

  const guardarPresupuesto = useCallback(() => {
    if (hook.partidas.length === 0) { toast.show('Añade al menos un producto', 'error'); return }
    const presupuesto = {
      numero: numPresupuesto,
      fecha: new Date().toISOString(),
      cliente: hook.datosCliente,
      partidas: hook.partidas,
      categoria: hook.categoria,
      total: hook.partidas.reduce((s, p) => s + p.precio_total, 0),
    }
    const nuevo = [presupuesto, ...historial].slice(0, 20)
    setHistorial(nuevo)
    toast.show('Presupuesto guardado', 'success')
  }, [hook.partidas, hook.datosCliente, hook.categoria, numPresupuesto, historial, setHistorial, toast])

  const cargarPresupuesto = useCallback((h) => {
    hook.dispatchPartidas({ type: 'SET', payload: h.partidas || [] })
    hook.setDatosCliente(h.cliente || hook.datosCliente)
    setNumPresupuesto(h.numero)
    hook.setCategoria(h.categoria || '')
    navigate('editor')
  }, [hook, navigate])

  const eliminarPresupuesto = useCallback((index) => {
    const nuevo = historial.filter((_, i) => i !== index)
    setHistorial(nuevo)
    toast.show('Presupuesto eliminado', 'success')
  }, [historial, setHistorial, toast])

  const totalBase = hook.partidas.reduce((s, p) => s + p.precio_total, 0)
  const ivaAmount = totalBase * (hook.datosCliente.iva / 100)
  const totalFinal = totalBase + ivaAmount

  const value = {
    ...hook,
    historial,
    numPresupuesto,
    setNumPresupuesto,
    totalBase,
    ivaAmount,
    totalFinal,
    guardarPresupuesto,
    cargarPresupuesto,
    eliminarPresupuesto,
    genNum,
  }

  return (
    <PresupuestosContext.Provider value={value}>
      <div className={styles.layout}>
        <main className={styles.main}>
          <div className={styles.main__content}>
            <Outlet />
          </div>
        </main>
      </div>
    </PresupuestosContext.Provider>
  )
}
