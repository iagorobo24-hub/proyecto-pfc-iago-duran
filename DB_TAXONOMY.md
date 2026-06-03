# Taxonomía de la Base de Datos — Proyecto PFC

> **Propósito**: Documento maestro de la estructura de la base de datos en Supabase.
> Cualquier cambio en la estructura de la DB debe reflejarse aquí primero.
> Los agentes IA deben leer este documento antes de modificar consultas de catálogo.

---

## Conexión

| Parámetro | Valor |
|-----------|-------|
| Plataforma | Supabase (PostgreSQL) |
| Configuración | `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` en `.env` |
| Cliente | `app/src/supabase/supabaseClient.js` |
| SDK | `@supabase/supabase-js` v2 |

---

## Tablas del catálogo

### Tabla `products` (~4.689 filas)

| Columna | Tipo | Descripción | Ejemplo |
|---------|------|-------------|---------|
| `id` | `serial` | PK autoincremental | 1 |
| `ref_fabricante` | `text` | Referencia del fabricante (única) | A9F74110 |
| `name` | `text` | Nombre descriptivo del producto | Magnetotérmico, Acti9 iC60N, 1P, 6A, C curva |
| `familia` | `text` | Categoría principal (Capitalizado) | Distribución de potencia |
| `Gama` | `text` | Gama comercial del fabricante (nullable) | Acti 9 iC60 |
| `Subgama` | `text` | Subgama dentro de la gama (nullable) | iC60N |
| `subfamilia` | `text` | Tipo funcional (Capitalizado, nullable) | Interruptor Magnetotérmico |
| `tipo` | `text` | Formato físico/montaje (nullable) | CARRIL DIN |
| `marca` | `text` | Nombre del fabricante (sin normalizar) | Schneider Electric |
| `brand_id` | `int4` | FK → `brands.id` (nullable) | 456 |
| `precio` | `numeric` | Precio unitario (nullable) | 14.50 |
| `imagen` | `text` | URL de imagen del producto (nullable) | https://... |
| `pdf_url` | `text` | URL de ficha técnica PDF (nullable) | https://... |
| `descripcion` | `text` | Descripción adicional (nullable) | — |
| `documentos` | `jsonb` | Array de objetos {nombre, url} (nullable) | [{"nombre": "Página producto", "url": "..."}] |
| `created_at` | `timestamptz` | Fecha de creación (default NOW()) | 2026-03-15T10:00:00Z |
| `updated_at` | `timestamptz` | Fecha de actualización | 2026-05-23T12:00:00Z |

### Tabla `brands` (~38 marcas)

| Columna | Tipo | Descripción | Ejemplo |
|---------|------|-------------|---------|
| `id` | `int4` | PK | 456 |
| `name` | `text` | Nombre de la marca | Schneider Electric |
| `website_url` | `text` | URL del sitio web (nullable) | https://www.se.com |

### Vista `vw_unique_families`

Vista que devuelve `SELECT DISTINCT familia` de la tabla `products`.
Usada por `getCategorias()` para cargar las ~14 familias sin descargar miles de productos.

---

## Familias (primer nivel de categorización)

Las familias son el nivel más alto. Se usan como categorías en el sidebar de Fichas Técnicas.
**En DB están Capitalizadas** (migración 001 aplicada).

| familia en DB | Label en UI | Icono | Productos aprox. | Marcas |
|---------------|-------------|-------|-------------------|--------|
| `Distribución de potencia` | Distribución de potencia | ⚡ | ~1.000 | Schneider, Legrand, Siemens, ABB, Hager |
| `Automatización` | Automatización | ⚙️ | ~251 | Schneider, Siemens |
| `Automatización de edificios` | Automatización de edificios | 🏘️ | ~49 | Schneider, Legrand |
| `Instalación` | Instalación | 📏 | ~101 | Legrand, Schneider |
| `Iluminación` | Iluminación | 💡 | ~64 | Legrand |
| `Fotovoltaica` | Fotovoltaica | ☀️ | ~24 | Schneider, Legrand |
| `Vehículos eléctricos` | Vehículos eléctricos | 🚗 | ~29 | Legrand, Schneider |
| `Cables` | Cables | 🧶 | — | — |
| `Climatización` | Climatización | 🌡️ | — | — |
| `Comunicación` | Comunicación | 📡 | — | — |
| `Herramientas` | Herramientas | 🔧 | — | — |
| `Protección` | Protección | 🛡️ | — | — |
| `Fontanería` | Fontanería | 💧 | — | — |
| `Energías renovables` | Energías renovables | 🌱 | — | — |

