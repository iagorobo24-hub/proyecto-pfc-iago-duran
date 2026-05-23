# Taxonomía de la Base de Datos — Proyecto PFC

> **Propósito**: Este documento define la estructura normalizada de la tabla `products` en Supabase.
> Cualquier cambio en la organización de la DB debe reflejarse aquí primero.

---

## Estructura de columnas

| Columna | Tipo | Descripción | Ejemplo |
|---------|------|-------------|---------|
| `id` | serial | PK autoincremental | 1 |
| `ref_fabricante` | text | Referencia del fabricante (única) | A9F74110 |
| `name` | text | Nombre descriptivo del producto | Magnetotérmico, Acti9 iC60N, 1P, 6A, C curva |
| `familia` | text | Categoría principal del producto | DISTRIBUCION DE POTENCIA |
| `Gama` | text | Gama comercial del fabricante | Acti 9 iC60 |
| `subfamilia` | text | Tipo funcional del producto | Interruptor Magnetotérmico |
| `tipo` | text | Formato físico/montaje | CARRIL DIN |
| `marca` | text | Nombre del fabricante | Schneider Electric |
| `brand_id` | int4 | FK a tabla `brands` | 456 |
| `precio` | numeric | Precio unitario (puede ser null) | 14.50 |
| `imagen` | text | URL de imagen del producto | https://... |
| `pdf_url` | text | URL de ficha técnica PDF | https://... |

---

## Familias

Las familias representan el nivel más alto de categorización. Cada familia agrupa productos
de un ámbito funcional concreto.

| familia | Descripción | Estado |
|---------|-------------|--------|
| `DISTRIBUCION DE POTENCIA` | Interruptores, diferenciales, contactores, protecciones | ✅ Normalizado |
| `AUTOMATIZACION` | PLCs, relés, sensores, variadores | ⏳ Pendiente |
| `INSTALACION` | Canalizaciones, bandejas, minicanales | ⏳ Pendiente |
| `ILUMINACION` | Luminarias, emergencias | ⏳ Pendiente |
| `FOTOVOLTAICA` | Placas solares, inversores | ⏳ Pendiente |
| `VEHICULO ELECTRICO` | Puntos de recarga, cableado EV | ⏳ Pendiente |

> **Regla**: `familia` siempre en MAYÚSCULAS con guiones bajos para espacios.

---

## Subfamilias (válidas para DISTRIBUCION DE POTENCIA)

La `subfamilia` define el tipo funcional del producto dentro de la familia.

### Subfamilias actuales

| subfamilia | Descripción | Ejemplos de gamas |
|------------|-------------|-------------------|
| `Interruptor Magnetotérmico` | MCB/MCCB — protección contra sobrecargas y cortocircuitos | Acti 9 iC60, C60 UL, ComPacT NSX, Resi9, DPX³ |
| `Interruptor Diferencial` | RCCB — protección contra fugas a tierra | iID, iD, Vigi iC60 |
| `Contactor` | Contactores modulares e industriales | iCT, iCV40 |
| `Elemento de Control` | Temporizadores, telerruptores, relés | iTL |
| `Proteccion Sobretension` | Limitadores de sobretensión transitoria (SPD) | iPRC - iPRI |
| `Interruptor Seccionador` | Interruptores en carga / seccionadores | iSW |
| `Rearmador` | Reenganchadores automáticos diferenciales | Rearmador |
| `Accesorio` | Pilotos, bornas, contadores, accesorios varios | (sin Gama) |

### Reglas de asignación

