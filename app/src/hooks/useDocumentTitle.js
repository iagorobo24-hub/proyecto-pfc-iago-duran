import { useEffect } from 'react'

/* Hook que actualiza el title y meta tags SEO según la ruta activa */
export default function useDocumentTitle(title, description) {
  useEffect(() => {
    // Actualizar título
    const fullTitle = title ? `${title} — Proyectos PFC` : 'Proyectos PFC'
    document.title = fullTitle

    // Actualizar meta description
    const metaDesc = description || 'Suite de 7 herramientas web con IA para logística industrial — la empresa'
    let metaElement = document.querySelector('meta[name="description"]')
    if (metaElement) {
      metaElement.setAttribute('content', metaDesc)
    } else {
      metaElement = document.createElement('meta')
      metaElement.name = 'description'
      metaElement.content = metaDesc
      document.head.appendChild(metaElement)
    }

    // Actualizar OpenGraph title
    let ogTitle = document.querySelector('meta[property="og:title"]')
    if (!ogTitle) {
      ogTitle = document.createElement('meta')
      ogTitle.setAttribute('property', 'og:title')
      document.head.appendChild(ogTitle)
    }
    ogTitle.content = fullTitle

    // Actualizar OpenGraph description
    let ogDesc = document.querySelector('meta[property="og:description"]')
    if (!ogDesc) {
      ogDesc = document.createElement('meta')
      ogDesc.setAttribute('property', 'og:description')
      document.head.appendChild(ogDesc)
    }
    ogDesc.content = metaDesc

    return () => {
      document.title = 'Proyectos PFC'
      if (metaElement) {
        metaElement.setAttribute('content', 'Proyectos PFC Tools')
      }
    }
  }, [title, description])
}