### Mapeo de variantes → nombre canónico

Definido en `etiquetasFamilias` dentro de `catalogService.ts` (línea 21).
La DB puede contener variantes legacy; el servicio las unifica con este mapeo:

| Variante en DB | Normaliza a |
|----------------|-------------|
| `CABLES`, `CABLES DE BAJA TENSION`, `CABLES DE MEDIA TENSION`, `CABLES DE ALTA TENSION` | `Cables` |
| `AUTOMATIZACION`, `AUTOMATIZACION INDUSTRIAL`, `CONTROL Y AUTOMATIZACION INDUSTRIAL`, `AUTOMACION INDUSTRIAL` | `Automatización` |
| `AUTOMATIZACION DE EDIFICIOS`, `DOMOTICA`, `DOMOTICA Y CONTROL` | `Automatización de edificios` |
| `DISTRIBUCION DE POTENCIA`, `POTENCIA` | `Distribución de potencia` |
| `INSTALACION`, `CANALIZACION`, `CANALIZACIONES`, `BANDEJAS` | `Instalación` |
| `ILUMINACION`, `LUMINARIAS` | `Iluminación` |
| `FOTOVOLTAICA`, `FOTOVOLTAICA SOLAR`, `SOLAR`, `PANELES SOLARES` | `Fotovoltaica` |
| `VEHICULOS ELECTRICOS`, `VEHICULOS_ELECTRICOS`, `VEHICULO ELECTRICO` | `Vehículos eléctricos` |
| `CLIMATIZACION`, `HVAC`, `CLIMA` | `Climatización` |
| `COMUNICACION`, `COMUNICACIONES`, `REDES` | `Comunicación` |
| `HERRAMIENTAS`, `HERRAMIENTAS Y MANIPULACION` | `Herramientas` |
| `PROTECCION`, `PROTECCION ELECTRICA` | `Protección` |
| `FONTANERIA`, `FONTANERÍA` | `Fontanería` |
| `ENERGIAS RENOVABLES`, `ENERGIAS RENOVABLES Y VEHICULO ELECTRICO`, `PLACAS SOLARES` | `Energías renovables` |

### Historial de migraciones de familias

| Migración | Comando SQL | Qué cambió |
|-----------|-------------|------------|
| 001 | `migrations/001_nombres_familias_canonicos.sql` | Unificó UPPERCASE → Capitalizado en DB |
| 002 | `migrations/002_vehiculos_electricos_correccion.sql` | Corrección de naming VE |
| 003 | `migrations/003_mover_schneider_ev_a_vehiculos.sql` | Reclasificó Schneider EV |
| 004 | `migrations/004_fotovoltaica_correccion.sql` | Corrección de naming FV |

---

## Subfamilias (segundo nivel)

La `subfamilia` define el tipo funcional del producto.

### Subfamilias de DISTRIBUCION DE POTENCIA

