# Líneas futuras

Las líneas futuras se limitan a trabajo que **no está ya implementado** en el snapshot reconciliado.

## Prioridad alta

### 1. Evidencia reproducible de calidad

- ejecutar build, lint, Vitest y Playwright sobre el commit de entrega;
- conservar resultados y códigos de salida;
- publicar métricas solo cuando estén vinculadas a esa ejecución.

### 2. Validación con usuarios

- sesiones observadas con técnicos/usuarios objetivo;
- registro de tareas, errores y feedback;
- separar satisfacción subjetiva de métricas de usabilidad.

### 3. Seguridad y fiabilidad de IA

- validar de forma estructural todas las respuestas JSON;
- reforzar el tratamiento de errores del gateway para no devolver detalles innecesarios del proveedor;
- incorporar fuentes verificables para consultas normativas/técnicas de alto riesgo;
- definir cuándo la aplicación debe negarse a dar una recomendación no respaldada.

## Prioridad media

### 4. CI reproducible

Añadir o consolidar CI que ejecute build, lint y pruebas en cada cambio relevante. El deploy automático no debe confundirse con una validación completa de calidad.

### 5. Observabilidad

Registrar errores, latencia y fallos de proveedores sin exponer datos sensibles.

### 6. Datos y catálogo

Definir un proceso autorizado y mantenible para actualizar el catálogo, con trazabilidad de procedencia, normalización y controles de calidad.

## Evoluciones opcionales

- PWA/offline más completa;
- TypeScript más estricto;
- internacionalización;
- integraciones empresariales solo con autorización y contrato de datos;
- mejoras de accesibilidad verificadas con auditoría específica.

## Trabajo ya cerrado que no vuelve a figurar como futuro

La migración principal a Supabase y la existencia de pruebas Playwright ya forman parte del repositorio actual, por lo que no se listan como pendientes.

*Líneas futuras reconciliadas — agosto de 2026.*
