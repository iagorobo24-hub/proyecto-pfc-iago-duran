# Implementation Plan — CTO Senior

> Plan de ejecución ordenado para llevar el código a producción limpia. Cada fase tiene tareas independientes que pueden ejecutarse en paralelo dentro de la fase.

---

## FASE 1: Quick Wins Críticos (1-3 días)

> **Objetivo**: Eliminar errores que congelan la app, arreglar dark mode, y limpiar código muerto.
> **Regla**: Cada tarea es un commit separado. Tests después de cada cambio.

### Tarea 1.1: Eliminar hooks muertos
```bash
# Archivos a eliminar (420 líneas muertas)
rm app/src/hooks/useFormacionInterna.js
rm app/src/hooks/useKpiLogistico.js
rm app/src/hooks/useDashboardIncidencias.js
rm app/src/hooks/useSimuladorAlmacen.js
```
- **Por qué**: Estos hooks nunca se importan. Los componentes re-implementan la lógica directamente.
- **Riesgo**: Ninguno. No están referenciados.
- **Commit**: `chore: remove 4 unused hooks (420 lines)`

### Tarea 1.2: Fix AuthContext catch
```jsx
// app/src/contexts/AuthContext.jsx — línea ~24
supabase.auth.getSession()
  .then(({ data: { session } }) => {
    setSession(session)
    setLoading(false)
  })
  .catch(() => setLoading(false))  // ← AÑADIR
```
- **Por qué**: Sin catch, si la red falla, `loading` se queda `true` y la app entera se congela.
- **Riesgo**: Bajo. Solo añade fallback.
- **Commit**: `fix: add catch to getSession to prevent app freeze`

### Tarea 1.3: Fix FormacionInterna toast
```jsx
// app/src/tools/FormacionInterna.jsx — añadir después de imports
const { toast } = useToast()
```
- **Por qué**: `toast.show()` se llama pero `toast` no está destructurado. Crashea en runtime.
- **Riesgo**: Ninguno.
- **Commit**: `fix: add missing useToast destructuring in FormacionInterna`

### Tarea 1.4: Fix DashboardGlobal null guard
```jsx
// app/src/tools/DashboardGlobal.jsx — línea ~26
const filtered = (incidencias || []).filter(...)
```
- **Por qué**: `incidencias` puede ser `undefined` en el primer render.
- **Riesgo**: Ninguno.
- **Commit**: `fix: add null guard for incidencias in DashboardGlobal`

### Tarea 1.5: Fix Dark Mode backgrounds
```css
/* app/src/index.css — línea ~14 */
.shell { background: var(--color-bg); }  /* era var(--gray-50) */

/* línea ~25 */
.main { background: var(--color-surface); }  /* era var(--white) */
```
- **Por qué**: `var(--white)` y `var(--gray-50)` no son semánticos para dark mode.
- **Riesgo**: Bajo. Las variables ya están definidas en `variables.css`.
- **Commit**: `fix: use semantic CSS variables for dark mode backgrounds`

### Tarea 1.6: Fix BudgetPrintView fonts
```css
/* app/src/components/presupuestos/BudgetPrintView.module.css — línea ~8 */
font-family: var(--font-body);  /* era 'IBM Plex Sans' */

/* línea ~148 */
font-family: var(--font-mono);  /* era 'IBM Plex Mono' */
```
- **Por qué**: IBM Plex Sans no se carga en ningún sitio. El fallback es `system-ui`.
- **Riesgo**: Ninguno.
- **Commit**: `fix: use CSS font variables in BudgetPrintView instead of unloaded fonts`

### Tarea 1.7: Fix FormacionInterna toast (verificación)
```bash
# Verificar que no hay más llamadas a toast.show() sin import
grep -rn "toast\.show" app/src/ | grep -v "useToast"
```
- **Commit**: Incluido en Tarea 1.3

---

## FASE 2: Seguridad y Performance Crítica (1 semana)

> **Objetivo**: Cerrar brechas de seguridad, estabilizar contextos, optimizar renders críticos.
> **Depende de**: Fase 1 completada.

### Tarea 2.1: Verificar RLS en todas las tablas
```sql
-- Verificar que TODAS las tablas tienen RLS habilitado
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public';
```
- **Archivos afectados**: Ninguno (configuración de Supabase)
- **Por qué**: El anon key está en el frontend. Sin RLS, datos expuestos.
- **Commit**: N/A (configuración de BD)

