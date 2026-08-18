# Arquitectura del sistema

## Vista general

La aplicación es una SPA React desplegable en Vercel. El área privada comparte `AppShell` y `ProtectedRoute`; cada herramienta se carga de forma diferida desde `app/src/App.jsx`.

```text
Navegador
  ├─ Landing / Login
  └─ Área /app protegida
       ├─ Dashboard Global
       ├─ Fichas
       ├─ Almacén
       ├─ Incidencias
       ├─ KPI
       ├─ Presupuestos
       ├─ Formación
       └─ SONEX

Navegador ── Supabase ── Auth + catálogo + datos persistentes
Navegador ── /api/ai ── Vercel Function ── OpenRouter/Groq
```

## Frontend

- React 19 y React Router.
- Rutas `lazy()` con `Suspense`.
- `ErrorBoundary` para errores de render.
- CSS Modules y variables de diseño.
- Contextos de autenticación, tema y notificaciones.

El Dashboard Global es una pantalla agregadora, no una octava herramienta funcional.

## Datos

`catalogService.ts` consulta Supabase para familias, marcas, filtros, productos, búsqueda y estadísticas. Los datos de usuario de varios módulos pasan por `useUserData`, que combina almacenamiento local con la tabla `user_data` cuando existe una sesión válida y la migración correspondiente se ha completado.

Firebase se conserva en la documentación como arquitectura histórica. No se usa como descripción primaria del estado actual.

## IA

El cliente no contiene la clave privada del proveedor. Las peticiones se envían a `/api/ai`, que:

- valida método y entrada;
- aplica CORS y rate limiting;
- valida el modelo contra una allowlist;
- limita número/tamaño de mensajes y tokens;
- reenvía a OpenRouter o Groq;
- puede intentar fallbacks en errores de crédito/rate limit.

Los módulos no comparten obligatoriamente el mismo modelo. En el snapshot auditado, SONEX selecciona `google/gemini-2.5-flash`, mientras otros módulos utilizan modelos diferentes.

## Seguridad

`app/vercel.json` configura cabeceras como CSP, `X-Frame-Options`, `X-Content-Type-Options` y `Referrer-Policy`. El renderizado Markdown usa sanitización. Estas medidas son controles implementados, **no equivalen por sí solas a una certificación de seguridad**.

## Resiliencia

El proyecto dispone de fallbacks locales en determinados datos de usuario y de un cliente stub para desarrollo sin Supabase. Eso no debe describirse como “modo offline completo”: autenticación, catálogo y servicios remotos siguen teniendo dependencias de red.

## Despliegue

Vercel compila la aplicación desde `app`, sirve los assets y enruta `/api/*` a funciones serverless. Las cifras de uptime, latencia o capacidad deben medirse aparte; no forman parte de la arquitectura como garantías.

*Arquitectura reconciliada con el código de `main` auditado en agosto de 2026.*
