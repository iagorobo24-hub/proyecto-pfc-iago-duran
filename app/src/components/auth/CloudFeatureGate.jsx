import { useAuth } from '../../contexts/AuthContext'
import styles from '../ui/ErrorBoundary.module.css'

export default function CloudFeatureGate({ children }) {
  const { backendMode } = useAuth()

  if (backendMode === 'cloud') return children

  return (
    <div className={styles.container} role="status">
      <h2 className={styles.title}>Función cloud no disponible</h2>
      <p className={styles.message}>
        Esta función necesita la base de datos y no está disponible en modo local.
      </p>
    </div>
  )
}
