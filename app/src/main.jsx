/**
 * @file main.jsx
 * @description Punto de entrada principal para el cliente en React. 
 * Inicializa el renderizado del DOM en el contenedor raíz, envuelve la aplicación
 * en los proveedores de contexto necesarios (Rutas, Tema, Autenticación y Toasts)
 * y define un manejador de errores global para fallos críticos de inicialización/hidratación.
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ToastProvider } from './contexts/ToastContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider } from './contexts/AuthContext'
import './styles/variables.css'
import './index.css'
import App from './App.jsx'

/**
 * Escucha global de errores no controlados en tiempo de ejecución (runtime/hidratación).
 * Si la aplicación falla gravemente al inicio, se reemplaza el árbol de elementos de la
 * raíz con una interfaz de fallback HTML simple y limpia para evitar una pantalla en blanco.
 */
window.addEventListener('error', (e) => {
  console.error('[Global Error]', e.error)
  const root = document.getElementById('root')
  if (root && !root.innerHTML.includes('Error')) {
    root.textContent = ''
    
    // Contenedor principal de error
    const container = document.createElement('div')
    container.style.cssText = 'padding:40px;font-family:sans-serif;max-width:600px;margin:0 auto;'

    // Título descriptivo
    const h1 = document.createElement('h1')
    h1.textContent = '⚠️ Error de carga'
    container.appendChild(h1)

    // Explicación
    const p = document.createElement('p')
    p.textContent = 'Ha ocurrido un error crítico al inicializar la aplicación.'
    container.appendChild(p)

    // Detalles técnicos del error
    const errorP = document.createElement('p')
    const strong = document.createElement('strong')
    strong.textContent = 'Detalles: '
    errorP.appendChild(strong)
    errorP.appendChild(document.createTextNode(e.error?.message || 'Error de script o carga fallida.'))
    container.appendChild(errorP)

    // Botón de recarga de la página
    const btn = document.createElement('button')
    btn.textContent = 'Recargar página'
    btn.style.cssText = 'padding:10px 20px;background:#0072CE;color:white;border:none;border-radius:4px;cursor:pointer;margin-top:20px;'
    btn.onclick = () => location.reload()
    container.appendChild(btn)

    root.appendChild(container)
  }
})

// Selección del nodo raíz de la página HTML e hidratación/renderizado de la app de React.
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

