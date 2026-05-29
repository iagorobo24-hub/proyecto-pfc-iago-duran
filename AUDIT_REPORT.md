# Planning de Auditoría Completa — 29 Mayo 2026

## Resumen Ejecutivo

| Severidad | Código | UI/UX | Performance | Total |
|-----------|--------|-------|-------------|-------|
| 🔴 Crítico | 7 | 1 | 4 | **12** |
| 🟠 Alto | 20 | 6 | 8 | **34** |
| 🟡 Medio | 17 | 17 | 11 | **45** |
| 🔵 Bajo | 0 | 12 | 9 | **21** |
| **Total** | **44** | **36** | **32** | **112** |

---

## Fase 1: Críticos (Urgente — 1-3 días)

### 1.1 Seguridad — RLS Verification
- [ ] **Verificar RLS en TODAS las tablas** — El anon key de Supabase está en el frontend. Si alguna tabla no tiene RLS, los datos están expuestos.
  - **Archivos**: `supabaseClient.js`, todas las tablas de Supabase
  - **Solución**: Ejecutar `supabase_get_advisors` para verificar RLS en `user_data`, `products`, `brands`, `testimonios`
  - **Esfuerzo**: S (1-2h)

### 1.2 Errores — AuthContext sin catch
- [ ] **`AuthContext.jsx:24`** — `getSession()` sin `.catch()`. Si la red falla, `loading` se queda `true` forever y la app se congela.
  - **Solución**: Añadir `.catch(() => setLoading(false))`
  - **Esfuerzo**: XS (<30min)

### 1.3 Errores — XSS potencial
- [ ] **`TarjetaFicha.jsx:84`** — `resultado.consejo_tecnico` de IA se renderiza directo. Verificar que pase por `renderMarkdown()` con DOMPurify.
  - **Archivos**: `Sonex.jsx:272`, `TarjetaFicha.jsx:84`, `CircleLayout.jsx:155`
  - **Solución**: Auditar que TODOS los `dangerouslySetInnerHTML` usen `renderMarkdown()`
  - **Esfuerzo**: S (1-2h)

### 1.4 Performance — Contextos inestables
- [ ] **AuthContext y ThemeContext** — Los values se recrean en cada render, causando re-renders en toda la app.
  - **Solución**: Estabilizar con `useMemo`/`useCallback`
  - **Esfuerzo**: M (medio día)

### 1.5 Errores — FormacionInterna sin toast
- [ ] **`FormacionInterna.jsx:73,82,89`** — Llama `toast.show()` pero `toast` no está destructurado de `useToast()`. Crashea en runtime.
  - **Solución**: Añadir `const { toast } = useToast()`
  - **Esfuerzo**: XS (<30min)

### 1.6 Performance — useMemoriaUsuario inestable
- [ ] **`useMemoriaUsuario.js:109-115`** — Reconstruye el objeto `memoria` en cada render. Usado por 6+ herramientas.
  - **Solución**: Memorizar con `useMemo`
  - **Esfuerzo**: S (1-2h)

### 1.7 Seguridad — Supabase stub silencioso
- [ ] **`supabaseClient.js:3-4`** — Si `VITE_SUPABASE_URL` es undefined, usa stub silenciosamente. En producción podría causar pérdida de datos.
  - **Solución**: Lanzar error en modo production si faltan env vars
  - **Esfuerzo**: XS (<30min)

### 1.8 Errores — DashboardGlobal null filter
- [ ] **`DashboardGlobal.jsx:26`** — `incidencias.filter(...)` sin null guard. `incidencias` puede ser `undefined` en el primer render.
  - **Solución**: `(incidencias || []).filter(...)`
  - **Esfuerzo**: XS (<30min)

### 1.9 UI — Dark mode backgrounds
- [ ] **`index.css:14,25`** — `.shell` usa `var(--gray-50)` y `.main` usa `var(--white)` en vez de variables semánticas. Rompe dark mode.
  - **Solución**: Cambiar a `var(--color-bg)` y `var(--color-surface)`
  - **Esfuerzo**: XS (<30min)

