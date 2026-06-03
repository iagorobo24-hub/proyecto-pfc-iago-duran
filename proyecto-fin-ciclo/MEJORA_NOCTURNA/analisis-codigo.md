# Análisis de Código Fuente — Proyectos PFC

> **Proyecto**: Aplicación web de herramientas para técnicos de material eléctrico e industrial
> **Fecha de análisis**: 2025
> **Tecnología principal**: React 18 + Vite + Supabase + OpenRouter AI
> **Directorio fuente**: `app/src/`

---

## 1. Arquitectura del Sistema

### 1.1 Stack Tecnológico

| Capa | Tecnología |
|------|------------|
| **Framework UI** | React 18 (StrictMode) |
| **Bundler** | Vite |
| **Routing** | React Router v6 (BrowserRouter) |
| **Estado global** | Context API (Auth, Theme, Toast) |
| **Estado local** | useState / useReducer / useCallback / useMemo |
| **Backend** | Supabase (PostgreSQL + Auth + Realtime) |
| **IA** | OpenRouter API (proveedor: anthropic/claude-3.5-haiku) |
| **Estilos** | CSS Modules + CSS custom properties (variables.css) |
| **Testing** | Playwright (E2E) |

### 1.2 Routing y Navegación

El enrutamiento se gestiona en `App.jsx` con React Router v6:

```
/                       → LandingPage (público)
/login                  → LoginPage (autenticación Google)
/app                    → AppShell (ProtectedRoute) + Outlet
  /app/                 → DashboardGlobal (lazy)
  /app/fichas           → FichasTecnicas (lazy)
  /app/almacen          → SimuladorAlmacen (lazy)
  /app/incidencias      → DashboardIncidencias (lazy)
  /app/kpi              → KpiLogistico (lazy)
  /app/presupuestos     → PresupuestosLayout (lazy)
    /app/presupuestos/seleccion
    /app/presupuestos/editor
    /app/presupuestos/gestion
    /app/presupuestos/pdf
  /app/formacion        → FormacionInterna (lazy)
  /app/sonex            → Sonex (lazy)
```

- **Lazy loading** con `React.lazy()` y `Suspense` para code-splitting por herramienta.
- **ProtectedRoute**: componente wrapper que redirige a `/login` si no hay sesión.
- **ErrorBoundary** a nivel de App para capturar errores de renderizado.
- **PageLoader** como fallback de Suspense con indicador de carga animado.

### 1.3 Estado de la Aplicación

#### Contextos globales (`contexts/`)

| Context | Proveedor | Datos |
|---------|-----------|-------|
| **AuthContext** | `AuthProvider` | `user`, `loading`, `loginWithGoogle()`, `logout()` |
| **ThemeContext** | `ThemeProvider` | `dark`, `toggle()` — tema claro/oscuro con View Transitions API |
| **ToastContext** | `ToastProvider` | `show(mensaje, tipo, duracion)` — notificaciones temporales |

#### Persistencia de datos

- **Supabase**: datos de usuario autenticado (tabla `user_data` con columnas `user_id`, `module`, `key`, `data`, `updated_at`).
- **localStorage**: fallback offline y caché. Keys con prefijo `Proyectos PFC_`.
- **Migración one-shot**: `migrateLocalStorageToSupabase()` mueve datos legacy de localStorage a Supabase tras el primer login.

### 1.4 Cliente Supabase (`supabase/supabaseClient.js`)

- Crea cliente con `createClient(SUPABASE_URL, SUPABASE_ANON_KEY)` si las variables de entorno están definidas.
- **Stub funcional**: si no hay credenciales, devuelve un cliente mock que no crashea la app — permite desarrollo sin Supabase configurado.
- Opciones: `persistSession: true`, `autoRefreshToken: true`, `detectSessionInUrl: true`.
- Realtime configurado con `eventsPerSecond: 10`.

### 1.5 Flujo de autenticación

1. `AuthProvider` verifica sesión existente con `supabase.auth.getSession()`.
2. Escucha cambios con `supabase.auth.onAuthStateChange()`.
3. Login con Google via `supabase.auth.signInWithOAuth({ provider: 'google' })`.
4. Support para E2E tests: si `window.__PW_MOCK_USER__` está definido (DEV mode), usa ese usuario.