### Tarea 2.2: Estabilizar AuthContext
```jsx
// app/src/contexts/AuthContext.jsx
const value = useMemo(() => ({
  session, user, loading, error,
  signInWithGoogle, signOut
}), [session, user, loading, error, signInWithGoogle, signOut])
```
- **Por qué**: El value se recrea en cada render → todos los consumers se re-renderizan.
- **Riesgo**: Bajo. Solo añade memoización.
- **Commit**: `perf: memoize AuthContext value to prevent unnecessary re-renders`

### Tarea 2.3: Estabilizar ThemeContext
```jsx
// app/src/contexts/ThemeContext.jsx
const value = useMemo(() => ({
  dark, toggle
}), [dark, toggle])
```
- **Commit**: `perf: memoize ThemeContext value`

### Tarea 2.4: Estabilizar useMemoriaUsuario
```jsx
// app/src/hooks/useMemoriaUsuario.js
const memoria = useMemo(() => {
  const obj = {}
  for (const tool of TOOLS) {
    obj[tool] = {}
    for (const field of FIELDS) {
      obj[tool][field] = buildField(tool, field)
    }
  }
  return obj
}, [])  // buildField es estable por useCallback
```
- **Por qué**: Se usa en 6+ herramientas. Reconstruir en cada render causa cascada de re-renders.
- **Commit**: `perf: memoize useMemoriaUsuario return value`

### Tarea 2.5: Añadir React.memo a FichasTecnicasContent
```jsx
// app/src/components/fichas/FichasTecnicasContent.jsx
export default React.memo(FichasTecnicasContent)
```
- **Por qué**: 915 líneas, 25 props. Se re-renderiza con cada cambio del padre.
- **Riesgo**: Bajo. Los props ya son estables (strings, functions de callback).
- **Commit**: `perf: memoize FichasTecnicasContent to prevent re-renders`

### Tarea 2.6: Sanitizar input en Supabase .or()
```typescript
// app/src/services/catalogService.ts — líneas 558, 575
function sanitizeSearchInput(t: string): string {
  return t.replace(/[(),]/g, '')
}

// En buscarProductos:
const sanitized = sanitizeSearchInput(t)
.or(`name.ilike.%${sanitized}%,ref_fabricante.ilike.%${sanitized}%`)
```
- **Por qué**: Input con comas/paréntesis rompe la sintaxis de `.or()`.
- **Commit**: `fix: sanitize search input to prevent filter injection`

### Tarea 2.7: Fix useSonex stale closure
```jsx
// app/src/hooks/useSonex.js
const messagesRef = useRef(messages)
useEffect(() => { messagesRef.current = messages }, [messages])

// En saveCurrentMessages, usar messagesRef.current en lugar de messages
```
- **Commit**: `fix: use ref for latest messages in useSonex to prevent stale closure`

---

## FASE 3: Arquitectura y Lógica (2 semanas)

> **Objetivo**: Refactorizar código complejo, eliminar duplicación, mejorar arquitectura.
> **Depende de**: Fase 2 completada.

### Tarea 3.1: Refactorizar useNavegacionFichas a useReducer
```jsx
// Nuevo archivo: app/src/hooks/useNavegacionReducer.js
const initialState = {
  paso: 'categorias',
  categoria: null,
  marca: null,
  gama: null,
  tipo: null,
  gamaComercial: null,
  subgama: null,
  categoriaGrupo: null,
  subcategoria: null,
  referencia: null,
  historial: [],
  // ... datos cargados
}

function navegacionReducer(state, action) {
  switch (action.type) {
    case 'SELECT_CATEGORIA':
      return { ...initialState, categoria: action.payload, paso: 'marcas' }
    case 'SELECT_MARCA':
      return { ...state, marca: action.payload, paso: 'gamas', historial: [...state.historial, { paso: 'categorias' }] }
    case 'GO_BACK':
      // ...
    case 'NAVIGATE_BREADCRUMB':
      // ...
  }
}
```
- **Por qué**: 17 useState + 7 useEffect = bugs garantizados. Un reducer es más predecible.
- **Esfuerzo**: XL (varios días)
- **Commit**: `refactor: replace useState cascade in useNavegacionFichas with useReducer`

### Tarea 3.2: Unificar clearStatesAfter e irAPaso
```jsx
// Consolidar en una sola función
function clearStateFromStep(step, setters) {
  // Lógica unificada de limpieza
}
```
- **Por qué**: Dos funciones hacen lo mismo de forma diferente. DRY violation.
- **Commit**: `refactor: unify state clearing logic in useNavegacionFichas`

