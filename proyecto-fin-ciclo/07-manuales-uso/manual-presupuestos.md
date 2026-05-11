# Manual de Usuario: Generador de Presupuestos

## Introducción

El Generador de Presupuestos te permite crear presupuestos profesionales para clientes, usando productos reales del catálogo de Sonepar.

---

## Cómo acceder

1. Inicia sesión en la aplicación
2. En el menú lateral, haz clic en **Presupuestos** (icono de documento con	check)

---

## Interfaz principal

```
┌─────────────────────────────────────────────────────────────┐
│  GENERADOR DE PRESUPUESTOS                          [🌓]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🔍 Buscar producto por nombre o referencia...        [🔍] │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ RESULTADOS DE BÚSQUEDA                             │   │
│  │                                                     │   │
│  │ • ABB - Interruptor iC60N 10A     Ref: AB123456   │   │
│  │   [+] Añadir                                          │   │
│  │                                                     │   │
│  │ • ABB - Interruptor iC60N 16A       Ref: AB123457   │   │
│  │   [+] Añadir                                          │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ─────────────────────────────────────────────────────     │
│                                                             │
│  PRESUPUESTO ACTUAL                                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Producto                    Cant.   P.Unit.  Total  │   │
│  │ ─────────────────────────────────────────────────   │   │
│  │ ABB iC60N 10A                 10     25,00   250,00 │   │
│  │ ABB iC60N 16A                 5      28,00   140,00 │   │
│  │                                                     │   │
│  │                                    Subtotal: 390,00 │   │
│  │                                    IVA (21%): 81,90 │   │
│  │                                    ──────────────   │   │
│  │                                    TOTAL: 471,90 €  │   │
│  │                                                     │   │
│  │ [🗑️ Vaciar]  [📋 Copiar]  [💾 Guardar]              │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Cómo crear un presupuesto

### Paso 1: Buscar productos

1. Escribe en el campo de búsqueda
2. Usa nombre o referencia del fabricante
3. Los resultados aparecerán automáticamente

### Paso 2: Añadir productos

1. Haz clic en **"+"** junto al producto
2. Se abrirá un diálogo para especificar cantidad
3. Confirma y el producto se añadirá

### Paso 3: Ajustar cantidades

- Haz clic en la cantidad para modificarla
- Usa los botones + / - para ajustar

### Paso 4: Calcular total

- El sistema calcula automáticamente:
  - Subtotal
  - IVA (21%)
  - Total

---

## Funciones adicionales

### Añadir desde Fichas Técnicas

Desde el módulo de Fichas Técnicas:

1. Busca un producto
2. Haz clic en **"Añadir a presupuesto"**
3. Serás redirigido a Presupuestos con el producto añadido

### Añadir desde SONEX

Desde el asistente SONEX:

1. Pregunta sobre un producto
2. Cuando detecte una referencia, haz clic en **"Ver ficha"**
3. Desde la ficha, añade a presupuesto

---

## Exportar presupuesto

### Copiar al portapapeles

1. Haz clic en **"Copiar"**
2. El presupuesto se copiará en formato texto
3. Pega en WhatsApp, email, etc.

### Ejemplo de formato copiado

```
PRESUPUESTO
===========
Producto                    Cant.   P.Unit.   Total
──────────────────────────────────────────────────
ABB iC60N 10A               10      25,00 €   250,00 €
ABB iC60N 16A               5       28,00 €   140,00 €
──────────────────────────────────────────────────
                           Subtotal:   390,00 €
                           IVA (21%):   81,90 €
                           TOTAL:      471,90 €
```

---

## Guardar presupuesto

1. Haz clic en **"Guardar"**
2. El presupuesto se almacenará en tu perfil
3. Podrás recuperarlo más tarde

### Recuperar presupuesto guardado

1. Busca la sección "Presupuestos guardados"
2. Selecciona el presupuesto
3. Se cargará en el editor

---

## Vaciar presupuesto

Para empezar de cero:

1. Haz clic en **"Vaciar"**
2. Confirma la acción
3. Se borrarán todos los productos

---

## Cálculos automáticos

| Concepto | Cálculo |
|----------|---------|
| Subtotal | Σ (cantidad × precio unitario) |
| IVA | Subtotal × 0.21 |
| Total | Subtotal + IVA |

---

## atajo de teclado

| Tecla | Acción |
|-------|--------|
| **Ctrl + B** | Enfocar buscador |
| **Ctrl + C** | Copiar presupuesto |
| **Ctrl + N** | Nuevo presupuesto |
| **Esc** | Cancelar acción |

---

## Solución de problemas

### No encuentro el producto

- Verifica la ortografía
- Prueba solo la referencia
- Prueba solo el nombre

### El precio aparece como "Consultar"

- Algunos productos no tienen precio definido
- Contacta con Sonepar para pricing

---

*Manual actualizado: Mayo 2026*
