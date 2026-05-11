# Estado del Arte: IA Generativa en Desarrollo Web

## Introducción

La inteligencia artificial generativa ha transformado radicalmente la forma en que se desarrolla software. En menos de dos años (2023-2026), hemos pasado de no existir herramientas de coding con IA a tener agentes completos que pueden escribir, revisar y depurar código de forma autónoma.

Este capítulo documenta el estado del arte de estas herramientas en el contexto de un proyecto de ciclo formativo.

---

## Cronología de la IA Generativa

### 2020-2022: Los orígenes

| Año | Acontecimiento |
|-----|----------------|
| 2020 | GPT-3 de OpenAI — Primer modelo de lenguaje con capacidades de código |
| 2021 | GitHub Copilot (preview) — Primer copiloto de código con IA |
| 2022 | ChatGPT — IA conversacional accesible para todos |

### 2023: Explosión

| Mes | Acontecimiento |
|-----|----------------|
| Marzo | GPT-4 — Modelo multimodelo con razonamiento avanzado |
| Marzo | Claude (Anthropic) — Competidor con enfoque en seguridad |
| Mayo | Bing Chat / Claude AI — Chatbots con acceso a internet |
| Octubre | OpenAI o1 — Modelos con razonamiento |

### 2024-2025: Agentes y CLI

| Año | Acontecimiento |
|-----|----------------|
| 2024 | GPT-4o, Claude 3 — Modelos más rápidos y capaces |
| 2024 | Windsurf (Codeium) — Primer IDE completo con IA |
| 2024 | Gemini CLI, Qwen CLI — Agentes de terminal |
| 2025 | OpenCode, Devin — Agentes autónomos completos |

### 2026: Estado actual

- **Agentes CLI** accesibles gratuitamente (NVIDIA, Google)
- **IDE con IA** integrados en el flujo de trabajo
- **Agentes autónomos** que pueden hacer PRs automáticamente
- **Modelos gratuitos** suficientes para proyectos académicos

---

## Herramientas en el mercado (2026)

### Asistentes conversacionales

| Herramienta | Desarrollador | Coste gratuito | Mejor para |
|-------------|---------------|----------------|------------|
| **Claude Web** | Anthropic | Sí (limitado) | Razonamiento complejo |
| **ChatGPT** | OpenAI | Sí (limitado) |通用 |
| **Gemini** | Google | Sí | Velocidad |

### IDEs con IA

| Herramienta | Tipo | Coste | Diferenciador |
|-------------|------|-------|---------------|
| **Windsurf** | IDE completo | Gratis | Coding ilimitado |
| **Cursor** | IDE basado en VSCode | Gratis | autocomplete avanzado |
| **Copilot** | Extensión VSCode | Gratis estudiantes | IDEs tradicionales |

### Agentes CLI

| Herramienta | Desarrollador | Modelo | Coste |
|-------------|---------------|--------|-------|
| **OpenCode** | NVIDIA | Nemotron | Gratis |
| **Qwen CLI** | Alibaba | Qwen | Gratis (cerró abr 2026) |
| **Gemini CLI** | Google | Gemini | Gratis |
| **Hermes** | Nous Research | Varios | Gratis (NVIDIA) |

### Agentes autónomos

| Herramienta | Función | Coste |
|-------------|---------|-------|
| **Devin** | Agente que hace PRs | Pago |
| **Claude Code** | Agente CLI + coding | Pago |
| **OpenCode** | Agente terminal | Gratis |

---

## ¿Por qué IA generativa para desarrollo web?

### Ventajas documentadas

1. **Velocidad:** Un estudiante sin experiencia puede generar código funcional en minutos
2. **Aprendizaje:** Ver código generado ayuda a entender patrones
3. **Productividad:** Automatiza tareas repetitivas (boilerplate, tests)
4. **Accesibilidad:** Reduce la barrera de entrada a la programación

### Riesgos y limitaciones

1. **Calidad variable:** El código generado puede tener errores sutiles
2. **Dependencia:** Usar IA sin entender el código impide el aprendizaje
3. **Seguridad:** Pueden generar código con vulnerabilidades
4. **Obsolescencia:** Herramientas cambian rápidamente

---

## Estado del arte en este proyecto

Este proyecto用了 15+ herramientas de IA, desde Claude Web (marzo 2026) hasta Hermes Agent (mayo 2026). La metodología evolucionó:

```
Marzo 2026          Abril 2026           Mayo 2026
    │                   │                    │
    ▼                   ▼                    ▼
Claude Web    →    Windsurf IDE    →    OpenCode CLI
(artefactos)      (SPA completa)       (scripts, migración)
                        │
                        ▼
                   Qwen CLI / Gemini CLI
                   (agentes terminal)
```

---

## Tendencias identificadas

### Lo que está creciendo
- Agentes CLI con acceso a filesystem
- IDEs con coding ilimitado (no solo autocompletado)
- Modelos gratuitos de alta calidad (NVIDIA, Google)
- Integración nativa en herramientas de desarrollo

### Lo que está decreciendo
- Chat web como herramienta principal de coding
- Copilot tradicional (sustituido por Windsurf/Cursor)
- Herramientas de pago para casos de uso básicos

### Lo que está por venir
- Agentes完全 autónomos (Devin, Claude Code)
- Mejora en razonamiento técnico
- Integración con sistemas de build y deployment

---

## Conclusión

La IA generativa ha alcanzado un punto de madurez donde **un estudiante sin experiencia previa puede desarrollar aplicaciones web profesionales** utilizando únicamente herramientas gratuitas.

El factor crítico no es la herramienta en sí, sino **cómo se usa**: el mejor resultado viene de entender el código generado, iterar sobre él, y documentar el proceso.

Este proyecto demuestra esa metodología: 7 módulos funcionales, 400K+ productos en catálogo, deploy en producción, todo construido con IA como herramienta principal.

---

*Capítulo 02 — Estado del Arte*
*Elaborado: Mayo 2026*
