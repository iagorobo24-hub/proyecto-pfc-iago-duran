# Proyectos PFC Tools

Suite web académica orientada al sector eléctrico y logístico. El repositorio contiene **7 herramientas funcionales** integradas en una SPA, más un **Dashboard Global** de acceso a los módulos.

## Aplicación actual

| Ruta | Módulo | Capacidad principal |
|---|---|---|
| `/app` | Dashboard Global | Acceso y resumen de las herramientas |
| `/app/fichas` | Fichas Técnicas | Navegación y búsqueda de catálogo, detalle y enriquecimiento asistido por IA |
| `/app/almacen` | Simulador Almacén | Recepción, ubicación, picking, verificación y expedición; incidencias, puntuación y multijugador |
| `/app/incidencias` | Incidencias | Registro, filtros, diagnóstico asistido por IA, seguimiento y PDF |
| `/app/kpi` | KPI Logístico | Seis KPIs operativos, semáforo, histórico, gráficos, informe IA y PDF |
| `/app/presupuestos` | Presupuestos | Selección de catálogo, edición, IVA, guardado y PDF |
| `/app/formacion` | Formación Interna | Empleados, módulos, progreso, alertas y plan de desarrollo asistido por IA |
| `/app/sonex` | SONEX | Asistente técnico con historial y cuatro modos de consulta |

## Stack verificado en el snapshot documental

La aplicación usa React 19, Vite 7, React Router 7, Supabase, Vercel Functions, OpenRouter/Groq, Vitest y Playwright. Las versiones exactas deben tomarse de `app/package.json`; la arquitectura de despliegue y cabeceras se define en `app/vercel.json`.

El gateway `/api/ai` mantiene lista blanca de modelos, límites de entrada, CORS y limitación de peticiones. **No existe un único modelo de IA para toda la aplicación**: los módulos pueden seleccionar modelos diferentes y el gateway dispone de fallbacks.

## Testing

El repositorio contiene suites de Vitest y múltiples especificaciones Playwright, y `app/package.json` define `test`, `test:e2e` y `test:all`. Este README **no fija un número de tests verdes ni una cobertura** porque esas métricas solo deben publicarse después de una ejecución fresca del commit correspondiente.

```bash
cd app
npm install
npm run build
npm run test
npm run test:e2e
```

## Datos y métricas

Las cantidades de productos, usuarios, rendimiento, coste y consumo de servicios son datos temporales. La documentación académica evita convertir snapshots históricos en cifras actuales. Para catálogo, el código dispone de `getCatalogStats()`; para resultados de pruebas, debe conservarse el log de la ejecución que los respalda.

## Documentación académica

La fuente principal está en [`proyecto-fin-ciclo/`](./proyecto-fin-ciclo/00-README.md). Los capítulos `01` a `10` son la fuente canónica de la memoria. Los artefactos de `desarrollo-entrega-final/` son derivados y pueden requerir regeneración cuando cambian las fuentes.

## Seguridad y alcance

La aplicación es un proyecto académico. Las respuestas generadas por IA, especialmente sobre normativa, instalación, seguridad eléctrica, compatibilidad o especificaciones de producto, **no sustituyen la documentación oficial del fabricante, la normativa aplicable ni la validación de un profesional cualificado**.

## Licencia

MIT License.
