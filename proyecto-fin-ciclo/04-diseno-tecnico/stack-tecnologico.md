# Stack tecnológico

## Principio

Esta página describe **tecnologías y responsabilidades**. Las versiones exactas se consultan en `app/package.json`; precios, cuotas y planes de los proveedores no se congelan aquí.

## Frontend

- React 19.
- Vite 7.
- React Router DOM 7.
- CSS Modules.
- Framer Motion para animación.
- Recharts para visualización.
- Lucide React para iconografía.
- `marked` + DOMPurify para Markdown seguro.
- jsPDF + html2canvas para generación de PDF.
- `vite-plugin-pwa` presente como dependencia; su presencia no se presenta como prueba de una experiencia offline completa.

## Datos y autenticación

- Supabase/PostgreSQL para catálogo y persistencia remota.
- Supabase Auth para autenticación.
- `localStorage` como respaldo/persistencia local en varios módulos.

Firebase se mantiene únicamente como tecnología **histórica** del proyecto.

## IA

- Vercel Function `/api/ai` como gateway.
- OpenRouter como proveedor principal configurado en el gateway.
- Groq como proveedor alternativo soportado.
- Modelos seleccionados por módulo; no existe un único “modelo del proyecto”.

En el snapshot auditado, SONEX solicita `google/gemini-2.5-flash` y el gateway mantiene fallbacks. Esto invalida la antigua descripción “todo usa Claude Haiku gratis”.

## Calidad

- ESLint.
- Vitest.
- Playwright.
- Testing Library.
- TypeScript incremental (`.ts` coexistiendo con `.js/.jsx`).

## Despliegue

Vercel compila el proyecto con `npm run build` y sirve `dist`. `vercel.json` define rewrites y cabeceras de seguridad.

## Criterio de documentación

No se publican aquí:

- límites de un plan gratuito;
- precios mensuales;
- número de modelos gratuitos;
- número de tests verdes;
- porcentaje de cobertura;
- Lighthouse o bundle.

Todos son datos temporales que deben acompañarse de fecha y evidencia en el capítulo 08.