| subfamilia | Descripción | Ejemplos de Gama | Categoría UI | Subcategoría UI |
|------------|-------------|-------------------|--------------|-----------------|
| `Interruptor Magnetotérmico` | MCB/MCCB (protección sobrecargas y cortocircuitos) | Acti 9 iC60, ComPacT NSX, DPX³ | Protección | Magnetotérmico modular (CARRIL DIN) / MCCB (CAJA MOLDEADA) |
| `Interruptor Caja Moldeada` | MCCB en caja moldeada | DPX³, 3VA2 | Protección | Magnetotérmico MCCB |
| `Interruptor Diferencial` | RCCB (protección fugas a tierra) | iID, iD, Vigi iC60, RX³ | Protección | Diferencial |
| `Proteccion Sobretension` | Limitadores de sobretensión (SPD) | iPRC - iPRI, Limitador Sobretension | Protección | Sobretensión |
| `Cortacircuito Fusible` | Fusibles de protección | Cortacircuito Seccionable | Protección | Fusibles |
| `Interruptor Seccionador` | Interruptores en carga / seccionadores | iSW, Vistop | Seccionamiento | Seccionador |
| `Seccionador CC` | Seccionadores para CC | Seccionador DC | Seccionamiento | Seccionador CC |
| `Interruptor CC` | Interruptores para CC | DX³ 800V= | Seccionamiento | Interruptor CC |
| `Rearmador` | Reenganchadores automáticos | Rearmador diferencial | Accesorios | Rearme |
| `Control Aislamiento` | Vigilantes de aislamiento | Control Aislamiento | Accesorios | Control aislamiento |
| `Central Reporte` | Centrales de reporte | Control Aislamiento | Accesorios | Central reporte |
| `Accesorio` | Pilotos, bornas, contadores, accesorios | Linergy, Prisma, Mosaic, Señalizacion | Accesorios | Pilotaje / Medida / Distribución (segun tipo) |
| `Caja Distribucion` | Cajas de distribución | Nedbox, Practibox | Accesorios | Cajas distribución |
| `Caja Conexion` | Cajas de conexión | Plexo³ | Accesorios | Cajas conexión |
| `Conmutador` | Conmutadores | Conmutador | Accesorios | Conmutación |
| `Toma Corriente Industrial` | Tomas industriales | Toma Industrial | Accesorios | Tomas corriente |
| `Fuente Alimentacion` | Fuentes de alimentación | Fuente Conmutada | Accesorios | Fuentes alimentación |
| `Timbre` | Timbres | Señalizacion Acustica | Accesorios | Señalización |
| `Zumbador` | Zumbadores | Señalizacion Acustica | Accesorios | Señalización |
| `Contactor` | Contactores modulares | Acti 9 iCT | Control Motor | Contactor |
| `Elemento de Control` | Temporizadores, telerruptores, relés | iTL, Control Modular, Interruptor Horario | Control Motor | Relés y control |
| `Bloque Mando Osmoz` | Pulsadores y mandos Osmoz | Osmoz | Control Motor | Pulsadores |
| `Pulsador Osmoz` | Pulsadores Osmoz | Osmoz | Control Motor | Pulsadores |
| `Arrancadores Suaves` | Arrancadores progresivos | 3RW4 | Control Motor | Arrancadores suaves |
| `Bornas` | Bornas de conexión | 5TB4 | Accesorios | Bornas y terminales |
| `Relés de Seguridad` | Relés de seguridad | 3RK1 | Accesorios | Relés y seguridad |

### Subfamilias de otras familias

| Familia | Subfamilias |
|---------|-------------|
| **Automatización** | `Contactor`, `Contactor Industrial`, `Elemento de Control`, `Bloque Mando Osmoz`, `Pulsador Osmoz`, `Fuente Alimentacion`, `Interruptor Diferencial`, `Arrancador Suave`, `Variador de Frecuencia`, `Autómata Programable`, `Módulo de E/S`, `Módulo de Comunicación`, `Sistema de Control`, `Actuador de Válvula`, `Relé Térmico`, `Interruptor Motor` |
| **Automatización de edificios** | `Acoplador KNX`, `Actuador HVAC KNX`, `Actuador HVAC`, `Actuador KNX`, `Base Conectada`, `Compensador`, `Controlador KNX`, `Detector Movimiento`, `Interface KNX`, `Interruptor Rotulo`, `Mando Smart`, `Micromodulo Smart`, `Pasarela KNX`, `Pulsador Telemando`, `Router KNX`, `Sensor KNX`, `Telemando` |
| **Iluminación** | `Luminaria Emergencia`, `Linterna`, `Bateria`, `Accesorio` |
| **Instalación** | `Borniera`, `Canal de Instalación`, `Mini Canal`, `Bandeja Portacables`, `Canalización` |
| **Vehículos eléctricos** | `Puntos de recarga`, `Protección para recarga`, `Accesorios` |
| **Fotovoltaica** | `Seccionador CC`, `Protecciones sobretensión`, `Cajas combinadoras`, `Interruptores CC`, `Accesorios` |

---

## Tipos (formato físico / montaje)

| tipo | Descripción |
|------|-------------|
| `CARRIL DIN` | Montaje en carril DIN (18mm módulo) |
| `CAJA MOLDEADA` | Interruptor en caja moldeada (MCCB) |
| `Piloto luminoso` | Pilotos de señalización LED |
| `Contador eléctrico` | Contadores de energía digitales |

