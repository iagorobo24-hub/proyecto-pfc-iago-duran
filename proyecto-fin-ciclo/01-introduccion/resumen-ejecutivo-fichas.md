# Presentación de herramientas

> Una página por cada herramienta usada en el proyecto. Para fichas completas, ver Capítulo 06.

---

## Herramientas Conversacionales

### Claude Web (Anthropic)
**Rol:** Primera herramienta usada, diseño inicial de arquitectura

- Generó los 7 artefactos JSX originales
- Ayuda con diseño de componentes
- Limitación: sin acceso al filesystem

**Coste:** Gratis (con límites)

---

### GitHub Copilot
**Rol:** Autocompletado en VSCode

- Sugerencias de código en tiempo real
-Chat inline para explicaciones

**Coste:** Gratis para estudiantes

---

### Windsurf IDE
**Rol:** IDE principal (sustituyó a Copilot)

- Coding ilimitado con IA
- Acceso a proyecto local
- Mejor que Copilot para este proyecto

**Coste:** Gratis (tier gratuito)

---

## Agentes CLI

### Qwen CLI
**Rol:** Agente terminal (cerrado abril 2026)

- Ejecución de tareas complejas
- Análisis de código
- Scripts automatizados

**Coste:** Gratis (modelos NVIDIA)

---

### Gemini CLI (Google)
**Rol:** Agente terminal alternativo

- Buena velocidad
- Integración con ecosistema Google

**Coste:** Gratis

---

### OpenCode CLI
**Rol:** Agente actual (NVIDIA)

- Acceso completo al filesystem
- Skills especializados
- Integración con modelos NVIDIA

**Coste:** Gratis

---

### Hermes Agent
**Rol:** Documentación y análisis

- Agente que genera esta documentación
- Análisis profundo de repositorio
- Memoria persistente

**Coste:** Gratis (modelos NVIDIA)

---

## Infraestructura

### GitHub
**Rol:** Control de versiones

- Repositorio principal
- Commits, branches, PRs

**Coste:** Gratis

---

### Vercel
**Rol:** Hosting + Serverless

- Deploy automático
- Vercel Functions para API de IA
- Dominio gratuito

**Coste:** Gratis (hobby tier)

---

### Firebase
**Rol:** Auth + Base de datos

- Firebase Auth (Google Sign-In)
- Firestore para catálogo
- Spark tier (gratis)

**Coste:** Gratis (límite 50K escrituras/día)

---

### Supabase
**Rol:** Migración en curso

- PostgreSQL como alternativa a Firestore
- Mayor escalabilidad
- Tier gratuito generoso

**Coste:** Gratis

---

## APIs y Servicios

### OpenRouter
**Rol:** Gateway de IA

- Unifica múltiples proveedores
- Modelos gratuitos (Claude Haiku, DeepSeek, Qwen)
- Coste cero con límites

**Coste:** Gratis (modelos seleccionados)

---

## Testing

### Playwright
**Rol:** Scraping + Tests E2E

- Scraping de web pública del distribuidor (400K productos)
- Tests automatizados de UI
- 14 tests implementados

**Coste:** Gratis (open source)

---

## Resumen de costes

| Categoría | Herramienta | Coste real |
|-----------|-------------|------------|
| IDE + Coding | Windsurf | 0€ |
| Hosting | Vercel | 0€ |
| Auth + DB | Firebase | 0€ |
| IA | OpenRouter | 0€ |
| Control de versiones | GitHub | 0€ |
| Testing | Playwright | 0€ |
| **TOTAL** | | **0€** |

---

*Fichas resumidas — Para detalle completo ver: `06-herramientas-ia/`*
