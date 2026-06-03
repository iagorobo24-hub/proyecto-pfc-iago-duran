# 🔍 Auditoría Modo Oscuro - Proyecto PFC

## 📊 Resumen Ejecutivo

**Problema principal:** Las variables de color no están correctamente implementadas para modo oscuro. Se usa `var(--white)` que no cambia en dark mode.

**Solución:** Reemplazar `--white` por `--color-surface` y `--color-bg`, y añadir selectores dark para cada componente.

---

## 🎯 Problemas Detectados por Módulo

### 1. **FichasTecnicas.module.css** (6 usos de --white)
- [ ] Línea 18: `background: var(--white)` → `background: var(--color-surface)`
- [ ] Línea 97: `background: var(--white)` → `background: var(--color-surface)`
- [ ] Línea 119: `background: var(--white)` → `background: var(--color-surface)`
- [ ] Línea 214: `background: var(--white)` → `background: var(--color-surface)`
- [ ] Línea 269: `background: var(--white)` → `background: var(--color-surface)`
- [ ] Línea 610: `background: var(--white)` → `background: var(--color-surface)`

**Selector dark existente:** Línea 663 `:global([data-theme="dark"]) .main`
**Falta:** Selectores dark para `.sidebar`, `.tarjeta`, `.sugerencias`, etc.

---

### 2. **Presupuestos.module.css** (16 usos de --white + 3 white hardcodeado)
- [ ] Línea 6: `background: var(--white)` → `background: var(--color-surface)`
- [ ] Línea 28: `background: var(--white)` → `background: var(--color-surface)`
- [ ] Línea 89: `background: var(--white)` → `background: var(--color-surface)`
- [ ] Línea 110: `background: var(--white)` → `background: var(--color-surface)`
- [ ] Línea 130: `linear-gradient(135deg, var(--blue-50), var(--white))` → `linear-gradient(135deg, var(--blue-100), var(--color-surface))`
- [ ] Línea 183: `background: var(--white)` → `background: var(--color-surface)`
- [ ] Línea 227: `background: var(--white)` → `background: var(--color-surface)`
- [ ] Línea 241: `background: var(--white)` → `background: var(--color-surface)`
- [ ] Línea 307: `background: var(--white)` → `background: var(--color-surface)`
- [ ] Línea 324: `background: var(--white)` → `background: var(--color-surface)`
- [ ] Línea 394: `background: var(--white)` → `background: var(--color-surface)`
- [ ] Línea 431: `background: var(--white)` → `background: var(--color-surface)`
- [ ] Línea 513: `background: var(--white)` → `background: var(--color-surface)`
- [ ] **Línea 642:** `background: white !important` → `background: var(--color-surface) !important`
- [ ] **Línea 647:** `background: white` → `background: var(--color-surface)`
- [ ] **Línea 657:** `background: white` → `background: var(--color-surface)`

**Selector dark existente:** Línea 661 `:global([data-theme="dark"]) .main`
**Falta:** Selectores para `.toolbar`, `.historial`, `.modal`, etc.

---

### 3. **SimuladorAlmacen.module.css** (7 usos de --white)
- [ ] Línea 15: `background: var(--white)` → `background: var(--color-surface)`
- [ ] Línea 58: `background: var(--white)` → `background: var(--color-surface)`
- [ ] Línea 167: `background: var(--white)` → `background: var(--color-surface)`
- [ ] Línea 223: `background: var(--white)` → `background: var(--color-surface)`
- [ ] Línea 299: `background: var(--white)` → `background: var(--color-surface)`
- [ ] Línea 367: `background: var(--white)` → `background: var(--color-surface)`

**Selector dark existente:** Línea 469 `:global([data-theme="dark"]) .main`
**Falta:** Selectores para `.ubicacion`, `.producto`, `.panel`, etc.

---

