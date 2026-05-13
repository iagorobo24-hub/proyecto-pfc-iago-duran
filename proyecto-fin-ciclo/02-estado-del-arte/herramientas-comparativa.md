# Comparativa de Herramientas IA

> Esto es mi experiencia usando cada herramienta durante el proyecto. No es un análisis de laboratorio — es lo que me funcionó (y lo que no) en el día a día. Las fichas técnicas completas están en el Capítulo 06.

---

## ¿Cómo las evalué?

No usé ningún método científico raro. Simplemente fui probando cada herramienta según las necesitaba y viendo cuál me daba mejores resultados. Las cosas que miraba:

- **¿El código funciona?** — Lo más importante, si no sirve no sirve
- **¿Entiende mi proyecto?** — O repite lo mismo siempre sin mirar el contexto
- **¿Es rápido?** —O tarda veinte minutos en responder
- **¿Es gratis?** — Crítico, porque no tengo dinero para pagar suscripciones
- **¿Es fácil de usar?** — O tengo que leer manuales tres horas antes de empezar
- **¿Puede tocar mis archivos?** — O solo habla y no hace nada

---

## Asistentes conversacionales (los chatbots)

| Herramienta | Calidad código | Entiende contexto | Velocidad | Coste | Toca archivos | Nota |
|-------------|--------------|-------------------|-----------|-------|---------------|------|
| **Claude Web** | Excelente | Regular | Buena | Gratis | No | 7/10 |
| **ChatGPT** | Buena | Regular | Buena | Pago | No | 6/10 |
| **Gemini** | Aceptable | Regular | Muy buena | Gratis | No | 5/10 |

**Mi opinión:** Claude Web se llevó la palma para diseñar cosas y pensar la arquitectura. Pero el problema gordo es que **no puede ver tus archivos**. Tienes que copiar y pegar código todo el rato, y eso cansa rápido. Los chatbots están bien para empezar, pero para trabajar de verdad necesitas algo más.

---

## IDEs con IA (los editores inteligentes)

| Herramienta | Calidad código | Entiende contexto | Velocidad | Coste | Toca archivos | Nota |
|-------------|--------------|-------------------|-----------|-------|---------------|------|
| **Windsurf** | Excelente | Excelente | Muy buena | Gratis | Sí | **9/10** |
| **Cursor** | Excelente | Excelente | Muy buena | Gratis | Sí | 9/10 |
| **Copilot** | Buena | Buena | Excelente | Gratis* | Sí | 7/10 |

\*Gratis para estudiantes, pero se acaba

**Mi opinión:** Aquí está el salto de calidad. Cuando pasas de un chat web a un IDE con IA, es como pasar de un destornillador manual a un taladro eléctrico. **Windsurf fue mi herramienta principal durante casi todo el proyecto.** Ve mis archivos, entiende cómo está estructurado el código, y puede modificarlo sin que yo tenga que copiar y pegar nada. 
Copilot está bien para empezar pero se queda corto cuando el proyecto se hace grande. Además la versión gratuita de estudiante tiene límites.

---

## Agentes CLI (los que trabajan desde la terminal)

| Herramienta | Calidad código | Entiende contexto | Velocidad | Coste | Toca archivos | Nota |
|-------------|--------------|-------------------|-----------|-------|---------------|------|
| **OpenCode** | Excelente | Excelente | Muy buena | Gratis | Sí | **9/10** |
| **Qwen CLI** | Muy buena | Excelente | Muy buena | Gratis | Sí | 8/10 |
| **Gemini CLI** | Muy buena | Buena | Excelente | Gratis | Sí | 8/10 |
| **Hermes** | Excelente | Excelente | Muy buena | Gratis | Sí | **9/10** |

**Mi opinión:** Los agentes CLI fueron un descubrimiento tardío pero brutal. Le dices desde la terminal "oye, haz tal cosa" y el agente solo mira tus archivos, los modifica, ejecuta comandos, y te dice qué ha hecho. **OpenCode y Hermes son los que uso ahora mismo.** Lástima que Qwen CLI cerrara en abril de 2026, porque también era muy bueno.

---

## Puertas de enlace para IA (APIs)

| Servicio | Modelos disponibles | Coste | Es fiable? |
|----------|-------------------|-------|------------|
| **OpenRouter** | Muchísimos (Claude, GPT, DeepSeek...) | Gratis* | Bastante |
| **Groq** | Llama, Mixtral | Gratis | Normal |
| **Anthropic directo** | Solo Claude | Pago | Muy fiable |

\*Gratis para modelos seleccionados

**Mi opinión:** OpenRouter fue un salvavidas. Cuando Anthropic directo no funcionaba (y os prometo que pasamos tres días peleándonos con CORS y configuraciones), OpenRouter nos dio acceso a modelos gratis sin complicaciones. Es como un "centro comercial" de IAs: vas, eliges el modelo que quieras, y pagas poco o nada.

---

## Bases de datos

| Servicio | Tipo | Gratis hasta... | Para proyectos grandes | Fácil de montar |
|----------|------|-----------------|----------------------|----------------|
| **Firebase (Firestore)** | NoSQL | 50 mil escrituras/día | Regular | Muy fácil |
| **Supabase** | PostgreSQL | 500 MB | Buena | Normal |
| **MongoDB Atlas** | NoSQL | 512 MB | Buena | Normal |

**Mi opinión:** Empecé con Firebase porque es lo más fácil del mundo para empezar — en 10 minutos tienes base de datos funcionando. Pero cuando el catálogo llegó a 400.000 productos, los límites del plan gratis empezaron a notarse. Por eso estoy migrando a Supabase, que da más por el mismo precio (cero euros).

---

## Tabla rápida: qué usar según lo que necesites

```
¿Empezar desde cero?        → Claude Web (diseño) → Windsurf (código)
¿Ya tienes un proyecto?     → Windsurf / OpenCode
¿Bases de datos?            → Firebase para empezar, Supabase para crecer
¿API de IA?                 → OpenRouter
¿Publicar la web?           → Vercel (un click y ya está)
¿Probar que funciona?       → Playwright
```

---

## Lo que aprendí con todo esto

1. **No existe la herramienta perfecta** — Cada una es buena para algo distinto
2. **Lo mejor es combinarlas** — Claude para pensar, Windsurf para escribir, OpenCode para arreglar
3. **Lo gratis es suficiente** — Para un proyecto de FP no necesitas pagar nada
4. **Las herramientas cambian** — Qwen CLI cerró, otras aparecen. No te cases con ninguna
5. **El IDE con IA es el futuro** — Los chatbots se quedan cortos cuando el proyecto crece

---

## Para futuros alumnos (por si os sirve)

**Empezad con:** Claude Web (para ver qué es posible), Windsurf (para escribir código), Vercel (para publicar)

**Cuando os sintáis cómodos:** OpenCode CLI (para tareas más gordas), Supabase (para datos de verdad), Playwright (para tests)

**Y sobre todo:** No paguéis nada hasta que de verdad haga falta. El tier gratuito da para mucho.

---

*Esto es mi experiencia personal, no un análisis de una revista técnica*
*Ver fichas detalladas en: `06-herramientas-ia/`*
