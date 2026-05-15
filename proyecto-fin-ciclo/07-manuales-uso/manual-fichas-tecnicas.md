# Manual de Usuario: Fichas Técnicas — Navegación del Catálogo

## Introducción

El módulo de Fichas Técnicas te permite explorar el catálogo completo de productos de la empresa. Con más de 400.000 productos organizados jerárquicamente, puedes encontrar rápidamente la información que necesitas.

---

## Cómo acceder

1. Inicia sesión en la aplicación
2. En el menú lateral, haz clic en **Fichas Técnicas** (icono de archivo)
3. Verás la navegación jerárquica

---

## Estructura de navegación

El catálogo está organizado en **4 niveles**:

```
Familia  →  Marca  →  Gama  →  Producto
```

| Nivel | Ejemplo |
|-------|---------|
| **Familia** | Iluminación, Cableado, Protecciones |
| **Marca** | Philips, Schneider, ABB, Siemens |
| **Gama** | LED, Convencional, Extraeólica |
| **Producto** | Bombilla LED E27 10W |

---

## Interfaz de usuario

```
┌─────────────────────────────────────────────────────────────┐
│  FICHAS TÉCNICAS                                    [🌓]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  FAMILIA                 MARCA               GAMA           │
│  ─────────────          ─────────           ─────────       │
│  ▶ Iluminación          ▶ Philips           ▶ LED          │
│  ▶ Cableado             ▶ Schneider         ▶ Convenc.     │
│  ▶ Protecciones         ▶ ABB               ▶ Fluoresc.    │
│  ▶ Automatización       ▶ Siemens                           │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  PRODUCTOS EN "LED - Philips"                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 🌡️ Bombilla LED E27 10W - 806lm                    │  │
│  │     Ref: 929001199123  |  Philips                  │  │
│  │     [Ver ficha] [Añadir]                            │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 🌡️ Bombilla LED GU10 7W - 600lm                    │  │
│  │     Ref: 929001199456  |  Philips                  │  │
│  │     [Ver ficha] [Añadir]                            │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Cómo navegar

### Paso 1: Seleccionar familia

1. Haz clic en una familia del panel izquierdo
2. Las marcas disponibles se cargarán en el panel central

### Paso 2: Seleccionar marca

1. Con una familia seleccionada, haz clic en una marca
2. Las gamas disponibles se cargarán en el panel derecho

### Paso 3: Seleccionar gama

1. Con una marca seleccionada, haz clic en una gama
2. Los productos se mostrarán en el panel inferior

### Paso 4: Ver producto

1. Haz clic en **"Ver ficha"** en cualquier producto
2. Se abrirá la ficha técnica completa

---

## Ficha de producto

Al hacer clic en un producto, verás:

```
┌─────────────────────────────────────────────────────────────┐
│  DETALLE DEL PRODUCTO                                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌────────────────────┐                                    │
│  │                    │  Nombre: Bombilla LED E27 10W      │
│  │   [IMAGEN]         │  Ref. Fabricante: 929001199123     │
│  │                    │  Marca: Philips                    │
│  │                    │  Familia: Iluminación              │
│  └────────────────────┘  Gama: LED                         │
│                           Tipo: Bombilla                   │
│                                                             │
│  Descripción:                                              │
│  Bombilla LED de alta eficiencia energética...             │
│                                                             │
│  Características técnicas:                                 │
│  • Potencia: 10W                                           │
│  • Tensión: 220-240V                                       │
│  • Flujo luminoso: 806 lm                                  │
│  • Temperatura color: 4000K                                │
│  • Casquillo: E27                                          │
│  • Vida útil: 15000 h                                      │
│                                                             │
│  [← Volver]  [Añadir a presupuesto]  [Ver en web]         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Buscador

También puedes buscar directamente por referencia o nombre:

1. Usa el campo de búsqueda en la parte superior
2. Escribe el nombre o referencia
3. Los resultados aparecerán automáticamente

---

## Añadir a presupuesto

Desde cualquier producto:

1. Haz clic en **"Añadir a presupuesto"**
2. Selecciona la cantidad
3. El producto se añadirá al módulo de Presupuestos

---

## Información técnica por IA

Al abrir la ficha de un producto, el sistema busca automáticamente información técnica adicional mediante inteligencia artificial. Esta información se muestra debajo de la ficha del producto.

```
┌─────────────────────────────────────────────────────────────┐
│  INFORMACIÓN TÉCNICA (IA)                                   │
│                                                             │
│  CARACTERÍSTICAS TÉCNICAS                                   │
│  • Potencia: 10W                                            │
│  • Tensión: 220-240V                                        │
│  • Flujo luminoso: 806 lm                                   │
│  • Temperatura color: 4000K                                 │
│  • Casquillo: E27                                           │
│                                                             │
│  APLICACIONES                                               │
│  • Iluminación general interior                             │
│  • Sustitución de bombillas incandescentes                  │
│  • Instalaciones domésticas y comerciales                   │
│                                                             │
│  NORMAS                                                     │
│  • CE                                                        │
│  • RoHS                                                     │
│                                                             │
│  MANUAL / DOCUMENTACIÓN                                     │
│  https://www.ejemplo.com/manual-producto.pdf                │
│                                                             │
│  💡 Consejo técnico:                                        │
│  Para máximo rendimiento, usa con regulador compatible LED. │
└─────────────────────────────────────────────────────────────┘
```

### Funcionamiento

| Estado | Qué ves |
|--------|---------|
| **Cargando** | Mensaje "Buscando información técnica..." |
| **Completado** | Datos organizados en bloques (características, aplicaciones, normas, manual, consejo) |
| **Sin datos** | Se muestra la descripción básica del producto |
| **Error de IA** | Fallback silencioso — solo ves la ficha sin datos extra |

### Campos que puede incluir

- **Características técnicas**: especificaciones detalladas del producto
- **Aplicaciones**: usos recomendados
- **Normas**: certificaciones y normativas que cumple
- **Manual**: enlace a documentación del fabricante
- **Consejo técnico**: recomendación práctica de instalación o mantenimiento

> La información IA se genera en el momento y es orientativa. Siempre verifica los datos con la documentación oficial del fabricante.

---

## Logos de marcas

El sistema incluye logos de las principales marcas:

- ABB
- Schneider Electric
- Philips
- Siemens
- Legrand
- Mitsubishi
- Y otros 8+

Los logos se muestran automáticamente en las fichas de productos.

---

## atajo de teclado

| Tecla | Acción |
|-------|--------|
| **←** | Volver al nivel anterior |
| **/** | Enfocar buscador |
| **Esc** | Cerrar ficha |

---

## Solución de problemas

### No aparecen productos

- Verifica que has seleccionado familia + marca + gama
- Prueba con otra combinación

### La imagen no carga

- Algunas productos no tienen imagen
- Se mostrará un placeholder

### La búsqueda no funciona

- Usa al menos 3 caracteres
- Busca por referencia o nombre, no por descripción

---

*Manual actualizado: Mayo 2026*
