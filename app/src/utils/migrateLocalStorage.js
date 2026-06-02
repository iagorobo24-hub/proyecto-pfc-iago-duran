/**
 * Migración one-shot: lee datos de localStorage (formato useMemoriaUsuario)
 * y los upserta a la tabla user_data de Supabase.
 *
 * Se ejecuta una vez por usuario al hacer login. Los datos en localStorage
 * se mantienen como cache offlline (no se borran hasta que Supabase confirma).
 */
import { supabase } from '../supabase/supabaseClient'
import { safeGetJSON } from './storage'

const MIGRATION_KEY = 'pfc_migrated_to_supabase_v1'

/**
 * Comprueba si la migración ya se completó para un usuario dado.
 * Lectura síncrona — usar antes de que los hooks hagan load/save a Supabase.
 */
export function isMigrationComplete(userId) {
  if (!userId) return true
  try {
    const flags = safeGetJSON(MIGRATION_KEY, {})
    return !!flags[userId]
  } catch {
    return false
  }
}

const MODULES_TO_MIGRATE = [
  { module: 'fichas',       fields: [{ key: 'historial', lsSuffix: 'fichas_historial', default: [] }, { key: 'aiCache', lsSuffix: 'fichas_ai_cache', default: {} }] },
  { module: 'presupuestos', fields: [{ key: 'historial', lsSuffix: 'presupuestos_historial', default: [] }] },
  { module: 'sonex',        fields: [{ key: 'sesiones', lsSuffix: 'sonex_sesiones', default: [] }] },
  { module: 'simulador',    fields: [{ key: 'perfil', lsSuffix: 'simulador_perfil', default: { nombre: '', turno: 'Mañana', area: 'Almacén' } }, { key: 'historial', lsSuffix: 'simulador_historial', default: [] }] },
  { module: 'incidencias',  fields: [{ key: 'listado', lsSuffix: 'incidencias_listado', default: [] }] },
  { module: 'kpi',          fields: [{ key: 'historial', lsSuffix: 'kpi_historial', default: [] }] },
  { module: 'formacion',    fields: [
    { key: 'empleados', lsSuffix: 'formacion_empleados', default: [] },
    { key: 'modulos', lsSuffix: 'formacion_modulos', default: [] },
    { key: 'progresos', lsSuffix: 'formacion_progresos', default: {} },
    { key: 'fechas', lsSuffix: 'formacion_fechas', default: {} },
  ] },
  { module: 'preferencias', fields: [{ key: 'tema', lsSuffix: null, default: null }, { key: 'sidebar', lsSuffix: null, default: null }] },
]

/**
 * Migra datos de localStorage a Supabase para un usuario dado.
 * Ejecutar una vez al login. Idempotente — no sobreescribe datos existentes en Supabase.
 *
 * @param {string} userId - ID del usuario autenticado
 * @returns {Promise<{migrated: number, skipped: number, errors: number}>}
 */
export async function migrateLocalStorageToSupabase(userId) {
  if (!userId) return { migrated: 0, skipped: 0, errors: 0 }

  // No migrar más de una vez por sesión
  try {
    const alreadyMigrated = safeGetJSON(MIGRATION_KEY, {})
    if (alreadyMigrated[userId]) return { migrated: 0, skipped: 0, errors: 0 }
  } catch { /* continue */ }

  let migrated = 0
  let skipped = 0
  let errors = 0

  for (const { module, fields } of MODULES_TO_MIGRATE) {
    for (const { key, lsSuffix } of fields) {
      try {
        // Construir key de localStorage (formato useMemoriaUsuario)
        const lsKey = lsSuffix ? `pfc_u_${userId}_${lsSuffix}` : null

        // Para preferencias, intentar también las keys directas de ThemeContext/AppShell
        let localData = null
        if (lsKey) {
          localData = safeGetJSON(lsKey)
        }
        if (module === 'preferencias' && key === 'tema' && localData === null) {
          localData = safeGetJSON('Proyectos PFC_theme')
        }
        if (module === 'preferencias' && key === 'sidebar' && localData === null) {
          const raw = safeGetJSON('Proyectos PFC_sidebar_collapsed')
          localData = raw !== null ? (raw === 'true' || raw === true) : null
        }

        if (localData === null || localData === undefined) {
          skipped++
          continue
        }

        // No sobreescribir si Supabase ya tiene datos
        const { data: existing } = await supabase
          .from('user_data')
          .select('id')
          .eq('user_id', userId)
          .eq('module', module)
          .eq('key', key)
          .maybeSingle()

        if (existing) {
          skipped++
          continue
        }

        // Upsert a Supabase
        const { error: upsertError } = await supabase
          .from('user_data')
          .upsert({
            user_id: userId,
            module,
            key,
            data: localData,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id, module, key',
            ignoreDuplicates: true,
          })

        if (upsertError) throw upsertError
        migrated++
      } catch (e) {
        console.warn(`[migrateLocalStorage] Error migrando ${module}.${key}:`, e.message)
        errors++
      }
    }
  }

  // Marcar como completada
  try {
    const flags = safeGetJSON(MIGRATION_KEY, {})
    flags[userId] = new Date().toISOString()
    localStorage.setItem(MIGRATION_KEY, JSON.stringify(flags))
  } catch { /* silent */ }

  return { migrated, skipped, errors }
}
