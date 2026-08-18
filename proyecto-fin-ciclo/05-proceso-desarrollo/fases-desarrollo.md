# Fases de desarrollo

Esta cronología resume la evolución técnica sin convertir una fotografía intermedia en estado actual.

## 1. Prototipos independientes

El proyecto comenzó con herramientas JSX separadas. El objetivo era validar ideas rápidamente antes de unificar navegación, estado y estilos.

## 2. Unificación en SPA

Los prototipos se migraron a una aplicación React con routing, layout común, componentes reutilizables y tema compartido.

## 3. Primer backend y catálogo

Se experimentó con Firebase/Firestore para autenticación y datos. El scraping del catálogo evolucionó a través de distintas versiones y requirió normalización de datos.

## 4. Migración a Supabase

La arquitectura de datos se trasladó a Supabase/PostgreSQL. En el estado actual, catálogo, autenticación y varios datos de usuario están integrados con Supabase; por tanto esta migración ya no se considera “pendiente”.

## 5. Consolidación de módulos

Las siete herramientas evolucionaron más allá de los primeros prototipos:

- Almacén: cinco etapas, incidencias, puntuación y multijugador.
- Incidencias: diagnóstico IA, estados, alertas y PDF.
- KPI: seis indicadores operativos, histórico, gráficos, IA y PDF.
- Presupuestos: flujo con subrutas y generación PDF.
- Formación: empleados, módulos, progreso, alertas y plan IA.
- SONEX: sesiones, cuatro modos, búsqueda/contexto de catálogo y streaming.
- Fichas: navegación y búsqueda de catálogo con filtros dinámicos.

## 6. Seguridad y robustez

Se trasladaron las claves de IA al backend serverless, se añadieron límites/allowlists en el gateway, CSP y sanitización del Markdown. Estas medidas se describen como controles implementados, no como certificación final.

## 7. Testing y diagnóstico

El repositorio contiene suites de Vitest y múltiples specs Playwright. Parte de la historia del proyecto incluye tests que se perdieron o se rehicieron; el estado actual es que **sí existen tests automatizados**. La cantidad que pasa debe medirse en cada commit.

## 8. Documentación y entrega

La última fase consiste en reconciliar memoria, manuales y presentación con el código. Los documentos derivados no deben generar nuevas cifras o funcionalidades sin respaldo en las fuentes.

## Lectura de la cronología

Una decisión descrita como error histórico no implica que siga presente. Del mismo modo, una funcionalidad que apareció después no debe proyectarse hacia fases tempranas. Esta separación entre “qué ocurrió” y “qué existe ahora” es parte de la trazabilidad del PFC.
