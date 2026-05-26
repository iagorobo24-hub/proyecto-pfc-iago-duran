# Diagnóstico Técnico Completo

> Evaluación del CTO — Proyecto PFC v4.1.0
> Puntuación global: **6/10**

---

## 1. Evaluación Herramienta por Herramienta

### 🔧 Fichas Técnicas — Puntuación: 6/10

**Valor para el técnico (9/10):**
Catálogo navegable jerárquicamente con +400.000 productos reales en Supabase (PostgreSQL), enriquecimiento IA generativo (características técnicas, aplicaciones, normas, consejos). Navegación dual: modo DP agrupado (Distribución de Potencia con categorías/subcategorías) y modo Legacy (familia→marca→gama→tipo). Resuelve el problema real de buscar referencias técnicas de múltiples fabricantes en un solo lugar.

**Ejecución (5/10):**
- `useNavegacionFichas.js` (640 líneas) con 12 estados y cascada de `useEffect` — cada cambio de dependencia dispara renders encadenados
- `clearStatesAfter()` es un switch manual con 8 casos de código repetitivo. Debería ser un único estado reseteable.
- **CircleLayout** como metáfora visual (órbitas concéntricas) es confusa para el usuario. Curva de aprendizaje alta.
- La búsqueda hace 2 llamadas separadas sin coordinación (catálogo + IA)
- `ProductTable` sin virtualización — con 200+ referencias el DOM colapsa
- `FichasTecnicas.jsx` (884 líneas): monolito imposible de testear

### 🔧 SONEX (Asistente IA) — Puntuación: 6/10

**Valor para el técnico (9/10):**
Chat contextual con conocimiento técnico eléctrico industrial. Detección automática de referencias en respuestas. 4 modos de operación (búsqueda, comparativa, asistencia, formación). Sistema de sesiones múltiples con persistencia.

**Ejecución (5/10):**
- `procesarMarkdown()` implementado a mano — 40 líneas de if/else concatenando JSX. **XSS potencial**: `procesarNegritas()` devuelve JSX con `dangerouslySetInnerHTML` implícito.
- **Bug de ruta**: las referencias detectadas navegan a `/fichas?ref=...` pero el router usa `/app/fichas` → 404.
- **N+1 queries**: `extraerReferencias()` hace una llamada a Supabase POR cada posible referencia match.
- Sin streaming de respuestas — el usuario espera 3-6s viendo un spinner sin feedback.
- Sin sistema de feedback ("esto fue útil" / "esto no").

### 🔧 Dashboard Incidencias — Puntuación: 5/10

**Valor para el técnico (8/10):**
Registro y diagnóstico de fallos industriales con diagnóstico IA. Sistema de severidades, estados, zonas de almacén. KPIs de criticidad.

**Ejecución (4/10):**
- Sin persistencia real — todo es localStorage volátil.
- Diagnóstico IA se guarda en estado local, no se exporta ni sincroniza.
- Sin notificaciones push para incidencias críticas sin atender >2h.
- Formulario "Nueva incidencia" dentro del mismo componente de 302 líneas.
- Sin exportación PDF (sería killer: ficha de diagnóstico imprimible para el técnico en campo).

### 🔧 KPI Logístico — Puntuación: 5/10

**Valor (7/10):**
6 KPIs con semáforo visual, histórico, informe ejecutivo IA. Útil para responsables de almacén y turnos.

**Ejecución (4/10):**
- Fórmulas simplistas: productividad asume 2.5 pedidos/operario/hora fijo.
- Al volver a cargar un histórico se reconstruyen datos con operaciones inversas no exactas → pérdida de precisión.
- Informe IA con prompt genérico sin datos estructurados.
- Solo un gráfico (pedidos/hora) — deberían ser 6 minigráficos tipo sparkline.
- Sin exportación a Excel/CSV de los KPIs calculados.

### 🔧 Presupuestos — Puntuación: 6/10

**Valor (8/10):**
Integración directa catálogo → presupuesto. Reducer pattern con partidas dinámicas. Vista PDF imprimible. Historial.

**Ejecución (5/10):**
- El reducer recalcula `precio_total` de forma inline en cada UPDATE (debería ser derivado con `useMemo`).
- 5 vistas (wizard, seleccion, editor, pdf, gestion) en un mismo componente de 666 líneas.
- PDF usa `window.print()` sobre un portal — frágil en mobile, sin configuración `@page`.
- Sin descuentos, portes, ni retenciones fiscales (IRPF, RE).
- Sin plantillas de presupuesto personalizables.