### 4. **Sonex.module.css** (5 usos de --white)
- [ ] Línea 13: `background: var(--white)` → `background: var(--color-surface)`
- [ ] Línea 112: `background: var(--white)` → `background: var(--color-surface)`
- [ ] Línea 302: `background: var(--white)` → `background: var(--color-surface)`
- [ ] Línea 371: `background: var(--white)` → `background: var(--color-surface)`
- [ ] Línea 407: `background: var(--white)` → `background: var(--color-surface)`

**Selectores dark existentes:**
- Línea 300: `:global([data-theme="dark"]) .chatContainer`
- Línea 303: `:global([data-theme="dark"]) .chatInput`
**Falta:** Selectores para `.message`, `.bubble`, `.input`, etc.

---

### 5. **DashboardIncidencias.module.css** (6 usos de --white)
- [ ] Línea 15: `background: var(--white)` → `background: var(--color-surface)`
- [ ] Línea 38: `background: var(--white)` → `background: var(--color-surface)`
- [ ] Línea 98: `background: var(--white)` → `background: var(--color-surface)`
- [ ] Línea 227: `background: var(--white)` → `background: var(--color-surface)`
- [ ] Línea 331: `background: var(--white)` → `background: var(--color-surface)`
- [ ] Línea 424: `background: var(--white)` → `background: var(--color-surface)`

**Selector dark existente:** Línea 538 `:global([data-theme="dark"]) .main`
**Falta:** Selectores para `.incidencia-card`, `.grafico`, `.panel`, etc.

---

### 6. **FormacionInterna.module.css** (7 usos de --white)
- [ ] Línea 6: `background: var(--white)` → `background: var(--color-surface)`
- [ ] Línea 15: `background: var(--white)` → `background: var(--color-surface)`
- [ ] Línea 27: `background: var(--white)` → `background: var(--color-surface)`
- [ ] Línea 47: `background: var(--white)` → `background: var(--color-surface)`
- [ ] Línea 94: `background: var(--white)` → `background: var(--color-surface)`
- [ ] Línea 104: `background: var(--white)` → `background: var(--color-surface)`

**Selector dark existente:** Línea 169 `:global([data-theme="dark"]) .main`
**Falta:** Selectores para `.kpi`, `.empleado`, `.modulo`, `.form`, etc.

---

### 7. **KpiLogistico.module.css** (4 usos de --white)
- [ ] Línea 6: `background: var(--white)` → `background: var(--color-surface)`
- [ ] Línea 99: `background: var(--white)` → `background: var(--color-surface)`
- [ ] Línea 125: `background: var(--white)` → `background: var(--color-surface)`
- [ ] Línea 193: `background: var(--white)` → `background: var(--color-surface)`

**Selector dark existente:** Línea 295 `:global([data-theme="dark"]) .main`
**Falta:** Selectores para `.kpi-card`, `.grafico`, `.semáforo`, etc.

---

## 🛠️ Plan de Acción

### Fase 1: Reemplazo de Variables (CRÍTICO)
Reemplazar TODOS los `var(--white)` por `var(--color-surface)` en los 7 módulos.

**Por qué:** `--white` es hardcoded a `#ffffff` y no cambia en dark mode. `--color-surface` sí cambia automáticamente.

### Fase 2: Eliminar Colores Hardcodeados (CRÍTICO)
Eliminar `background: white` y reemplazar por `var(--color-surface)`.

**Archivos afectados:**
- Presupuestos.module.css (líneas 642, 647, 657)

### Fase 3: Completar Selectores Dark Mode
Cada módulo necesita selectores `:global([data-theme="dark"])` para:
- Cards principales
- Paneles laterales
- Modales / Diálogos
- Inputs / Textareas
- Tablas / Listas
- Botones secundarios

### Fase 4: Revisar Gradientes
Algunos gradientes usan `var(--blue-50)` que en dark mode es muy oscuro.
- Revisar: `linear-gradient(135deg, var(--blue-50), var(--white))`
- Cambiar a: `linear-gradient(135deg, var(--blue-100), var(--color-surface))`

