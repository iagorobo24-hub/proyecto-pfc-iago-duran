# Herramientas IA: Comparativa 2024-2026

> Comparativa de las herramientas utilizadas en este proyecto. Para fichas técnicas detalladas, ver Capítulo 06.

---

## Metodología de evaluación

Cada herramienta se evaluó en 6 dimensiones:

- **Calidad de código:** ¿El código generado funciona correctamente?
- **Comprensión de contexto:** ¿Entiende el proyecto existente?
- **Velocidad:** ¿Cuánto tarda en responder?
- **Coste:** ¿Es gratuita o de pago?
- **Facilidad de uso:** ¿Cuánto hay que configurar?
- **Acceso a proyecto:** ¿Puede leer/escribir archivos directamente?

---

## Herramientas conversacionales

| Herramienta | Calidad | Contexto | Velocidad | Coste | Acceso | Puntuación |
|-------------|---------|----------|-----------|-------|--------|------------|
| **Claude Web** | ★★★★★ | ★★☆☆☆ | ★★★☆☆ | Gratis | No | 7/10 |
| **ChatGPT 4o** | ★★★★☆ | ★★☆☆☆ | ★★★★☆ | Pago | No | 7/10 |
| **Gemini** | ★★★☆☆ | ★★☆☆☆ | ★★★★★ | Gratis | No | 6/10 |

**Veredicto:** Claude Web es el mejor para diseño y arquitectura, pero limitado sin acceso al proyecto.

---

## IDEs con IA

| Herramienta | Calidad | Contexto | Velocidad | Coste | Acceso | Puntuación |
|-------------|---------|----------|-----------|-------|--------|------------|
| **Windsurf** | ★★★★★ | ★★★★★ | ★★★★☆ | Gratis | Sí | 9/10 |
| **Cursor** | ★★★★★ | ★★★★★ | ★★★★☆ | Gratis | Sí | 9/10 |
| **Copilot** | ★★★☆☆ | ★★★☆☆ | ★★★★★ | Gratis* | Sí | 7/10 |

*Gratis para estudiantes

**Veredicto:** Windsurf y Cursor son equivalentes. Windsurf se usó por su tier gratuito ilimitado.

---

## Agentes CLI

| Herramienta | Calidad | Contexto | Velocidad | Coste | Acceso | Puntuación |
|-------------|---------|----------|-----------|-------|--------|------------|
| **OpenCode** | ★★★★★ | ★★★★★ | ★★★★☆ | Gratis | Sí | 9/10 |
| **Qwen CLI** | ★★★★☆ | ★★★★★ | ★★★★☆ | Gratis | Sí | 8/10 |
| **Gemini CLI** | ★★★★☆ | ★★★★☆ | ★★★★★ | Gratis | Sí | 8/10 |
| **Hermes** | ★★★★★ | ★★★★★ | ★★★★☆ | Gratis | Sí | 9/10 |

**Veredicto:** OpenCode y Hermes son los más completos. Qwen cerró en abril 2026.

---

## Gateways de IA

| Herramienta | Modelos | Coste | Fiabilidad | Documentación |
|-------------|---------|-------|------------|----------------|
| **OpenRouter** | Muchos (Claude, GPT, DeepSeek) | Gratis* | ★★★★☆ | ★★★★☆ |
| **Groq** | Llama, Mixtral | Gratis | ★★★☆☆ | ★★★☆☆ |
| **Anthropic directo** | Claude | Pago | ★★★★★ | ★★★★★ |

*Gratis con límites en modelos seleccionados

**Veredicto:** OpenRouter es ideal para proyectos académicos por su tier gratuito generoso.

---

## Bases de datos

| Servicio | Tipo | Tier gratuito | Escalabilidad | Complejidad |
|----------|------|---------------|---------------|-------------|
| **Firebase/Firestore** | NoSQL | 50K escrituras/día | Alta | Baja |
| **Supabase** | PostgreSQL | 500MB, 2GB bandwidth | Muy alta | Media |
| **MongoDB Atlas** | NoSQL | 512MB | Alta | Media |

**Veredicto:** Firebase fue el inicial, pero Supabase ofrece mejor relación características/gratis.

---

## Comparativa por caso de uso

### Para principiantes

| Caso de uso | Herramienta recomendada | Razón |
|-------------|------------------------|-------|
| Primeros pasos | Claude Web | Interfaz fácil, sin instalar nada |
| Primer proyecto | Windsurf | IDE completo, coding ilimitado |
| Despliegue | Vercel | Deploy en 1 click |

### Para proyectos académicos

| Caso de uso | Herramienta recomendada | Razón |
|-------------|------------------------|-------|
| Catálogo de productos | Firebase Firestore | Schema flexible, fácil de empezar |
| API de IA | OpenRouter | Modelos gratuitos suficientes |
| Hosting | Vercel | Integrado con GitHub |

### Para producción

| Caso de uso | Herramienta recomendada | Razón |
|-------------|------------------------|-------|
| Base de datos | Supabase | PostgreSQL, mejor escalabilidad |
| Testing | Playwright | E2E robusto, open source |
| CI/CD | GitHub Actions | Integrado, gratis para open source |

---

## Lecciones aprendidas

1. **No hay herramienta perfecta:** Cada una tiene fortalezas y debilidades
2. **Combinar es optimal:** Claude para diseño, Windsurf para coding, OpenCode para scripts
3. **El tier gratuito es suficiente:** Para proyectos académicos, no necesitas pagar
4. **La velocidad cambia:** Herramientas que eran lentas ahora son rápidas (y viceversa)
5. **Algunas cierran:** Qwen CLI cerró en abril 2026 — no depender de una sola

---

## Recomendaciones para futuros alumnos

### Empezar con:
1. **Claude Web** — Para entender qué es posible
2. **Windsurf** — Para el primer código real
3. **Vercel** — Para desplegar rápido

### Evolucionar a:
1. **OpenCode CLI** — Para tareas complejas
2. **Supabase** — Para bases de datos más robustas
3. **Playwright** — Para testing automático

### Evitar:
1. **Pagar antes de necesitarlo** — El tier gratuito es suficiente
2. **Usar solo chat web** — IDE con IA es mucho más productivo
3. **Depender de una herramienta** — El ecosistema cambia rápido

---

## Matriz de decisión rápida

```
¿Necesitas coding real?        → Windsurf / OpenCode
¿Necesitas analizar código?    → OpenCode / Hermes  
¿Necesitas diseño/arquitectura? → Claude Web
¿Necesitas ejecutar scripts?   → OpenCode / Qwen CLI
¿Necesitas API de IA?          → OpenRouter
¿Necesitas base de datos?      → Supabase (no Firebase)
¿Necesitas desplegar?          → Vercel
```

---

*Comparativa elaborada: Mayo 2026*
*Ver fichas técnicas en: `06-herramientas-ia/`*
