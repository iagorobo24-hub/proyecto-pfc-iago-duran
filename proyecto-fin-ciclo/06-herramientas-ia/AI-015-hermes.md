---
tool_id: AI-015
nombre: Hermes Agent
version_observada: 2025-2026
rol_principal: AgenteCLI actual - análisis de repos, documentación y desarrollo
url: https://hermes-agent.nousresearch.com
---

# Ficha Técnica: Hermes Agent

## ¿Qué es?

Hermes es el agente de IA que estás usando en este momento. Desarrollado por Nous Research, es un asistente de línea de comandos que combina capacidades de coding, análisis de código, y tareas generales.

## ¿Para qué lo uso? (uso actual)

### 1. Análisis exhaustivo del repositorio

En esta sesión, he analizado completamente el proyecto:

- Estructura de carpetas y archivos
- Stack tecnológico (React 19, Vite 7, Firebase, etc.)
- Los 7 módulos funcionales
- Los servicios y hooks
- Los scripts de sincronización
- El historial de commits
- La documentación existente (README, EVOLUCION, CLAUDE.md)

### 2. Creación de documentación estructurada

Estoy generando:
- Fichas técnicas de cada herramienta IA
- Estructura de capítulos para el proyecto fin de ciclo
- Guía para profesores
- Índice general de documentación

### 3. Próximas tareas (pendientes)

- Desarrollo de nuevas funcionalidades
- Migración de Firestore a Supabase
- Implementación de tests
- Mejora del asistente IA (SONEX)

## ¿Cómo lo uso?

1. Lo tengo configurado como agente de terminal
2. Le envío mensajes con tareas específicas
3. Hermes analiza, ejecuta y reporta

### Ejemplo de prompts que uso

> "Analiza el código de useSonex.js y propón mejoras de rendimiento"

> "Crea tests unitarios para el hook useFichasTecnicas con Vitest"

> "Genera un plan para migrar el catálogo de Firestore a Supabase"

## Ventajas que encuentro

| Aspecto | Valoración |
|---------|-----------|
| Análisis de código profundo | ⭐⭐⭐⭐⭐ |
| Acceso al filesystem | ⭐⭐⭐⭐⭐ |
| Multi-herramienta (puede usar CLI, leer archivos, ejecutar código) | ⭐⭐⭐⭐⭐ |
| Contextos largos | ⭐⭐⭐⭐⭐ |
| Herramientas especializadas (skills) | ⭐⭐⭐⭐⭐ |
| Integración con NVIDIA (modelos gratuitos) | ⭐⭐⭐⭐⭐ |
| Memoria persistente | ⭐⭐⭐⭐⭐ |

## Limitaciones que encuentro

1. **No tiene acceso al navegador web** (para buscar documentación actualizada).
2. **Velocidad variable** según modelo y hora.

## Skills disponibles

Hermes tiene skills especializados que cargan automáticamente cuando detecta el contexto:

| Skill | Uso |
|-------|-----|
| `multica-cli` | Gestión de Multica CLI y agentes |
| `playwright-best-practices` | Testing E2E |
| `nodejs-best-practices` | Backend patterns |
| `frontend-design` | Diseño UI |
| `github-pr-workflow` | Gestión de PRs |

## ¿Qué lo diferencia de otros agentes?

A diferencia de Claude Web o ChatGPT:
- **Tiene memoria persistente** entre sesiones (no olvidan nada)
- **Puede ejecutar comandos** en el sistema (no solo generar código)
- **Tiene skills especializados** que cargan automáticamente
- **Se integra con herramientas locales** (terminal, filesystem, git)

## Lecciones aprendidas

1. **La memoria persistente cambia todo:** Hermes recuerda decisiones y convenciones de sesiones anteriores.
2. **Los skills son muy útiles:** Cargan contexto especializado automáticamente.
3. **Combinar agentes es optimal:** Cada herramienta tiene strengths diferentes.

## El workflow completo que estoy usando

```
1. Análisis (Claude Web) → Diseño arquitectónico
2. Codificación (Windsurf / OpenCode CLI) → Implementación
3. Documentación (Hermes) → Captura de conocimiento
4. Deploy (Vercel) → Producción
```

## Referencias

- [Hermes Agent](https://hermes-agent.nousresearch.com)
- [Nous Research](https://nousresearch.com)

---

**Fecha de elaboración de esta ficha:** Mayo 2026
**Nota:** Esta ficha se escribió a sí misma, lo cual es un poco redundante pero necesario para la documentación completa.

---

*Fin de las fichas de herramientas IA. Total: 15 fichas generadas.*