/**
 * @file storage.js
 * @description Utilidades para interactuar de forma segura con `localStorage` del navegador.
 * Previene caídas catastróficas en entornos con cookies desactivadas, navegación de incógnito restrictiva
 * o cuando se excede la cuota física de almacenamiento (QuotaExceededError).
 */

const QUOTA_EXCEEDED = 22

/**
 * Recupera un valor del localStorage de forma segura.
 * 
 * @export
 * @param {string} key - Clave del elemento a recuperar
 * @param {*} [fallback=null] - Valor de respaldo en caso de error o ausencia
 * @returns {string|null} Valor recuperado o fallback
 */
export function safeGetItem(key, fallback = null) {
  try {
    return localStorage.getItem(key)
  } catch {
    return fallback
  }
}

/**
 * Guarda un valor en el localStorage de forma segura.
 * Si se detecta un error de cuota excedida, intenta liberar espacio eliminando
 * las claves más antiguas antes de intentar guardar nuevamente.
 * 
 * @export
 * @param {string} key - Clave a registrar
 * @param {string} value - Valor en texto a registrar
 * @returns {boolean} True si se guardó con éxito, false en caso contrario
 */
export function safeSetItem(key, value) {
  try {
    localStorage.setItem(key, value)
    return true
  } catch (e) {
    if (e.code === QUOTA_EXCEEDED || e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
      console.warn(`⚠️ localStorage quota exceeded for "${key}". Clearing oldest entries.`)
      clearLeastUsed()
      try {
        localStorage.setItem(key, value)
        return true
      } catch {
        console.warn(`⚠️ Still unable to save "${key}" after cleanup`)
        return false
      }
    }
    return false
  }
}

/**
 * Remueve de forma segura un elemento del localStorage.
 * 
 * @export
 * @param {string} key - Clave a eliminar
 */
export function safeRemoveItem(key) {
  try {
    localStorage.removeItem(key)
  } catch {
    // Falla silenciosa para evitar caídas
  }
}

/**
 * Intenta limpiar espacio en localStorage.
 * Elimina primero las claves que no comiencen con el prefijo de la aplicación 'pfc_'.
 * Si persiste el espacio lleno, elimina las entradas más antiguas de la aplicación.
 */
function clearLeastUsed() {
  try {
    const keys = Object.keys(localStorage).filter(k => !k.startsWith('pfc_'))
    if (keys.length > 0) {
      localStorage.removeItem(keys[0])
      return
    }
    const pfcKeys = Object.keys(localStorage).filter(k => k.startsWith('pfc_'))
    if (pfcKeys.length > 0) {
      localStorage.removeItem(pfcKeys[pfcKeys.length - 1])
    }
  } catch {
    // Falla silenciosa
  }
}

/**
 * Recupera y parsea un objeto JSON desde localStorage de forma segura.
 * 
 * @export
 * @param {string} key - Clave del elemento
 * @param {*} [fallback=null] - Valor de respaldo
 * @returns {*} Objeto parseado o fallback
 */
export function safeGetJSON(key, fallback = null) {
  try {
    const raw = safeGetItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

/**
 * Serializa y guarda un objeto JSON en localStorage de forma segura.
 * 
 * @export
 * @param {string} key - Clave a registrar
 * @param {*} value - Objeto a registrar
 * @returns {boolean} True si se completó con éxito
 */
export function safeSetJSON(key, value) {
  try {
    return safeSetItem(key, JSON.stringify(value))
  } catch {
    return false
  }
}

/**
 * Limpia todo el localStorage excepto las claves especificadas en el listado de exclusión.
 * 
 * @export
 * @param {string[]} [keepKeys=[]] - Listado de claves que NO deben ser eliminadas
 */
export function safeClear(keepKeys = []) {
  try {
    const keep = {}
    keepKeys.forEach(k => {
      const v = safeGetItem(k)
      if (v !== null) keep[k] = v
    })
    localStorage.clear()
    Object.entries(keep).forEach(([k, v]) => safeSetItem(k, v))
  } catch {
    // Falla silenciosa
  }
}