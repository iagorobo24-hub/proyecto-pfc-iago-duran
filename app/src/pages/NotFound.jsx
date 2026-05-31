import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <main style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      gap: '16px',
      padding: '40px',
      textAlign: 'center',
      fontFamily: 'var(--font-body)',
      color: 'var(--color-text)',
      background: 'var(--color-bg)',
    }}>
      <div style={{ fontSize: '64px', lineHeight: 1, opacity: 0.15 }} aria-hidden="true">404</div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0, color: 'var(--color-text)' }}>
        Página no encontrada
      </h1>
      <p style={{ color: 'var(--color-text-secondary)', maxWidth: 360, margin: 0 }}>
        La ruta que buscas no existe o ha sido movida.
      </p>
      <Link
        to="/app"
        style={{
          marginTop: '8px',
          padding: '10px 24px',
          background: 'var(--color-brand)',
          color: 'var(--color-on-brand)',
          borderRadius: '8px',
          fontWeight: 600,
          textDecoration: 'none',
        }}
      >
        Volver al dashboard
      </Link>
    </main>
  )
}