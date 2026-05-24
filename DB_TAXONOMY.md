# Taxonomía de la Base de Datos — Proyecto PFC

> **Propósito**: Este documento define la estructura y organización de la tabla `products` en Supabase.
> Cualquier cambio en la estructura de la DB debe reflejarse aquí primero.
> Los agentes IA deben leer este documento antes de modificar consultas de catálogo.

---

## Columnas de la tabla `products`

| Columna | Tipo | Descripción | Ejemplo |
|---------|------|-------------|---------|
| `id` | `serial` | PK autoincremental | 1 |
| `ref_fabricante` | `text` | Referencia del fabricante (única, NOT NULL) | A9F74110 |
| `name` | `text` | Nombre descriptivo del producto | Magnetotérmico, Acti9 iC60N, 1P, 6A, C curva |
| `familia` | `text` | Categoría principal (MAYÚSCULAS con guiones bajos) | DISTRIBUCION DE POTENCIA |
| `Gama` | `text` | Gama comercial del fabricante (sin normalizar) | Acti 9 iC60 |
| `Subgama` | `text` | Subgama dentro de la gama comercial | iC60N |
| `subfamilia` | `text` | Tipo funcional (Capitalizado) | Interruptor Magnetotérmico |
| `tipo` | `text` | Formato físico/montaje (MAYÚSCULAS) | CARRIL DIN |
| `marca` | `text` | Nombre del fabricante (sin normalizar) | Schneider Electric |
| `brand_id` | `int4` | FK → `brands.id` | 456 |
| `precio` | `numeric` | Precio unitario (puede ser null) | 14.50 |
| `imagen` | `text` | URL de imagen del producto | https://... |
| `pdf_url` | `text` | URL de ficha técnica PDF | https://... |
| `documentos` | `jsonb` | Array de objetos {nombre, url} con enlaces adicionales | [{"nombre": "Página producto", "url": "..."}] |
| `created_at` | `timestamptz` | Fecha de creación (default NOW()) | 2026-03-15T10:00:00Z |
| `updated_at` | `timestamptz` | Fecha de actualización | 2026-05-23T12:00:00Z |

### Tabla `brands`

| Columna | Tipo | Descripción | Ejemplo |
|---------|------|-------------|---------|
| `id` | `int4` | PK | 456 |
| `name` | `text` | Nombre de la marca | Schneider Electric |
| `website_url` | `text` | URL del sitio web | https://www.se.com |

---

## Familias (primer nivel de categorización)

Las familias son el nivel más alto. Se usan como categorías en el sidebar de Fichas Técnicas.

| familia en DB | Label en UI | Estado | Productos |
|---------------|-------------|--------|-----------|
| `DISTRIBUCION DE POTENCIA` | Distribución de Potencia | ✅ Normalizado | ~1.970 |
| `AUTOMATIZACION` | Automatización | ✅ Etiquetado | ~128 |
| `AUTOMATIZACION DE EDIFICIOS` | Domótica | ✅ Etiquetado | ~49 |
| `FOTOVOLTAICA` | Fotovoltaica | ✅ Etiquetado | ~24 |
| `ILUMINACION` | Iluminación | ✅ Etiquetado | ~64 |
| `INSTALACION` | Instalación | ✅ Etiquetado | ~120 |
| `VEHICULOS_ELECTRICOS` | Vehículos Eléctricos | ✅ Etiquetado | ~24 |
| `CABLES` | Cables | ⏳ Sin normalizar | — |
| `CLIMATIZACION` | Climatización | ⏳ Sin normalizar | — |
| `COMUNICACION` | Comunicación | ⏳ Sin normalizar | — |
| `ENERGIAS RENOVABLES` | Energías Renovables | ⏳ Sin normalizar | — |
| `FONTANERIA` | Fontanería | ⏳ Sin normalizar | — |
| `HERRAMIENTAS` | Herramientas | ⏳ Sin normalizar | — |
| `PROTECCION` | Protección | ⏳ Sin normalizar | — |

