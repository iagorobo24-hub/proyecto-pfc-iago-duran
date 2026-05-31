# Arquitectura del Sistema

## Cómo está montado

La app es una **SPA** (Single Page Application) hecha con React 19. El usuario navega entre pantallas sin que la web se recargue. El backend es **Supabase** (PostgreSQL) para el catálogo y la autenticación, y **OpenRouter** para las funcionalidades de IA.

```
┌─────────────────────────────────────────────────┐
│                   NAVEGADOR                      │
│                                                  │
│  React 19 + React Router v7                      │
│  ├── AppShell (layout común)                     │
│  │   ├── Topbar (barra superior)                 │
│  │   ├── Sidebar (navegación + info herramienta) │
│  │   └── <Outlet /> (contenido de la ruta)       │
│  │                                                │
│  ├── ProtectedRoute (exige login)                │
│  ├── Contexts (Auth, Theme, Toast)               │
│  └── Tools (8 módulos)                           │
│                                                  │
└──────────┬──────────────┬────────────────────────┘
           │              │
     ┌─────▼─────┐  ┌────▼────────┐
     │ Supabase  │  │ /api/ai     │
     │ (PG + Auth)│  │ (Vercel Fn)│
     └───────────┘  └─────┬──────┘
                          │
                    ┌─────▼──────┐
                    │ OpenRouter │
                    │ (Claude,   │
                    │  DeepSeek) │
                    └────────────┘
```

---

## Las pantallas

### Rutas principales

| Ruta | ¿Login? | Qué hace |
|------|---------|----------|
| `/` | No | Landing page con info del proyecto |
| `/login` | No | Botón para entrar con Google |
| `/app` | Sí | Dashboard Global — accesos rápidos |
| `/app/fichas` | Sí | Catálogo de productos |
| `/app/almacen` | Sí | Simulador de almacén |
| `/app/incidencias` | Sí | Registro de fallos |
| `/app/kpi` | Sí | Indicadores logísticos |
| `/app/presupuestos` | Sí | Generador de presupuestos |
| `/app/formacion` | Sí | Control de formación |
| `/app/sonex` | Sí | Chatbot técnico |

Todas las rutas de `/app/*` están protegidas por `ProtectedRoute`. Si no has iniciado sesión, te redirige a `/login`.

---

## Los componentes principales

### Layout (la estructura que se repite)

| Componente | Qué hace |
|------------|----------|
| `AppShell` | El "esqueleto" de la web: topbar arriba, sidebar a la izquierda, contenido al lado |
| `Topbar` | Barra superior con logo, búsqueda, modo oscuro y avatar |
| `Sidebar` | Navegación a las 7 herramientas + info de la que estás usando |
| `ProtectedRoute` | Comprueba si hay sesión. Si no, te manda al login |

### Herramientas (cada una es un módulo)

| Herramienta | Componente | Descripción |
|-------------|------------|-------------|
| Fichas Técnicas | `FichasTecnicas` | Navegación jerárquica por catálogo + IA |
| Almacén | `SimuladorAlmacen` | Simulación con cronómetro + multijugador |
| Incidencias | `DashboardIncidencias` | Formulario + lista + diagnóstico IA |
| KPI | `KpiLogistico` | 6 KPIs + gráfico + informe IA |
| Presupuestos | `PresupuestosLayout` | Wizard → Selección → Editor → PDF |
| Formación | `FormacionInterna` | Matriz competencias + plan IA |
| SONEX | `Sonex` | Chat con historial + modos |

### Datos

| Servicio | Qué hace |
|----------|----------|
| `catalogService.ts` | Consultas al catálogo (18 funciones: categorías, marcas, gamas, productos, búsqueda) |
| `anthropicService.ts` | Llamadas a la IA (streaming, rate limiter, parseo de JSON) |
| `brandLogoService.js` | Mapea marcas a logos con gradientes de fallback |
| `api/ai.js` | Vercel Function que hace de proxy a OpenRouter (CORS, rate limit, validación) |

---

## Cómo fluyen los datos

### Carga del catálogo

```
1. Entras en Fichas Técnicas
2. useNavegacionFichas carga las categorías → catalogService.getCategorias()
3. Haces clic en una categoría → getMarcasPorCategoria()
4. Seleccionas marca → getSubfamiliasConTipos() o getGamasPorMarcaYCategoria()
5. Sigues navegando hasta llegar a los productos
6. Los productos se muestran en ProductTable o CircleLayout
```

### Chat con SONEX

```
1. Escribes un mensaje
2. useSonex lo envía a /api/ai
3. api/ai.js añade la API key y llama a OpenRouter
4. OpenRouter devuelve la respuesta (streaming)
5. La respuesta se muestra poco a poco en el chat
6. Si la respuesta menciona una referencia, aparece un botón "Ver ficha"
```

### Login

```
1. Entras en /login
2. Haces clic en "Continuar con Google"
3. Supabase abre el popup de Google
4. Google te autentica y vuelve a la web
5. AuthContext guarda el usuario
6. ProtectedRoute te deja pasar a /app
```

---

## Las capas de seguridad

He intentado que la app sea lo más segura posible:

### 1. Autenticación
- Supabase Auth con Google OAuth
- ProtectedRoute en todas las rutas `/app/*`
- Sesión persistente (no se pierde al recargar)

### 2. Datos
- Row Level Security en Supabase (cada usuario solo ve lo suyo)
- localStorage como fallback offline
- Sync a Supabase `user_data` cuando hay sesión

### 3. API de IA
- CORS whitelist (solo mi dominio y localhost)
- Rate limiting (30 peticiones/min por IP)
- Solo modelos de la lista blanca
- Límite de mensajes (50) y caracteres (50k)
- Los errores del proveedor no se filtran al cliente

### 4. Frontend
- DOMPurify en todo el markdown que viene de la IA
- `textContent` en mensajes de error (nada de `innerHTML`)
- CSP headers en Vercel (X-Content-Type-Options, X-Frame-Options, etc.)
- Sanitización de inputs en búsquedas y filtros

---

## Los servicios que uso

| Servicio | Para qué | Tier | Coste |
|----------|----------|------|-------|
| **Supabase** | Base de datos + Auth | Free | 0€ |
| **Vercel** | Hosting + Functions | Hobby | 0€ |
| **OpenRouter** | API de IA | Free | 0€ |
| **GitHub** | Código fuente | Free | 0€ |

Todo gratis. Para un proyecto de FP, el tier gratuito de todos estos servicios es más que suficiente.

---

## Escalabilidad

### El reto: 400K+ productos

El catálogo tiene más de 400.000 productos. Para que vaya bien:

- **Navegación jerárquica** — No se cargan todos de golpe. Se navega por familias → marcas → gamas → referencias
- **Paginación** — Las queries a Supabase usan `.range()` para no traer más de 1000 filas
- **Búsqueda optimizada** — `buscarProductos()` con `ilike` y límite de resultados
- **Brand lookup O(1)** — Reverse Map para encontrar marcas por nombre en vez de recorrer todo el array

### El reto: Rate limits de IA

- OpenRouter tiene límites diarios en el tier gratuito
- El rate limiter del API gateway (30 req/min) evita abusos
- El cliente tiene un rate limiter propio (20 llamadas/min)
- Si la IA falla, se muestra un error claro y se puede reintentar

---

*Arquitectura documentada: Mayo 2026*
*Ver también: listado-componentes.md para el inventario completo*
