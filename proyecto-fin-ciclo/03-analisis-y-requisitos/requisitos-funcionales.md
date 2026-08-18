# Requisitos funcionales

## Convención

Para evitar el antiguo problema de conteo, esta memoria define **8 grupos de requisitos funcionales (RF-01 a RF-08)**. Los identificadores `RF-x.y` son capacidades o criterios de aceptación dentro del grupo; no se suman como “RF independientes” en otras secciones.

## RF-01 — Autenticación

**Prioridad:** alta.

- RF-01.1: iniciar sesión mediante el proveedor configurado en Supabase Auth.
- RF-01.2: cerrar sesión.
- RF-01.3: impedir el acceso anónimo al área `/app/*` mediante `ProtectedRoute`.

## RF-02 — Fichas Técnicas

**Prioridad:** alta.

- RF-02.1: obtener familias/categorías desde el catálogo.
- RF-02.2: filtrar por marca.
- RF-02.3: navegar por subfamilia/tipo y, cuando existan, gama y subgama comercial.
- RF-02.4: listar productos resultantes.
- RF-02.5: buscar por texto o referencia y abrir el detalle.
- RF-02.6: mostrar información de catálogo y permitir enriquecimiento asistido por IA sin sustituir la fuente original.

## RF-03 — Simulador de Almacén

**Prioridad:** media.

- RF-03.1: crear/seleccionar perfil de operario.
- RF-03.2: ejecutar las cinco etapas: Recepción, Ubicación, Picking, Verificación y Expedición.
- RF-03.3: medir tiempos y comparar con estándares de simulación.
- RF-03.4: presentar incidencias interactivas y calcular puntuación.
- RF-03.5: conservar historial y admitir modo entrenamiento/evaluación.
- RF-03.6: admitir el flujo multijugador implementado cuando la conectividad lo permita.

## RF-04 — Incidencias

**Prioridad:** media.

- RF-04.1: registrar equipo, zona, operario, síntoma y severidad.
- RF-04.2: filtrar por estado y severidad.
- RF-04.3: cambiar el estado y guardar observaciones.
- RF-04.4: generar un diagnóstico asistido por IA.
- RF-04.5: señalar incidencias críticas abiertas durante más de dos horas.
- RF-04.6: exportar un resumen PDF.

## RF-05 — KPI Logístico

**Prioridad:** media.

- RF-05.1: capturar datos de un turno.
- RF-05.2: calcular seis KPIs: pedidos/hora, error de picking, tiempo de ciclo, ocupación, devoluciones y productividad.
- RF-05.3: clasificar cada KPI mediante semáforo.
- RF-05.4: guardar histórico y representar comparativas/gráficos.
- RF-05.5: generar un comentario asistido por IA y exportar PDF.

## RF-06 — Presupuestos

**Prioridad:** alta.

- RF-06.1: iniciar un presupuesto y seleccionar productos del catálogo.
- RF-06.2: editar líneas y cantidades.
- RF-06.3: calcular subtotal, IVA y total.
- RF-06.4: guardar/recuperar presupuestos según el flujo implementado.
- RF-06.5: generar una salida PDF.

## RF-07 — Formación Interna

**Prioridad:** baja/media.

- RF-07.1: gestionar empleados y módulos de formación.
- RF-07.2: registrar progreso `pendiente`, `en_curso` o `completado`.
- RF-07.3: calcular progreso individual/global y alertar por obligatorios pendientes.
- RF-07.4: generar un plan de desarrollo asistido por IA.

## RF-08 — SONEX

**Prioridad:** alta.

- RF-08.1: mantener sesiones de conversación y aceptar preguntas en lenguaje natural.
- RF-08.2: ofrecer cuatro modos actuales: Búsqueda, Comparativa, Asistencia y Formación.
- RF-08.3: usar contexto del catálogo para consultas de producto cuando esté disponible.
- RF-08.4: mostrar resultados de catálogo y validar referencias antes de enlazarlas a Fichas/Presupuestos.
- RF-08.5: conservar historial según la persistencia implementada.

SONEX **no incluye actualmente un requisito de exportación de conversación a PDF**; esa afirmación se elimina de los manuales.

## Validación

Los requisitos se originaron en observación, necesidades detectadas y decisiones del propio PFC. Esto no equivale a afirmar que todo el producto haya sido validado masivamente con usuarios reales. La validación externa fue limitada y se reconoce como tal en resultados y conclusiones.

*Requisitos reconciliados con el código auditado en agosto de 2026.*