> **Regla**: `familia` siempre en MAYÚSCULAS con guiones bajos para espacios.
> Los labels UI se definen en `etiquetasFamilias` dentro de `catalogService.js`.

---

## Subfamilias (segundo nivel — solo DISTRIBUCION DE POTENCIA normalizado)

La `subfamilia` define el tipo funcional. Solo DISTRIBUCION DE POTENCIA tiene subfamilias normalizadas.
El resto de familias usan la navegación legacy (subfamilia → tipo directo).

### Subfamilias de DISTRIBUCION DE POTENCIA

| subfamilia | Descripción | Ejemplos de Gama |
|------------|-------------|-------------------|
| `Interruptor Magnetotérmico` | MCB/MCCB — protección sobrecargas y cortocircuitos | Acti 9 iC60, C60 UL, ComPacT NSX, Resi9, DPX³ |
| `Interruptor Diferencial` | RCCB — protección contra fugas a tierra | iID, iD, Vigi iC60 |
| `Proteccion Sobretension` | Limitadores de sobretensión transitoria (SPD) | iPRC - iPRI |
| `Cortacircuito Fusible` | Fusibles de protección | (varios) |
| `Interruptor Seccionador` | Interruptores en carga / seccionadores | iSW |
| `Seccionador CC` | Seccionadores para corriente continua | (varios) |
| `Interruptor CC` | Interruptores para corriente continua | (varios) |
| `Interruptor Caja Moldeada` | MCCB en caja moldeada | (varios) |
| `Rearmador` | Reenganchadores automáticos diferenciales | Rearmador |
| `Control Aislamiento` | Vigilantes de aislamiento | (varios) |
| `Central Reporte` | Centrales de reporte | (varios) |
| `Accesorio` | Pilotos, bornas, contadores, accesorios varios | (sin Gama) |
| `Caja Distribucion` | Cajas de distribución | (varios) |
| `Caja Conexion` | Cajas de conexión | (varios) |
| `Conmutador` | Conmutadores | (varios) |
| `Toma Corriente Industrial` | Tomas de corriente industriales | (varios) |
| `Fuente Alimentacion` | Fuentes de alimentación | (varios) |
| `Timbre` | Timbres | (varios) |
| `Zumbador` | Zumbadores | (varios) |
| `Contactor` | Contactores modulares e industriales | iCT, iCV40 |
| `Elemento de Control` | Temporizadores, telerruptores, relés | iTL |
| `Bloque Mando Osmoz` | Pulsadores y mandos Osmoz | (varios) |
| `Pulsador Osmoz` | Pulsadores Osmoz | (varios) |

> **Regla**: `subfamilia` en formato Capitalizado.

---

## Tipos (tercer nivel — formato físico)

| tipo | Descripción | Ejemplos |
|------|-------------|----------|
| `CARRIL DIN` | Montaje en carril DIN (18mm módulo) | iC60, iID, iCT, iTL |
| `CAJA MOLDEADA` | Interruptor en caja moldeada (MCCB) | ComPacT NSX, DPX³ |
| `Piloto luminoso` | Pilotos de señalización LED | A9E1832x |
| `Contador eléctrico` | Contadores de energía digitales | M8650 |

> **Regla**: `tipo` en MAYÚSCULAS con guiones bajos para espacios.

---

## Categorías y Subcategorías UI (navegación agrupada para DP)

Para DISTRIBUCION DE POTENCIA, la navegación UI agrupa subfamilias+tipos en **categorías** y **subcategorías**.
Este mapeo se define en `app/src/data/categoriaMapping.js`.

### Árbol completo de categorización