---

## 2. Modelos de Datos (Types / Interfaces)

### 2.1 Catálogo (`types/catalog.ts`)

```typescript
interface Product extends Record<string, unknown> {
  id: number;
  ref_fabricante: string;
  name: string;
  marca: string;
  brand_id?: number;
  familia: string;
  subfamilia: string;
  tipo: string;
  Gama?: string;
  Subgama?: string;
  imagen?: string;
  pdf_url?: string;
  precio?: number;
  descripcion?: string;
  documentos?: Array<{ nombre: string; url: string }>;
}

interface Brand {
  id: number;
  name: string;
}

interface Category {
  id: string;
  label: string;
  icon: string;
  color: string;
}

interface SubfamiliaTipo {
  subfamilia: string;
  tipo: string;
}

interface FiltroSubcategoria {
  subfamilia: string;
  tipo?: string;
}
```

### 2.2 IA (`types/ai.ts`)

```typescript
interface AIRequestBody {
  provider?: string;    // 'openrouter'
  model?: string;       // 'anthropic/claude-3.5-haiku'
  messages: Array<{ role: string; content: string }>;
  system?: string;
  max_tokens?: number;
  temperature?: number;
}

interface AIResponse {
  text: string;
  raw: Record<string, unknown>;
  provider?: string;
  model?: string;
}

interface AIFicha {
  caracteristicas: string[];
  aplicaciones: string[];
  normas: string[];
  url_manual?: string;
  consejo_tecnico?: string;
  [key: string]: unknown;
}
```

### 2.3 Datos del simulador (`data/simulador/simuladorData.js`)

```javascript
ETAPAS = [
  { id: 0, nombre: "Recepción",    icono: "📥", estandar: 60  },
  { id: 1, nombre: "Ubicación",    icono: "📦", estandar: 90  },
  { id: 2, nombre: "Picking",      icono: "🔍", estandar: null },  // dinámico por categoría
  { id: 3, nombre: "Verificación", icono: "✅", estandar: 30  },
  { id: 4, nombre: "Expedición",   icono: "🚚", estandar: 45  },
]

ESTANDAR_PICKING = { "Variador": 180, "Contactor": 45, "Sensor": 60, "PLC": 120, ... }

PEDIDOS_DEMO = [
  { id, producto, referencia, categoria, cantidad, cliente, urgente, dificultad }
]

INCIDENCIAS = [
  { id, etapa, titulo, descripcion, opciones: [{ texto, correcto, feedback }] }
]
```

---

## 3. Servicios y APIs

### 3.1 `catalogService.ts` (Supabase → PostgreSQL)

Proporciona acceso al catálogo de productos eléctricos. Tablas: `products`, `brands`.

**Funciones principales**:

| Función | Descripción |
|---------|-------------|
| `getCategorias()` | Lista familias únicas de productos con paginación (batch 1000 por límite de Supabase) |
| `getMarcasPorCategoria(familia)` | Lista marcas disponibles para una familia |
| `getGamasPorMarcaYCategoria(marca, familia)` | Lista subfamilias/gamas |
| `getTiposPorGamaMarcaYFamilia(gama, marca, familia)` | Lista tipos dentro de una gama |
| `getProductosPorFiltro(familia, marca, gama, tipo, gamaComercial, subgama)` | Productos filtrados |
| `getSubfamiliasConTipos(marca, familia)` | Subfamilias con sus tipos |
| `getProductosPorSubcategoria(familia, marca, filtros, ...)` | Productos por múltiples subfamilias |
| `findBrandIdByName(marca)` | Resolve nombre → brand_id (con caché Map) |

**Estrategias**:
- Caché en memoria (`Map`) para `marcasCache` y `marcasReverseCache`.
- Mapeo de variantes de nombres de familia a nombres canónicos (`etiquetasFamilias`).
- Rate limiting con `setTimeout` de 100ms entre batches.