> **Nota**: La columna `tipo` tiene valores poco normalizados. Solo los 4 tipos listados arriba están documentados. El resto se muestran tal cual en la UI.

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
│   ├── Rearme → Rearmador
│   ├── Control aislamiento → Control Aislamiento
│   ├── Central reporte → Central Reporte
│   ├── Pilotaje → Accesorio + Piloto luminoso
│   ├── Medida → Accesorio + Contador eléctrico
│   ├── Distribución → Accesorio + CARRIL DIN
│   ├── Cajas distribución → Caja Distribucion
│   ├── Cajas conexión → Caja Conexion
│   ├── Conmutación → Conmutador
│   ├── Tomas corriente → Toma Corriente Industrial
│   ├── Fuentes alimentación → Fuente Alimentacion
│   ├── Señalización → Timbre / Zumbador
│   ├── Relés y seguridad → Relés de Seguridad
│   └── Bornas y terminales → Bornas
│
└── ⚙️ Control Motor
    ├── Contactor → Contactor
    ├── Relés y control → Elemento de Control
    ├── Pulsadores → Bloque Mando Osmoz / Pulsador Osmoz
    ├── Arrancadores suaves → Arrancadores Suaves
    ├── Contactor Industrial → Contactor Industrial
    ├── Interruptor Motor → Interruptor Motor
    ├── Relé Térmico → Relé Térmico
    ├── Autómata Programable → Autómata Programable
    ├── Variador de Frecuencia → Variador de Frecuencia
    ├── Sistema de Control → Sistema de Control
    └── Actuador de Válvula → Actuador de Válvula
```

### Categorías UI para otras familias

```
AUTOMATIZACION (familia)
└── ⚙️ Control Motor
    ├── Variador de Frecuencia → Variador de Frecuencia
    ├── Autómata Programable → Autómata Programable
    ├── Contactor → Contactor
    ├── Contactor Industrial → Contactor Industrial
    ├── Arrancadores suaves → Arrancador Suave
    ├── Interruptor Motor → Interruptor Motor
    ├── Relé Térmico → Relé Térmico
    ├── Relés y control → Elemento de Control
    ├── Pulsadores → Bloque Mando Osmoz / Pulsador Osmoz
    ├── Módulos E/S → Módulo de E/S
    ├── Módulos comunicación → Módulo de Comunicación
    └── Actuador de Válvula → Actuador de Válvula

AUTOMATIZACION DE EDIFICIOS (familia)
└── 🏘️ Domótica
    ├── Dispositivos KNX → Acoplador KNX / Actuador KNX / Controlador KNX / Interface KNX / Router KNX / Sensor KNX
    ├── Actuadores HVAC → Actuador HVAC KNX / Actuador HVAC
    ├── Hogar conectado → Base Conectada / Detector Movimiento / Mando Smart / Micromodulo Smart / Compensador
    ├── Seguridad → Interruptor Rotulo
    └── Telemando → Pulsador Telemando / Telemando

ILUMINACION (familia)
└── 💡 Iluminación
    ├── Luminarias emergencia → Luminaria Emergencia
    ├── Linternas → Linterna
    └── Baterías → Bateria

INSTALACION (familia)
└── 📏 Instalación
    ├── Bornieras → Borniera
    ├── Canales de instalación → Canal de Instalación
    ├── Mini canal → Mini Canal
    ├── Bandejas portacables → Bandeja Portacables
    └── Canalizaciones → Canalización

VEHICULOS ELECTRICOS (familia)
└── 🚗 Vehículo Eléctrico
    ├── Puntos de recarga → Puntos de recarga
    └── Protección recarga → Protección para recarga