### 1.10 UI — BudgetPrintView hardcoded colors
- [ ] **`BudgetPrintView.module.css`** — 24+ colores hardcodeados (`#1a1a1a`, `#0072CE`, `#666`, etc.)
  - **Solución**: Reemplazar con variables CSS (`var(--brand-primary)`, `var(--color-text)`, etc.)
  - **Esfuerzo**: S (1-2h)

### 1.11 UI — IBM Plex Sans no cargada
- [ ] **`BudgetPrintView.module.css:8,148`** — Referencia a `IBM Plex Sans` y `IBM Plex Mono` que no se cargan en ningún sitio.
  - **Solución**: Cambiar a `var(--font-body)` y `var(--font-mono)`
  - **Esfuerzo**: XS (<30min)

### 1.12 Performance — FichasTecnicasContent sin memo
- [ ] **`FichasTecnicasContent.jsx`** — 915 líneas, 25 props, cero `React.memo`. Se re-renderiza en cada cambio de estado del padre.
  - **Solución**: Envolver con `React.memo`
  - **Esfuerzo**: S (1-2h)

---

## Fase 2: Altos (1 semana)

### 2.1 Código — useNavegacionFichas refactor
- [ ] **`useNavegacionFichas.js`** — 690 líneas, 17 useState, 7 useEffect cascading. El hook más complejo del repo.
  - **Solución**: Refactorizar a `useReducer` con state machine explícito, o dividir en hooks más pequeños
  - **Esfuerzo**: XL (varios días)

### 2.2 Código — 4 hooks muertos
- [ ] **Eliminar**: `useFormacionInterna.js`, `useKpiLogistico.js`, `useDashboardIncidencias.js`, `useSimuladorAlmacen.js` (420 líneas muertas)
  - **Solución**: Borrar archivos
  - **Esfuerzo**: XS (<30min)

### 2.3 Código — SimuladorAlmacen lógica en componente
- [ ] **`SimuladorAlmacen.jsx`** — 358 líneas mezclando estado, effects y UI. La lógica de simulación debería estar en un hook.
  - **Solución**: Extraer a custom hook (el hook `useSimuladorAlmacen` existía pero nunca se conectó)
  - **Esfuerzo**: L (1 día)

### 2.4 Seguridad — Inyección en Supabase .or()
- [ ] **`catalogService.ts:558,575`** — `buscarProductos()` interpola input del usuario directo en `.or()`. Si `t` contiene comas/paréntesis, rompe el filtro.
  - **Solución**: Sanitizar input o usar queries separadas con `.ilike()`
  - **Esfuerzo**: S (1-2h)

### 2.5 Performance — transition: all (89 occurrences)
- [ ] **Múltiples archivos** — `transition: all` fuerza al browser a calcular TODAS las propiedades. Incluye `background-color`, `border-color`, `color` que causan paint.
  - **Archivos clave**: `FichasTecnicas.module.css`, `SimuladorAlmacen.module.css`, `Sonex.module.css`
  - **Solución**: Reemplazar con listas explícitas: `transition: transform 0.3s, box-shadow 0.3s`
  - **Esfuerzo**: L (1 día)

### 2.6 UI — TestimoniosSection hardcoded colors
- [ ] **`TestimoniosSection.module.css:46,59,67,93,135,202`** — `#ffffff` (5x) y `#f59e0b` (2x) hardcodeados.
  - **Solución**: Cambiar a `var(--color-surface)` y `var(--amber-500)`
  - **Esfuerzo**: XS (<30min)

### 2.7 UI — HeroContainer dark mode
- [ ] **`HeroContainer.module.css:8`** — `background-color: var(--white)` sin override dark mode.
  - **Solución**: Añadir `:global([data-theme="dark"]) .heroContainer { background-color: var(--color-surface); }`
  - **Esfuerzo**: XS (<30min)

