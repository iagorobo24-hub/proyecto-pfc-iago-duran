# Proyectos PFC Tools

> **Suite de 7 herramientas web con IA para automatización industrial y logística.**

Aplicación SPA de una sola página con autenticación, diseño responsive, modo oscuro y asistente técnico impulsado por Inteligencia Artificial.

**Demo en vivo:** [proyecto-pfc-iago-duran.vercel.app](https://proyecto-pfc-iago-duran.vercel.app)

---

## Capturas de pantalla

| Landing Page | Fichas Técnicas | Simulador Almacén | SONEX Chat |
|:---:|:---:|:---:|:---:|
| Hero interactivo | Catálogo jerárquico con IA | Cronómetro + incidencias | Chatbot técnico IA |

---

## Módulos funcionales

| Ruta | Módulo | Descripción |
|------|--------|-------------|
| `/` | **Landing Page** | Hero interactivo con typing animation, secciones de stats, comparativa, roadmap, testimonios y CTA |
| `/login` | **Login** | Autenticación con Google via Supabase OAuth |
| `/app` | **Dashboard Global** | Panel de control con widgets de todas las herramientas y analytics de uso |
| `/app/fichas` | **Fichas Técnicas** | Catálogo de productos eléctricos con navegación jerárquica dual mode (agrupado por categoría DP / legacy), búsqueda por referencia y enriquecimiento IA |
| `/app/almacen` | **Simulador Almacén** | Simulación del ciclo completo de un pedido (recepción → ubicación → picking → verificación → expedición) con cronómetro real, incidencias interactivas y modo multijugador |
| `/app/incidencias` | **Dashboard Incidencias** | Registro y diagnóstico de fallos en equipos industriales con IA, KPIs en tiempo real y exportación PDF |
| `/app/kpi` | **KPI Logístico** | Cálculo de 6 KPIs logísticos (pedidos/hora, error picking, tiempo ciclo, ocupación, devoluciones, productividad) con semáforo e informe IA |
| `/app/presupuestos` | **Presupuestos** | Generador de presupuestos con selección del catálogo, cálculo automático IVA, auto-guardado y exportación PDF |
| `/app/formacion` | **Formación Interna** | Matriz de competencias por empleado, registro de módulos y plan de formación personalizado generado por IA |
| `/app/sonex` | **SONEX** | Asistente técnico con IA especializado en material eléctrico e industrial, con historial de sesiones y múltiples modos de consulta |

---

## Stack tecnológico

### Frontend

| Tecnología | Versión | Uso |
|------------|---------|-----|
| React | 19.2 | UI library con hooks, contextos, lazy loading |
| Vite | 7.3 | Build tool con HMR, code splitting, PWA |
| React Router DOM | 7.13 | Routing anidado con rutas protegidas |
| CSS Modules | — | Estilos scoped por componente + variables CSS |
| Framer Motion | 12.38 | Animaciones en landing page |
| Recharts | 3.8 | Gráficos de líneas y barras (KPI, Incidencias) |
| Lucide React | 0.577 | Iconografía (50+ iconos) |
| jsPDF + html2canvas | — | Generación de PDFs (presupuestos, informes) |
| DOMPurify + marked | — | Renderizado seguro de markdown (IA, SONEX) |

### Backend y datos

| Servicio | Uso |
|----------|-----|
| **Supabase (PostgreSQL)** | Catálogo de productos (`products` + `brands`), autenticación Google OAuth |
| **Supabase Auth** | Sesiones, login/logout, escucha de cambios de auth |
| **localStorage** | Datos de usuario offline (fichas, presupuestos, incidencias, KPIs, formación, analytics) |
| **OpenRouter API** | Gateway IA unificado — Claude 3.5 Haiku, DeepSeek R1, Qwen 2.5 72B, Gemini Flash |
| **Groq API** | Provider alternativo (Llama 3.3 70B, Mixtral 8x7B) |
| **Vercel Functions** | Serverless API gateway (`/api/ai`) con rate limiting y CORS whitelist |

### Testing y calidad

| Herramienta | Versión | Uso |
|-------------|---------|-----|
| Vitest | 4.1 | Tests unitarios (272 tests, 12 suites) |
| Playwright | 1.59 | Tests E2E (7 specs + responsive audit) |
| ESLint | 9.39 | Linting con react-hooks y react-refresh plugins |
| TypeScript (progresivo) | — | `strict: false`, `allowJs: true`, migración incremental |

### Seguridad

- **ProtectedRoute** en todas las rutas `/app/*` — redirige a `/login` si no hay sesión
- **CORS whitelist** — solo orígenes permitidos en el API gateway
- **Rate limiting** — 30 requests/min por IP en `/api/ai`
- **Model validation** — solo modelos de la lista blanca permitidos
- **Input bounds** — max 50 mensajes, 50k chars, max_tokens cap 4096
- **CSP headers** — `default-src 'self'`, `frame-ancestors 'none'`
- **XSS protection** — DOMPurify en markdown, `textContent` en errores, `role="alert"` en toasts
- **SQL injection prevention** — `sanitizeFilterValue()` en `.or()` filters, `sanitizeSearchInput()` con escape de wildcards

### Performance

- **React.memo** en BrandCard, GamaCard, FichaCard, RefCard, FichasTecnicasContent
- **useMemo/useCallback** en catInfo, breadcrumb, event handlers
- **AbortController pattern** — requestIdRef en 7 useEffects de navegación
- **Lazy loading** — `loading="lazy"` en imágenes del catálogo
- **Code splitting** — lazy() en todas las rutas de herramientas
- **Manual chunks** — vendor-react, vendor-animations, vendor-charts, vendor-pdf separados
- **Analytics batching** — buffer en memoria con flush cada 5s
- **getCategorias optimizado** — 1 query + Set dedup vs N paginated requests

---

## Arquitectura

```
proyecto-pfc-iago-duran/
├── app/                                  # Aplicación React
│   ├── api/
│   │   └── ai.js                         # Vercel Function — gateway IA (CORS, rate limit, model validation)
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/                     # LoginPage, ProtectedRoute
│   │   │   ├── fichas/                   # 19 componentes — navegación catálogo, cards, steps, skeleton
│   │   │   ├── HeroSection/              # 19 componentes — landing page completa
│   │   │   ├── incidencias/              # 8 componentes — formulario, lista, detalle, shared
│   │   │   ├── layout/                   # AppShell, Topbar, Sidebar (con navegación), KeyboardShortcuts
│   │   │   ├── presupuestos/             # 9 componentes — wizard, editor, gestión, PDF, context
│   │   │   ├── simulador/                # 8 componentes — perfil, onboarding, etapa, resultados, multijugador
│   │   │   └── ui/                       # 22 componentes — Button, Badge, Input, Card, CircleLayout, ProductTable...
│   │   ├── config/
│   │   │   └── tools.js                  # Config centralizada de las 7 herramientas
│   │   ├── contexts/                     # AuthContext, ThemeContext (modo oscuro), ToastContext
│   │   ├── data/
│   │   │   ├── categoriaMapping.js       # Mapeo subfamilia+tipo → categoría/subcategoría (DP)
│   │   │   ├── categoryMapping.js        # Info completa de categorías (iconos, colores, rutas)
│   │   │   ├── etiquetasSubcategoria.js  # Etiquetas legibles para subcategorías
│   │   │   ├── familiaMapping.js         # Mapeo de familias del catálogo
│   │   │   ├── marcasLogos.js            # URLs de logos de 15 fabricantes
│   │   │   ├── roadmapData.js            # Datos del roadmap para landing
│   │   │   └── simulador/simuladorData.js # Etapas, pedidos demo, incidencias, helpers
│   │   ├── hooks/                        # 13 custom hooks
│   │   │   ├── useNavegacionFichas.js    # Estado completo de navegación del catálogo (15+ useState)
│   │   │   ├── useFichasTecnicas.js      # Búsqueda y enriquecimiento IA de fichas
│   │   │   ├── useSimuladorAlmacen.js    # Lógica del simulador (timer, incidencias, puntuación)
│   │   │   ├── usePresupuestos.js        # Estado de presupuestos (reducer + persistencia)
│   │   │   ├── useSonex.js               # Chat sessions, memoria, historial
│   │   │   ├── useUserData.js            # Persistencia genérica Supabase + localStorage
│   │   │   ├── useMemoriaUsuario.js      # Acceso a datos por módulo (fichas, incidencias, kpi...)
│   │   │   ├── useAnalytics.js           # Tracking de eventos con batching
│   │   │   ├── useProductTable.js        # Agrupación de productos por secciones
│   │   │   ├── useSimuladorMultijugador.js # WebRTC/WebSocket para multijugador
│   │   │   ├── useKeyboardShortcuts.js   # Atajos de teclado globales
│   │   │   ├── useTestimonios.js         # CRUD de testimonios (localStorage)
│   │   │   └── useDocumentTitle.js       # Título dinámico por página
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx           # Página de aterrizaje completa
│   │   │   └── NotFound.jsx              # 404 con <main> landmark
│   │   ├── services/
│   │   │   ├── catalogService.ts         # 18 funciones — categorías, marcas, gamas, productos, búsqueda
│   │   │   ├── anthropicService.ts       # callAnthropicAI, streaming, parseAIJsonResponse, rate limiter
│   │   │   └── brandLogoService.js       # Mapeo marcas→logos con gradientes fallback
│   │   ├── styles/
│   │   │   ├── variables.css             # Sistema de diseño (colores, tipografía, espaciado, dark mode)
│   │   │   └── animations.css            # Keyframes globales
│   │   ├── supabase/
│   │   │   └── supabaseClient.js         # Cliente Supabase con stub completo para dev sin credenciales
│   │   ├── tools/                        # 7 módulos página (cada uno = .jsx + .module.css)
│   │   ├── types/
│   │   │   ├── catalog.ts                # Product, Brand, Category, SubfamiliaTipo
│   │   │   └── ai.ts                     # AIRequestBody, AIResponse, AIFicha
│   │   ├── utils/
│   │   │   ├── logger.js                 # Logger condicional (silenciado en producción)
│   │   │   ├── markdown.js               # RenderMarkdown con DOMPurify
│   │   │   ├── normalizarCategoria.js    # Normalización de categorías
│   │   │   ├── pdfGenerator.js           # Generación de PDFs
│   │   │   ├── storage.js                # Helpers seguros para localStorage
│   │   │   └── validate.js               # Validación de datos con shape()
│   │   ├── App.jsx                       # Router + ErrorBoundary + rutas protegidas
│   │   └── main.jsx                      # Entry point + providers (BrowserRouter, Theme, Auth, Toast)
│   ├── scripts/                          # 48 scripts — scraping, migración DB, normalización
│   ├── e2e/                              # 7 specs Playwright + helpers + responsive audit
│   ├── tests/                            # Tests adicionales (visual-verification, fichas-navigation)
│   ├── __tests__/                        # 12 suites Vitest (272 tests)
│   ├── public/
│   │   ├── logos/                        # 15 logos de fabricantes (PNG/JPG)
│   │   └── screenshots/                  # Capturas para landing + E2E
│   ├── eslint.config.js                  # ESLint flat config
│   ├── playwright.config.js              # Config Playwright
│   ├── tsconfig.json                     # TypeScript progresivo (strict: false)
│   ├── vercel.json                       # Config Vercel (headers, rewrites)
│   ├── vite.config.js                    # Vite config (plugins, chunks, proxy)
│   └── package.json
├── proyecto-fin-ciclo/                   # Documentación académica (10 capítulos, 50+ archivos)
├── DB_TAXONOMY.md                        # Taxonomía maestra de la base de datos
├── CLAUDE.md                             # Guía del proyecto para agentes IA
├── EVOLUCION.md                          # Historial cronológico de evolución
├── LICENSE                               # MIT
└── README.md
```

---

## Inicio rápido

### Prerrequisitos

- Node.js 20.19+ o 22.12+
- npm 9+
- Cuenta de Supabase (gratis)
- API key de OpenRouter (gratis)

### Configuración

1. **Clonar el repositorio:**

```bash
git clone https://github.com/iagorobo24-hub/proyecto-pfc-iago-duran.git
cd proyecto-pfc-iago-duran
```

2. **Instalar dependencias:**

```bash
cd app
npm install
```

3. **Configurar variables de entorno:**

Crea `app/.env` con el contenido de `.env.example`:

```env
# Supabase
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui

# IA (obligatorio para SONEX, KPI, Incidencias, Formación)
OPENROUTER_API_KEY=sk-or-tu_key_aqui
```

4. **Iniciar desarrollo:**

```bash
npm run dev
```

La app estará en `http://localhost:5173`.

### Desarrollo sin Supabase

Si no tienes credenciales de Supabase, la app usa un **stub client** que devuelve datos vacíos. La app funcionará pero sin autenticación ni datos reales del catálogo.

---

## Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo con HMR (puerto 5173) |
| `npm run build` | Build de producción (output: `dist/`) |
| `npm run preview` | Preview del build de producción |
| `npm run lint` | ESLint en todo el proyecto |
| `npm run test` | Tests unitarios con Vitest (272 tests) |
| `npm run test:watch` | Tests en modo watch |
| `npm run test:e2e` | Tests E2E con Playwright (headless) |
| `npm run test:e2e:ui` | Tests E2E con interfaz gráfica |
| `npm run test:all` | Todos los tests (unit + E2E) |

---

## Variables de entorno

| Variable | Obligatoria | Descripción |
|----------|-------------|-------------|
| `VITE_SUPABASE_URL` | Sí | URL del proyecto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Sí | Anon key de Supabase (pública, segura para cliente) |
| `OPENROUTER_API_KEY` | Sí* | API key de OpenRouter para funciones IA |
| `GROQ_API_KEY` | No | API key de Groq (provider alternativo) |

*Obligatoria para que funcionen SONEX, diagnóstico de incidencias, generación de planes de formación y KPI informes.

---

## Base de datos

### Tabla `products`

El catálogo contiene productos de fabricantes eléctricos e industriales.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | serial | PK autoincremental |
| `ref_fabricante` | text | Referencia del fabricante (única) |
| `name` | text | Nombre descriptivo |
| `familia` | text | Categoría principal (ej: `DISTRIBUCION DE POTENCIA`) |
| `subfamilia` | text | Tipo funcional (ej: `Interruptor Magnetotérmico`) |
| `tipo` | text | Formato físico (ej: `CARRIL DIN`) |
| `Gama` | text | Gama comercial del fabricante |
| `Subgama` | text | Subgama dentro de la gama |
| `marca` | text | Nombre del fabricante |
| `brand_id` | int4 | FK → brands.id |
| `precio` | numeric | Precio unitario |
| `imagen` | text | URL de imagen |
| `pdf_url` | text | URL de ficha técnica PDF |

### Tabla `brands`

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | serial | PK |
| `name` | text | Nombre del fabricante |

Ver [DB_TAXONOMY.md](./DB_TAXONOMY.md) para la documentación completa de la taxonomía.

---

## Seguridad implementada

| Capa | Medida |
|------|--------|
| **Autenticación** | ProtectedRoute en todas las rutas `/app/*`, Supabase Auth con Google OAuth |
| **API Gateway** | CORS whitelist (solo dominios permitidos), rate limiting 30 req/min por IP |
| **Input validation** | Modelos permitidos whitelist, max_tokens cap, max messages, sanitize filter values |
| **XSS** | DOMPurify en markdown rendering, textContent en error messages, CSP headers |
| **SQL Injection** | sanitizeFilterValue en `.or()` filters, sanitizeSearchInput con escape de `%` y `_` |
| **Headers** | X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Referrer-Policy, CSP |
| **Auth bypass prevention** | `__PW_MOCK_USER__` solo funciona en `import.meta.env.DEV` |
| **Error leakage** | Errores del proveedor IA no se filtran al cliente, mensajes genéricos |

---

## Testing

### Tests unitarios (Vitest)

```bash
npm run test          # Ejecutar todos
npm run test:watch    # Modo watch
```

12 suites, 272 tests cubriendo:
- `catalogService` — funciones de catálogo
- `anthropicService` — rate limiter, parsing
- `brandLogoService` — mapeo de logos
- `markdown` — sanitización XSS
- `validate` — validación de datos
- `storage` — helpers de localStorage
- `supabaseClient` — stub client
- `useMemoriaUsuario` — persistencia
- `useProductTable` — agrupación
- `useUserData` — sync Supabase/localStorage
- `normalizarCategoria` — normalización

### Tests E2E (Playwright)

```bash
npx playwright test   # Headless
npm run test:e2e:ui   # Con UI
```

7 specs cubriendo:
- Navegación general
- Fichas Técnicas (navegación jerárquica)
- Tabla de marcas
- Análisis completo
- Diagnóstico final
- Responsive audit

---

## Despliegue

### Vercel (producción)

1. Conectar el repositorio a Vercel
2. Configurar **Root Directory:** `app`
3. Añadir variables de entorno en Settings → Environment Variables
4. Deploy automático en cada push a `main`

### Build local

```bash
cd app
npm run build     # Genera dist/
npm run preview   # Preview local
```

---

## Documentación adicional

| Archivo | Contenido |
|---------|-----------|
| [DB_TAXONOMY.md](./DB_TAXONOMY.md) | Taxonomía maestra de la base de datos |
| [CLAUDE.md](./CLAUDE.md) | Guía del proyecto para agentes IA (convenciones, reglas, estructura) |
| [EVOLUCION.md](./EVOLUCION.md) | Historial cronológico de evolución del proyecto |
| [LICENSE](./LICENSE) | MIT License |

---

## Licencia

MIT License — Copyright (c) 2026 Iago Durán

---

## Agradecimientos

- **Supabase** — Backend como servicio (auth + PostgreSQL)
- **OpenRouter** — Gateway unificado de modelos de IA
- **Vercel** — Hosting y serverless functions
- **React** — UI library
- **Vite** — Build tool