FOTOVOLTAICA (familia)
└── ☀️ Energía Solar
    ├── Seccionador CC → Seccionador CC
    ├── Protecciones sobretensión → Protecciones sobretensión
    ├── Cajas combinadoras → Cajas combinadoras
    ├── Interruptores CC → Interruptores CC
    └── Accesorios → Accesorios
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
| `Relés y seguridad` | Relés y seguridad |
| `Bornas y terminales` | Bornas y terminales |
| `Luminarias emergencia` | Luminarias de emergencia |
| `Linternas` | Linternas |
| `Baterías` | Baterías |
| `Bornieras` | Bornieras |
| `Canales` | Canales de instalación |
| `Mini canal` | Mini canal |
| `Bandejas portacables` | Bandejas portacables |
| `Canalizaciones` | Canalizaciones |
| `Puntos de recarga` | Puntos de recarga |
| `Protección recarga` | Protección para recarga |
| `Dispositivos KNX` | Dispositivos KNX |
| `Actuadores HVAC` | Actuadores HVAC |
| `Hogar conectado` | Hogar conectado |
| `Seguridad` | Seguridad |
| `Telemando` | Telemando |
| `Módulos E/S` | Módulos E/S |
| `Módulos comunicación` | Módulos de comunicación |

### Iconos por categoría UI

Definido en `app/src/data/categoriaMapping.js` → `CATEGORIA_ICONOS`:

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
| Cables | 🧶 |
| Climatización | 🌡️ |
| Comunicación | 📡 |
| Herramientas | 🔨 |
| Fontanería | 💧 |
| Energías renovables | 🌱 |

### Arquitectura de metadata

La metadata de familias se define en `app/src/data/categoryMapping.js` → `FULL_CATEGORY_INFO`:

```javascript
FULL_CATEGORY_INFO = {
  "AUTOMATIZACION": {
    label: 'Automatización',
    icon: '⚙️',
    desc: '...',
    tip: '...'
  },
  // ... 13 familias más
}
```

La función `getCategoriaMeta(familia)` hace búsqueda por: nombre exacto → uppercase → sin acentos → con guiones bajos → con espacios.

---

## Flujo de navegación UI (Fichas Técnicas)

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
┌─ Categorías ──┐  ┌─ Subfamilias ──────────┐
│ 🛡️ Protección  │  │ Interruptor Mag.        │
│ 🔌 Seccionam. │  │ Interruptor Diferencial │
│ 🔧 Accesorios │  │ Elemento de Control     │
│ ⚙️ Control M. │  │ ...                    │
└───────────────┘  └─────────────────────────┘
         │                │
         ▼                ▼
┌─ Subcategorías ──┐  ┌─ Tipos ──────────────┐
│ Magnetotérmico    │  │ CARRIL DIN           │
│ Diferencial       │  │ CAJA MOLDEADA        │
│ ...              │  │ ...                  │
└──────────────────┘  └──────────────────────┘
         │                │
         ▼                ▼
┌─ Referencias ────────────────────────────┐
│ Lista de productos con ref_fabricante     │
└───────────────────────────────────────────┘
         │
         ▼
