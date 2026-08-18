# Presentación del proyecto

## Resumen

El PFC desarrolla una suite web para explorar necesidades del sector eléctrico y logístico mediante una aplicación React apoyada por servicios de IA. El resultado actual integra **7 herramientas funcionales + un Dashboard Global**, autenticación, persistencia, catálogo, generación de documentos y automatización de pruebas.

## Problema abordado

Durante el análisis se identificaron tareas susceptibles de digitalización o apoyo: consulta de producto, entrenamiento logístico, registro de incidencias, seguimiento de KPIs, elaboración de presupuestos, formación y asistencia técnica. El proyecto construye prototipos funcionales alrededor de esas necesidades sin afirmar integración oficial con ERP/SAP ni sustitución de procesos corporativos.

## Propuesta

La aplicación unifica en una SPA:

- catálogo y fichas técnicas;
- simulación de procesos de almacén;
- gestión de incidencias;
- cálculo de KPIs;
- presupuestos;
- seguimiento de formación;
- asistente SONEX.

El Dashboard Global sirve de punto de entrada al área privada.

## Arquitectura actual

- Frontend: React + Vite + React Router.
- Datos y autenticación: Supabase.
- Backend ligero: Vercel Functions.
- IA: gateway compatible con varios modelos/proveedores.
- Calidad: ESLint, Vitest y Playwright.
- Documentación: capítulos Markdown versionados en Git.

Firebase forma parte de la evolución histórica, no de la descripción principal de la arquitectura actual.

## Qué se evalúa realmente

El proyecto no intenta demostrar que la IA genera software correcto automáticamente. Evalúa un flujo de trabajo:

1. definir el problema y los criterios de aceptación;
2. usar IA para acelerar análisis o implementación;
3. revisar el resultado;
4. ejecutar pruebas y comprobar comportamiento;
5. documentar evidencia y limitaciones.

## Estado de datos y métricas

Las antiguas cifras fijas de productos, tests, cobertura, Lighthouse o coste se han retirado de esta introducción porque cambiaron durante el proyecto. Cuando sean relevantes se documentan en el capítulo de resultados como snapshots con método y fecha.

## Limitaciones

- Validación con usuarios reales limitada.
- Sin integración con sistemas internos de la empresa.
- Dependencia de servicios externos para autenticación, datos e IA.
- La información técnica generada por IA es orientativa y requiere verificación independiente.

*Presentación reconciliada con el snapshot de `main` auditado en agosto de 2026.*
