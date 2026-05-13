# ÍNDICE GENERAL — Proyecto Fin de Ciclo

## Documentación del proyecto

### 📁 Estructura principal

```
proyecto-fin-ciclo/
├── 00-README.md                    ← Este archivo: índice y guía de uso
├── 01-resumen-ejecutivo/           ← Resumen ejecutivo del proyecto
├── 02-estado-del-arte/             ← IA generativa en desarrollo web
├── 03-analisis-requisitos/         ← Análisis de necesidades de la empresa
├── 04-diseno-tecnico/              ← Arquitectura y decisiones técnicas
├── 05-proceso-desarrollo/          ← Metodología de trabajo con IA
├── 06-herramientas-ia/            ← Catálogo de herramientas (fichas)
├── 07-manuales-uso/                ← Manuales de usuario de la app
├── 08-resultados/                  ← Resultados y validación
├── 09-conclusiones/               ← Conclusiones y líneas futuras
├── 10-manual-profesores/          ← Guía para docentes
└── assets/                         ← Diagramas, capturas, branding
```

---

## 📋 Fichas de herramientas (Capítulo 06)

### Herramientas conversacionales / Web

| ID | Herramienta | Uso principal | Estado |
|----|-------------|---------------|--------|
| AI-001 | Claude Web (Anthropic) | Diseño de arquitectura, prototipos | ✅ Completa |
| AI-002 | GitHub Copilot | Autocompletado en VSCode | ✅ Completa |
| AI-003 | Vercel | Despliegue y serverless | ✅ Completa |
| AI-004 | Windsurf IDE | Coding ilimitado (reemplazo Copilot) | ✅ Completa |

### Agentes CLI (terminal)

| ID | Herramienta | Uso principal | Estado |
|----|-------------|---------------|--------|
| AI-005 | Qwen CLI | Agente terminal | ✅ Completa (cerrado abr 2026) |
| AI-006 | Gemini CLI | Agente terminal (Google) | ✅ Completa |
| AI-007 | OpenCode CLI | Agente terminal (NVIDIA) | ✅ Completa |

### Agentes autónomos (GitHub)

| ID | Herramienta | Uso principal | Estado |
|----|-------------|---------------|--------|
| AI-008 | GitHub | Control de versiones | 📝 Pendiente |
| AI-009 | Devin (Cognition) | Agente autónomo (PRs automáticos) | ✅ Completa |

### APIs y servicios

| ID | Herramienta | Uso principal | Estado |
|----|-------------|---------------|--------|
| API-001 | OpenRouter | Gateway de IA (modelos gratuitos) | ✅ Completa |

### Bases de datos

| ID | Herramienta | Uso principal | Estado |
|----|-------------|---------------|--------|
| DB-001 | Firebase | Auth + Firestore (actual) | ✅ Completa |
| DB-002 | Supabase | PostgreSQL (migración en curso) | 🔄 En progreso |

### Scraping y testing

| ID | Herramienta | Uso principal | Estado |
|----|-------------|---------------|--------|
| SCRAPE-001 | Playwright | Web scraping + E2E tests | ✅ Completa |

### Agente actual

| ID | Herramienta | Uso principal | Estado |
|----|-------------|---------------|--------|
| AI-015 | Hermes Agent | Documentación y análisis | ✅ Completa |

---

## 📖 Contenido por capítulo

### 01 — Resumen Ejecutivo
- [x] `resumen-ejecutivo.md` — Síntesis del proyecto
- [x] `objetivos.md` — Objetivos generales y específicos
- [x] `resumen-ejecutivo-fichas.md` — Una página por herramienta usada

### 02 — Estado del Arte
- [x] `estado-arte-ia-generativa.md` — Evolución de la IA generativa
- [x] `herramientas-comparativa.md` — Comparativa de herramientas 2024-2026
- [x] `tendencias-futuro.md` — Líneas de evolución

### 03 — Análisis de Requisitos
- [x] `analisis-empresa.md` — Estudio de la empresa y necesidades
- [x] `entrevistas.md` — Notas de entrevistas con técnicos
- [x] `requisitos-funcionales.md` — Casos de uso
- [x] `requisitos-no-funcionales.md` — Rendimiento, seguridad, etc.