┌─ Ficha completa ─────────────────────────┐
│ Datos + IA enrichment                     │
└───────────────────────────────────────────┘
```

### Implementación técnica

- **Detección de flujo**: El hook `useNavegacionFichas.js` llama a `getSubfamiliasConTipos(marca, familia)`. Si el resultado tiene mapeo en `SUBCATEGORIA_A_CATEGORIA` (definido en `categoriaMapping.js`), usa flujo DP. Si no, usa flujo legacy (subfamilias → tipos).
- **Construcción de grupos**: La función `construirGrupos(pares)` itera los pares (subfamilia, tipo) y los agrupa por categoria → subcategoria usando `getCategoria()`.
- **Consulta de productos**: `getProductosPorSubcategoria(familia, marca, filtros)` usa OR de Supabase para consultar múltiples pares (subfamilia, tipo) en una sola query.

---

## Gamas Comerciales

La `Gama` es el nombre comercial del fabricante. **No se normaliza** — se mantiene el nombre original.
Productos sin gama conocida llevan `Gama = null`.

### Gamas por familia (consolidadas de categoryMapping.js)

**DISTRIBUCIÓN DE POTENCIA (~40+ gamas):**
| Gama | Subfamilia |
|------|------------|
| Acti 9, RX³ Diferencial, TX³ Diferencial, Acti 9 Vigi para iC60, Interruptor diferencial Acti 9 iID | Interruptor Diferencial |
| ComPacT NSX, DPX³ 250, DPX³ 250 HP, 3VA2, 5JS6, 5SL3, 5SL30, 5SL4, 5SL58, 5SL6, 5SL60, 5SY4, 5SY6 | Interruptor Magnetotérmico |
| Vistop, iSW | Interruptor Seccionador |
| Limitador Sobretension, iPRC - iPRI, Mosaic | Proteccion Sobretension |
| Acti 9 iCT | Contactor |
| iTL, Control Modular, Crepuscular, Interruptor Horario, Minuteria, Temporizador | Elemento de Control |
| Rearmador diferencial | Rearmador |
| Señalizacion Acustica | Timbre / Zumbador |
| Toma Industrial | Toma Corriente Industrial |
| Fuente Conmutada | Fuente Alimentacion |
| Plexo³ | Caja Conexion |
| Nedbox, Practibox | Caja Distribucion |
| DPX³ Accesorio, Linergy, Prisma, Mosaic, Borna Tierra, etc. | Accesorio |

**AUTOMATIZACIÓN:**
| Gama | Subfamilia |
|------|------------|
| Acti 9 iCT | Contactor |
| Acti9 iCV40 | Interruptor Diferencial |
| Control Modular, Crepuscular, Interruptor Horario, Minuteria, Temporizador, iTL | Elemento de Control |
| Osmoz, Acti 9 Osmoz | Bloque Mando Osmoz / Pulsador Osmoz |
| Soft Starter | Arrancador Suave |
| Autómata Programable, 6ES7 | Autómata Programable |
| Contactor Industrial | Contactor Industrial |
| Variador Frecuencia | Variador de Frecuencia |
| Módulo I/O | Módulo de E/S |
| Fuente Conmutada | Fuente Alimentacion |

**ILUMINACIÓN:**
| Gama | Subfamilia |
|------|------------|
| B65LED, C3LED, C3LED Autotest, C3LED Estandar, INOXLED, NFL65 Estanca, NT65 Estanca, TEXLED | Luminaria Emergencia |
| Bateria Repuesto | Bateria |
| Linterna | Linterna |

**VEHÍCULOS ELÉCTRICOS:**
| Gama | Subfamilia |
|------|------------|
| Green'up Accesorio, Green'up Home, Green'up One, Green'up Premium | Puntos de recarga |
| Acti 9 | Protección para recarga |
| Green'up Accesorio | Accesorios |

**AUTOMATIZACIÓN DE EDIFICIOS:**
| Gama | Subfamilia |
|------|------------|
| KNX, KNX HVAC, KNX DALI | Acoplador/Actuador/Controlador/Interface/Router KNX |
| Smather Netatmo | Actuador HVAC |
| Hogar Conectado | Base Conectada, Detector Movimiento, Mando Smart, Micromodulo Smart |
| Green-I | Sensor KNX |
| Telemando | Pulsador Telemando, Telemando |
| Seguridad Rotulos | Interruptor Rotulo |

**FOTOVOLTAICA:**
| Gama | Subfamilia |
|------|------------|
| Descargador PV, Descargador PV Accesorio | Accesorios / Protecciones sobretensión |
| Plexo³ PV | Cajas combinadoras |
| DX³ 800V= | Interruptores CC |
| Seccionador DC | Seccionador CC |

---

## Vista ProductTable (tabla en UI)

La vista de tabla organizada por polos × calibre (amperios) se activa automáticamente para ciertas gamas de interruptores magnetotérmicos que comparten un formato de nombre que permite extraer polos, calibre y curva mediante regex:

- `Acti 9 iC60`
- `C60 UL CSA IEC`
- `ComPacT NSX`
- `Resi9`

Soporta también productos diferenciales con agrupación por sensibilidad (30mA, 300mA, etc.).
El resto usan vista de tarjetas (RefCard).

Ver `app/src/components/ui/ProductTable.jsx` y `app/src/hooks/useProductTable.js`.

---

## Archivos de mapeo (data layer)

### Archivos activos

| Archivo | Propósito |
|---------|-----------|
| `app/src/data/categoriaMapping.js` | Mapea (subfamilia, tipo) → (categoria, subcategoria). Exporta `SUBCATEGORIA_A_CATEGORIA`, `getCategoria()`, `CATEGORIA_ICONOS` |
| `app/src/data/etiquetasSubcategoria.js` | Labels UI para subcategorías. Exporta `SUBCATEGORIA_ETIQUETAS`, `getEtiquetaSubcategoria()` |
| `app/src/data/categoryMapping.js` | Metadata de familias + gamas consolidadas. Exporta `FULL_CATEGORY_INFO`, `getCategoriaMeta()`, `GAMAS_POR_FAMILIA` |
| `app/src/data/marcasLogos.js` | Logos y colores por marca |

### Servicios

| Archivo | Propósito |
|---------|-----------|
| `app/src/services/catalogService.ts` | **18 funciones**: `getCategorias`, `getMarcasPorCategoria`, `getGamasPorMarcaYCategoria`, `getTiposPorGamaMarcaYFamilia`, `getSubfamiliasConTipos`, `getProductosPorSubcategoria`, `getGamasPorSubcategoria`, `getSubgamasPorSubcategoria`, `getProductosPorFiltro`, `getGamasPorFiltro`, `getSubgamasPorFiltro`, `getProductoPorRef`, `buscarProductos`, `buscarProductosConLimite`, `getCatalogStats`, `initCatalog`, `cargarMarcas`, `findBrandIdByName` |

### Archivos eliminados

| Archivo | Motivo |
|---------|--------|
| `app/src/data/familiaMapping.js` | Reemplazado por mapeo inline en `etiquetasFamilias` de `catalogService.ts` |

---

## Convenciones de nomenclatura (post-migración)

| Campo | Formato actual en DB | Ejemplo correcto |
|-------|----------------------|------------------|
| `familia` | Capitalizado (con acentos) | `Distribución de potencia` |
| `subfamilia` | Capitalizado | `Interruptor Magnetotérmico` |
| `tipo` | MAYÚSCULAS con guiones bajos | `CARRIL DIN` |
| `Gama` | Original del fabricante | `Acti 9 iC60` |
| `Subgama` | Original del fabricante | `iC60N` |
| `marca` | Original del fabricante | `Schneider Electric` |

### Variantes legacy (aceptadas por el mapeo)

El código acepta variantes legacy en `familia` (UPPERCASE, con/sin acentos, guiones bajos) y las normaliza automáticamente mediante `etiquetasFamilias` en `catalogService.ts`.

---

## Scripts de normalización

Los scripts de normalización están en `app/scripts/`:

| Script | Propósito |
|--------|-----------|
| `00-backup-db.mjs` | Backup completo antes de migrar |
| `01-clean-placeholders.mjs` | Limpiar placeholders |
| `02-verify-taxonomy.mjs` | Verificar consistencia taxonómica |
| `03-fix-contactores.mjs` | Corregir clasificación de contactores |
| `04-fix-siemens-families.mjs` | Corregir familias Siemens |
| `05-normalize-automatizacion.mjs` | Normalizar automatización |
| `06-normalize-instalacion.mjs` | Normalizar instalación |
| `07-normalize-ve-fv.mjs` | Normalizar vehículos eléctricos y fotovoltaica |
| `08-normalize-tipos.mjs` | Normalizar tipos de producto |
| `09-update-mapping-files.mjs` | Actualizar archivos de mapeo |
| `generate_mapeo_consolidado.cjs` | Generar `GAMAS_POR_FAMILIA` desde datos reales |

---

## Historial de cambios

| Fecha | Cambio |
|------|--------|
| 2026-05-23 | Normalización inicial de DISTRIBUCION DE POTENCIA |
| 2026-05-23 | Añadido mapeo categoría→subcategoría (4 categorías, 23 subcategorías) |
| 2026-05-23 | Documentado flujo dual de navegación (DP agrupado vs legacy) |
| 2026-05-23 | Añadidos archivos de mapeo |
| 2026-06-01 | Migración 001: UPPERCASE→Capitalizado en DB |
| 2026-06-01 | Fixes 1-2: Unificación de nombres de familias |
| 2026-06-02 | Generación de `GAMAS_POR_FAMILIA` consolidado desde datos reales |
| 2026-06-03 | Ampliado mapeo a todas las familias (Autom., Domótica, Ilum., Inst., VE, FV) |
| 2026-06-03 | Añadidas 14 categorías UI + iconos, 44+ subcategorías |
| 2026-06-03 | Actualizado schema con columnas reales (descripcion, documentos) |
| 2026-06-03 | Documentada vista `vw_unique_families` |
| 2026-06-03 | Añadida tabla de migraciones SQL y scripts de normalización |