```
DISTRIBUCION DE POTENCIA (familia)
│
├── 🛡️ Protección
│   ├── Magnetotérmico modular
│   │   └── Interruptor Magnetotérmico + CARRIL DIN
│   ├── Magnetotérmico MCCB
│   │   ├── Interruptor Magnetotérmico + CAJA MOLDEADA
│   │   └── Interruptor Caja Moldeada (cualquier tipo)
│   ├── Diferencial
│   │   └── Interruptor Diferencial (cualquier tipo)
│   ├── Sobretensión
│   │   └── Proteccion Sobretension (cualquier tipo)
│   └── Fusibles
│       └── Cortacircuito Fusible (cualquier tipo)
│
├── 🔌 Seccionamiento
│   ├── Seccionador
│   │   └── Interruptor Seccionador (cualquier tipo)
│   ├── Seccionador CC
│   │   └── Seccionador CC (cualquier tipo)
│   └── Interruptor CC
│       └── Interruptor CC (cualquier tipo)
│
├── 🔧 Accesorios
│   ├── Rearme
│   │   └── Rearmador (cualquier tipo)
│   ├── Control aislamiento
│   │   └── Control Aislamiento (cualquier tipo)
│   ├── Central reporte
│   │   └── Central Reporte (cualquier tipo)
│   ├── Pilotaje
│   │   └── Accesorio + Piloto luminoso
│   ├── Medida
│   │   └── Accesorio + Contador eléctrico
│   ├── Distribución
│   │   └── Accesorio + CARRIL DIN
│   ├── Cajas distribución
│   │   └── Caja Distribucion (cualquier tipo)
│   ├── Cajas conexión
│   │   └── Caja Conexion (cualquier tipo)
│   ├── Conmutación
│   │   └── Conmutador (cualquier tipo)
│   ├── Tomas corriente
│   │   └── Toma Corriente Industrial (cualquier tipo)
│   ├── Fuentes alimentación
│   │   └── Fuente Alimentacion (cualquier tipo)
│   └── Señalización
│       ├── Timbre (cualquier tipo)
│       └── Zumbador (cualquier tipo)
│
└── ⚙️ Control Motor
    ├── Contactor
    │   └── Contactor (cualquier tipo)
    ├── Relés y control
    │   └── Elemento de Control (cualquier tipo)
    └── Pulsadores
        ├── Bloque Mando Osmoz (cualquier tipo)
        └── Pulsador Osmoz (cualquier tipo)
```

### Mapa de etiquetas UI para subcategorías

Definido en `app/src/data/etiquetasSubcategoria.js`:

| Clave interna | Label en UI |
|---------------|-------------|
| `Magnetotérmico modular` | Magnetotérmico modular |
| `Magnetotérmico MCCB` | Magnetotérmico MCCB |
| `Diferencial` | Diferencial |
| `Sobretensión` | Sobretensión |
| `Fusibles` | Fusibles |
| `Seccionador` | Seccionador |
| `Seccionador CC` | Seccionador CC |
| `Interruptor CC` | Interruptor CC |
| `Rearme` | Rearme |
| `Control aislamiento` | Control aislamiento |
| `Central reporte` | Central reporte |
| `Pilotaje` | Pilotaje |
| `Medida` | Medida |
| `Distribución` | Distribución |
| `Cajas distribución` | Cajas distribución |
| `Cajas conexión` | Cajas conexión |
| `Conmutación` | Conmutación |
| `Tomas corriente` | Tomas corriente |
| `Fuentes alimentación` | Fuentes alimentación |
| `Señalización` | Señalización |
| `Contactor` | Contactor |
| `Relés y control` | Relés y control |
| `Pulsadores` | Pulsadores |

### Iconos por categoría UI

Definido en `app/src/data/categoriaMapping.js`:

| Categoría | Icono |
|-----------|-------|
| Protección | 🛡️ |
| Seccionamiento | 🔌 |
| Accesorios | 🔧 |
| Control Motor | ⚙️ |
| Domótica | 🏘️ |
| Energía Solar | ☀️ |
| Iluminación | 💡 |
| Instalación | 📏 |
| Vehículo Eléctrico | 🚗 |