### 3.2 `anthropicService.ts` (OpenRouter API)

Integración con modelos de IA generativa via proxy `/api/ai`.

**Funciones principales**:

| Función | Descripción |
|---------|-------------|
| `callAnthropicAI(body)` | Petición POST simple, devuelve `{ text, raw, provider, model }` |
| `callAnthropicAIStream(body, onChunk, onDone)` | Petición con streaming Server-Sent Events |
| `parseAIJsonResponse(text, validator?)` | Parsea respuesta JSON de la IA con validación opcional |
| `parseAIResponse(text)` | Limpia markdown y hace `JSON.parse` |
| `sanitizeUrl(url)` | Valida que una URL tenga protocolo permitido |

**Rate limiting cliente**:
- 20 llamadas por minuto por usuario (cliente-side, no bloquea realmente).
- Validación de content-type antes de parsear.

**Flujo de streaming**:
1. Envía `stream: true` al proxy.
2. Lee body como ReadableStream con `TextDecoder`.
3. Parsea líneas `data: {...}` estilo SSE.
4. Acumula buffer entre chunks.

### 3.3 `brandLogoService.js`

Proporciona logos y avatares para marcas.

```javascript
getBrandLogoData(brandName) → { logo, initials, gradient }
// logo: ruta a /logos/*.png o null
// initials: 2 caracteres (ej: "SE" para "Schneider Electric")
// gradient: CSS linear-gradient generado por hash del nombre
```

Marcas con logo real en `/public/logos/`: Schneider Electric, ABB, Siemens, Hager, Mitsubishi Electric, IFM, Philips, Ledvance, Zemper, Wallbox, Fronius, SMA, Pylontech.

Fallback: gradientes predefinidos (15 opciones) generados por hash del nombre para consistencia.

### 3.4 `supabaseClient.js`

Ver sección 1.4.

---

## 4. Hooks Personalizados

### 4.1 `useFichasTecnicas.js`

Búsqueda de fichas técnicas con IA hibrida (catálogo real + RAG).

```javascript
const {
  consulta, setConsulta,
  resultado, setResultado,
  resultadosBusqueda,
  error,
  cargando,
  buscar,
} = useFichasTecnicas()
```

**Estrategia de búsqueda en 3 capas**:
1. Busca por referencia exacta en catálogo real.
2. Busca por nombre/palabras clave en catálogo.
3. Si no hay resultados, consulta a la IA con prompt de ficha técnica estructurada.

### 4.2 `useUserData.js`

Persistencia genérica de datos de usuario.

```javascript
const { data, loading, error, save, remove, migrateFromLocal, reload }
  = useUserData(module, field, defaultValue, legacyKeys)
```

- Module/field: espacio de nombres tipo clave-valor.
- Legacy keys: migrate automáticamente desde localStorage legacy.
- dual-storage: Supabase (autenticado) + localStorage (fallback offline).
- Migración one-shot: `isMigrationComplete()` marca cuándo la migración localStorage→Supabase terminó.

### 4.3 `useProductTable.js`

Utilidades para visualizar productos eléctricos en formato tabla.

```javascript
// Extracción de campos desde nombres de producto
extractSubgama(name)      // C60, NSX, iC60, etc.
extractFramework(name)    // 25, 40, 63... (tamaño cuadro NSX)
extractPoles(name)        // 1P, 2P, 3P, 4P, 1P+N...
extractAmps(name)          // amperaje desde string
extractCurve(name)         // B, C, D, K, MA, TMD, Z
extractSensitivity(name)  // mA para diferenciales
extractTipoDiferencial(name)  // AC, A, F, B, Hpi, Si

// Helpers
supportsTableView(products)   // ¿se puede mostrar como tabla?
groupByTable(products)        // agrupar por subfamilia
filterProductsBy(products, filtro)
ampToStandard(amp)            // redondear a valor estándar IEC
```

Tablas soportadas: magnetotérmicos (iC60, ComPacT NSX, Resi9, RX3, TX3, Mosaic) y diferenciales (iID, Vigi, RX3/TX3 diferenciales).

### 4.4 `usePresupuestos.js`

