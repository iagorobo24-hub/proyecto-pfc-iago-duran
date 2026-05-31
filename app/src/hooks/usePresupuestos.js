/**
 * Hook para Presupuestos - sincronización con Firestore
 */
import { useState, useEffect, useReducer } from 'react'
import useUserData from './useUserData'

const genNum = () => {
  const d = new Date()
  return `SNP-${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}-${String(Math.floor(Math.random()*900)+100)}`
}

function partidasReducer(state, action) {
  switch (action.type) {
    case "SET":
      return action.payload.map((p, i) => ({ ...p, _id: i }))
    case "UPDATE":
      return state.map(p => {
        if (p._id !== action.id) return p
        const updated = { ...p, [action.field]: action.value }
        if (action.field === "precio_unitario" || action.field === "cantidad" || action.field === "descuento") {
          updated.precio_total = updated.cantidad * updated.precio_unitario * (1 - (updated.descuento || 0) / 100)
        }
        return updated
      })
    case "ADD_ITEM":
      return [...state, { _id: state.length, ...action.payload }]
    case "ADD_FROM_CATALOG":
      return [...state, { _id: state.length, ref: action.ref || "", desc: action.desc || "", cantidad: 1, precio_unitario: action.precio || 0, precio_total: action.precio || 0, descuento: 0 }]
    case "ADD":
      return [...state, { _id: state.length, ref: "", desc: "", cantidad: 1, precio_unitario: 0, precio_total: 0, descuento: 0 }]
    case "DELETE":
      return state.filter(p => p._id !== action.id).map((p, i) => ({ ...p, _id: i }))
    case "RECALC":
      return state.map(p => ({ ...p, precio_total: p.cantidad * p.precio_unitario * (1 - p.descuento/100) }))
    default:
      return state
  }
}

const EMPTY_ARRAY = []

export default function usePresupuestos() {
  const [categoria, setCategoria] = useState("")
  const [respuestas, setRespuestas] = useState({})
  const [recomendaciones, setRecomendaciones] = useState([])
  const [partidas, dispatchPartidas] = useReducer(partidasReducer, [])
  const [datosCliente, setDatosCliente] = useState({ nombre: "", cif: "", contacto: "", email: "", telefono: "", direccion: "", poblacion: "", cp: "", provincia: "", pais: "España", iva: 21, forma_pago: "Transferencia", plazo_entrega: "15 días", validez: "30 días" })
  const [vista, setVista] = useState("wizard")
  const [generando, setGenerando] = useState(false)
  const [guardando, setGuardando] = useState(false)

  /* Persistencia en Supabase + localStorage */
  const {
    data: storedHistorial,
    loading,
    save: saveHistorial,
  } = useUserData('presupuestos', 'historial', EMPTY_ARRAY, ['pfc_presupuestos_historial'])

  const [historial, setHistorial] = useState([])

  useEffect(() => {
    if (storedHistorial !== undefined && storedHistorial !== null) {
      setHistorial(storedHistorial)
    }
  }, [storedHistorial])

  const guardarHistorial = (presup) => {
    const nuevo = [presup, ...historial].slice(0, 20)
    setHistorial(nuevo)
    saveHistorial(nuevo)
  }

  const calcularTotales = () => {
    const base = partidas.reduce((acc, p) => acc + (p.cantidad * p.precio_unitario * (1 - p.descuento/100)), 0)
    const iva = base * (datosCliente.iva / 100)
    const total = base + iva
    return { base, iva, total }
  }

  const guardarPresupuesto = () => {
    if (!datosCliente.nombre || partidas.length === 0) return null
    setGuardando(true)
    const presupuesto = {
      id: genNum(),
      fecha: new Date().toLocaleDateString("es-ES", { day:"2-digit", month:"2-digit", year:"numeric" }),
      cliente: datosCliente.nombre,
      categoria: categoria,
      partidas: partidas,
      totales: calcularTotales(),
      datos: datosCliente
    }
    guardarHistorial(presupuesto)
    setGuardando(false)
    return presupuesto
  }

  return {
    /* Estado */
    categoria, setCategoria,
    respuestas, setRespuestas,
    recomendaciones, setRecomendaciones,
    partidas, dispatchPartidas,
    datosCliente, setDatosCliente,
    vista, setVista,
    generando, setGenerando,
    guardando, setGuardando,
    historial,
    loading,
    /* Acciones */
    guardarHistorial,
    calcularTotales,
    guardarPresupuesto,
  }
}
