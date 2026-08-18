# Guion de defensa — versión reconciliada

Duración orientativa: 12-15 minutos.

## Apertura — 45 s

Presentar el PFC como una suite académica de siete herramientas más un Dashboard Global. Explicar desde el principio que el objetivo no es vender una aplicación empresarial terminada, sino mostrar desarrollo técnico y una metodología de trabajo con IA verificable.

## Problema y alcance — 1 min

Describir necesidades observadas en catálogo, logística, incidencias, indicadores, presupuestos, formación y asistencia técnica. Aclarar que no hubo integración oficial con ERP/SAP.

## Requisitos — 1 min

Explicar que la documentación se organiza en ocho grupos funcionales. Evitar recitar números antiguos de subrequisitos. Destacar que rendimiento, disponibilidad o cobertura solo se consideran demostrados cuando hay medición.

## Arquitectura — 1 min 30 s

Explicar SPA React/Vite, rutas protegidas, Supabase, persistencia y gateway serverless. Mencionar Firebase como etapa histórica de la evolución y la migración posterior.

## Metodología con IA — 1 min 30 s

Exponer el ciclo: definir, pedir/implementar, inspeccionar, probar, contrastar y documentar. Contar un ejemplo donde una salida de IA parecía válida pero necesitó revisión. Subrayar que un prompt no garantiza exactitud.

## Demo de módulos — 4 min

- Fichas: localizar una referencia y abrir ficha.
- Almacén: mostrar las cinco etapas y una incidencia.
- Incidencias: crear/filtrar y enseñar diagnóstico como ayuda orientativa.
- KPI: introducir datos y enseñar los seis indicadores actuales.
- Presupuestos: añadir un producto y mostrar total/PDF.
- Formación: progreso y plan IA.
- SONEX: explicar los cuatro modos y una tarjeta de catálogo validada.

No es necesario demostrar cada botón; elegir los flujos que mejor prueben integración.

## Calidad y seguridad — 1 min 30 s

Mostrar que existen Vitest y Playwright y explicar cómo se ejecutarían sobre el commit de defensa. Si se dispone de un resultado fresco, presentar ese log; si no, decir que las suites existen pero no afirmar un número verde.

Explicar proxy de API, CORS, rate limit y CSP. Reconocer el límite: la IA no sustituye normativa/fabricante.

## Resultados y límites — 1 min

Destacar la integración del producto y la documentación del proceso. Reconocer validación limitada con usuarios y ausencia de integración empresarial oficial. No usar cifras de catálogo, Lighthouse o coste que no estén medidas ese día.

## Cierre — 45 s

Idea final: la IA fue útil porque se combinó con criterio, Git, pruebas y revisión. El aprendizaje transferible es saber convertir una herramienta generativa en un proceso técnico auditable.
