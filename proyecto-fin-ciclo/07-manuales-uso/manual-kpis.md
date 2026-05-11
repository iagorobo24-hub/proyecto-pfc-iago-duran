# Manual de Usuario: Dashboard de KPIs

## Introducción

El Dashboard de KPIs te permite visualizar los indicadores clave de rendimiento logístico de un almacén de material eléctrico. Cada KPI incluye un semáforo que indica si está dentro, cerca o fuera del objetivo.

---

## Cómo acceder

1. Inicia sesión en la aplicación
2. En el menú lateral, haz clic en **KPIs** (icono de gráfico)

---

## Los 6 KPIs principales

| # | KPI | Descripción | Objetivo |
|---|-----|-------------|----------|
| 1 | **Rotación de inventario** | Veces que se renueva el stock | > 4/año |
| 2 | **Tiempo medio de preparación** | Minutos por pedido | < 30 min |
| 3 | **Tasa de disponibilidad** | % productos disponibles | > 95% |
| 4 | **Pedidos perfectos** | % pedidos sin errores | > 98% |
| 5 | **Valor en almacén** | Valor total del stock | Según capacidad |
| 6 | **Incidencias por familia** | Incidencias registradas | < 5% |

---

## Interfaz del dashboard

```
┌─────────────────────────────────────────────────────────────┐
│  DASHBOARD DE KPIs LOGÍSTICOS                        [🌓]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 1. ROTACIÓN DE INVENTARIO                   🟢 OK   │   │
│  │                                                     │   │
│  │    Valor: 5.2 veces/año                            │   │
│  │    Objetivo: > 4 veces/año                         │   │
│  │    ─────────────────────────────────────            │   │
│  │    ████████████████████░░░░░░░ 75%                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 2. TIEMPO MEDIO DE PREPARACIÓN              🟡 WARN │   │
│  │                                                     │   │
│  │    Valor: 28 minutos                               │   │
│  │    Objetivo: < 30 minutos                          │   │
│  │    ─────────────────────────────────────            │   │
│  │    ████████████████████████░░░░ 95%                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 3. TASA DE DISPONIBILIDAD                   🔴 LOW  │   │
│  │                                                     │   │
│  │    Valor: 87%                                      │   │
│  │    Objetivo: > 95%                                 │   │
│  │    ─────────────────────────────────────            │   │
│  │    ██████████████████░░░░░░░░░░░░ 87%               │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ...                                                        │
│                                                             │
│  [📥 Exportar informe]                                     │
└─────────────────────────────────────────────────────────────┘
```

---

## Semáforo

| Color | Significado | Acción recomendada |
|-------|-------------|-------------------|
| 🟢 **Verde** | Dentro del objetivo | Mantener |
| 🟡 **Amarillo** | Cerca del límite | Monitorizar |
| 🔴 **Rojo** | Por debajo del objetivo | Actuar |

### Cómo se calcula

```
VERDE:   valor >= objetivo × 1.0
AMARILLO: valor >= objetivo × 0.8 Y valor < objetivo × 1.0
ROJO:    valor < objetivo × 0.8
```

---

## Detalle de cada KPI

### 1. Rotación de inventario

**Fórmula:** `(Ventas anuales) / (Stock medio)`

**Interpretación:**
- > 6: Excelente (producto muy demandado)
- 4-6: Bueno
- 2-4: Aceptable
- < 2: Bajo (producto parado)

### 2. Tiempo medio de preparación

**Fórmula:** `Σ(tiempo de cada pedido) / N pedidos`

**Interpretación:**
- < 15 min: Excelente
- 15-30 min: Bueno
- 30-45 min: Aceptable
- > 45 min: Mejorar procesos

### 3. Tasa de disponibilidad

**Fórmula:** `(Productos disponibles / Total productos) × 100`

**Interpretación:**
- > 98%: Excelente
- 95-98%: Bueno
- 90-95%: Aceptable
- < 90%: Crítico

### 4. Pedidos perfectos

**Fórmula:** `(Pedidos sin errores / Total pedidos) × 100`

**Interpretación:**
- > 99%: Excelente
- 98-99%: Bueno
- 95-98%: Aceptable
- < 95%: Mejorar calidad

### 5. Valor en almacén

**Fórmula:** `Σ(productos × precio unitario)`

**Interpretación:**
- Depende de la capacidad del almacén
- Objetivo: optimizar sin excesso

### 6. Incidencias por familia

**Fórmula:** `(Incidencias por familia / Total incidencias) × 100`

**Interpretación:**
- < 2%: Excelente
- 2-5%: Bueno
- 5-10%: Aceptable
- > 10%: Analizar causas

---

## Exportar informe

1. Haz clic en **"Exportar informe"**
2. Se generará un resumen en texto

### Ejemplo de informe

```
========================================
  INFORME DE KPIs LOGÍSTICOS
  Fecha: 15/05/2026
========================================

1. ROTACIÓN DE INVENTARIO
   Valor: 5.2/año | Objetivo: >4 | Estado: 🟢 OK

2. TIEMPO MEDIO DE PREPARACIÓN
   Valor: 28 min | Objetivo: <30 | Estado: 🟡 WARN

3. TASA DE DISPONIBILIDAD
   Valor: 87% | Objetivo: >95% | Estado: 🔴 LOW

4. PEDIDOS PERFECTOS
   Valor: 97% | Objetivo: >98% | Estado: 🟡 WARN

5. VALOR EN ALMACÉN
   Valor: 125.000€ | Estado: ✓

6. INCIDENCIAS POR FAMILIA
   Valor: 4% | Objetivo: <5% | Estado: 🟢 OK

========================================
  RESUMEN: 2 OK, 2 WARN, 1 LOW
  ACCIÓN: Revisar disponibilidad y pedidos
========================================
```

---

## atajo de teclado

| Tecla | Acción |
|-------|--------|
| **E** | Exportar informe |
| **R** | Recalcular |
| **1-6** | Ir al KPI específico |

---

## Solución de problemas

### Los valores no se actualizan

- Los KPIs se calculan con datos simulados
- Recarga la página

### Los colores no coinciden con expectativas

- Los umbrales pueden estar configurados
- Consulta con el administrador

---

*Manual actualizado: Mayo 2026*