| Gama | subfamilia | tipo |
|------|------------|------|
| Acti 9 iC60 | Interruptor Magnetotérmico | CARRIL DIN |
| C60 UL CSA IEC | Interruptor Magnetotérmico | CARRIL DIN |
| Resi9 | Interruptor Magnetotérmico | CARRIL DIN |
| ComPacT NSX | Interruptor Magnetotérmico | CAJA MOLDEADA |
| Interruptores de caja moldeada DPX³ | Interruptor Magnetotérmico | CAJA MOLDEADA |
| Interruptores de caja moldeada DPX³ HP | Interruptor Magnetotérmico | CAJA MOLDEADA |
| Interruptor diferencial Acti 9 iID | Interruptor Diferencial | CARRIL DIN |
| iD | Interruptor Diferencial | CARRIL DIN |
| Acti 9 Vigi para iC60 | Interruptor Diferencial | CARRIL DIN |
| Acti 9 iCT | Contactor | CARRIL DIN |
| Acti9 iCV40 | Contactor | CARRIL DIN |
| iTL | Elemento de Control | CARRIL DIN |
| iPRC - iPRI | Proteccion Sobretension | CARRIL DIN |
| Limitadores de sobretensión | Proteccion Sobretension | CARRIL DIN |
| iSW | Interruptor Seccionador | CARRIL DIN |
| Interruptores seccionadores | Interruptor Seccionador | CARRIL DIN |
| Rearmador diferencial | Rearmador | CARRIL DIN |
| (sin Gama) — pilotos A9E1832x/3x | Accesorio | Piloto luminoso |
| (sin Gama) — bornas A9XPKxxx | Accesorio | CARRIL DIN |
| (sin Gama) — Linergy LVSxxxx | Accesorio | CARRIL DIN |
| (sin Gama) — M8650 | Accesorio | Contador eléctrico |
| Protección modular magnetotérmica y diferencial | Interruptor Magnetotérmico | CARRIL DIN |
| Protección residencial magnetotérmica y diferencial | Interruptor Magnetotérmico | CARRIL DIN |
| Protección e Industria | Interruptor Magnetotérmico | CARRIL DIN |
| Protección y distribución industrial | Interruptor Magnetotérmico | CARRIL DIN |
| Protección y distribución terciario | Interruptor Magnetotérmico | CARRIL DIN |
| Interruptores automáticos | Interruptor Magnetotérmico | CARRIL DIN |
| Guardamotores, contactores y fusibles | Contactor | CARRIL DIN |

> **Regla**: `subfamilia` en formato **Capitalizado** (ej: "Interruptor Magnetotérmico", no "interruptor magnetotérmico" ni "INTERRUPTOR MAGNETOTÉRMICO").

---

## Tipos (válidos para DISTRIBUCION DE POTENCIA)

El `tipo` define el formato físico o montaje del producto.

| tipo | Descripción | Ejemplos |
|------|-------------|----------|
| `CARRIL DIN` | Montaje en carril DIN (18mm módulo) | iC60, iID, iCT, iTL |
| `CAJA MOLDEADA` | Interruptor en caja moldeada (MCCB) | ComPacT NSX, DPX³ |
| `Piloto luminoso` | Pilotos de señalización LED | A9E1832x |
| `Contador eléctrico` | Contadores de energía digitales | M8650 |

> **Regla**: `tipo` en MAYÚSCULAS con guiones bajos para espacios.

---

## Gamas

La `Gama` es el nombre comercial del fabricante. No se normaliza — se mantiene el nombre
original del fabricante. Los productos sin gama conocida llevan `Gama = null`.

---

## Relación familia ↔ subfamilia (para DISTRIBUCION DE POTENCIA)

```
DISTRIBUCION DE POTENCIA
├── Interruptor Magnetotérmico
│   ├── CARRIL DIN (Acti 9 iC60, C60 UL, Resi9, ...)
│   └── CAJA MOLDEADA (ComPacT NSX, DPX³)
├── Interruptor Diferencial
│   └── CARRIL DIN (iID, iD, Vigi iC60)
├── Contactor
│   └── CARRIL DIN (iCT, iCV40, Guardamotores)
├── Elemento de Control
│   └── CARRIL DIN (iTL)
├── Proteccion Sobretension
│   └── CARRIL DIN (iPRC - iPRI, Limitadores)
├── Interruptor Seccionador
│   └── CARRIL DIN (iSW, Interruptores seccionadores)
├── Rearmador
│   └── CARRIL DIN (Rearmador)
└── Accesorio
    ├── Piloto luminoso (A9E1832x/3x)
    ├── CARRIL DIN (bornas, Linergy)
    └── Contador eléctrico (M8650)
```

---

## Mapa de etiquetas UI (FichasTécnicas)

Cuando se muestre en la interfaz, traducir:

| DB value | UI label |
|----------|----------|
| `DISTRIBUCION DE POTENCIA` | Distribución de Potencia |
| `Interruptor Magnetotérmico` | Interruptor Magnetotérmico |
| `Interruptor Diferencial` | Interruptor Diferencial |
| `Contactor` | Contactor |
| `Elemento de Control` | Elemento de Control |
| `Proteccion Sobretension` | Protección Sobretensión |
| `Interruptor Seccionador` | Interruptor Seccionador |
| `Rearmador` | Rearmador Diferencial |
| `Accesorio` | Accesorio |

---

## ProductTable (vista tabla en UI)

La vista de tabla organizada por polos × calibre solo se activa para estas gamas:

- `Acti 9 iC60`
- `C60 UL CSA IEC`
- `ComPacT NSX`
- `Resi9`

Estas gamas comparten un formato de nombre que permite extraer polos, calibre y curva.
El resto de gamas usan la vista de tarjetas (RefCard).

---

## Historial de cambios

| Fecha | Cambio |
|------|--------|
| 2026-05-23 | Normalización inicial de DISTRIBUCION DE POTENCIA |