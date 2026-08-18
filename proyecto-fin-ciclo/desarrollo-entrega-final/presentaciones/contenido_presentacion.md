# Contenido canónico de la presentación del PFC

## 1. Portada

**Suite de herramientas web para el sector eléctrico y logístico, desarrollada con apoyo de IA generativa.**

Autor: Iago Durán Romera — Automatización y Robótica Industrial.

## 2. Problema y objetivo

El PFC explora si un alumno de perfil técnico puede construir y documentar una suite web útil apoyándose en IA sin delegar la responsabilidad de validar el resultado.

## 3. Alcance

**7 herramientas funcionales + Dashboard Global**:

Fichas Técnicas, Simulador de Almacén, Incidencias, KPI Logístico, Presupuestos, Formación Interna y SONEX.

Fuera de alcance: integración oficial con ERP/SAP, operación empresarial certificada y validación normativa automática.

## 4. Requisitos

La memoria usa **8 grupos funcionales RF-01…RF-08**. Los identificadores `RF-x.y` son capacidades/criterios dentro de cada grupo y no se suman como requisitos independientes.

Los requisitos no funcionales se presentan como objetivos y evidencias, no como SLA demostrados sin medición.

## 5. Arquitectura

- React + Vite + React Router.
- Supabase para autenticación y datos actuales.
- Vercel para despliegue y gateway serverless.
- OpenRouter/Groq como proveedores de modelos a través de `/api/ai`.
- persistencia local + Supabase para datos de usuario.

Firebase se conserva como parte de la historia de evolución, no como backend actual principal.

## 6. Desarrollo con IA

Metodología: **definir → inspeccionar → implementar → probar → contrastar → documentar**.

La IA se utilizó como acelerador de análisis, código y documentación. Las salidas de agentes se trataron como propuestas, no como evidencia.

## 7. Casos de aprendizaje

- exposición histórica de una clave y migración a proxy serverless;
- migración Firebase → Supabase;
- depuración de validadores/JSON;
- optimización de consultas de catálogo;
- necesidad de separar información generada por IA de fuentes oficiales.

## 8. Módulos actuales

**Almacén:** cinco etapas, incidencias, puntuación y multijugador.  
**Incidencias:** registro, estados, diagnóstico IA y PDF.  
**KPI:** pedidos/hora, error de picking, tiempo de ciclo, ocupación, devoluciones y productividad.  
**Presupuestos:** catálogo, edición, IVA, guardado y PDF.  
**Formación:** empleados, módulos, progreso, alertas y plan IA.  
**SONEX:** cuatro modos, sesiones y contexto de catálogo.

## 9. Testing y evidencia

El repo contiene Vitest y múltiples especificaciones Playwright y define scripts de prueba. La presentación **no publica un número de tests verdes** sin ejecutar las suites sobre el commit que se defiende.

Del mismo modo, catálogo, Lighthouse, bundle y coste se tratan como métricas fechadas, no constantes.

## 10. Seguridad y límites de IA

El gateway aplica CORS, rate limiting, lista de modelos y límites de entrada; Vercel configura cabeceras de seguridad. Esto reduce riesgos, no convierte el sistema en una solución certificada.

Para normativa, instalación y seguridad eléctrica se requiere documentación oficial y criterio profesional.

## 11. Resultados

Resultado principal: una suite integrada y una metodología documentada y reutilizable. La evidencia visual está versionada en `app/e2e/screenshots/`.

Limitaciones: validación limitada con usuarios reales, ausencia de integración corporativa oficial y necesidad de ejecutar validaciones frescas antes de afirmar un estado de calidad.

## 12. Conclusión

El proyecto no demuestra que la IA sustituya al desarrollador o al técnico. Demuestra que puede aumentar la capacidad de un alumno cuando existe **control de alcance, revisión, pruebas, fuentes y responsabilidad humana**.
