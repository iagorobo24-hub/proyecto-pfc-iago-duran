---
tool_id: AI-003
nombre: Vercel
version_observada: 2025-2026
rol_principal: Despliegue automático de la aplicación web
url: https://vercel.com
---
Vercel es donde vive la web de verdad. Es una plataforma que coge tu código, lo compila y lo sirve en internet. Lo mejor de todo: es gratis y cada vez que subes algo a GitHub se actualiza solo. No hay que hacer nada manual.

## ¿Qué es?

Vercel es una plataforma de **despliegue en la nube** especializada en aplicaciones frontend y serverless functions. Conecta directamente con GitHub para hacer **deploy automático** en cada push.

## ¿Para qué lo usé?

### Despliegue de la SPA

- Subí el repositorio a GitHub y conecté Vercel
- Cada push a `main` activaba un despliegue automático
- La URL de producción: **https://proyecto-pfc-iago-duran.vercel.app**

### Funciones Serverless

La carpeta `app/api/` contiene funciones serverless que Vercel ejecuta:

- `app/api/ai.js` — Gateway unificado de IA (OpenRouter, Groq, Gemini)
- Procesa las peticiones del frontend sin exponer claves de API

### Configuración de variables de entorno

- `OPENROUTER_API_KEY` — Configurada solo en Vercel, nunca en el repo
- Dominios autorizados para Firebase Auth

## ¿Cómo lo usé?

1. Creé cuenta en vercel.com
2. Conecté el repo de GitHub (`iagorobo24-hub/proyecto-pfc-iago-duran`)
3. Configuré el root directory: `app` (la aplicación está en `/app`)
4. Añadí las variables de entorno
5. Vercel detectó automáticamente React + Vite

### Configuración de vercel.json

```json
{
  "buildCommand": "npm install && npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

## Arquitectura del deploy

```
GitHub push → Vercel webhook → Build (npm run build) → Deploy a CDN
                                                              ↓
                        Firebase Auth ← Usuario accede ← Browser
                            ↓
                        API /api/ai → Vercel Function → OpenRouter
```

## Ventajas que encontré

| Aspecto | Valoración |
|---------|-----------|
| Deploy automático desde GitHub | ⭐⭐⭐⭐⭐ |
| CDN global (velocidad) | ⭐⭐⭐⭐⭐ |
| Serverless Functions integradas | ⭐⭐⭐⭐⭐ |
| SSL automático | ⭐⭐⭐⭐⭐ |
| Preview deployments (PRs) | ⭐⭐⭐⭐ |
| Dominio personalizado | ⭐⭐⭐ |
| Plan gratuito suficiente | ⭐⭐⭐⭐⭐ |

## Coste

**Plan Hobby (gratis):**
- 100GB de transferencia/mes
- 100 horas de serverless execution/mes
- Ancho de banda ilimitado para la SPA
- Dominio `.vercel.app` incluido

**Coste real:** 0€

## Limitaciones que encontré

1. **Funciones serverless limitadas:** El plan gratuito tiene límites de ejecución (10s para funciones sync, 60s para streaming).
2. **Sin backend persistente:** Vercel no tiene base de datos propia; para eso usé Firestore/Supabase.
3. **Cold starts:** La primera ejecución de una función serverless tras un periodo de inactividad puede ser lenta.

## ¿Cuándo lo usé?

✅ **Siempre:**
- Deploy automático en cada commit a main
- Ejecutar la API de IA (/api/ai)
- Gestionar variables de entorno sensibles

❌ **No para:**
- Base de datos (usé Firestore/Supabase)
- Almacenamiento de archivos estáticos (usé el propio CDN de Vercel para logos, imágenes)

## Lecciones aprendidas con esta herramienta

1. **Conectar GitHub es essencial:** El workflow de commit → deploy automático te ahorra mucho tiempo.
2. **Las Serverless Functions son potentes:** La API de IA (/api/ai.js) que creé corre perfectamente como función serverless.
3. **El plan gratuito es más que suficiente:** Para un proyecto académico, no necesitas pagar.

## Dominio personalizado

En algún momento podrías querer conectar tu propio dominio (ej: `proyecto-pfc-iago-duran.es`). Vercel lo permite gratis con Let's Encrypt.

## Referencias

- [Vercel](https://vercel.com)
- [Documentación de Serverless Functions](https://vercel.com/docs/functions)

---

**Fecha de elaboración de esta ficha:** Abril 2026