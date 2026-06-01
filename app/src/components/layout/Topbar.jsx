import { Link } from 'react-router-dom'
import { useTheme } from '../../contexts/ThemeContext'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { LogOut, LogIn, House, Sun, Moon } from 'lucide-react'
import styles from './Topbar.module.css'

/* Extrae las iniciales de un nombre o email */
function getUserInitials(name) {
  if (!name) return '?'
  const parts = name.trim().split(/[\s._-]+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

/* Topbar — barra superior con logo, usuario y logout (navegación en Sidebar) */
export default function Topbar() {
  const { dark, toggle } = useTheme()
  const { user, logout } = useAuth()
  const { toast } = useToast()

  async function handleLogout() {
    try {
      await logout()
    } catch {
      toast.show('Error al cerrar sesión', 'error')
    }
  }

  return (
    <header className={styles.topbar} role="banner">
      {/* Botón home — vuelve a la landing */}
      <Link to="/" className={styles.homeBtn} title="Volver al inicio" aria-label="Ir a la página de inicio">
        <House size={18} aria-hidden="true" />
        <span className="sr-only">Inicio</span>
      </Link>

      <div className={styles.logo}>
        <span className={styles.logoMarca}>Proyecto PFC</span>
        <span className={styles.logoSuite}>Iago Durán</span>
      </div>

      <div className={styles.rightSection}>
        {/* Toggle tema */}
        <button
          onClick={(e) => { e.stopPropagation(); toggle(e); }}
          title={dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          className={styles.themeToggle}
          aria-label={dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        >
          {dark ? <Sun size={16} /> : <Moon size={16} />}
          <span>{dark ? 'Claro' : 'Oscuro'}</span>
        </button>

        {/* Usuario autenticado o botón de login */}
        {user ? (
          <>
            <div className={styles.userInfo}>
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Usuario'}
                  className={`${styles.userAvatar} ${dark ? styles.userAvatarDark : ''}`}
                />
              ) : (
                <span
                  className={`${styles.userInitials} ${dark ? styles.userInitialsDark : ''}`}
                  title={user.displayName || user.email}
                >
                  {getUserInitials(user.displayName || user.email)}
                </span>
              )}
              <span
                className={`${styles.userName} ${dark ? styles.userNameDark : ''}`}
                title={user.displayName || user.email}
              >
                {user.displayName || user.email}
              </span>
            </div>

            <button
              onClick={handleLogout}
              title="Cerrar sesión"
              className={`${styles.logoutBtn} ${dark ? styles.logoutBtnDark : ''}`}
            >
              <LogOut size={15} />
            </button>
          </>
        ) : (
          <Link to="/login" className={styles.loginBtn}>
            <LogIn size={15} />
            <span>Iniciar sesión</span>
          </Link>
        )}
      </div>
    </header>
  )
}
