---
tool_id: AI-003
nombre: Vercel
rol_en_el_pfc: despliegue y funciones serverless
estado_documental: parte de la arquitectura actual
---

# Vercel

## Papel en el proyecto

Vercel aloja la aplicación y ejecuta el gateway serverless `/api/ai`. La configuración versionada está en `app/vercel.json`.

## Flujo de despliegue

El repositorio se conecta al proyecto de Vercel y el directorio `app` se construye con `npm run build`. Los rewrites permiten servir la SPA y separar `/api/*` de las rutas del cliente.

## Función de IA

`app/api/ai.js` mantiene las claves privadas en el entorno serverless y aplica controles como CORS, rate limiting, validación de modelos y límites de entrada antes de llamar al proveedor.

## Seguridad

`vercel.json` define CSP y otras cabeceras. Esto es evidencia de controles implementados, no de una auditoría o certificación de seguridad completa.

## Coste y límites

El PFC se desarrolló buscando un coste bajo y aprovechó planes disponibles durante el proyecto. La memoria no fija aquí ancho de banda, minutos, duración de funciones ni precio: pueden cambiar y deben consultarse en Vercel cuando se necesiten.