### 2.8 Performance — useMemoriaUsuario return value
- [ ] **`useMemoriaUsuario.js`** — El objeto `memoria` se recrea en cada render, causando re-renders en 6+ herramientas.
  - **Solución**: Memorizar con `useMemo`
  - **Esfuerzo**: S (1-2h)

---

## Fase 3: Medios (2 semanas)

### 3.1 Código — Duplicación en clearStatesAfter/irAPaso
- [ ] **`useNavegacionFichas.js:25-95` y `540-557`** — Dos funciones manejan limpieza de estado con enfoques diferentes.
  - **Solución**: Unificar en una sola función
  - **Esfuerzo**: M (medio día)

### 3.2 Código — useSonex stale closure
- [ ] **`useSonex.js:55-66`** — `saveCurrentMessages` tiene referencia stale de `messages`. El `eslint-disable` en línea 89 silencia esto.
  - **Solución**: Usar ref para el valor más reciente de messages
  - **Esfuerzo**: S (1-2h)

### 3.3 Código — useTestimonios variable shadowing
- [ ] **`useTestimonios.js:103`** — `const prev = testimonios` sombrea el parámetro del callback.
  - **Solución**: Renombrar a `previousTestimonios`
  - **Esfuerzo**: XS (<30min)

### 3.4 Código — usePresupuestos generando unused
- [ ] **`usePresupuestos.js:42`** — Estado `generando` se crea pero nunca se pone en `true`.
  - **Solución**: Eliminar o usar
  - **Esfuerzo**: XS (<30min)

### 3.5 UI — Keyframes duplicados
- [ ] **`variables.css:237-269`** y **`animations.css:7-168`** — Definen los mismos keyframes.
  - **Solución**: Consolidar en un solo archivo
  - **Esfuerzo**: S (1-2h)

### 3.6 UI — Border-radius inconsistente
- [ ] **Múltiples archivos** — `6px`, `8px`, `10px` hardcodeados en vez de usar variables CSS.
  - **Solución**: Establecer `--radius-sm: 6px`, `--radius-md: 8px`, `--radius-lg: 10px` y usarlas
  - **Esfuerzo**: S (1-2h)

### 3.7 UI — Touch targets < 44px
- [ ] **`Sonex.module.css:52-54, 151-153`** — Botones de 34px y 28px en mobile.
  - **Solución**: Añadir `min-width: var(--touch-target)` en media query `pointer: coarse`
  - **Esfuerzo**: XS (<30min)

### 3.8 UI — Hero visual hidden on mobile
- [ ] **`HeroVisual.module.css:331-332`** — `.visualContainer { display: none }` en ≤640px.
  - **Solución**: Crear versión simplificada para mobile
  - **Esfuerzo**: M (medio día)

### 3.9 UI — Sonex search hidden on mobile
- [ ] **`Sonex.module.css:558-561`** — Panel de búsqueda oculto en mobile. Los usuarios pierden acceso a historial/búsqueda.
  - **Solución**: Usar overlay o bottom sheet toggleable
  - **Esfuerzo**: M (medio día)

### 3.10 Performance — Font loading render-blocking
- [ ] **`variables.css:6`** — Google Fonts cargados via `@import url()` que bloquea el render.
  - **Solución**: Mover a `<link rel="preload" as="font">` en `index.html`
  - **Esfuerzo**: S (1-2h)

### 3.11 Performance — useSonex sugerenciasPopulares
- [ ] **`useSonex.js:173-179`** — Array literal recreado en cada render, causa re-renders en hijos.
  - **Solución**: Mover a constante de módulo o `useMemo`
  - **Esfuerzo**: XS (<30min)

---

## Fase 4: Bajos / Polish (1 mes)