Gestión de presupuestos con reducer para partidas.

```javascript
const {
  categoria, respuestas, recomendaciones,
  partidas, dispatchPartidas,
  datosCliente, setDatosCliente,
  vista, generando, guardando,
  historial,
  guardarPresupuesto, calcularTotales,
} = usePresupuestos()
```

- Reducer con acciones: SET, UPDATE, ADD_ITEM, ADD_FROM_CATALOG, ADD, DELETE, CLEAR, RECALC.
- Historial persistente (últimos 20 presupuestos) via `useUserData`.
- Cálculo automático de totales: base, IVA, total.
- Numeración: `SNP-YYYYMM-NNN`.

### 4.5 `useSimuladorAlmacen.js`

Lógica del simulador de almacén logístico.

```javascript
const {
  pantalla, pedidoActivo, etapaActual, tiempos, tiempoEtapa,
  incActiva, incResueltas, feedbackInc, puntuacionPropia,
  estandarActual, semaforoActual, puntuacionActual,
  iniciarSimulacion, avanzarEtapa, responderIncidencia,
  finalizarSimulacion, resetear, verHistorial,
} = useSimuladorAlmacen({ operario, multiplayer })
```

- Estados de pantalla: perfil → onboarding → simulacion → resultado.
- Sorteo aleatorio de incidencias por partida.
- Temporizador por etapa con `setInterval`.
- Análisis IA post-simulación via `callAnthropicAI`.
- Integración con modo multijugador via `multiplayer` (roomCode, actualizarProgreso, finalizarPartida).

### 4.6 `useSimuladorMultijugador.js`

Sistema multiplayer para el simulador via Supabase Realtime.

```javascript
const {
  roomCode, jugadores, rol, estado, error, eventos, partidaIniciada,
  crearSala, unirseSala, iniciarPartida,
  actualizarProgreso, finalizarPartida, abandonarSala,
} = useSimuladorMultijugador(operario)
```

- Usa `supabase.channel()` con broadcast y presence.
- Room prefix: `simulacion:`.
- Códigos de sala de 6 caracteres generados aleatoriamente.
- Eventos broadcast: `game:start`, `player:finish`, `player:progress`, `game:abort`.

### 4.7 `useSonex.js`

Chatbot técnico con historial de conversaciones.

```javascript
const {
  sessions, activeSessionId, messages, input, isLoading,
  categoriaActiva, modoActivo, refsTurno,
  sugerenciasPopulares,
  guardarMensaje, limpiarChat, exportarChat,
  createNewSession, switchSession, deleteSession,
} = useSonex()
```

- Persistencia de sesiones via `useUserData('sonex', 'sesiones', [])`.
- Límite de 100 mensajes por sesión.
- Generación de títulos automáticos desde primer mensaje.
- Exportación a texto plano.
- Sugerencias populares hardcodeadas.

### 4.8 `useAnalytics.js`

Tracking de eventos para analítica.

```javascript
const {
  track, trackPageView, trackToolOpen, trackSearch,
  trackAIError, trackShortcut, summary,
} = useAnalytics()
```

- Eventos almacenados en localStorage (`pfc_analytics_events`).
- Flush asíncrono cada 5s o en `beforeunload`.
- Máximo 500 eventos almacenados.
- Categorías: pageview, herramienta, busqueda, ia, atajo.

### 4.9 Otros hooks

| Hook | Propósito |
|------|-----------|
| `useKeyboardShortcuts` | Atajos de teclado globales (toggle sidebar, shortcuts overlay, búsqueda) |
| `useDocumentTitle` | Actualizar `<title>` con formato `pagina — subtitulo` |
| `useNavegacionFichas` | Navegación entre fichas (anterior/siguiente) |
| `useTestimonios` | Datos de testimonios para landing |

---

## 5. Componentes UI Principales

### 5.1 Layout