### 🔧 Simulador Almacén — Puntuación: 7/10**

**Valor (8/10):**
Simulación gamificada del ciclo completo de pedido con incidencias realistas aleatorias. Temporizador, semáforo de rendimiento, puntuación, análisis IA. Excelente para formación de operarios.

**Ejecución (6/10):**
- Las incidencias se sortean con `Math.random()` malo — mismo orden cada sesión por mala semilla.
- Toast manual inline (no usa `ToastContext`) → duplicación de lógica de UI.
- Sin modo multijugador ni ranking entre operarios.
- 481 líneas, 12 estados, 13 funciones, todo en un único componente.
- Sin persistencia del análisis IA por sesión (se pierde al recargar).

### 🔧 Formación Interna — Puntuación: 5/10

**Valor (7/10):**
Matriz de competencias por empleado con módulos por área, progreso, alertas de obligatorios, plan de desarrollo IA.

**Ejecución (4/10):**
- Datos demo hardcodeados (María Fernández con fecha fija).
- Sin drag & drop para reordenar módulos por prioridad.
- Fechas de completado no visibles en dashboard de equipo.
- Plan IA es texto plano sin seguimiento (no se guarda quién lo ejecutó, ni estado de implementación).
- Sin vista de "plan formativo anual" con calendario.

---

## 2. Problemas de Seguridad

| # | Problema | Gravedad | Localización |
|---|----------|----------|-------------|
| S1 | Clave Supabase hardcodeada en bundle de cliente | 🔴 GRAVE | `catalogService.js:10` — `supabaseKey` visible en sources de producción |
| S2 | XSS potencial en SONEX | 🟠 MEDIA | `procesarNegritas()` en `Sonex.jsx:43` — inyecta JSX sin sanitizar |
| S3 | Firestore legacy con mock que puede petar en runtime | 🟡 BAJA | `firestoreService.js` importa `firebaseConfig.js` que es un mock |
| S4 | console.logs exponen estructura de datos en producción | 🟡 BAJA | Todo `catalogService.js` con logs de depuración |

## 3. Problemas de Arquitectura

| # | Problema | Impacto |
|---|----------|---------|
| A1 | Sin TypeScript en 7 herramientas + 12 hooks + 5 servicios | Mantenibilidad, refactors inseguros |
| A2 | Componentes monolíticos: 884, 666, 481, 340, 302 líneas | Testing imposible, legibilidad nula |
| A3 | Firestore abandonado (142 líneas de dead code mantenido) | Deuda técnica, confusión |
| A4 | Solo 3 archivos de test unitario para 12 hooks | Sin red de seguridad para refactors |
| A5 | console.logs masivos en producción (catalogService) | Performance, exposición |
| A6 | CircleLayout con órbitas CSS en herramientas que escalan mal | Rendimiento, usabilidad |

## 4. Problemas de UX/UI

| # | Problema | Impacto |
|---|----------|---------|
| U1 | CircleLayout como metáfora de navegación — confusa, no intuitiva | Abandono del usuario |
| U2 | Sin atajos de teclado — los técnicos necesitan velocidad | Productividad |
| U3 | Sin PWA/offline — los técnicos trabajan en obra sin cobertura | Indisponibilidad |
| U4 | Exceso de navegación: Topbar + Sidebar + Breadcrumb + Dropdown | Complejidad cognitiva |
| U5 | Transiciones pobres entre herramientas (sin animaciones Framer Motion a pesar de tenerlo importado) | Sensación de app "pegajosa" |
| U6 | Sin splash screen ni dashboard ejecutivo al entrar | Primera impresión pobre |

---

## 5. Resumen de Puntuaciones

| Herramienta | Idea | Ejecución | Global | Prioridad de mejora |
|------------|------|-----------|--------|-------------------|
| Fichas Técnicas | 9 | 5 | 6 | 🔴 Alta |
| SONEX | 9 | 5 | 6 | 🔴 Alta |
| Dashboard Incidencias | 8 | 4 | 5 | 🔴 Alta |
| KPI Logístico | 7 | 4 | 5 | 🟠 Media |
| Presupuestos | 8 | 5 | 6 | 🟠 Media |
| Simulador Almacén | 8 | 6 | 7 | 🟢 Baja (el mejor) |
| Formación Interna | 7 | 4 | 5 | 🟠 Media |

**Nota del CTO**: La app tiene un núcleo valiosísimo. Los problemas no son de concepto sino de ejecución junior. Con disciplina de ingeniería (TypeScript, tests, refactor) y un overhaul de UX, esto compite con herramientas SAAS del sector.