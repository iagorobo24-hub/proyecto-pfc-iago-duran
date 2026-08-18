# Herramientas de IA descubiertas y utilizadas

Este capítulo registra el **ecosistema experimentado durante el PFC**, no un ranking permanente del mercado. Las herramientas, modelos, planes gratuitos, cuotas y precios cambian con rapidez; para esos datos debe consultarse la documentación oficial del proveedor en el momento de uso.

## Categorías que aparecieron en el proyecto

| Categoría | Ejemplos documentados | Aportación al flujo |
|---|---|---|
| Chat web | Claude Web | Ideación, explicación, prototipos y revisión |
| Asistente de editor | GitHub Copilot, Windsurf | Autocompletado y edición contextual |
| Agente CLI | Qwen CLI, Gemini CLI, OpenCode | Lectura de repositorio, cambios y ejecución de comandos |
| Agente remoto | Devin | Trabajo propuesto mediante commits/PRs |
| Agente general | Hermes | Análisis y documentación en una fase del proyecto |
| Gateway de modelos | OpenRouter | Acceso unificado a distintos modelos para la aplicación |
| Infraestructura | Vercel, Supabase | Despliegue, funciones serverless, autenticación y datos |
| Automatización | Playwright | E2E, diagnóstico visual y scraping histórico |

## Criterios de evaluación

Las fichas del capítulo 06 se leen con cinco preguntas:

1. ¿Para qué se utilizó realmente en este proyecto?
2. ¿Qué acceso tenía al contexto: conversación, editor, filesystem o GitHub?
3. ¿Podía ejecutar cambios o solo proponerlos?
4. ¿Qué revisión humana fue necesaria?
5. ¿Qué parte de la ficha es histórica y qué parte depende del proveedor?

## Lección principal

No existe una herramienta “mejor” para todo. El patrón más útil fue separar **planificación**, **implementación** y **verificación**, y elegir la herramienta por el tipo de acceso que necesitaba la tarea. Cualquier afirmación sobre coste, límites o disponibilidad debe fecharse; no se reutiliza como verdad actual en la memoria.
