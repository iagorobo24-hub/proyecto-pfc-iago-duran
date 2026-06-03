# Plan Fase 3 — CTO Audit: Proyecto PFC Iago Durán

## Resumen auditoría
- **Estado:** 6.5/10 — funcional pero con deuda técnica alta
- **Tests:** 272/272 passing ✅
- **Build:** OK ✅
- **Deploy Vercel:** OK ✅
- **Críticos:** 4 | **Altos:** 7 | **Medios:** 11 | **Bajos:** 9

---

## Acciones priorizadas

### 🔴 CRÍTICAS (primero)

#### C1: `useNavegacionFichas.js` → `useReducer`
**Por qué:** 17 useState + staleness risk + incomprensible para testeo
**Cambio:**
- Crear `NavigationState` reducer con actions: `SET_PASO`, `SET_CATEGORIA`, `SET_MARCA`, `SET_GAMA`, `SET_TIPO`, `SET_GRUPO`, `SET_SUBCATEGORIA`, `SET_GAMA_COMERCIAL`, `SET_SUBGAMA`, `SET_REFERENCIA`, `RESET`, `CLEAR_AFTER`, `PUSH_HISTORIAL`, `POP_HISTORIAL`
- Extraer loaders (getMarcasPorCategoria, getGamasPorMarcaYCategoria, etc.) a funciones independientes fuera del hook
- El hook solo retorna `{ state, dispatch, ...derivedValues }`
- **Archivos:** `useNavegacionFichas.js` → rewrite completo

#### C2: Eliminar prop drilling — crear `FichasTecnicasContext`
**Por qué:** 35 props through 2 niveles, mantenimiento imposible
**Cambio:**
- Crear `FichasTecnicasContext.jsx` que provee navegación state + callbacks
- `FichasTecnicas.jsx` → Provider + Sidebar (solo lee contexto)
- `FichasTecnicasContent.jsx` → consume contexto (ya recibe 35 props)
- `FichasTecnicasSidebar.jsx` → consume contexto
- **Archivos:** `contexts/FichasTecnicasContext.jsx` (nuevo), `FichasTecnicas.jsx` (modify), `FichasTecnicasSidebar.jsx` (modify)

#### C3: Eliminar auth bypass `window.__PW_MOCK_USER__`
**Por qué:** Exploitable if XSS or arbitrary code injection
**Cambio:**
- `AuthContext.jsx`: eliminar `window.__PW_MOCK_USER__` 
- Eliminar `__PW_MOCK_USER__` de todos los archivos
- Tests E2E: usar Supertest mock de Supabase en lugar de bypass de auth
- **Archivos:** `AuthContext.jsx`, buscar otros usos con grep

#### C4: Eliminar dead exports
**Por qué:** Código muerto, confunde, aumenta bundle
**Cambios:**
- `CircleLayout.jsx`: eliminar `CircleCenter`, `OrbitRing`, `OrbitRow`, `BrandCard`, `GamaCard`, `RefCard`, `FichaCard`, `Label`
- `FichasTecnicasSkeleton.jsx`: eliminar `SkeletonCard` export
- `PresupuestosContext.jsx`: eliminar `usePresupuestosContext` export si no se usa
- **Archivos:** estos 3 archivos

---

### 🟠 ALTAS

#### H1: Refactor `SimuladorAlmacen.jsx` — useCallback para handlers inline
**Por qué:** 10+ funciones inline recreadas cada render
**Cambio:** Extraer cada handler a `useCallback` con deps correctas

#### H2: Code-split vendor bundles >500KB
**Por qué:** UX con red lenta penalizada
**Cambio:**
```javascript
// vite.config.js - agregar manualChunks
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'vendor-react': ['react', 'react-dom'],
        'vendor-pdf': ['pdfjs-dist'],
        'vendor-charts': ['chart.js', 'react-chartjs-2'],
      }
    }
  }
}
```

#### H3: Migrar `useProductTable.js` → TypeScript
**Por qué:** Es el hook con más lógica de filtrado, necesita type safety
**Cambio:** `.js` → `.ts` con interfaces `ProductFilter`, `SortConfig`

#### H4: Extraer `StepReferenciasSimple` → archivo propio
**Por qué:** Sub-componente interno en StepReferencias debe ser archivo
**Cambio:** Mover `StepReferenciasSimple` a `StepReferenciasSimple.jsx`

