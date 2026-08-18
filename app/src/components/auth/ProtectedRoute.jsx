import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { supabaseConfig } from '../../supabase/config'
import styles from './ProtectedRoute.module.css'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (import.meta.env.PROD && !supabaseConfig.configured) {
    return (
      <div className={styles.loading} role="alert">
        <div>
          <strong>Servicio temporalmente no disponible</strong>
          <div>La autenticación de la aplicación no está configurada correctamente.</div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <span>Cargando sesión…</span>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}
