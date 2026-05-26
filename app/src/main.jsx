import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ToastProvider } from './contexts/ToastContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider } from './contexts/AuthContext'
import './styles/variables.css'
import './index.css'
import App from './App.jsx'

// Error boundary global para capturar errores de hidratación
window.addEventListener('error', (e) => {
  console.error('[Global Error]', e.error)
  const root = document.getElementById('root')
  if (root && !root.innerHTML.includes('Error')) {
    root.innerHTML = `
      <div style="padding:40px;font-family:sans-serif;max-width:600px;margin:0 auto;">
        <h1>⚠️ Error de carga</h1>
        <p>Ha ocurrido un error al cargar la aplicación.</p>
        <p><strong>Error:</strong> ${e.error?.message || 'Desconocido'}</p>
        <button onclick="location.reload()" style="padding:10px 20px;background:#0072CE;color:white;border:none;border-radius:4px;cursor:pointer;margin-top:20px;">
          Recargar página
        </button>
      </div>
    `
  }
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
