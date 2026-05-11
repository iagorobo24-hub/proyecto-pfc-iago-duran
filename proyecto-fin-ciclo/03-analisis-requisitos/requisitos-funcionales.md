# Requisitos Funcionales

## Definición

Los requisitos funcionales describen **qué debe hacer el sistema** desde la perspectiva del usuario. Cada requisito está vinculado a un módulo de la aplicación.

---

## RF-01: Autenticación de usuarios

**Módulo:** Login
**Prioridad:** Alta

### RF-01.1
> El sistema debe permitir autenticación con cuenta Google

- Botón "Iniciar sesión con Google"
- Redirección a Google OAuth
- Sesión persistente (recordar usuario)

### RF-01.2
> El sistema debe permitir cerrar sesión

- Botón de logout en la interfaz
- Cierre de sesión en Firebase Auth
- Redirección a página de login

### RF-01.3
> El sistema debe proteger todas las rutas excepto login

- Middleware de rutas protegidas
- Redirección a login si no autenticado

---

## RF-02: Catálogo de fichas técnicas

**Módulo:** Fichas Técnicas
**Prioridad:** Alta

### RF-02.1
> El usuario debe poder navegar por familias de productos

- Listado de familias (iluminación, cableado, automatización...)
- Filtrado por familia

### RF-02.2
> El usuario debe poder filtrar por marca

- Listado de marcas disponibles
- Filtrado por marca dentro de familia

### RF-02.3
> El usuario debe poder filtrar por gama/tipo

- Listado de gamas dentro de marca
- Filtrado por gama

### RF-02.4
> El usuario debe poder ver los productos de una gama

- Listado de referencias con imagen, nombre, referencia
- Información básica visible

### RF-02.5
> El usuario debe poder ver el detalle de un producto

- Ficha completa con todas las especificaciones técnicas
- Imagen del producto
- Referencia del fabricante
- Enlace a web del fabricante

---

## RF-03: Simulador de almacén

**Módulo:** Almacén
**Prioridad:** Media

### RF-03.1
> El usuario debe poder simular recepción de pedido

- Formulario de productos solicitados
- Confirmación de recepción

### RF-03.2
> El usuario debe poder simular almacenamiento

- Asignación de ubicación en almacén
- Validación de capacidad

### RF-03.3
> El usuario debe poder simular preparación de pedido

- Selección de productos del inventario
- Cálculo de disponibilidad

### RF-03.4
> El usuario debe poder simular expedición

- Generación de albarán
- Registro de salida

---

## RF-04: Dashboard de incidencias

**Módulo:** Incidencias
**Prioridad:** Media

### RF-04.1
> El usuario debe poder registrar una incidencia

- Formulario: título, descripción, categoría, severidad
- Timestamp automático

### RF-04.2
> El usuario debe poder categorizar incidencias

- Categorías predefinidas (producto, logística, calidad...)
- Niveles de severidad (bajo, medio, alto, crítico)

### RF-04.3
> El usuario debe poder ver el historial de incidencias

- Listado ordenable por fecha
- Filtrado por estado (abierta/cerrada)

### RF-04.4
> El usuario debe poder actualizar el estado de una incidencia

- Cambiar deabierta a en proceso a resuelta

---

## RF-05: KPIs logísticos

**Módulo:** KPI
**Prioridad:** Media

### RF-05.1
> El usuario debe poder ver 6 KPIs principales

- Rotación de inventario
- Tiempo medio de preparación
- Tasa de disponibilidad
- Pedidos perfectos
- Valor en almacén
- Incidencias por familia

### RF-05.2
> Cada KPI debe mostrar estado con semáforo

- Verde: dentro de objetivo
- Amarillo: cerca del límite
- Rojo: fuera de objetivo

### RF-05.3
> El usuario debe poder exportar informe

- Generación de informe en formato texto

---

## RF-06: Generador de presupuestos

**Módulo:** Presupuestos
**Prioridad:** Alta

### RF-06.1
> El usuario debe poder buscar productos

- Buscador por nombre o referencia
- Resultados en tiempo real

### RF-06.2
> El usuario debe poder añadir productos al presupuesto

- Selección de cantidad
- Acumulación en lista

### RF-06.3
> El sistema debe calcular subtotal, IVA y total

- Cálculo automático con IVA 21%
- Actualización en tiempo real

### RF-06.4
> El usuario debe poder generar presupuesto formateado

- Vista previa del presupuesto
- Exportable/copiable

---

## RF-07: Gestión de formación

**Módulo:** Formación
**Prioridad:** Baja

### RF-07.1
> El usuario debe poder ver la matriz de competencias

- Listado de empleados
- Listado de cursos
- Estado de completado/no completado

### RF-07.2
> El usuario debe poder registrar formación completada

- Selección de empleado y curso
- Fecha de completion

---

## RF-08: Asistente técnico (SONEX)

**Módulo:** SONEX
**Prioridad:** Alta

### RF-08.1
> El usuario debe poder hacer preguntas en lenguaje natural

- Input de texto libre
- Envío de mensaje

### RF-08.2
> El sistema debe responder con información técnica

- Respuestas basadas en contexto de productos
- Procesamiento de Markdown

### RF-08.3
> El sistema debe detectar referencias de productos

- Identificación de referencias en respuestas
- Enlace a fichas técnicas

### RF-08.4
> El usuario debe poder exportar conversación

- Exportar a PDF

---

## Resumen deprioridades

| Prioridad | Módulos | Requisitos |
|-----------|---------|------------|
| **Alta** | Login, Fichas, Presupuestos, SONEX | 12 RFs |
| **Media** | Almacén, Incidencias, KPI | 8 RFs |
| **Baja** | Formación | 2 RFs |

---

*Requisitos funcionales documentados: Abril 2026*
*Validados contra entrevistas: Mayo 2026*