| Componente | Archivo | Descripción |
|------------|---------|-------------|
| **AppShell** | `components/layout/AppShell.jsx` | Contenedor principal con sidebar + topbar + outlet. Responsive (sidebar oculta en ≤1024px). Skip link para accesibilidad. Búsqueda global (Ctrl+K). |
| **Sidebar** | `components/layout/Sidebar.jsx` | Navegación de herramientas. Estado collapsed persistente (localStorage + Supabase). Tooltips cuando colapsada. |
| **Topbar** | `components/layout/Topbar.jsx` | Barra superior con logo, toggle tema, nombre de usuario, logout. |
| **KeyboardShortcutsOverlay** | `components/layout/KeyboardShortcutsOverlay.jsx` | Modal con lista de atajos de teclado. |

### 5.2 Autenticación

| Componente | Descripción |
|------------|-------------|
| **LoginPage** | Página de login con botón "Iniciar sesión con Google". |
| **ProtectedRoute** | Wrapper que redirige a `/login` si no hay usuario autenticado. |

### 5.3 Landing Page

- **HeroSection**: componentes en `components/HeroSection/` (HeroContainer, HeroContent, HeroHeader, HeroVisual, AnimatedBackground, FloatingParticles, StatsSection, FeaturesMini, HowItWorks, TestimoniosSection, Roadmap, ToolsShowcase, ComparativaSection, FinalCTA, TechStack, SimpleFooter).

### 5.4 Fichas Técnicas (`tools/FichasTecnicas.jsx` + `components/fichas/`)

| Componente | Descripción |
|------------|-------------|
| `FichasTecnicasSidebar` | Selector de categoría → marca → gama → tipo |
| `FichasTecnicasContent` | Lista de productos filtrados con búsqueda IA |
| `TarjetaFicha` | Tarjeta individual de producto |
| `LinearFichaCard` / `LinearRefCard` | Vista en lista compacta |
| `VistaCurvaTipo` / `VistaPolos` / `VistaCalibre` / `VistaFramework` | Vistas especializadas de atributos de producto |
| `VistaCardConImagen` | Tarjeta con imagen del producto |
| `StepFicha` / `StepReferencias` | Componentes de wizard/pasos |
| `FichasTecnicasSkeleton` | Estado de carga |

### 5.5 Presupuestos (`components/presupuestos/`)

| Componente | Descripción |
|------------|-------------|
| `PresupuestosLayout` | Layout con sidebar de navegación interna |
| `PresupuestosWizard` | Wizard de creación en 3 pasos |
| `PresupuestosSeleccion` | Selección de categoría y parámetros |
| `PresupuestosEditor` | Editor línea a línea de partidas |
| `PresupuestosGestion` | Lista de presupuestos guardados |
| `PresupuestosPdf` | Vista de impresión/exportación PDF |
| `PresupuestosContext` | Context para compartir estado entre componentes |

### 5.6 Simulador Almacén (`tools/SimuladorAlmacen.jsx` + `components/simulador/`)

| Componente | Descripción |
|------------|-------------|
| `SimuladorPerfil` | Selección de operario y modo (entrenamiento/evaluación) |
| `SimuladorOnboarding` | Instrucciones antes de empezar |
| `SimuladorEtapa` | Simulación activa con timer, semáforo, log de eventos |
| `SimuladorResultados` | Resultado final con puntuación y análisis IA |
| `SalaMultijugador` | Lobby multiplayer con código de sala |
| `RankingMultijugador` | Clasificación en tiempo real |

### 5.7 Dashboard Incidencias (`tools/DashboardIncidencias.jsx` + `components/incidencias/`)

| Componente | Descripción |
|------------|-------------|
| `IncidenciasLista` | Tabla filtrable con KPIs |
| `IncidenciasFormulario` | Formulario de registro con diagnóstico IA |
| `IncidenciasDetalle` | Vista detalle de una incidencia |
| `IncidenciasShared` | Componentes compartidos (badges, estados) |

### 5.8 Componentes UI base (`components/ui/`)

- `Badge`, `Button`, `Card`, `Input`, `SegmentedControl`
- `WelcomeState`, `DashboardWidget`, `VisuallyHidden`, `CircleLayout`
- `ProductTable` — tabla de productos eléctricos con soporte de vista tabular (magnetotérmicos/diferenciales)
- `index.js` — barrel export

