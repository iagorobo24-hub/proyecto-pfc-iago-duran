/**
 * Firebase Config - MOCK (ya no se usa, mantenido solo para compatibilidad)
 * La aplicación ahora usa Supabase
 */
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

// Configuración de Firebase (ya no se usa)
const firebaseConfig = {
  apiKey: "demo-key",
  authDomain: "proyecto-pfc-iago-duran.firebaseapp.com",
  projectId: "proyecto-pfc-iago-duran",
  storageBucket: "proyecto-pfc-iago-duran.appspot.com",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:0000000000000000000000"
}

// Inicializar Firebase (ya no se usa activamente)
const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const auth = getAuth(app)

export default app
