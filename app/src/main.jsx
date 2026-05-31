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
    root.textContent = ''
    const container = document.createElement('div')
    container.style.cssText = 'padding:40px;font-family:sans-serif;max-width:600px;margin:0 auto;'

    const h1 = document.createElement('h1')
    h1.textContent = '⚠️ Error de carga'
    container.appendChild(h1)

    const p = document.createElement('p')
    p.textContent = 'Ha ocurrido un error al cargar la aplicación.'
    container.appendChild(p)

    const errorP = document.createElement('p')
    const strong = document.createElement('strong')
    strong.textContent = 'Error: '
    errorP.appendChild(strong)
    errorP.appendChild(document.createTextNode(e.error?.message || 'Desconocido'))
    container.appendChild(errorP)

    const btn = document.createElement('button')
    btn.textContent = 'Recargar página'
    btn.style.cssText = 'padding:10px 20px;background:#0072CE;color:white;border:none;border-radius:4px;cursor:pointer;margin-top:20px;'
    btn.onclick = () => location.reload()
    container.appendChild(btn)

    root.appendChild(container)
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
