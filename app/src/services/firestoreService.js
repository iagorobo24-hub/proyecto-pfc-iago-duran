/**
 * ════════════════════════════════════════════════════════════
 * @deprecated Este archivo ya NO se usa en producción.
 * Toda la persistencia se maneja via localStorage en
 * `useMemoriaUsuario.js` con el esquema de MEMORY_SCHEMA.
 *
 * Se mantiene por referencia histórica pero no debe
 * importarse en nuevo código.
 * ════════════════════════════════════════════════════════════
 */

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

/**
 * Construye segmentos de path para doc() garantizando número par
 * Ej: buildPath('users', uid, 'fichas', 'history', 'default')
 *     → ['users', uid, 'fichas', 'history', 'default']
 *     Si es impar, añade 'default' al final
 */
function buildPath(...segments) {
  const filtered = segments.filter(Boolean)
  if (filtered.length % 2 !== 0) {
    filtered.push('default')
  }
  return filtered
}

/**
 * Guarda o actualiza un documento en Firestore
 */
export async function saveUserDoc(uid, collectionPath, data, docId = 'default') {
  try {
    const segments = buildPath('users', uid, ...collectionPath.split('/'), docId)
    const docRef = doc(db, ...segments)
    await setDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    }, { merge: true })
    return true
  } catch (error) {
    console.error('Error saving to Firestore:', error)
    throw error
  }
}

/**
 * Obtiene un documento de Firestore
 */
export async function getUserDoc(uid, collectionPath, docId = 'default') {
  try {
    const segments = buildPath('users', uid, ...collectionPath.split('/'), docId)
    const docRef = doc(db, ...segments)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() }
    }
    return null
  } catch (error) {
    console.error('Error getting from Firestore:', error)
    throw error
  }
}

/**
 * Suscribe a cambios en tiempo real en un documento
 */
export function subscribeToUserDoc(uid, collectionPath, callback, docId = 'default') {
  try {
    const segments = buildPath('users', uid, ...collectionPath.split('/'), docId)
    const docRef = doc(db, ...segments)
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        callback({ id: docSnap.id, ...docSnap.data() })
      } else {
        callback(null)
      }
    }, (error) => {
      console.error('Error in Firestore subscription:', error)
      callback(null)
    })
    return unsubscribe
  } catch (error) {
    console.error('Error subscribing to Firestore:', error)
    return () => {}
  }
}

/**
 * Obtiene una colección ordenada y limitada
 */
export async function getUserCollection(uid, collectionPath, orderByField = 'updatedAt', limitCount = 50) {
  try {
    const colSegments = buildPath('users', uid, ...collectionPath.split('/'))
    // collection() también necesita segmentos pares para subcolecciones
    // Tomamos todo menos el último segmento (que es el docId que añadimos)
    const pathForCollection = colSegments.slice(0, -1)
    if (pathForCollection.length === 0) return []
    const colRef = collection(db, ...pathForCollection)
    const q = query(colRef, orderBy(orderByField, 'desc'), limit(limitCount))
    const snapshot = await getDocs(q)
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (error) {
    console.error('Error getting collection from Firestore:', error)
    return []
  }
}

/**
 * Elimina un documento de Firestore
 */
export async function deleteUserDoc(uid, collectionPath, docId = 'default') {
  try {
    const segments = buildPath('users', uid, ...collectionPath.split('/'), docId)
    const docRef = doc(db, ...segments)
    await deleteDoc(docRef)
    return true
  } catch (error) {
    console.error('Error deleting from Firestore:', error)
    throw error
  }
}



export default {
  saveUserDoc,
  getUserDoc,
  subscribeToUserDoc,
  getUserCollection,
  deleteUserDoc,
}
