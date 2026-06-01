import { useCallback, useMemo, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { safeGetJSON, safeSetJSON, safeRemoveItem } from '../utils/storage'

/**
 * Esquema de memoria por herramienta — define qué se guarda y cómo.
 * Cada herramienta registra aquí sus claves.
 */
export const MEMORY_SCHEMA = {
  fichas: {
    historial: { key: 'fichas_historial', default: [], maxAge: 90 },
    aiCache: { key: 'fichas_ai_cache', default: {}, maxAge: 30 },
  },
  presupuestos: {
    historial: { key: 'presupuestos_historial', default: [], maxAge: 365 },
    borrador: { key: 'presupuestos_borrador', default: null, maxAge: 7 },
  },
  sonex: {
    sesiones: { key: 'sonex_sesiones', default: [], maxAge: 365 },
  },
  simulador: {
    perfil: { key: 'simulador_perfil', default: { nombre: '', turno: 'Mañana', area: 'Almacén' }, maxAge: 365 },
    historial: { key: 'simulador_historial', default: [], maxAge: 365 },
    estado: { key: 'simulador_estado', default: null, maxAge: 1 },
  },
  incidencias: {
    listado: { key: 'incidencias_listado', default: [], maxAge: 365 },
    filtros: { key: 'incidencias_filtros', default: null, maxAge: 7 },
  },
  kpi: {
    historial: { key: 'kpi_historial', default: [], maxAge: 365 },
    ultimosDatos: { key: 'kpi_ultimos_datos', default: null, maxAge: 7 },
  },
  formacion: {
    empleados: { key: 'formacion_empleados', default: [], maxAge: 365 },
    modulos: { key: 'formacion_modulos', default: [], maxAge: 365 },
    progresos: { key: 'formacion_progresos', default: {}, maxAge: 365 },
    fechas: { key: 'formacion_fechas', default: {}, maxAge: 365 },
    planIA: { key: 'formacion_plan_ia', default: null, maxAge: 7 },
  },
}

function getStorageKey(userId, tool, field) {
  const schema = MEMORY_SCHEMA[tool]?.[field]
  if (!schema) return null
  return userId ? `pfc_u_${userId}_${schema.key}` : `pfc_${schema.key}`
}

/**
 * Hook unificado de memoria por usuario.
 *
 * Uso:
 *   const memoria = useMemoriaUsuario()
 *   const [historial, setHistorial] = memoria.presupuestos.historial.use()
 *   memoria.presupuestos.historial.save(nuevoHistorial)
 */
export default function useMemoriaUsuario() {
  const { user } = useAuth()
  const userId = user?.id || null

  const buildField = useCallback((tool, field) => {
    const schema = MEMORY_SCHEMA[tool]?.[field]
    if (!schema) throw new Error(`Unknown memory field: ${tool}.${field}`)

    const storageKey = getStorageKey(userId, tool, field)

    function load() {
      return safeGetJSON(storageKey, schema.default)
    }

    function save(value) {
      return safeSetJSON(storageKey, value)
    }

    function remove() {
      safeRemoveItem(storageKey)
    }

    function use(defaultOverride) {
      const [data, setData] = useState(defaultOverride !== undefined ? defaultOverride : load())

      const saveData = useCallback((value) => {
        if (typeof value === 'function') {
          setData(prev => {
            const next = value(prev)
            save(next)
            return next
          })
        } else {
          setData(value)
          save(value)
        }
      }, [])

      const mergeData = useCallback((partial) => {
        setData(prev => {
          const next = typeof partial === 'function' ? partial(prev) : { ...prev, ...partial }
          save(next)
          return next
        })
      }, [])

      return [data, saveData, { merge: mergeData, remove, load }]
    }

    return { load, save, remove, use, storageKey }
  }, [userId])

  const memoria = useMemo(() => {
    const obj = {}
    for (const tool of Object.keys(MEMORY_SCHEMA)) {
      obj[tool] = {}
      for (const field of Object.keys(MEMORY_SCHEMA[tool])) {
        obj[tool][field] = buildField(tool, field)
      }
    }
    return obj
  }, [buildField])

  const migrarDesdeLegacy = useCallback((legacyKey, tool, field) => {
    if (!userId) return null
    const legacy = safeGetJSON(legacyKey)
    if (legacy === null) return null
    const fieldObj = buildField(tool, field)
    fieldObj.save(legacy)
    safeRemoveItem(legacyKey)
    return legacy
  }, [userId, buildField])

  return useMemo(() => ({
    userId,
    ...memoria,
    migrarDesdeLegacy,
  }), [userId, memoria, migrarDesdeLegacy])
}