---

### 🟡 MEDIAS

#### M1: Eliminar 45 console.log/warn/error → usar logger util con level
**Por qué:** Info disclosure en production
**Cambio:** Reemplazar todos `console.*` con `src/utils/logger.js` que tiene level filter
- Flags: ERROR always logs, WARN only in dev, LOG only in dev

#### M2: Fortalecer `sanitizeSearchInput()` en catalogService.ts
**Por qué:** Input `%) or true or (%` podría manipular .ilike()
**Cambio:** Whitelistallowed chars: alphanumeric, space, hyphen, underscore

#### M3: Memoizar Context providers (AuthContext, ThemeContext)
**Por qué:** Cada cambio de contexto re-renderea todo el subtree
**Cambio:**
```javascript
const authValue = useMemo(() => ({ user, loading, ...handlers }), [user, loading, ...])
const ThemeContextValue = useMemo(() => ({ theme, toggle, ... }), [theme, ...])
```

#### M4: Agregar `React.memo` a componentes que reciben object/array props
**Por qué:** Re-renders innecesarios en child components
**Archivos:** LinearRefCard, TarjetaFicha, BrandCard, y otros que reciben props object

#### M5: Agregar ErrorBoundary a nivel de route
**Por qué:** Error en cualquier componente rompe toda la app
**Cambio:** Crear `ErrorBoundary.jsx` y wrappear routes en `App.jsx`

#### M6: Dynamic import para vendor-pdf y vendor-charts
**Por qué:** Carga perezosa, reduce initial bundle
**Cambio:**
```javascript
const PDFViewer = React.lazy(() => import('../ui/PDFViewer'))
const ChartDashboard = React.lazy(() => import('../components/charts/...'))
```

#### M7: Consolidar constantes mágicas en `src/constants/`
**Por qué:** 800ms, 250ms, 3s, 5s, 30s hardcodeados
**Archivo:** `constants/index.js` con DEBOUNCE_MS, THROTTLE_MS, ANIMATION_MS, etc.

#### M8: Extraer `StepNavegacionSimple` (pasos list) a archivos propios
**Por qué:** Unificar patrones repetidos para pasos marcas/gamas/tipos/subcategorias
**Cambio:** Crear `StepMarcas.jsx`, `StepGamas.jsx`, `StepTipos.jsx`, `StepSubcategorias.jsx` con patrón compartido

#### M9: `StepReferenciasSimple` → archivo propio desde StepReferencias
(Véase H4 — mismo cambio pero como media)

---

### 🟢 BAJAS

#### L1: Reemplazar `window.location.reload()` con estado de React Router
#### L2: Eliminar `window.location.pathname` en useAnalytics → usar `useLocation`
#### L3: Eliminar E2E test files con nombres `diagnostico*.spec.js` (temporal)
#### L4: Verificar que todos los componentes de Presupuesto usan ProtectedRoute
#### L5: Limpiar `useSimuladorAlmacen.js` (untracked, sin refs) — eliminar o integrar

---

## Commit strategy

| Commit | Contenido |
|--------|-----------|
| C3+C4 (dead code + auth bypass) | `fix: remove auth bypass + delete dead exports` |
| C1 (useReducer) | `refactor: useNavegacionFichas → useReducer` |
| C2 (FichasTecnicasContext) | `refactor: create FichasTecnicasContext, eliminate prop drilling` |
| H1 (SimuladorAlmacen useCallback) | `perf: memoize SimuladorAlmacen handlers` |
| H2 (code-split vendors) | `perf: dynamic import vendor-pdf + vendor-charts` |
| M1-M9 | `refactor: cleanup — logging, sanitization, error boundary, constants` |

---

## Orden de ejecución recomendada

```
1. C3+C4 → commit → deploy (quick wins, bajo riesgo)
2. C1 → commit → deploy (refactor crítico, necesita tests)
3. C2 → commit → deploy (arquitectónico)
4. H1 → H4 → M1-M9 → commit → deploy (cleanup)
5. L1-L5 → commit → deploy ( polish)
```

**Nota:** Los cambios críticos (C1, C2) deben acompañarse de testeo manual exhaustivo antes de promote a producción con `vercel --prod`.
