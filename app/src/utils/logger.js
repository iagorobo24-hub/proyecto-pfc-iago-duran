/**
 * Logger condicional — silencia logs en producción,
 * los muestra en desarrollo.
 *
 * Uso:
 *   import { log, logWarn, logError } from '../utils/logger'
 *   log('Cargando productos...')
 *   logError('Error al conectar:', err)
 */

const isDev = import.meta.env.DEV

export const log = isDev ? (...args) => console.log('[PFC]', ...args) : () => {}
export const logWarn = isDev ? (...args) => console.warn('[PFC]', ...args) : () => {}
export const logError = (...args) => console.error('[PFC]', ...args)

export default { log, logWarn, logError }