### 04 — Diseño Técnico
- [x] `arquitectura.md` — Diagrama de arquitectura
- [x] `stack-tecnologico.md` — Decisiones de tecnología
- [x] `modelo-datos.md` — Esquema de datos
- [x] `diseno-ui-ux.md` — Sistema de diseño

### 05 — Proceso de Desarrollo
- [x] `metodologia.md` — Cómo trabajé con IA generativa
- [x] `fases-desarrollo.md` — Cronología de fases
- [x] `prompts-exitosos.md` — Ejemplos de prompts efectivos
- [x] `lecciones-aprendidas.md` — Errores y aciertos

### 06 — Herramientas IA
- [x] 14 fichas técnicas completadas
- [ ] `comparativa-final.md` — Tabla comparativa de todas

### 07 — Manuales de Uso
- [x] `manual-sonex.md` — Cómo usar el asistente IA
- [x] `manual-fichas-tecnicas.md` — Navegación del catálogo
- [x] `manual-almacen.md` — Simulador de pedidos
- [x] `manual-presupuestos.md` — Generador de presupuestos
- [x] `manual-kpis.md` — Dashboard de KPIs
- [x] `manual-formacion.md` — Gestión de formación

### 08 — Resultados
- [x] `resultados-cuantitativos.md` — Métricas (velocidad, coste, etc.)
- [x] `resultados-cualitativos.md` — Valor percibido por usuarios
- [x] `validacion-profesores.md` — Feedback de los tutores

### 09 — Conclusiones
- [x] `conclusiones.md` — ¿Se cumplieron los objetivos?
- [x] `lineas-futuro.md` — Mejoras y ampliaciones
- [x] `impacto-educativo.md` — Qué aporta al ciclo formativo

### 10 — Manual para Profesores
- [x] `guia-rapida.md` — Cómo usar la documentación
- [x] `actividades-propuestas.md` — Ejercicios para alumnos
- [x] `evaluacion.md` — Rúbricas de evaluación
- [x] `recursos-adicionales.md` — Enlaces y materiales

---

## 🎯 Cómo usar esta documentación

### Para escribir tu memoria

1. Empieza por `00-README.md` para entender la estructura
2. Usa las fichas de herramientas (06) como referencia
3. Consulta `EVOLUCION.md` del repo principal para cronología real
4. Los scripts en `/app/scripts/` son tus "pruebas" de metodología

### Para crear la presentación

1. Cada capítulo tiene suficiente material para 3-5 diapositivas
2. Las fichas de herramientas son ideales para "Estado del arte"
3. Los resultados en `08-resultados` son el cierre perfecto

### Para dejar recursos a futuros alumnos

1. Copia la carpeta `06-herramientas-ia/` completa
2. Usa `10-manual-profesores/` como plantilla
3. Añade tus propias notas y ejercicios

---

## 📊 Estadísticas de documentación

| Capítulo | Archivos | Estado |
|----------|----------|--------|
| 00 - README | 1 | ✅ |
| 01 - Resumen | 3 | ✅ Completo |
| 02 - Estado del arte | 3 | ✅ Completo |
| 03 - Análisis requisitos | 4 | ✅ Completo |
| 04 - Diseño técnico | 4 | ✅ Completo |
| 05 - Proceso desarrollo | 4 | ✅ Completo |
| 06 - Herramientas IA | 14 | ✅ Completo |
| 07 - Manuales de uso | 6 | ✅ Completo |
| 08 - Resultados | 3 | ✅ Completo |
| 09 - Conclusiones | 3 | ✅ Completo |
| 10 - Manual profesores | 5 | ✅ Completo |

**Total creado:** 50 archivos MD (1 README + 14 fichas + 35 capítulo)

---

## 🔜 Próximos pasos

1. **Completar cap 01-05** — Narrativa del proyecto
2. **Crear cap 07-09** — Manuales, resultados y conclusiones
3. **Desarrollar cap 10** — Manual para profesores

---

*Última actualización: Mayo 2026*
*Generado con Hermes Agent para Iago — Proyecto Fin de Ciclo 2025-2026*