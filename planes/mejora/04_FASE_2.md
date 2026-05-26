# Fase 2: Refactorización (Días 6-12)

> **Objetivo**: Calidad de código, componentes pequeños, PWA
> **Impacto**: 🏗️ Mantenibilidad + 🎨 UX + ⚡ Performance

---

## 2.1 — Refactor FichasTecnicas: 884 → 3 componentes

**Esfuerzo**: 1 día | **Impacto**: 🏗️ Mantenibilidad

### Estrategia
Dividir `FichasTecnicas.jsx` en:
- `FichasTecnicasSidebar.jsx` — buscador + lista de categorías (extraído de `renderSidebar()`)
- `FichasTecnicasContent.jsx` — render del contenido principal según `paso`
- `FichasTecnicasSkeleton.jsx` — skeleton loaders

La lógica de negocio (`useNavegacionFichas`) se queda en el padre o en un hook compartido.

### Archivos
- `app/src/tools/FichasTecnicas.jsx` → refactor
- `app/src/components/fichas/FichasTecnicasSidebar.jsx` (NUEVO)
- `app/src/components/fichas/FichasTecnicasContent.jsx` (NUEVO)

---

## 2.2 — Refactor Presupuestos: 666 → rutas anidadas

**Esfuerzo**: 1 día | **Impacto**: 🏗️ Mantenibilidad

### Estrategia
Las 5 vistas internas (wizard, seleccion, editor, pdf, gestion) pasan a ser rutas anidadas bajo `/app/presupuestos/`:
- `/app/presupuestos` → wizard (selección categoría)
- `/app/presupuestos/seleccion` → navegación catálogo
- `/app/presupuestos/editor` → editor de partidas
- `/app/presupuestos/gestion` → historial
- `/app/presupuestos/pdf` → vista PDF

Esto elimina el estado `vista` y permite deep linking.

---

## 2.3 — Refactor SimuladorAlmacén: 481 → 4 componentes

**Esfuerzo**: 1 día | **Impacto**: 🏗️ Testing

### Componentes
- `SimuladorPerfil.jsx` — formulario de perfil
- `SimuladorOnboarding.jsx` — selección de modo
- `SimuladorEtapa.jsx` — etapa activa + incidencias
- `SimuladorResultados.jsx` — resultados + análisis IA

---

## 2.4 — Reemplazar CircleLayout por navegación lineal

**Esfuerzo**: 2 días | **Impacto**: 🎨 UX (el cambio más disruptivo)

### Problema
CircleLayout (órbitas concéntricas) es visualmente creativo pero:
1. Confunde al usuario — no es evidente que las cards en órbita sean seleccionables
2. Escala mal — con +10 marcas las órbitas se solapan
3. No es responsive — en mobile es imposible de usar
4. Curva de aprendizaje alta — un técnico quiere velocidad, no arte

### Solución
Reemplazar por un patrón de **navegación jerárquica en árbol + tabla**:
```
Nivel 1: Categorías → [grid de cards grandes con icono + nombre + count]
Nivel 2: Marcas →    [grid de logos/names]
Nivel 3: Gamas →     [lista vertical con flecha]
Nivel 4: Tipos →     [lista vertical]
Nivel 5: Refs →      [tabla con filtro + vista agrupada]
```

Inspiración: interfaz de catálogo tipo "Amazon Business" o "RS Components".

---

## 2.5 — Virtualizar ProductTable

**Esfuerzo**: 1 día | **Impacto**: ⚡ Performance

Usar `react-window` (o `@tanstack/react-virtual` que no necesita librería extra) para virtualizar la tabla de productos. Con +200 referencias, el DOM actual es de +5000 nodos.

---

## 2.6 — Implementar PWA

**Esfuerzo**: 2 días | **Impacto**: 📡 Offline

### Requisitos
1. Service worker con estrategia Cache First para el shell de la app
2. Manifest.json con iconos y colores de marca
3. Estrategia offline: datos cacheados localmente (IndexedDB via idb)
4. Badge de instalación (beforeinstallprompt)

### Archivos
- `app/public/manifest.json` (NUEVO)
- `app/public/sw.js` (NUEVO) — service worker
- `app/index.html` — añadir link a manifest
- `app/src/main.jsx` — registrar SW
- `app/vite.config.js` — configurar PWA plugin (vite-plugin-pwa)

---

## 2.7 — Reescribir procesarMarkdown con marked + DOMPurify

**Esfuerzo**: 1 día | **Impacto**: 🔒 Seguridad

### Problema actual
`procesarMarkdown()` en `Sonex.jsx` implementa parseo manual con 40 líneas de if/else que generan JSX directamente. `procesarNegritas()` devuelve React elements sin sanitizar.

### Solución
Usar `marked` (parser markdown) + `DOMPurify` (sanitizer). Renderizar con `dangerouslySetInnerHTML` SOLO después de sanitizar.

### Dependencias a añadir
- `marked` (parser markdown ligero)
- `dompurify` (sanitizer DOMPurify)
- `@types/marked` (si usamos TS)

