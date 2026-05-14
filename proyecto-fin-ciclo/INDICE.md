# ÍNDICE GENERAL — Proyecto Fin de Ciclo

## Documentación del proyecto

### 📁 Estructura principal por fases

```
proyecto-fin-ciclo/
├── 00-README.md                    ← Guía de lectura + glosario
├── INDICE.md                       ← Este archivo
│
├── ════════════════════════════════════════════════════
├── FASE I — CONTEXTO Y FUNDAMENTO
├── ════════════════════════════════════════════════════
├── 01-introduccion/           ← Presentación del proyecto completo
├── 02-contexto-de-la-ia/           ← Panorama actual de IA generativa
│
├── ════════════════════════════════════════════════════
├── FASE II — ANÁLISIS Y DISEÑO
├── ════════════════════════════════════════════════════
├── 03-analisis-y-requisitos/       ← Estudio de la empresa, propuesta inicial
├── 04-diseno-tecnico/              ← Arquitectura y componentes del sistema
│
├── ════════════════════════════════════════════════════
├── FASE III — EJECUCIÓN CON IA
├── ════════════════════════════════════════════════════
├── 05-proceso-desarrollo/          ← Metodología de trabajo con IA
├── 06-herramientas-ia/            ← Catálogo de herramientas (fichas)
│
├── ════════════════════════════════════════════════════
├── FASE IV — RESULTADOS Y CIERRE
├── ════════════════════════════════════════════════════
├── 07-manuales-uso/                ← Manuales de usuario de la app
├── 08-resultados/                  ← Métricas, validación y presupuesto
├── 09-conclusiones/               ← Conclusiones y líneas futuras
├── 10-manual-profesores/          ← Guía didáctica para docentes
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

Cada capítulo responde a una pregunta concreta dentro de la narrativa del proyecto.

---

### ═══ FASE I — CONTEXTO Y FUNDAMENTO ═══

> **Propósito:** Situar al lector en el proyecto: qué se hizo, por qué es relevante y en qué contexto tecnológico se desarrolló.

### 01 — Presentación del proyecto
> *"¿De qué va este proyecto en conjunto?"*

Vista general para quien no tiene tiempo de leer la memoria completa.

- [x] `presentacion-del-proyecto.md` — Presentación del proyecto: problema, solución, metodología, resultados
- [x] `objetivos.md` — Objetivos generales y específicos del PFC
- [x] `presentacion-de-herramientas.md` — Presentación de las herramientas IA usadas en el proyecto

### 02 — Contexto de la IA
> *"¿Por qué este proyecto tiene sentido ahora?"*

Panorama actual de la IA generativa aplicada al desarrollo web.

- [x] `evolucion-ultimos-anos.md` — Evolución de la IA generativa (2020-2026)
- [x] `herramientas-descubiertas.md` — Comparativa de herramientas que probé
- [x] `tendencia-futuro.md` — Hacia dónde va todo esto: memoria persistente, auto-aprendizaje, automatización total

---

### ═══ FASE II — ANÁLISIS Y DISEÑO ═══

> **Propósito:** Demostrar que hay trabajo de ingeniería previo a la codificación.

### 03 — Análisis y Requisitos
> *"¿Qué problemas reales resuelve la aplicación?"*

Documenta necesidades detectadas durante las prácticas y la propuesta inicial del proyecto.

- [x] `analisis-previo.md` — Propuesta inicial del proyecto (entregable Fase 1 oficial)
- [x] `analisis-empresa.md` — Estudio de la empresa: quién es, cómo funciona, qué necesidades tiene
- [x] `requisitos-funcionales.md` — Casos de uso: qué debe hacer cada módulo
- [x] `requisitos-no-funcionales.md` — Rendimiento, seguridad, usabilidad, restricciones

### 04 — Diseño Técnico
> *"¿Cómo está construido y por qué se tomaron esas decisiones?"*

Traduce los requisitos a decisiones técnicas. Incluye el listado completo de componentes (equivalente al listado de E/S de un PLC).

- [x] `arquitectura.md` — Diagramas del sistema, flujos de datos, capas de seguridad (con referencias a SVGs en `/diagramas/`)
- [x] `listado-componentes.md` — Inventario completo: rutas, componentes, hooks, APIs y colecciones
- [x] `stack-tecnologico.md` — Justificación de cada tecnología elegida
- [x] `modelo-datos.md` — Esquema de datos Firestore y estructura de colecciones
- [x] `diseno-ui-ux.md` — Sistema de diseño: colores, tipografía, espaciado, componentes

---

### ═══ FASE III — EJECUCIÓN CON IA ═══

> **Propósito:** Documentar el núcleo diferencial del PFC: cómo se trabajó con IA generativa.

### 05 — Proceso de Desarrollo
> *"¿Cómo se construyó la aplicación usando IA generativa?"*

El capítulo más importante de la memoria. Documenta la metodología, fases, errores y aciertos.

- [x] `metodologia.md` — Cómo trabajé con IA generativa: flujo de 4 fases
- [x] `fases-desarrollo.md` — Cronología real del proyecto (12 fases)
- [x] `prompts-exitosos.md` — Ejemplos de prompts que funcionaron bien
- [x] `lecciones-aprendidas.md` — Errores cometidos y cómo se evitarían

### 06 — Herramientas IA
> *"¿Qué herramientas de IA se usaron y para qué?"*

Catálogo detallado de cada herramienta del ecosistema IA explorado.

- [x] 13 fichas técnicas de herramientas IA
- [ ] `comparativa-final.md` — Tabla comparativa de todas las herramientas

---

### ═══ FASE IV — RESULTADOS Y CIERRE ═══

> **Propósito:** Demostrar que el producto funciona, validar resultados y dejar materiales reutilizables.

### 07 — Manuales de Uso
> *"¿Cómo se usa cada módulo de la aplicación?"*

Guías de usuario para los 6 módulos. Demuestra que el producto es usable por personal no técnico.

- [x] `manual-sonex.md` — Asistente técnico con IA
- [x] `manual-fichas-tecnicas.md` — Navegación del catálogo de productos
- [x] `manual-almacen.md` — Simulador de ciclo de pedido
- [x] `manual-presupuestos.md` — Generador de presupuestos
- [x] `manual-kpis.md` — Dashboard de indicadores logísticos
- [x] `manual-formacion.md` — Matriz de competencias y formación

### 08 — Resultados
> *"¿Funciona? ¿Mereció la pena?"*

Métricas, feedback y presupuesto detallado del proyecto.

- [x] `resultados-cuantitativos.md` — Métricas: tiempo, coste, rendimiento, catálogo
- [x] `resultados-cualitativos.md` — Valor percibido por usuarios potenciales
- [x] `presupuesto.md` — Desglose detallado de costes (0€) vs. costes estimados de mercado

### 09 — Conclusiones
> *"¿Cumplí los objetivos? ¿Qué aprendí? ¿Qué sigue?"*

Cierra el círculo del proyecto.

- [x] `conclusiones.md` — Evaluación de objetivos cumplidos y no cumplidos
- [x] `lineas-futuro.md` — Mejoras y ampliaciones posibles
- [x] `impacto-educativo.md` — Qué aporta este proyecto al ciclo formativo

### 10 — Manual para Profesores
> *"¿Cómo pueden otros profesores usar esto en clase?"*

Guía didáctica para que docentes repliquen la metodología.

- [x] `guia-rapida.md` — Cómo usar esta documentación como profesor
- [x] `actividades-propuestas.md` — Ejercicios prácticos para alumnos
- [x] `evaluacion.md` — Rúbricas de evaluación del proyecto
- [x] `recursos-adicionales.md` — Enlaces y materiales complementarios

---

## 🎯 Cómo usar esta documentación

### Para escribir tu memoria

1. Empieza por `00-README.md` para entender la estructura
2. Usa las fichas de herramientas (06) como referencia
3. Consulta `EVOLUCION.md` del repo principal para cronología real
4. Los diagramas SVG en `/diagramas/` sirven como esquemas del sistema

### Para crear la presentación

1. Cada fase son 3-5 diapositivas
2. Las fichas de herramientas y los resultados son ideales para la defensa
3. Los diagramas SVG se pueden usar directamente en la presentación

### Para dejar recursos a futuros alumnos

1. Copia la carpeta `06-herramientas-ia/` completa
2. Usa `10-manual-profesores/` como plantilla
3. Añade tus propias notas y ejercicios

---

## 📊 Estadísticas de documentación

| Fase | Capítulo | Archivos | Estado |
|------|----------|----------|--------|
| | 00 - README + INDICE | 2 | ✅ |
| **I** Contexto | 01 - Presentación del proyecto | 3 | ✅ |
| **I** Contexto | 02 - Contexto de la IA | 3 | ✅ |
| **II** Análisis y diseño | 03 - Análisis y requisitos | 4 | ✅ |
| **II** Análisis y diseño | 04 - Diseño técnico | 5 | ✅ |
| **III** Ejecución con IA | 05 - Proceso desarrollo | 4 | ✅ |
| **III** Ejecución con IA | 06 - Herramientas IA | 13 | ✅ |
| **IV** Resultados y cierre | 07 - Manuales de uso | 6 | ✅ |
| **IV** Resultados y cierre | 08 - Resultados | 3 | ✅ |
| **IV** Resultados y cierre | 09 - Conclusiones | 3 | ✅ |
| **IV** Resultados y cierre | 10 - Manual profesores | 5 | ✅ |

**Total creado:** 51 archivos MD (2 índices + 13 fichas + 36 capítulo)

---

## 🔜 Próximos pasos

1. **Revisar coherencia narrativa entre capítulos** — Asegurar que cada fase fluye correctamente
2. **Completar Fase I** — Revisar que contexto y fundamento están bien argumentados
3. **Reforzar Fase III** — Añadir `comparativa-final.md` en herramientas IA
4. **Unificar tono y estilo** — Revisar que todos los capítulos usan el mismo lenguaje
5. **Generar documento final** — Exportar a DOCX para entrega oficial

---

*Última actualización: Mayo 2026*
*Generado para Iago Durán — Proyecto Fin de Ciclo 2025-2026*