### Tarea 3.3: Extraer lógica de SimuladorAlmacen
```jsx
// Nuevo: app/src/hooks/useSimuladorAlmacen.js
export default function useSimuladorAlmacen(categoria) {
  const [estado, dispatch] = useReducer(simuladorReducer, initialState)
  // Toda la lógica de simulación aquí
  
  return { estado, dispatch, iniciar, pausar, reiniciar }
}

// En SimuladorAlmacen.jsx
const { estado, dispatch, iniciar } = useSimuladorAlmacen(categoria)
```
- **Por qué**: 358 líneas de lógica en el componente. Inyectable y testeable en un hook.
- **Esfuerzo**: L (1 día)
- **Commit**: `refactor: extract simulation logic from SimuladorAlmacen into custom hook`

### Tarea 3.4: Eliminar keyframes duplicados
```css
/* Eliminar de variables.css las definiciones que ya están en animations.css */
/* O viceversa — consolidar en un solo archivo */
```
- **Archivos**: `variables.css:237-269`, `animations.css:7-168`
- **Commit**: `refactor: consolidate duplicate @keyframes definitions`

### Tarea 3.5: Eliminar hooks duplicados restantes
```bash
# Verificar y eliminar constantes duplicadas
grep -rn "ETAPAS\|PEDIDOS_DEMO\|MODULOS_INIT" app/src/hooks/
```
- **Commit**: `chore: remove duplicate constants from deleted hooks`

---

## FASE 4: UI/UX Polish (1 mes)

> **Objetivo**: Consistencia visual, performance de animaciones, responsive perfecto.
> **Depende de**: Fase 3 completada.

### Tarea 4.1: Reemplazar hardcoded colors en BudgetPrintView
```css
/* 24 reemplazos en BudgetPrintView.module.css */
/* #1a1a1a → var(--color-text) */
/* #0072CE → var(--brand-primary) */
/* #666 → var(--color-text-secondary) */
/* etc. */
```
- **Commit**: `style: replace hardcoded colors with CSS variables in BudgetPrintView`

### Tarea 4.2: Reemplazar hardcoded colors en TestimoniosSection
```css
/* 6 reemplazos en TestimoniosSection.module.css */
/* #ffffff → var(--color-surface) */
/* #f59e0b → var(--amber-500) */
```
- **Commit**: `style: replace hardcoded colors in TestimoniosSection`

### Tarea 4.3: Reemplazar hardcoded colors en CircleLayout
```css
/* 5 reemplazos en CircleLayout.module.css */
/* #ffffff → var(--color-surface) */
```
- **Commit**: `style: replace hardcoded colors in CircleLayout`

### Tarea 4.4: Reemplazar hardcoded colors en FichasTecnicas
```css
/* #ffffff → var(--color-surface) en brandCard__logo */
```
- **Commit**: `style: replace hardcoded color in FichasTecnicas`

### Tarea 4.5: Reemplazar hardcoded colors en LinearRefCard
```css
/* rgba(255,255,255,0.9) → var(--color-surface) */
```
- **Commit**: `style: replace hardcoded color in LinearRefCard`

### Tarea 4.6: Audit y reemplazo de `transition: all`
```css
/* ANTES */
transition: all 0.3s var(--ease-out);

/* DESPUÉS — explícito por componente */
transition: transform 0.3s var(--ease-out), box-shadow 0.3s var(--ease-out);
```
- **Archivos prioritarios**: Sonex, FichasTecnicas, SimuladorAlmacen
- **Commit**: `perf: replace transition:all with explicit property lists`

### Tarea 4.7: Establecer border-radius system
```css
/* En variables.css */
--radius-xs: 4px;
--radius-sm: 6px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-xl: 16px;
--radius-full: 9999px;
```
- **Commit**: `style: establish border-radius design tokens`

### Tarea 4.8: Reemplazar border-radius hardcodeados
```css
/* En cada componente, reemplazar valores hardcodeados */
border-radius: 6px → var(--radius-sm)
border-radius: 8px → var(--radius-md)
border-radius: 10px → var(--radius-lg)
```
- **Commit**: `style: use border-radius tokens across all components`

### Tarea 4.9: Fix touch targets en Sonex
```css
/* Sonex.module.css */
@media (pointer: coarse) {
  .historyToggle, .newChatBtn {
    min-width: var(--touch-target);
    min-height: var(--touch-target);
  }
  .historyItemDelete {
    min-width: var(--touch-target);
    min-height: var(--touch-target);
  }
}
```
- **Commit**: `a11y: ensure touch targets meet WCAG 44px minimum`