---

## 2.8 — Refactor DashboardIncidencias: 302 → componentes

**Esfuerzo**: 1 día | **Impacto**: 🏗️ Mantenibilidad

Extraer:
- `IncidenciasLista.jsx` — lista con filtros
- `IncidenciasDetalle.jsx` — detalle + diagnóstico
- `IncidenciasFormulario.jsx` — nueva incidencia

---

## 2.9 — Vistas técnicas agrupadas para magnetotérmicos y diferenciales

**Esfuerzo**: 2 días | **Impacto**: 🎯 UX (valor diferencial para el técnico)

### Problema

Actualmente, al navegar a la tabla de referencias de magnetotérmicos o diferenciales, el usuario ve directamente la matriz completa (curvas × polos × calibres) en `ProductTable.jsx`. Para gamas grandes (ej. Acti9 iC60N con 100+ referencias), esto abruma al usuario. Un técnico necesita poder **filtrar por atributos técnicos** antes de ver la tabla:

> Flujo actual: `Subgama → [Tabla completa curvas×polos×calibre]`

> Flujo deseado: `Subgama → Curva/Tipo → Polos → Calibre/Sensibilidad → [Tabla filtrada]`

### Solución

Añadir **pantallas de selección intermedias** entre la subgama y la tabla de referencias, activadas automáticamente cuando `useProductTable` detecta que los productos son magnetotérmicos o diferenciales.

#### Para magnetotérmicos (subfamilia = "Interruptor Magnetotérmico")

```
Subgama (iC60N, iC60L, RX³, TX³, DPX³, etc.)
  → [NUEVO] Selección de Curva (B | C | D | K | Z)
    → [NUEVO] Selección de Polos (1P | 1P+N | 2P | 3P | 3P+N | 4P)
      → [NUEVO] Selección de Calibre (6A | 10A | 16A | 20A | 25A | 32A | 40A | 50A | 63A ...)
        → Tabla filtrada (solo la curva/polo/calibre seleccionados)
```

Cada paso muestra:
- **Curva**: cards horizontales con icono, nombre (B, C, D, K, Z), descripción técnica de la curva, y badge con count de productos
- **Polos**: grid de cards con icono de número de polos + conteo de referencias disponibles
- **Calibre**: lista compacta en grid de botones con amperaje + badge de referencias

#### Para diferenciales (subfamilia = "Interruptor Diferencial")

```
Subgama (iID, iD, Vigi iC60, RX³, DPX³, etc.)
  → [NUEVO] Selección de Tipo (AC | A | F | B | Hpi | Si)
    → [NUEVO] Selección de Polos (2P | 4P)
      → [NUEVO] Selección de Sensibilidad (10mA | 30mA | 100mA | 300mA | 500mA | 1A)
        → Tabla filtrada (solo el tipo/polos/sensibilidad seleccionados)
```

Cada paso muestra:
- **Tipo**: cards con icono tipo, label (AC, A, F, B, etc.) + descripción del tipo (ej: "Tipo A — pulsos de corriente continua") + badge count
- **Sensibilidad**: grid de botones con mA/A + descripción del uso típico (30mA → protección personas, 300mA → protección incendios)

### Algoritmo de extracción

Los valores de curva, polos, calibre y sensibilidad se extraen del campo `name` de los productos usando las expresiones regulares ya existentes en `useProductTable.js`:

```js
// Ya existen y están testeadas:
extractCurve(name)     → 'C', 'B', 'D', 'K', 'Z'
extractPoles(name)     → '1P', '1P+N', '2P', '3P', '3P+N', '4P'
extractAmps(name)      → 6, 10, 16, 20, 25, 32, 40, 63 (número)
extractSensitivity(name) → 30, 100, 300, 500 (mA, solo diferenciales)
```

### Arquitectura

```
useNavegacionFichas.js
  │
  ├── paso: "referencias" (comportamiento actual si no aplica agrupación)
  │
  └── [NUEVO] paso: "vista_tecnica"
        │
        ├── subPaso: "curva_tipo"       → VistaCurvaTipo.jsx
        ├── subPaso: "polos"            → VistaPolos.jsx
        ├── subPaso: "calibre_sensibilidad" → VistaCalibre.jsx
        └── subPaso: "tabla_filtrada"   → ProductTable filtrado
```

### Nuevos componentes

| Componente | Propósito | Archivo |
|-----------|-----------|---------|
| `VistaCurvaTipo.jsx` | Selección de curva (magneto) o tipo (diferencial) | `components/fichas/VistaCurvaTipo.jsx` |
| `VistaPolos.jsx` | Selección de número de polos | `components/fichas/VistaPolos.jsx` |
| `VistaCalibre.jsx` | Selección de calibre/sensibilidad | `components/fichas/VistaCalibre.jsx` |
| `useVistaTecnica.js` | Hook de estado para la navegación técnica | `hooks/useVistaTecnica.js` |

### Nuevas funciones en `catalogService.js`

