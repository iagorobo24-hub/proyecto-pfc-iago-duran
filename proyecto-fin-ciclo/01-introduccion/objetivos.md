# Objetivos del proyecto

## Objetivo general

Diseñar, desarrollar y documentar una suite web académica que explore cómo la IA generativa puede apoyar el desarrollo de software aplicado al sector eléctrico y logístico, manteniendo trazabilidad sobre decisiones, limitaciones y validaciones.

## Objetivos funcionales

La aplicación se estructura en **7 herramientas funcionales**:

1. Fichas Técnicas.
2. Simulador de Almacén.
3. Dashboard de Incidencias.
4. KPI Logístico.
5. Presupuestos.
6. Formación Interna.
7. SONEX.

El **Dashboard Global** actúa como pantalla de acceso y resumen, pero no se cuenta como octava herramienta de negocio.

## Objetivos técnicos

- Construir una SPA con React y routing protegido.
- Integrar autenticación y persistencia con Supabase.
- Centralizar las llamadas de IA detrás de un gateway serverless para no exponer claves privadas en el cliente.
- Mantener degradación controlada cuando un servicio externo no esté disponible.
- Aplicar diseño responsive, tema claro/oscuro y componentes reutilizables.
- Incorporar pruebas automatizadas con Vitest y Playwright.
- Mantener el proyecto versionado en Git y documentar su evolución.

## Objetivos metodológicos

- Comparar distintas formas de trabajar con IA: chat web, IDE asistido y agentes de terminal/GitHub.
- Registrar errores, correcciones y decisiones para que el proceso sea reutilizable por otros alumnos.
- Evitar presentar la salida de un modelo como evidencia: código, datos y documentación deben contrastarse.
- Separar la contribución de la IA de la responsabilidad del autor del proyecto.

## Objetivos académicos

- Relacionar el proyecto con competencias de análisis, programación, bases de datos, documentación técnica y autonomía.
- Preparar una memoria y una defensa coherentes con el estado real del repositorio.
- Crear material docente reutilizable que enseñe también límites, riesgos y verificación.

## Alcance y límites

El proyecto no pretende ser un producto oficial de la empresa ni sustituir sus sistemas internos. Tampoco valida que una recomendación generada por IA sea segura o normativa por sí sola. Los datos técnicos de productos, reglamentos e instrucciones de instalación deben contrastarse con fuentes oficiales.

## Criterio de cierre

Se considera cumplido un objetivo cuando existe una implementación o evidencia observable en el repositorio. Las métricas variables (tests, cobertura, catálogo, Lighthouse, consumo o coste) solo se declaran con fecha y método de medición; no forman parte del objetivo como cifras inmutables.

*Objetivos reconciliados con el estado del repositorio: agosto de 2026.*