### Flujo de navegación UI (Fichas Técnicas)

```
┌─ Sidebar ──────────────────────────────────┐
│  DISTRIBUCIÓN DE POTENCIA  (click)          │
│  AUTOMATIZACIÓN                             │
│  ILUMINACIÓN                                │
│  ...                                        │
└─────────────────────────────────────────────┘
         │
         ▼
┌─ Marcas ───────────────────────────────────┐
│  Schneider Electric  (click)                │
│  Legrand                                    │
└─────────────────────────────────────────────┘
         │
         ▼  ┌─ ¿Es DISTRIBUCION DE POTENCIA? ─┐
             │  YES → categorias_grupo         │
             │  NO  → gamas (legacy)           │
             └─────────────────────────────────┘
         │
    YES  │         NO
         ▼         ▼
┌─ Categorías ──┐  ┌─ Gamas (legacy) ────┐
│ 🛡️ Protección │  │ Acti 9 iC60          │
│ 🔌 Seccionam. │  │ Resi9                │
│ 🔧 Accesorios │  │ ...                  │
│ ⚙️ Control M. │  └──────────────────────┘
└───────────────┘
         │
         ▼
┌─ Subcategorías ──────────────────────────┐
│ Magnetotérmico modular  (click)           │
│ Magnetotérmico MCCB                       │
│ Diferencial                               │
│ Sobretensión                              │
│ ...                                       │
└───────────────────────────────────────────┘
         │
         ▼
┌─ Referencias ────────────────────────────┐
│ A9F74110  | iC60N 1P 6A C  (click)       │
│ A9F74210  | iC60N 1P 10A C               │
│ ...                                       │
└───────────────────────────────────────────┘
         │
         ▼
┌─ Ficha completa ─────────────────────────┐
│ Datos + IA enrichment                     │
└───────────────────────────────────────────┘
```

### Implementación técnica

- **Detección de flujo**: El hook `useNavegacionFichas.js` llama a `getSubfamiliasConTipos(marca, familia)`. Si el resultado tiene mapeo en `SUBCATEGORIA_A_CATEGORIA` (definido en `categoriaMapping.js`), usa flujo DP. Si no, usa flujo legacy (gamas → tipos).
- **Construcción de grupos**: La función `construirGrupos(pares)` itera los pares (subfamilia, tipo) y los agrupa por categoria → subcategoria usando `getCategoria()`.
- **Consulta de productos**: `getProductosPorSubcategoria(familia, marca, filtros)` usa OR de Supabase para consultar múltiples pares (subfamilia, tipo) en una sola query.

---

## Gamas (nivel comercial — sin normalizar)

La `Gama` es el nombre comercial del fabricante. **No se normaliza** — se mantiene el nombre original.
Productos sin gama conocida llevan `Gama = null`.

Las gamas relevantes para DISTRIBUCION DE POTENCIA (Schneider):

| Gama | subfamilia | tipo |
|------|------------|------|
| Acti 9 iC60 | Interruptor Magnetotérmico | CARRIL DIN |
| C60 UL CSA IEC | Interruptor Magnetotérmico | CARRIL DIN |
| Resi9 | Interruptor Magnetotérmico | CARRIL DIN |
| ComPacT NSX | Interruptor Magnetotérmico | CAJA MOLDEADA |
| Interruptores de caja moldeada DPX³ | Interruptor Magnetotérmico | CAJA MOLDEADA |
| Interruptor diferencial Acti 9 iID | Interruptor Diferencial | CARRIL DIN |
| iD | Interruptor Diferencial | CARRIL DIN |
| Acti 9 Vigi para iC60 | Interruptor Diferencial | CARRIL DIN |
| Acti 9 iCT | Contactor | CARRIL DIN |
| Acti9 iCV40 | Contactor | CARRIL DIN |
| iPRC - iPRI | Proteccion Sobretension | CARRIL DIN |
| Limitadores de sobretensión | Proteccion Sobretension | CARRIL DIN |
| iSW | Interruptor Seccionador | CARRIL DIN |
| Interruptores seccionadores | Interruptor Seccionador | CARRIL DIN |
| Rearmador diferencial | Rearmador | CARRIL DIN |
| (sin Gama) — pilotos A9E1832x/3x | Accesorio | Piloto luminoso |
| (sin Gama) — bornas A9XPKxxx | Accesorio | CARRIL DIN |
| (sin Gama) — Linergy LVSxxxx | Accesorio | CARRIL DIN |
| (sin Gama) — M8650 | Accesorio | Contador eléctrico |