```js
// Obtener curvas disponibles para un conjunto de productos
getCurvasDisponibles(products) → ['B', 'C', 'D', 'K']

// Obtener tipos diferencial disponibles
getTiposDiferencial(products) → ['AC', 'A', 'F', 'B']

// Obtener polos disponibles (filtrados por curva/tipo seleccionado)
getPolosDisponibles(products, filtro) → ['1P', '1P+N', '2P', '3P']

// Obtener calibres disponibles (filtrados por curva + polos)
getCalibresDisponibles(products, filtro) → [6, 10, 16, 20, 25, 32]
```

### Estados UX

| Estado | Qué muestra |
|--------|------------|
| **Loading** | Skeleton loader con siluetas de cards de curva/tipo |
| **Data** | Grid de selección con cards interactivas |
| **Empty** | "No hay productos con curva C para esta configuración" + sugerencia de cambiar filtro |
| **Error** | Toast error + reintentar |
| **Edge: 1 sola curva** | Auto-seleccionar y pasar al siguiente paso (sin mostrar la pantalla) |
| **Edge: 1 solo polo** | Auto-seleccionar y pasar al siguiente paso |

### Breadcrumb integrado

El breadcrumb del paso técnico debe mostrar:
```
Subgama iC60N › Curva C › Polos 1P › 6A
```

Cada segmento del breadcrumb permite volver atrás, igual que en la navegación principal.

### Transiciones

- Cards de selección con `motion.div` (Framer Motion ya disponible):
  - `layoutId` por card para animación de expansión al seleccionar
  - `staggerChildren` 0.05s para aparición secuencial
- Al seleccionar una opción, slide a la izquierda (transición de ruta)
- Botón "Volver" con slide a la derecha

### Criterios de activación

La vista técnica se activa automáticamente si:
1. `subfamilia` del producto es `"Interruptor Magnetotérmico"` o `"Interruptor Diferencial"`
2. Y `extractCurve` / `extractSensitivity` encuentra al menos un valor parseable en los nombres
3. Si no se cumple alguna condición → tabla plana tradicional (comportamiento actual)

### Ordenación dentro de cada paso

- **Curvas**: orden natural B, C, D, K, Z
- **Tipos diferencial**: orden AC, A, F, B, Hpi, Si (de menor a mayor sofisticación)
- **Polos**: orden 1P, 1P+N, 2P, 3P, 3P+N, 4P
- **Calibres**: numérico ascendente
- **Sensibilidades**: 10, 30, 100, 300, 500, 1000 (mA)

### Archivos a crear/modificar

- `app/src/components/fichas/VistaCurvaTipo.jsx` (NUEVO)
- `app/src/components/fichas/VistaPolos.jsx` (NUEVO)
- `app/src/components/fichas/VistaCalibre.jsx` (NUEVO)
- `app/src/hooks/useVistaTecnica.js` (NUEVO)
- `app/src/services/catalogService.js` — nuevas funciones de filtrado agrupado
- `app/src/tools/FichasTecnicas.jsx` — integrar nuevo paso `vista_tecnica`
- `app/src/hooks/useNavegacionFichas.js` — nuevo estado + lógica de navegación técnica
- `app/src/components/ui/ProductTable.jsx` — posible refactor menor para aceptar prefiltros

### Dependencias
- Ninguna externa (reutiliza `extractCurve`, `extractPoles`, etc. ya existentes y testeadas)

### Tareas desglosadas

- [ ] 2.9.1 Extraer funciones de filtrado agrupado a `catalogService.js`
- [ ] 2.9.2 Crear `useVistaTecnica.js` con estado de navegación técnica (subPaso actual, selecciones)
- [ ] 2.9.3 Crear `VistaCurvaTipo.jsx` — cards de selección de curva/tipo con descripciones técnicas
- [ ] 2.9.4 Crear `VistaPolos.jsx` — grid de selección de polos
- [ ] 2.9.5 Crear `VistaCalibre.jsx` — grid de selección de calibre/sensibilidad
- [ ] 2.9.6 Integrar en `useNavegacionFichas.js` — nuevo paso + estado subPaso + breadcrumb
- [ ] 2.9.7 Integrar en `FichasTecnicas.jsx` — render condicional según paso
- [ ] 2.9.8 Manejar edge cases: 1 solo valor (auto-skip), vuelta atrás en breadcrumb
- [ ] 2.9.9 Añadir tests unitarios para `useVistaTecnica`
- [ ] 2.9.10 Verificar E2E: navegación técnica completa con magnetotérmicos y diferenciales

---

## Checklist de Verificación Post-Fase 2

- [ ] Todos los componentes <300 líneas
- [ ] Unit tests pasan
- [ ] E2E tests pasan
- [ ] PWA installable
- [ ] Sin CircleLayout en navegación principal
- [ ] ProductTable virtualizada con +200 refs sin lag
- [ ] SONEX sin XSS (DOMPurify en producción)
- [ ] Magnetotérmicos navegables por curva → polos → calibre
- [ ] Diferenciales navegables por tipo → sensibilidad → polos → calibre