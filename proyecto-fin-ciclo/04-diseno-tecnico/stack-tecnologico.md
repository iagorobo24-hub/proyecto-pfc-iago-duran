# Stack Tecnológico — Las tecnologías que usé y por qué

## La idea general

Cuando empecé el proyecto, no sabía qué herramientas usar. Fui probando, algunas las mantuve, otras las cambié sobre la marcha. Esto es lo que acabó funcionando y por qué lo elegí.

Mi única condición era: **todo gratis**. No podía gastar dinero en un proyecto de FP.

---

## El frontend (lo que ve el usuario)

### React 19 + Vite 7

React es lo más usado hoy en día para hacer aplicaciones web. Vite es la herramienta que lo monta todo y lo hace funcionar.

| Decisión | Por qué |
|----------|---------|
| **React 19** | Es la versión más nueva, funciona bien y hay mucha documentación |
| **Vite 7** | Es muy rápido y casi no hay que configurarlo |
| **React Router v7** | Es lo que todo el mundo usa para navegar entre pantallas |

**Otras opciones que miré:**
- **Vue/Nuxt** — No lo conocía, aprender otro framework desde cero era mucho
- **Next.js** — Está muy bien pero para lo que necesitaba yo (una web que carga una vez y ya) era más complicado de lo necesario
- **Svelte** — Menos conocido, menos ayuda en internet si me atascaba

**¿Por qué me quedé con React?** Porque es lo más estándar. Si algo se rompe, hay 50 soluciones en Stack Overflow. Para un proyecto de estudiante, eso es oro.

### Los estilos

| Decisión | Por qué |
|----------|---------|
| **CSS Modules** | Los estilos de cada componente no se mezclan con los de otros |
| **Variables CSS** | Para poder cambiar el tema claro/oscuro sin esfuerzo |
| **lucide-react** | Iconos bonitos, ligeros y gratuitos |
| **IBM Plex Sans** | Tipografía profesional, queda bien y es gratis |

**Otras opciones:**
- **Tailwind CSS** — La mayoría de la gente lo adora, pero a mí me lía tener que poner mil clases en el HTML. Prefiero el CSS de toda la vida
- **Styled Components** — Hace que el CSS esté dentro del JavaScript, pero ralentiza un poco la web

### Los gráficos

Para los KPIs (los indicadores del almacén) necesitaba gráficos. Usé **Recharts**, que es una librería de gráficos hecha para React. Los semáforos (verde/amarillo/rojo) los hice con CSS normal, no hacía falta más.

---

## La autenticación y la base de datos

### Supabase (PostgreSQL + Auth) — Backend principal

**Estado actual:** Es el backend principal del proyecto. Gestiona el catálogo de productos y la autenticación.

| Decisión | Por qué |
|----------|---------|
| **PostgreSQL** | Consultas flexibles con `ilike`, `.or()`, joins — imposible en Firestore |
| **Supabase Auth** | OAuth unificado con Google, sesión gestionada automáticamente |
| **Client-side SDK** | Consultas directas desde el frontend con anon key y RLS |
| **RLS (Row Level Security)** | Seguridad a nivel de fila, sin necesidad de reglas complejas |

**Cómo funciona:**
- `catalogService.ts` (en el frontend) hace consultas directas a Supabase desde el navegador
- Las queries usan la anon key (pública) — la seguridad la da Row Level Security
- Para DISTRIBUCION DE POTENCIA, el frontend agrupa productos en categorías y subcategorías mediante `categoriaMapping.js`
- Para el resto de familias, se usa navegación legacy (gama → tipo)
- Brand lookup optimizado con reverse Map (O(1) en vez de O(n))

**Ventajas sobre Firestore:**
- Sin límite de escrituras diarias
- Consultas complejas con múltiples filtros
- Búsqueda full-text con `ilike`
- Datos de usuario en localStorage con sync a Supabase `user_data`

### Firebase (legacy — en desuso)

Firebase fue el backend original. Actualmente solo se usa como referencia en la documentación. La migración a Supabase completó el catálogo y la autenticación.

| Servicio | Estado actual |
|----------|--------------|
| **Firebase Auth** | Migrado a Supabase Auth |
| **Firestore** | Migrado a localStorage + Supabase sync |

### La API de IA

Para que SONEX (el asistente) funcione, necesitaba una manera de llamar a modelos de IA desde la web.