### 5.9 Herramientas individuales

| Herramienta | Archivo | Descripción |
|-------------|---------|-------------|
| **KpiLogistico** | `tools/KpiLogistico.jsx` | Cálculo de 6 KPIs logísticos con semáforo e informe IA |
| **FormacionInterna** | `tools/FormacionInterna.jsx` | Matriz de competencias y planes de formación |
| **Sonex** | `tools/Sonex.jsx` | Interfaz de chatbot con sidebar de sesiones |
| **DashboardGlobal** | `tools/DashboardGlobal.jsx` | Panel de control centralizado |

---

## 6. Datos Estáticos

| Archivo | Contenido |
|---------|-----------|
| `data/categoryMapping.js` | Mapeo de categorías |
| `data/categoriaMapping.js` | Mapeo de categorías (español) |
| `data/etiquetasSubcategoria.js` | Etiquetas descriptivas para subcategorías |
| `data/marcasLogos.js` | Datos de marcas y logos |
| `data/roadmapData.js` | Roadmap de producto |
| `data/simulador/simuladorData.js` | Etapas, pedidos demo, incidencias, funciones helper |

---

## 7. Utilidades (`utils/`)

| Archivo | Funciones principales |
|---------|----------------------|
| `storage.js` | `safeGetItem`, `safeSetItem`, `safeGetJSON`, `safeSetJSON`, `safeRemoveItem` — wrappers seguros con try/catch |
| `validate.js` | `shape(schema)` — factory de validadores; `validateProduct`, `validateBrand` |
| `logger.js` | `log`, `logWarn`, `logError` — logging condicional por entorno |
| `migrateLocalStorage.js` | `migrateLocalStorageToSupabase()`, `isMigrationComplete()` |
| `pdfGenerator.js` | Generación de PDFs (para presupuestos) |
| `markdown.js` | Conversión de markdown a HTML |

---

## 8. Visión General de la Arquitectura

```
┌─────────────────────────────────────────────────────────────────────┐
│                           Browser                                    │
├─────────────────────────────────────────────────────────────────────┤
│  React 18 + Vite                                                     │
│  ┌─────────┐  ┌──────────┐  ┌───────────┐  ┌────────────────────┐ │
│  │ Context │  │  Router   │  │  Hooks    │  │     Lazy Pages     │ │
│  │ Auth    │  │ /app/*    │  │ useXxx    │  │ Fichas/Simulador/  │ │
│  │ Theme   │  │           │  │           │  │ Sonex/KPI/etc.      │ │
│  │ Toast   │  │           │  │           │  │                    │ │
│  └────┬────┘  └─────┬────┘  └─────┬────┘  └─────────┬──────────┘ │
│       │             │             │                  │            │
│  ┌────▼─────────────▼─────────────▼──────────────────▼──────────┐  │
│  │                    Services Layer                              │  │
│  │  catalogService  │  anthropicService  │  brandLogoService     │  │
│  └────┬────────────────────┬─────────────────────┬──────────────┘  │
│       │                    │                     │                  │
│  ┌────▼────────┐    ┌──────▼──────┐     ┌────────▼─────────┐       │
│  │  Supabase   │    │ /api/ai     │     │  localStorage     │       │
│  │ (Productos, │    │ (OpenRouter)│     │  (Fallback/cache) │       │
│  │  Auth,      │    │             │     │                   │       │
│  │  Realtime)  │    │             │     │                   │       │
│  └─────────────┘    └─────────────┘     └───────────────────┘       │
└─────────────────────────────────────────────────────────────────────┘
```

**Patrones arquitectónicos empleados**:
- **Provider pattern** para estado global (Context API).
- **Custom hooks** para lógica de negocio reutilizable.
- **Code splitting** con lazy loading por ruta.
- **Dual storage** (Supabase + localStorage) con estrategia de migración.
- **Service layer** separada de componentes.
- **Reducer pattern** para estado complejo (partidas de presupuestos).
- **Real-time presence** para funcionalidades multiplayer.

---

*Generado automáticamente por Hermes Agent — análisis estático del código fuente*