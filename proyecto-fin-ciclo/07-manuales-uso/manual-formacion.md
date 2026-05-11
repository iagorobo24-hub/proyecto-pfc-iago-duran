# Manual de Usuario: Gestión de Formación

## Introducción

El módulo de Formación permite gestionar la matriz de competencias de los empleados y crear planes de formación personalizados.

---

## Cómo acceder

1. Inicia sesión en la aplicación
2. En el menú lateral, haz clic en **Formación** (icono de graduación)

---

## Funcionalidades principales

| Función | Descripción |
|---------|-------------|
| **Matriz de competencias** | Ver qué empleados han completado qué cursos |
| **Registrar formación** | Marcar un curso como completado |
| **Plan de formación** | Ver cursos recomendados para un empleado |

---

## Interfaz: Matriz de competencias

```
┌─────────────────────────────────────────────────────────────┐
│  GESTIÓN DE FORMACIÓN                                [🌓]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  FILTROS:                                                   │
│  [Todos los empleados ▼]  [Todos los cursos ▼]  [Buscar]  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ MATRIZ DE COMPETENCIAS                                │ │
│  │                                                       │ │
│  │ Empleado          │ CURSO 1 │ CURSO 2 │ CURSO 3 │ ... │ │
│  │ ─────────────────────────────────────────────────────│ │
│  │ Juan Pérez        │   ✓     │    ✓    │    -    │     │ │
│  │ María García      │   ✓     │    -    │    ✓    │     │ │
│  │ Carlos López      │   -     │    -    │    -    │     │ │
│  │ Ana Martínez      │   ✓     │    ✓    │    ✓    │     │ │
│  │                                                       │ │
│  │ Leyenda: ✓ Completado  - No realizado  ⏳ En curso   │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  [+ Registrar nueva formación]  [Ver plan personalizado]  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Cómo usar

### Ver la matriz

1. Selecciona un empleado del filtro (o "Todos")
2. Selecciona un curso del filtro (o "Todos")
3. La matriz mostrará el estado correspondiente

### Símbolos

| Símbolo | Significado |
|---------|-------------|
| ✅ | Completado |
| ⏳ | En curso |
| ❌ | No realizado |

---

## Registrar formación

### Paso 1: Abrir formulario

1. Haz clic en **"+ Registrar nueva formación"**
2. Se abrirá el formulario

### Paso 2: Completar datos

```
Datos de la formación:
───────────────────────
Empleado: [Juan Pérez        ▼]
Curso:    [Protecciones Eléctricas ▼]
Fecha de inicio: [15/04/2026]
Fecha de fin:    [20/04/2026]
Nota obtained:  [85]

Estado:
(○) No iniciado
(●) En curso
(○) Completado

[Cancelar]  [Guardar]
```

### Paso 3: Confirmar

1. Revisa los datos
2. Haz clic en **"Guardar"**
3. La matriz se actualizará

---

## Plan de formación personalizado

### Para qué sirve

Ver qué cursos le faltan a un empleado para estar completamente formado.

### Cómo acceder

1. Selecciona un empleado
2. Haz clic en **"Ver plan personalizado"**

### Ejemplo de plan

```
PLAN DE FORMACIÓN: Carlos López
─────────────────────────────────────────

❌ PRIORIDAD ALTA:
   • Prevención de riesgos laborales (REBT)
   • Primeros auxilios
   • Manipulación de equipos de alta tensión

⏳ PRIORIDAD MEDIA:
   • Instalaciones fotovoltaicas
   • Domótica básica

✓ COMPLETADOS:
   • Manipulación de herramientas básicas
   • Seguridad en instalaciones eléctricas

─────────────────────────────────────────
Progreso: 1/4 cursos completados (25%)
```

---

## Cursos disponibles

| Curso | Duración | Obligatorio |
|-------|----------|-------------|
| REBT - Nied voltage | 8h | Sí |
| REBT - High voltage | 16h | No |
| PRL (Prevención) | 20h | Sí |
| Primeros auxilios | 12h | Sí |
| Instalaciones fotovoltaicas | 24h | No |
| Domótica | 16h | No |
| PLCs básicos | 20h | No |
| Automatización industrial | 24h | No |

---

## atajo de teclado

| Tecla | Acción |
|-------|--------|
| **N** | Nueva formación |
| **F** | Buscar empleado |
| **P** | Ver plan personalizado |

---

## Solución de problemas

### No aparecen empleados

- Verifica que tienes datos en el sistema
- Consulta con el administrador

### No puedo guardar

- Revisa que todos los campos obligatorios estén completos
- Verifica las fechas (inicio < fin)

---

*Manual actualizado: Mayo 2026*