| Decisión | Por qué |
|----------|---------|
| **OpenRouter** | Une varias IAs en una sola API, tiene modelos gratis |
| **Claude 3.5 Haiku** | El modelo que mejor funcionó para preguntas técnicas |
| **DeepSeek** | Alternativa gratis cuando Claude tenía límites |

**Lo que probé antes:**
- Llamar directo a Anthropic (los creadores de Claude) — No funcionaba por problemas de configuración
- OpenAI directo — Había que pagar
- Groq — Rápido pero con menos modelos

**La odisea de la API de IA:** Merece capítulo aparte. Estuvimos tres días probando configuraciones hasta que OpenRouter funcionó. Si quieres los detalles, están en `fases-desarrollo.md` (Fase 11).

### Las funciones en el servidor (Vercel Functions)

Necesitaba un sitio donde esconder la clave de la API de IA (no puede estar en el código del navegador porque la vería cualquiera). Las Vercel Functions son trocitos de código que se ejecutan en el servidor de Vercel sin que tengas que montar un servidor tú mismo. Gratis y fáciles.

---

## El despliegue (cómo llegó a internet)

### Vercel

Vercel es donde está publicada la web. Tiene varias ventajas:

| Ventaja | Por qué destaca |
|---------|-------------|
| **Deploy automático** | Cada vez que subo código a GitHub, Vercel lo publica solo |
| **Gratis** | El plan Hobby (gratuito) da para mucho |
| **Rápido** | La web carga rápido en todo el mundo |
| **Funciones serverless** | Las APIs de IA se ejecutan aquí también |

**Alternativas que miré:**
- **Netlify** — Similar a Vercel, pero Vercel funciona mejor con React
- **GitHub Pages** — Gratis pero más limitado

**Mi opinión:** Vercel es tan fácil que parece trampa. Conectas tu repositorio de GitHub, haces click en "Deploy", y ya está tu web en internet. Cuando subes cambios, se actualiza sola.

---

## Testing

### Playwright

Playwright es una herramienta que automatiza navegadores. La usé para dos cosas:
1. **Hacer tests** — Para comprobar que la web funciona correctamente en Chrome, Firefox y Safari
2. **Scraping** — Para descargar el catálogo de 400.000 productos de la web del distribuidor

Hay herramientas parecidas pero Playwright es la más moderna y la que mejor funciona.

---

## Resumen rápido

```
Lo que ve el usuario:     React 19 + Vite 7
Estilos:                  CSS Modules + variables CSS (+ Framer Motion)
Login:                    Supabase Auth (Google OAuth)
Base de datos:            Supabase (PostgreSQL) — catálogo
                          Firestore (legacy) — datos de usuario
IA:                       OpenRouter (Claude 3.5 Haiku, DeepSeek, Qwen, Gemini)
Servidor:                 Vercel Functions
Publicación:              Vercel
Tests:                    Playwright + Vitest
Control de versiones:     GitHub
```

---

## Tecnologías que probé y descarté

| Tecnología | Por qué no la usé al final |
|------------|---------------------------|
| **TypeScript** | Tenía que aprender React primero, añadir tipos después era demasiado |
| **Tailwind CSS** | Cuestión de gustos, prefiero CSS normal |
| **Redux** | React Context hace lo mismo sin complicaciones |
| **Next.js** | Para una web que no necesita aparecer en Google, sobra |
| **Docker** | No tengo un servidor propio como para necesitar contenedores |

---

## Migraciones completadas y pendientes

### ✅ Firebase Auth → Supabase Auth (completada)

La autenticación ahora usa Supabase OAuth con Google. El cambio fue directo:
- Antes: `firebase.auth().signInWithPopup(provider)` + manejo de tokens Firebase
- Ahora: `supabase.auth.signInWithOAuth({ provider: 'google' })` + sesión gestionada por Supabase
- Beneficio: auth unificado con la base de datos, sin depender de dos servicios distintos

### ✅ Firestore → Supabase (catálogo — completada)

Los 2.400+ productos del catálogo están en PostgreSQL (tablas `products` y `brands`).
La estructura pasó de colecciones NoSQL flexibles a un esquema SQL fijo con columnas tipadas.

### ⏳ Firestore → Supabase (datos de usuario — pendiente)

Los datos de usuario (fichas guardadas, presupuestos, incidencias, KPIs, formación) siguen en Firestore.
Migrarlos requiere crear tablas relacionales y actualizar `firestoreService.js`.

---

*Esto fue lo que usé y por qué. Si quieres ver cómo fueron cambiando las decisiones con el tiempo, mira EVOLUCION.md.*
