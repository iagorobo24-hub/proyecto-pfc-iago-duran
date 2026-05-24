# Proyectos PFC

> **Ecosistema de herramientas web para automatización industrial y logística.**

Aplicación SPA con **7 módulos funcionales**, autenticación con Google (Supabase OAuth), diseño responsive y asistente técnico impulsado por IA (OpenRouter).

**Demo:** [proyecto-pfc-iago-duran.vercel.app](https://proyecto-pfc-iago-duran.vercel.app)

---

## Módulos

| Ruta | Módulo | Descripción |
|------|--------|-------------|
| `/login` | **Login** | Autenticación con Google (Supabase OAuth) |
| `/fichas` | **Fichas Técnicas** | Catálogo de productos con navegación jerárquica (dual mode: agrupado por categoría DP / legacy) |
| `/almacen` | **Simulador Almacén** | Simulación de ciclo completo de pedido |
| `/incidencias` | **Dashboard Incidencias** | Registro y diagnóstico de fallos industriales |
| `/kpi` | **KPI Logístico** | 6 KPIs con semáforo e informe ejecutivo |
| `/presupuestos` | **Presupuestos** | Generador de presupuestos con referencias del catálogo |
| `/formacion` | **Formación Interna** | Matriz de competencias y planes personalizados |
| `/sonex` | **SONEX** | Asistente técnico con IA (OpenRouter) |

---

## Stack Tecnológico

### Frontend
- **React 19** + **Vite 7**
- **React Router DOM v7** — Routing anidado + lazy loading
- **CSS Modules** — Estilos scoped por componente
- **Framer Motion** — Animaciones
- **Recharts** — Visualización de datos
- **lucide-react** — Iconografía
- **Tipografía:** IBM Plex Sans

### Backend y Base de Datos
- **Supabase (PostgreSQL)** — Catálogo de productos (`products` + `brands`)
- **Supabase Auth** — Google Sign-In OAuth
- **Firestore (legacy)** — Datos de usuario (fichas, presupuestos, incidencias, kpis, formación)
- **OpenRouter API** — Gateway IA (Claude 3.5 Haiku, DeepSeek R1, Qwen 2.5 72B, Gemini Flash 1.5 8B)

### Testing y Deploy
- **Vitest** — Tests unitarios (~119 tests)
- **Playwright** — Tests E2E (7 specs + responsive audit)
- **Vercel** — Build automático + Serverless Functions + SPA

---

## Arquitectura

```
proyecto-pfc-iago-duran/
├── app/
│   ├── api/
│   │   └── ai.js                  # Vercel Function — gateway IA (OpenRouter/Groq/Gemini)
│   ├── src/
│   │   ├── __tests__/             # Tests unitarios (Vitest)
│   │   ├── components/
│   │   │   ├── auth/              # LoginPage, ProtectedRoute
│   │   │   ├── HeroSection/       # Landing page (14 componentes + estilos)
│   │   │   ├── layout/            # AppShell, Topbar, Sidebar (responsive)
│   │   │   ├── fichas/            # TarjetaFicha
│   │   │   └── ui/                # Button, Badge, Input, Card, CircleLayout, ProductTable...
│   │   ├── config/                # firestorePaths, tools
│   │   ├── contexts/              # AuthContext (Supabase), ThemeContext, ToastContext
│   │   ├── data/                  # categoriaMapping, categoryMapping, etiquetasSubcategoria, familiaMapping, hierarchy.json, marcasLogos
│   │   ├── firebase/              # Firebase config (legacy — solo datos usuario)
│   │   ├── hooks/                 # 11 custom hooks (useNavegacionFichas, useSonex, usePresupuestos...)
│   │   ├── pages/                 # LandingPage
│   │   ├── services/              # catalogService (Supabase), anthropicService, brandLogoService, firestoreService (legacy)
│   │   ├── styles/                # variables.css, animations.css, circleLayout.css
│   │   ├── supabase/              # supabaseClient.js (activo)
│   │   ├── tools/                 # 7 módulos página (FichasTecnicas, Presupuestos, Sonex...)
│   │   ├── App.jsx                # Router + rutas protegidas
│   │   └── main.jsx               # Entry point + providers
│   ├── scripts/                   # 8 scripts DB (migrate-columns, normalize-*, setup-schneider...)
│   ├── e2e/                       # Tests E2E Playwright (7 specs + helpers + screenshots)
│   ├── tests/                     # Tests adicionales (visual-verification, fichas-navigation)
│   ├── public/
│   │   ├── logos/                 # Logos de 15 fabricantes
│   │   └── screenshots/           # Capturas para landing page + E2E
│   ├── playwright.config.js
│   ├── vercel.json
│   ├── vite.config.js
│   └── package.json
├── proyecto-fin-ciclo/            # Documentación académica (50 archivos, 10 capítulos)
├── diagramas/                     # Diagramas SVG
├── DB_TAXONOMY.md                 # Taxonomía maestra de la base de datos
├── LICENSE                        # MIT
└── README.md
```

---

## Inicio Rápido

### Prerrequisitos
- Node.js 20.19+ o 22.12+
- Variables de entorno (ver sección Configuración)

### Desarrollo local

```bash
cd app
npm install
npm run dev
```

La app estará disponible en `http://localhost:5173`. El proxy `/api` redirige a `localhost:3001`.

### Build de producción

```bash
cd app
npm run build
npm run preview
```

---

## Configuración

### Variables de entorno

Crea `app/.env`:

```env
OPENROUTER_API_KEY=sk-or-...
```

| Variable | Descripción |
|----------|-------------|
| `OPENROUTER_API_KEY` | API key de OpenRouter (para SONEX y funciones IA) |

Obtén una API key gratuita en [openrouter.ai](https://openrouter.ai/).

### Supabase

El proyecto usa **Supabase** como backend principal:
- **Autenticación**: Google OAuth configurado en Supabase Dashboard
- **Base de datos**: PostgreSQL con tablas `products` y `brands`
- Las credenciales públicas están en `app/src/supabase/supabaseClient.js`

### Vercel

1. Conectar repo a Vercel (root directory: `app`)
2. Añadir variable `OPENROUTER_API_KEY` en settings del proyecto
3. Deploy automático en cada push a `main`

---

## Testing

```bash
# Tests unitarios (Vitest)
npm run test              # ~119 tests, 3 suites

# Tests E2E (Playwright)
npx playwright test       # Headless
npm run test:ui           # UI mode
```

---

## Documentación

- **[DB_TAXONOMY.md](./DB_TAXONOMY.md)** — Estructura completa de la base de datos y taxonomía de productos
- **[CLAUDE.md](./CLAUDE.md)** — Guía del proyecto para agentes IA
- **[EVOLUCION.md](./EVOLUCION.md)** — Historial cronológico del proyecto

---

## Licencia

© 2024–2026 **iagorobo24-hub** · MIT License