---

## 📋 Checklist por Archivo

### FichasTecnicas.module.css
- [ ] Reemplazar 6x `var(--white)` → `var(--color-surface)`
- [ ] Añadir selector dark para `.sidebar`
- [ ] Añadir selector dark para `.tarjeta`
- [ ] Añadir selector dark para `.sugerencias`
- [ ] Añadir selector dark para `.buscador`

### Presupuestos.module.css
- [ ] Reemplazar 16x `var(--white)` → `var(--color-surface)`
- [ ] Eliminar 3x `background: white` hardcodeado
- [ ] Añadir selector dark para `.toolbar`
- [ ] Añadir selector dark para `.historial`
- [ ] Añadir selector dark para `.modal`
- [ ] Revisar gradiente línea 130

### SimuladorAlmacen.module.css
- [ ] Reemplazar 7x `var(--white)` → `var(--color-surface)`
- [ ] Añadir selector dark para `.ubicacion`
- [ ] Añadir selector dark para `.panel`
- [ ] Añadir selector dark para `.producto-card`

### Sonex.module.css
- [ ] Reemplazar 5x `var(--white)` → `var(--color-surface)`
- [ ] Añadir selector dark para `.message`
- [ ] Añadir selector dark para `.message__bubble`
- [ ] Añadir selector dark para `.input`

### DashboardIncidencias.module.css
- [ ] Reemplazar 6x `var(--white)` → `var(--color-surface)`
- [ ] Añadir selector dark para `.incidencia-card`
- [ ] Añadir selector dark para `.grafico`
- [ ] Añadir selector dark para `.panel`

### FormacionInterna.module.css
- [ ] Reemplazar 7x `var(--white)` → `var(--color-surface)`
- [ ] Añadir selector dark para `.kpi`
- [ ] Añadir selector dark para `.empleado`
- [ ] Añadir selector dark para `.modulo`
- [ ] Añadir selector dark para `.form`

### KpiLogistico.module.css
- [ ] Reemplazar 4x `var(--white)` → `var(--color-surface)`
- [ ] Añadir selector dark para `.kpi-card`
- [ ] Añadir selector dark para `.grafico`
- [ ] Añadir selector dark para `.semáforo`

---

## 🎨 Variables Recomendadas

| En vez de | Usar | Razón |
|-----------|------|--------|
| `var(--white)` | `var(--color-surface)` | Cambia en dark mode |
| `var(--gray-50)` | `var(--color-bg)` | Fondo principal |
| `var(--gray-100)` | `var(--color-border)` | Bordes |
| `background: white` | `var(--color-surface)` | Nunca hardcodear |
| `var(--blue-50)` | `var(--blue-100)` | Más contraste en dark |

---

## ✅ Criterios de Aceptación

1. **Todas las cards** cambian de color en modo oscuro
2. **Texto siempre legible** sobre el fondo
3. **Bordes sutiles** pero visibles en ambos modos
4. **Sin colores hardcodeados** (white, #fff, #000, etc.)
5. **Gradientes revisados** para ambos modos
6. **Inputs y selects** con fondo correcto
7. **Hover states** visibles en ambos modos

---

## 🔧 Ejemplo de Implementación

### ANTES (incorrecto):
```css
.card {
  background: var(--white);
  border: 1px solid var(--gray-100);
  color: var(--gray-800);
}
```

### DESPUÉS (correcto):
```css
.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  color: var(--color-text);
}

/* Opcional: ajustes específicos para dark mode */
:global([data-theme="dark"]) .card {
  border-color: var(--color-border-light);
  box-shadow: var(--shadow-md);
}
```

---

**Fecha de auditoría:** 2026-05-25  
**Archivos auditados:** 7 módulos  
**Total incidencias:** 51 variables + 3 hardcodeados + 35 selectores dark faltantes