---

## Vista ProductTable (tabla en UI)

La vista de tabla organizada por polos × calibre (amperios) se activa automáticamente para:

- `Acti 9 iC60`
- `C60 UL CSA IEC`
- `ComPacT NSX`
- `Resi9`

Estas gamas comparten un formato de nombre que permite extraer polos, calibre y curva mediante regex.
El resto usan vista de tarjetas (RefCard).

Soporta también productos diferenciales con agrupación por sensibilidad (30mA, 300mA, etc.).

Ver `app/src/components/ui/ProductTable.jsx` y `app/src/hooks/useProductTable.js`.

---

## Archivos de mapeo (data layer)

| Archivo | Propósito |
|---------|-----------|
| `app/src/data/categoriaMapping.js` | Mapea (subfamilia, tipo) → (categoria, subcategoria) para DP. Exporta `SUBCATEGORIA_A_CATEGORIA`, `getCategoria()`, `getSubfamiliasPorCategoria()`, `CATEGORIA_ICONOS` |
| `app/src/data/etiquetasSubcategoria.js` | Labels UI para subcategorías. Exporta `SUBCATEGORIA_ETIQUETAS`, `getEtiquetaSubcategoria()` |
| `app/src/data/categoryMapping.js` | Metadatos de familias (iconos, descripciones, tips). Exporta `FULL_CATEGORY_INFO`, `SUBCATEGORY_LABELS`, `TYPE_LABELS`, `CATEGORY_IDS` |
| `app/src/data/familiaMapping.js` | Normaliza valores raw de `familia` a categorías normalizadas. Exporta `FAMILIA_A_CATEGORIA`, `normalizarFamilia()`, `CATEGORIAS_VALIDAS` |
| `app/src/services/catalogService.js` | Servicio principal de consultas a Supabase. Exporta 10 métodos: `getCategorias`, `getMarcasPorCategoria`, `getGamasPorMarcaYCategoria`, `getTiposPorGamaMarcaYFamilia`, `getSubfamiliasConTipos`, `getProductosPorSubcategoria`, `getProductosPorFiltro`, `getProductoPorRef`, `buscarProductos`, `getCatalogStats` |

---

## Convenciones de nomenclatura

| Campo | Formato | Ejemplo correcto |
|-------|---------|------------------|
| `familia` | MAYÚSCULAS con guiones bajos | `DISTRIBUCION DE POTENCIA` |
| `subfamilia` | Capitalizado | `Interruptor Magnetotérmico` |
| `tipo` | MAYÚSCULAS con guiones bajos | `CARRIL DIN` |
| `Gama` | Original del fabricante | `Acti 9 iC60` |
| `marca` | Original del fabricante | `Schneider Electric` |

---

## Historial de cambios

| Fecha | Cambio |
|------|--------|
| 2026-05-23 | Normalización inicial de DISTRIBUCION DE POTENCIA |
| 2026-05-23 | Añadido mapeo categoría→subcategoría (4 categorías, 23 subcategorías) |
| 2026-05-23 | Documentado flujo dual de navegación (DP agrupado vs legacy) |
| 2026-05-23 | Añadidos archivos de mapeo (categoriaMapping, etiquetasSubcategoria, categoryMapping, familiaMapping) |
