# Herramientas y servicios utilizados — visión general

Este capítulo documenta **cómo se utilizaron** distintas herramientas durante el PFC. No es un catálogo de precios ni un ranking actual del mercado.

## Cómo leer las fichas

Cada ficha separa:

- **uso en el PFC:** hecho histórico del proyecto;
- **función:** qué problema resolvía;
- **limitaciones observadas:** experiencia del desarrollo;
- **estado documental:** si sigue formando parte de la arquitectura actual o solo de la historia.

Los planes gratuitos, cuotas, nombres de modelos y condiciones comerciales cambian. No se consideran parte estable de la memoria.

## Mapa del ecosistema

| Tipo | Herramientas documentadas | Papel |
|---|---|---|
| Chat web | Claude Web | Diseño, explicación y prototipos |
| Asistente de editor | GitHub Copilot, Windsurf | Autocompletado y edición contextual |
| Agentes CLI | Qwen CLI, Gemini CLI, OpenCode | Trabajo sobre repositorio y terminal |
| Agente remoto | Devin | Cambios gestionados mediante Git/GitHub |
| Agente general | Hermes | Análisis/documentación en una etapa del proyecto |
| Gateway IA | OpenRouter | Acceso unificado a modelos desde `/api/ai` |
| Plataforma de datos | Firebase (legado), Supabase (actual) | Auth y persistencia |
| Despliegue | Vercel | Hosting y funciones serverless |
| Automatización | Playwright | E2E y scraping histórico |

La comparación razonada se resume en `comparativa-final.md`.
