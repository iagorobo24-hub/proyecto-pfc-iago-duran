const QUOTA_EXCEEDED = 22

export function safeGetItem(key, fallback = null) {
  try {
    return localStorage.getItem(key)
  } catch {
    return fallback
  }
}

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

export function safeRemoveItem(key) {
  try {
    localStorage.removeItem(key)
  } catch {
    // Silent fail
  }
}

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
    // Silent fail
  }
}

export function safeGetJSON(key, fallback = null) {
  try {
    const raw = safeGetItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export function safeSetJSON(key, value) {
  try {
    return safeSetItem(key, JSON.stringify(value))
  } catch {
    return false
  }
}

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
    // Silent fail
  }
}