### 4.1 UI — Línea base tipográfica 13px
- [ ] **`variables.css:83-91`** — `--text-base: 0.8125rem` (13px) está por debajo del recomendado (16px).
  - **Solución**: Considerar subir a 14px o 16px para legibilidad
  - **Esfuerzo**: S (1-2h)

### 4.2 UI — line-height inconsistente
- [ ] **Múltiples archivos** — `line-height: 1.3`, `1.4`, `1.5`, `1.6`, `1.7` hardcodeados en vez de usar variables.
  - **Solución**: Estandarizar en `--leading-tight` (1.25) headings, `--leading-relaxed` (1.625) body
  - **Esfuerzo**: S (1-2h)

### 4.3 UI — Hover states faltantes
- [ ] **`Input.module.css:16-27`**, **`FichasTecnicas.module.css:80-98`** — Inputs con focus pero sin hover.
  - **Solución**: Añadir `border-color` sutil en hover
  - **Esfuerzo**: XS (<30min)

### 4.4 UI — Skeleton loading faltante
- [ ] Solo `FichasTecnicas` tiene skeleton loading. `KpiLogistico`, `DashboardIncidencias`, `FormacionInterna` no.
  - **Solución**: Crear componente shared `Skeleton` o reutilizar patrón existente
  - **Esfuerzo**: M (medio día)

### 4.5 Performance — Console.log en producción
- [ ] **Múltiples archivos** — `console.log` y `console.warn` en código de producción.
  - **Solución**: Añadir babel plugin para eliminar en build de producción
  - **Esfuerzo**: S (1-2h)

### 4.6 Performance — Imágenes sin lazy loading
- [ ] **`CircleLayout.jsx:168`**, **`PresupuestosSeleccion.jsx:246`** — Imágenes sin `loading="lazy"`.
  - **Solución**: Añadir `loading="lazy"` a imágenes below-the-fold
  - **Esfuerzo**: XS (<30min)

### 4.7 Performance — CLS risk
- [ ] **`PresupuestosSeleccion.jsx:246-250`** — Imágenes de 40x40px sin `width`/`height` explícitos.
  - **Solución**: Añadir `width={40} height={40}` o `aspect-ratio`
  - **Esfuerzo**: XS (<30min)

### 4.8 Seguridad — Math.random() para IDs
- [ ] **`usePresupuestos.js:7-9`**, **`PresupuestosLayout.jsx:9-12`** — IDs de presupuesto usan `Math.random()`.
  - **Solución**: Usar `crypto.randomUUID()` o aceptar el riesgo bajo
  - **Esfuerzo**: XS (<30min)

### 4.9 Seguridad — Toast memory leak
- [ ] **`ToastContext.jsx:9-15`** — Si el componente se desmonta antes del timeout, `setToasts` se llama en componente desmontado.
  - **Solución**: Limpiar timeout en effect cleanup
  - **Esfuerzo**: XS (<30min)

---

## Métricas de Éxito

- [ ] Todos los 12 críticos resueltos
- [ ] Build sin warnings
- [ ] Test coverage > 60%
- [ ] Lighthouse performance > 85
- [ ] Dark mode funcionando en 100% de componentes
- [ ] Zero `transition: all` en componentes de alto tráfico
- [ ] Zero hardcoded colors en CSS Modules (solo print stylesheet)
- [ ] useNavegacionFichas refactorizado a reducer

---

## Archivos Más Críticos (por número de hallazgos)

| Archivo | Hallazgos | Severidad |
|---------|-----------|-----------|
| `useNavegacionFichas.js` | 8 | 🔴 Crítico |
| `FichasTecnicasContent.jsx` | 5 | 🟠 Alto |
| `BudgetPrintView.module.css` | 3 | 🔴 Crítico |
| `Sonex.module.css` | 4 | 🟡 Medio |
| `SimuladorAlmacen.jsx` | 3 | 🟠 Alto |
| `index.css` | 2 | 🔴 Crítico |
| `TestimoniosSection.module.css` | 2 | 🟠 Alto |