### Tarea 4.10: Fix HeroContainer dark mode
```css
/* HeroContainer.module.css */
:global([data-theme="dark"]) .heroContainer {
  background-color: var(--color-surface);
}
```
- **Commit**: `fix: add dark mode override for HeroContainer background`

### Tarea 4.11: Fix HeroVisual mobile
```css
/* HeroVisual.module.css — crear versión simplificada para mobile */
@media (max-width: 640px) {
  .visualContainer {
    display: block;
    height: 200px;
    /* Versión simplificada */
  }
}
```
- **Commit**: `feat: add simplified hero visual for mobile`

### Tarea 4.12: Fix Sonex search en mobile
```css
/* Sonex.module.css — usar overlay en mobile */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    z-index: 100;
    /* overlay pattern */
  }
}
```
- **Commit**: `feat: make Sonex search accessible on mobile via overlay`

### Tarea 4.13: Mover fonts a preload
```html
<!-- index.html — añadir antes de </head> -->
<link rel="preload" href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" as="style">
<link rel="preload" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&display=swap" as="style">
```
- **Commit**: `perf: preload Google Fonts to prevent render-blocking`

### Tarea 4.14: Añadir lazy loading a imágenes
```jsx
// En componentes donde hay imágenes below-the-fold
<img src={url} loading="lazy" alt="..." />
```
- **Commit**: `perf: add lazy loading to below-the-fold images`

### Tarea 4.15: Fix CLS en PresupuestosSeleccion
```jsx
<img
  src={prod.imagen}
  alt={key}
  width={40}
  height={40}
  style={{ objectFit: 'contain', borderRadius: '4px' }}
/>
```
- **Commit**: `perf: add width/height to images to prevent CLS`

---

## Orden de Ejecución Recomendado

```
Día 1:  Tareas 1.1, 1.2, 1.3, 1.4, 1.5, 1.6 (todas quick wins)
Día 2:  Tareas 2.2, 2.3, 2.4 (estabilizar contextos)
Día 3:  Tareas 2.5, 2.6, 2.7 (memoización y seguridad)
Semana 2: Tareas 3.1, 3.2 (refactor useNavegacionFichas)
Semana 3: Tareas 3.3, 3.4, 3.5 (SimuladorAlmacen + limpieza)
Semana 4-5: Tareas 4.1-4.8 (hardcoded colors + transition:all)
Semana 6-7: Tareas 4.9-4.15 (mobile, a11y, performance)
```

---

## Comandos Útiles

```bash
# Verificar que no hay imports rotos después de eliminar hooks
npm run build

# Buscar código muerto
grep -rn "import.*useFormacionInterna" app/src/
grep -rn "import.*useKpiLogistico" app/src/
grep -rn "import.*useDashboardIncidencias" app/src/
grep -rn "import.*useSimuladorAlmacen" app/src/

# Buscar hardcoded colors
grep -rn "#[0-9a-fA-F]\{6\}" app/src/**/*.module.css | grep -v "variables.css" | grep -v "animations.css"

# Buscar transition: all
grep -rn "transition: all" app/src/**/*.module.css

# Verificar bundle size
npm run build && ls -lh dist/assets/*.js | sort -k5 -h
```

---

## Criterios de Aceptación por Fase

### Fase 1 ✅
- [ ] App no se congela al iniciar sesión
- [ ] Dark mode funciona en todas las páginas
- [ ] No hay errores en consola al navegar
- [ ] 4 hooks muertos eliminados

### Fase 2 ✅
- [ ] RLS verificado en todas las tablas
- [ ] Contextos estabilizados (useMemo)
- [ ] FichasTecnicasContent memoizado
- [ ] Input sanitizado en búsquedas

### Fase 3 ✅
- [ ] useNavegacionFichas refactorizado a useReducer
- [ ] SimuladorAlmacen con lógica en hook
- [ ] Sin duplicación de código
- [ ] Keyframes consolidados

### Fase 4 ✅
- [ ] Zero hardcoded colors en CSS Modules
- [ ] Zero `transition: all` en componentes de alto tráfico
- [ ] Touch targets ≥44px en mobile
- [ ] Hero visual funcional en mobile
- [ ] Fonts preloadadas
- [ ] Imágenes con lazy loading
