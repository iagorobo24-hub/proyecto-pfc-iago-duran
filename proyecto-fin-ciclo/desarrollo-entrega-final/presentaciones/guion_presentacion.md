# 🎤 Guion de Presentación del Proyecto de Fin de Ciclo (PFC)

**Autor:** Iago Durán Romera  
**Proyecto:** Suite de Herramientas Web B2B para el Sector Eléctrico  
**Estilo de Diapositiva:** Neo-Brutalista (Interactivo)  
**Tiempo Recomendado:** ~15 minutos (Promedio de 40-45 segundos por diapositiva)

---

## ⏱️ Tabla Resumen de Tiempos y Transiciones

| Diapositiva | Título en Pantalla | Tiempo | Hito Clave / Concepto Técnico |
| :--- | :--- | :--- | :--- |
| **01 (Portada)** | Suite Web B2B Sector Eléctrico | 0:00 - 0:45 | Presentación del ponente, marco e hipótesis central. |
| **02 (Cap. 1)** | Introducción y Enfoque | 0:45 - 1:30 | Viabilidad de desarrollo asistido por IA por perfil técnico. |
| **03 (Cap. 1b)** | Tecnologías y Ámbito | 1:30 - 2:10 | Límite del proyecto, React 19 + Supabase, 0.00€ coste. |
| **04 (Cap. 2)** | Fugas de Productividad | 2:10 - 2:50 | Estudio en Sonepar: 5 ineficiencias de campo detectadas. |
| **05 (Cap. 2b)** | Restricciones y Stakeholders | 2:50 - 3:30 | Sin acceso a SAP, tiers gratuitos, mapa de influencia. |
| **06 (Cap. 3)** | Priorización y Módulos | 3:30 - 4:10 | 22 Requisitos Funcionales agrupados por prioridades. |
| **07 (Cap. 3b)** | Calidad de Ingeniería | 4:10 - 4:50 | Requisitos No Funcionales: carga <3s, inyección SQL, RLS. |
| **08 (Cap. 4)** | Arquitectura y Stack | 4:50 - 5:30 | Cliente SPA, protección de 14 rutas, migración Supabase. |
| **09 (Cap. 4b)** | Resiliencia y Seguridad | 5:30 - 6:15 | Proxy `createStubClient`, políticas RLS, View Transitions. |
| **10 (Cap. 5)** | Ecosistema y Herramientas IA | 6:15 - 6:55 | Evolución agéntica 2020-2026 y matriz de selección. |
| **11 (Cap. 5b)** | Aprendizajes y Tendencias IA | 6:55 - 7:35 | Hibridación de IA, el rol del desarrollador como supervisor. |
| **12 (Cap. 6)** | Evaluación de Herramientas IA | 7:35 - 8:15 | Claude.ai, Windsurf IDE, OpenCode CLI, Hermes Agent. |
| **13 (Cap. 6b)** | Workflow y Lecciones | 8:15 - 8:55 | Ciclo de 3 fases (Diseño, Implementación, Debug/Testing). |
| **14 (Cap. 7)** | Metodología y Pruebas | 8:55 - 9:40 | Calidad: 270 tests Vitest + 155 tests Playwright (425 total). |
| **15 (Cap. 7b)** | Cronología de Desarrollo | 9:40 - 10:20 | 12 fases incrementales, migración Firebase ➔ Supabase. |
| **16 (Cap. 7c)** | Casos de Estudio y Errores | 10:20 - 11:10 | Gestión de credenciales (Serverless proxy), bugs JSON, O(1). |
| **17 (Cap. 8)** | Operativa Core | 11:10 - 12:00 | Demo visual: Catálogo de 8 niveles, cotizador PDF, KPIs. |
| **18 (Cap. 8b)** | Módulos Avanzados | 12:00 - 12:50 | Picking en tiempo real (Supabase Presence), chatbot SONEX. |
| **19 (Cap. 9)** | Resultados Cuantitativos | 12:50 - 13:30 | ROI: TCO de 0€, valor comercial 19.000€, Lighthouse verde. |
| **20 (Cap. 9b)** | Resultados Cualitativos | 13:30 - 14:15 | 7/7 módulos completados, límites académicos, autoevaluación. |
| **21 (Cap. 10)** | Conclusiones y Líneas a Futuro | 14:15 - 15:00 | 15 fichas IA, plan docente de 4 sesiones FP, hoja de ruta. |

---

## 🎙️ Guion Detallado por Diapositiva

### 🎴 Diapositiva 1: Portada (slide-0)
* **Texto en Pantalla:** PORTADA ACADÉMICA // PFC 2026 - SUITE WEB B2B SECTOR ELÉCTRICO. Autor: Iago Durán Romera.
* **Badges Activos:** `★ PFC 2026 ★`, `0.00€ REAL`, `SONEPAR B2B`, `IA ~80%`, `7 HERRAMIENTAS`, `270 TESTS ✓`.
* **Tiempo:** 0:00 - 0:45
* **Discurso Literal:**
  > *"Muy buenos días a todos los miembros del tribunal. Mi nombre es Iago Durán Romera, alumno de Automatización y Robótica Industrial. Hoy tengo el placer de presentarles la defensa de mi Proyecto de Fin de Ciclo: una **Suite de Herramientas Web B2B** orientada al sector de la distribución eléctrica. Este proyecto ha sido desarrollado bajo un modelo innovador de ingeniería asistida por Inteligencia Artificial generativa. A lo largo de los próximos quince minutos, les expondré cómo hemos sido capaces de diseñar, programar, testear y desplegar una plataforma industrial de alta calidad en un plazo récord de tres meses y con un coste de mantenimiento de cero euros."*
* **Acción Física:** Mirada firme al tribunal. Pasar a la siguiente diapositiva.

---

### 🎴 Diapositiva 2: Capítulo 1 — Introducción y Enfoque (slide-1)
* **Texto en Pantalla:** CAPÍTULO 1 // INTRODUCCIÓN Y ENFOQUE - PRESENTACIÓN DEL PROYECTO.
* **Badges Activos:** `SPA REACT 19`, `7 HERRAMIENTAS`, `PFC 2026`, `OG1-OG5 ✓`, `CLI + IA`, `0.00€ LICENCIAS`.
* **Tiempo:** 0:45 - 1:30
* **Discurso Literal:**
  > *"El Capítulo 1 plantea el reto y la hipótesis principal del proyecto: ¿Es factible que un estudiante de un perfil técnico no informático desarrolle, valide y ponga en producción una suite web compleja en solo tres meses? La respuesta es sí, siempre y cuando se adopte una metodología estructurada de colaboración humano-IA. El valor diferencial de este PFC no es solo la suite funcional en sí, sino el legado metodológico. Hemos definido objetivos claros: cumplir con la funcionalidad de 7 herramientas de campo para técnicos, catalogar de forma crítica más de 15 herramientas de IA probadas en combate, y garantizar la máxima calidad del software manteniendo los costes reales en cero euros."*
* **Acción Física:** Enfatizar con las manos la idea de "perfil no informático" y "metodología humano-IA".

---

### 🎴 Diapositiva 3: Capítulo 1 — Alcance y Tecnologías (slide-1b)
* **Texto en Pantalla:** CAPÍTULO 1 // ALCANCE Y TECNOLOGÍAS - TECNOLOGÍAS Y ÁMBITO.
* **Badges Activos:** `VITE 7`, `SUPABASE SQL`, `VERCEL FREE`, `4.689 PRODS`, `270 TESTS`, `155 PLAYWRIGHT`.
* **Tiempo:** 1:30 - 2:10
* **Discurso Literal:**
  > *"Para delimitar el alcance del proyecto, establecimos qué debíamos incluir y qué debíamos dejar fuera para asegurar la entrega en plazo. La suite cuenta con 7 herramientas integradas en una SPA moderna bajo React 19 y Vite 7. Incluimos datos reales de catálogo con más de cuatro mil productos indexados y un asistente inteligente de soporte técnico. Sin embargo, excluimos de forma realista la construcción de aplicaciones móviles nativas o la integración directa con el ERP corporativo real debido a las obvias restricciones de acceso. Lo más destacable es que toda la infraestructura se aloja en tiers gratuitos de proveedores como Vercel y Supabase, logrando un coste de operación de cero euros."*
* **Acción Física:** Apuntar al badge de `0.00€` o `4.689 PRODS` en pantalla.

---

### 🎴 Diapositiva 4: Capítulo 2 — Análisis de la Empresa (slide-2)
* **Texto en Pantalla:** CAPÍTULO 2 // ANÁLISIS DE LA EMPRESA - FUGAS DE PRODUCTIVIDAD.
* **Badges Activos:** `5 INEFICIENCIAS`, `SONEPAR ~2200`, `B2B ELÉCTRICO`, `PDF CAÓTICOS`, `EXCEL LENTO`, `PAPEL SIN HIST`.
* **Tiempo:** 2:10 - 2:50
* **Discurso Literal:**
  > *"En el Capítulo 2 realizamos un estudio de campo en la empresa distribuidora, un gigante del sector B2B con aproximadamente 2200 empleados. A través de la observación directa durante mi periodo de prácticas curriculares, identifiqué cinco fugas críticas de productividad en la operativa técnica: búsquedas lentas de fichas técnicas en PDFs dispersos, dudas constantes de compatibilidad multimarca en obra, elaboración manual de presupuestos en Excel propensa a fallos de cálculo, un registro informal y desordenado de incidencias y, por último, la descentralización del control de planes de formación de técnicos. Estos cinco puntos de dolor justifican el desarrollo de cada uno de los módulos de la aplicación."*
* **Acción Física:** Enumerar con los dedos las 5 ineficiencias rápidamente.

---

### 🎴 Diapositiva 5: Capítulo 2 — Limitaciones y Stakeholders (slide-2b)
* **Texto en Pantalla:** CAPÍTULO 2 // LIMITACIONES Y AUDIENCIA - RESTRICCIONES Y STAKEHOLDERS.
* **Badges Activos:** `3 STAKEHOLDERS`, `SIN SAP REAL`, `GDPR CUMPLIDO`, `TÉCNICOS CAMPO`, `ROI VALIDADO`, `RESPONSABLE TI`.
* **Tiempo:** 2:50 - 3:30
* **Discurso Literal:**
  > *"El desarrollo se enfrentó a límites severos. Al no contar con API interna ni acceso directo a la base de datos de producción SAP, tuvimos que diseñar scrapers de datos públicos para poblar el catálogo. Además, el límite estricto de presupuesto cero nos obligó a optimizar las consultas para no exceder los límites diarios de la base de datos Supabase en su tier gratuito. A nivel humano, analizamos tres grupos clave de partes interesadas: los técnicos de campo, cuyo foco es la agilidad; el equipo comercial, interesado en cotizaciones rápidas; y el tribunal académico, que exige el cumplimiento de los estándares de calidad del ciclo."*
* **Acción Física:** Mostrar el contraste entre restricciones técnicas (SAP) y valor para el usuario.

---

### 🎴 Diapositiva 6: Capítulo 3 — Requisitos Funcionales (slide-3)
* **Texto en Pantalla:** CAPÍTULO 3 // REQUISITOS FUNCIONALES - PRIORIZACIÓN Y MÓDULOS.
* **Badges Activos:** `22 REQUISITOS`, `12 P. ALTA`, `10 P. MEDIA`, `OAUTH GOOGLE`, `STREAMING CHAT`, `PDF 1-CLIC`.
* **Tiempo:** 3:30 - 4:10
* **Discurso Literal:**
  > *"En el Capítulo 3 estructuramos un total de 22 Requisitos Funcionales mediante una matriz de priorización ágil. Definimos doce requisitos como Prioridad Alta, los cuales representan el core del negocio: control de acceso seguro vía Google OAuth, búsqueda predictiva de productos enriquecidos con IA en catálogo, cálculo automatizado de presupuestos comerciales, y soporte conversacional streaming con detección automática de referencias mediante el chatbot SONEX. En prioridad media y baja dejamos la operativa complementaria, como el registro de incidencias, el control de KPIs logísticos y la matriz de formación."*
* **Acción Física:** Resaltar verbalmente la importancia de la priorización para cumplir el plazo de 3 meses.

---

### 🎴 Diapositiva 7: Capítulo 3 — Calidad y Rendimiento (slide-3b)
* **Texto en Pantalla:** CAPÍTULO 3 // CALIDAD Y RENDIMIENTO - CALIDAD DE INGENIERÍA.
* **Badges Activos:** `FCP < 1.2s`, `SEGURIDAD RLS`, `99.9% UPTIME`, `STUB FALLBACK`, `CSP HEADER`, `COSTE 0.00€`.
* **Tiempo:** 4:10 - 4:50
* **Discurso Literal:**
  > *"Para que la aplicación fuera viable comercialmente, definimos exigentes Requisitos No Funcionales. Primero, el rendimiento: el First Contentful Paint debe ser inferior a 1.2 segundos para evitar la frustración del técnico en campo. Segundo, la seguridad de la información: implementamos políticas de seguridad Row Level Security a nivel de base de datos para blindar el acceso a los datos de cada usuario. Finalmente, aseguramos la tolerancia a fallos mediante mecanismos de fallback local que permiten al técnico seguir consultando información esencial aun cuando pierda la conexión a internet dentro del almacén."*
* **Acción Física:** Enfatizar la palabra "Seguridad" y "Fallback".

---

### 🎴 Diapositiva 8: Capítulo 4 — Arquitectura y Stack (slide-4)
* **Texto en Pantalla:** CAPÍTULO 4 // ARQUITECTURA Y STACK - ARQUITECTURA Y STACK.
* **Badges Activos:** `REACT 19 SPA`, `SUPABASE PG`, `ROUTING PROTECT`, `CSS MODULES`, `GIN INDEXES`, `VERCEL DEPLOY`.
* **Tiempo:** 4:50 - 5:30
* **Discurso Literal:**
  > *"El Capítulo 4 detalla el diseño técnico del sistema. Estructuramos una SPA utilizando React 19 y Vite 7 para garantizar una construcción rápida y ligera. El frontend se protege mediante un sistema de routing unificado con middleware que blinda catorce rutas internas del negocio. En cuanto al backend, migramos el modelo relacional desde un esquema plano a Supabase PostgreSQL. Esto nos permite estructurar la base de datos de manera relacional en dos tablas principales: marcas y productos, optimizando las consultas del catálogo mediante índices especializados GIN para búsqueda de texto libre."*
* **Acción Física:** Explicar con seguridad la arquitectura SPA y la optimización de base de datos.

---

### 🎴 Diapositiva 9: Capítulo 4 — Resiliencia, Seguridad y UI/UX (slide-4b)
* **Texto en Pantalla:** CAPÍTULO 4 // SEGURIDAD Y RESILIENCIA - RESILIENCIA Y SEGURIDAD.
* **Badges Activos:** `STUB CLIENT`, `MOCK FALLBACK`, `RLS POLICIES`, `SERVERLESS KEY`, `AZUL SONEPAR`, `VIEW TRANSITION`.
* **Tiempo:** 5:30 - 6:15
* **Discurso Literal:**
  > *"Uno de los mayores logros de resiliencia es el proxy `createStubClient`. Diseñamos un interceptor en el cliente de base de datos que, en caso de detectar una caída de conexión remota o de los servidores de Supabase, desvía todas las operaciones a una base de datos local stub en memoria para evitar el bloqueo del técnico. A nivel de seguridad, ocultamos por completo las API keys de la Inteligencia Artificial mediante funciones Serverless en Vercel, protegiendo al sistema de inyecciones o robos de tokens. Todo ello se presenta bajo una experiencia de usuario cuidada con colores corporativos y transiciones fluidas en modo oscuro."*
* **Acción Física:** Explicar el concepto del "Stub Client" como un salvavidas del sistema en producción.

---

### 🎴 Diapositiva 10: Capítulo 5 — Contexto de la IA (slide-5)
* **Texto en Pantalla:** CAPÍTULO 5 // CONTEXTO DE LA IA GENERATIVA - ECOSISTEMA Y ELECCIÓN DE HERRAMIENTAS.
* **Badges Activos:** `EVOLUCIÓN LLM`, `AI TRINITY`, `CLAUDE WEB`, `WINDSURF IDE`, `OPENCODE CLI`, `OPENROUTER API`.
* **Tiempo:** 6:15 - 6:55
* **Discurso Literal:**
  > *"En el Capítulo 5 analizamos la revolución que ha supuesto la IA generativa. No se trata solo de copiar y pegar fragmentos sueltos, sino de orquestar un ecosistema completo. Exponemos la evolución desde 2020 a 2026, pasando de simples modelos de lenguaje a agentes CLI autónomos. Para trabajar de manera profesional, estructuramos una matriz de uso: Claude en web para conceptualizar, Windsurf como IDE central de código con contexto de archivos, y agentes de terminal como OpenCode para refactorizaciones y corrección de bugs, todo soportado por la pasarela de OpenRouter a coste cero."*
* **Acción Física:** Mostrar con las manos las tres capas de interacción con la IA.

---

### 🎴 Diapositiva 11: Capítulo 5 — Lecciones y Tendencias IA (slide-5b)
* **Texto en Pantalla:** CAPÍTULO 5 // TENDENCIAS Y APRENDIZAJES - APRENDIZAJES Y TENDENCIAS.
* **Badges Activos:** `INTEGRACIÓN > 1`, `FREE TIERS`, `PERSIST MEMORY`, `AUTO-REFINING`, `E2E AUTO DEPLOY`, `IA IN PLCS/CAD`.
* **Tiempo:** 6:55 - 7:35
* **Discurso Literal:**
  > *"Este análisis de campo nos dejó dos lecciones fundamentales: la hibridación de herramientas es muy superior al uso de un único modelo, y los planes gratuitos son viables para proyectos productivos si se gestionan adecuadamente los límites de tokens. Mirando hacia el futuro de nuestra especialidad, la automatización, las tendencias son claras: se está pasando de programar líneas de código a supervisar flujos lógicos. Veremos una integración profunda de asistentes de IA nativos en entornos como CAD o software de control de PLCs como TIA Portal o CODESYS, acelerando radicalmente la puesta en marcha de maquinaria."*
* **Acción Física:** Conectar la IA directamente con la Automatización Industrial (el ciclo formativo del alumno).

---

### 🎴 Diapositiva 12: Capítulo 6 — Herramientas de IA (slide-6)
* **Texto en Pantalla:** CAPÍTULO 6 // HERRAMIENTAS DE IA UTILIZADAS - EVALUACIÓN Y SELECCIÓN DE HERRAMIENTAS.
* **Badges Activos:** `METODOLOGÍA 1-5`, `CLAUDE WEB 4.4`, `WINDSURF 4.2`, `OPENCODE CLI 4.2`, `HERMES LOCAL 4.8`, `OPENROUTER 0.00€`.
* **Tiempo:** 7:35 - 8:15
* **Discurso Literal:**
  > *"En el Capítulo 6 catalogamos y evaluamos más de quince herramientas de IA bajo criterios de ingeniería. No nos limitamos a un solo asistente: comparamos soluciones conversacionales, IDEs y agentes CLI. Claude.ai fue nuestro aliado para estructurar la arquitectura por su alto razonamiento; Windsurf como el editor principal de código rápido con Cascade; OpenCode como agente CLI de terminal model-agnostic para depuraciones avanzadas; y Hermes Agent como el pionero con memoria a largo plazo capaz de recordar nuestras preferencias de desarrollo."*
* **Acción Física:** Hacer una pausa breve para mostrar la solidez científica de haber evaluado las herramientas sistemáticamente en lugar de usarlas al azar.

---

### 🎴 Diapositiva 13: Capítulo 6 — Workflow y Lecciones (slide-6b)
* **Texto en Pantalla:** CAPÍTULO 6 // CICLO DE TRABAJO Y LECCIONES - WORKFLOW Y LECCIONES.
* **Badges Activos:** `FASE 1: DISEÑO`, `FASE 2: CODIGO`, `FASE 3: TESTS`, `MATRIZ DECISIÓN`, `RATE LIMITS`, `0.00€ API COST`.
* **Tiempo:** 8:15 - 8:55
* **Discurso Literal:**
  > *"La segunda parte del Capítulo 6 ilustra nuestro workflow integrado de desarrollo. Definimos tres fases: diseño conceptual con Claude, implementación de código con Windsurf/Copilot y depuración/tests con OpenCode y Gemini CLI. Además, sintetizamos una matriz de decisión rápida para futuros desarrolladores: delegar cada tarea a la IA más óptima según su fuerte. La lección principal es que no existe una herramienta perfecta; el éxito radica en saber orquestarlas de manera combinada, controlando los límites de tokens para operar a coste cero."*
* **Acción Física:** Mostrar en pantalla el flujo cíclico de diseño -> código -> test.

---

### 🎴 Diapositiva 14: Capítulo 7 — Proceso de Desarrollo y Pruebas (slide-7)
* **Texto en Pantalla:** CAPÍTULO 7 // PROCESO DE DESARROLLO Y CALIDAD - METODOLOGÍA Y PRUEBAS.
* **Badges Activos:** `ITERACIÓN PROMPT`, `270 TESTS UNIT`, `155 TESTS E2E`, `REGRESIÓN VISUAL`, `INYECCIÓN SQL`, `425 TESTS TOTAL`.
* **Tiempo:** 8:55 - 9:40
* **Discurso Literal:**
  > *"El Capítulo 7 detalla nuestra metodología de trabajo y control de calidad. Implementamos un ciclo cerrado en el que yo defino las especificaciones en prompts estructurados, la IA genera la lógica y posteriormente se valida todo con tests continuos. No confiamos ciegamente en el código: desarrollamos dos suites de pruebas. Una de 270 tests unitarios en Vitest para blindar los cálculos de presupuestos e IndexedDB, y otra de 155 tests E2E con Playwright que ejecutan pruebas de regresión visual y simulan ataques de inyección SQL para garantizar seguridad."*
* **Acción Física:** Enfatizar la cifra: **425 pruebas automatizadas** como garantía de robustez profesional.

---

### 🎴 Diapositiva 15: Capítulo 7 — Fases y Evolución (slide-7b)
* **Texto en Pantalla:** CAPÍTULO 7 // CRONOLOGÍA DE DESARROLLO - 12 FASES DE CONSTRUCCIÓN.
* **Badges Activos:** `FASES 0-2 BASE`, `FASES 3-5 UX`, `FASES 6-8 ESCALA`, `FASES 10-11 MDZ`, `CTO AUDIT`, `40 FILES FIXED`.
* **Tiempo:** 9:40 - 10:20
* **Discurso Literal:**
  > *"En esta sección mostramos la cronología del desarrollo del PFC, dividido en doce fases ágiles. Comenzamos creando prototipos JSX individuales con Claude. Luego los unificamos en un AppShell moderno con React 19 y Vite 7. La parte de datos fue un reto: tuvimos que migrar de Firebase Firestore, que nos bloqueaba por el rate limit del tier gratuito al importar el catálogo, hacia Supabase PostgreSQL. Finalmente, realizamos una auditoría de código CTO, sanitizando inputs y corrigiendo abort controllers en cuarenta archivos antes del despliegue final."*
* **Acción Física:** Relatar con honestidad el reto técnico de la migración de la base de datos (demuestra resiliencia y capacidad de adaptación).

---

### 🎴 Diapositiva 16: Capítulo 7 — Casos de Estudio y Errores (slide-7c)
* **Texto en Pantalla:** CAPÍTULO 7 // CASOS DE ESTUDIO Y ERRORES - APRENDIZAJES Y ERRORES.
* **Badges Activos:** `EXPOSICIÓN API`, `SERVERLESS SOL`, `PERF BOTTLENECK`, `O(1) OPTIMIZATION`, `VALIDATOR BUG`, `Object.assign`.
* **Tiempo:** 10:20 - 11:10
* **Discurso Literal:**
  > *"Finalmente, el Capítulo 7 expone los errores y aprendizajes técnicos reales que forjaron mi experiencia. El primer mes expusimos la API key en el frontend; lo solucionamos creando una función serverless en Vercel. También nos enfrentamos a problemas de rendimiento en la base de datos debido a consultas pesadas, que resolvimos reduciendo el lookup de marcas a orden constante O(1). Por último, depuramos un bug silencioso en el validador JSON del chatbot que descartaba datos sin emitir logs de error, reafirmando la lección de que no hay que confiar a ciegas y siempre se debe auditar el flujo completo de los datos."*
* **Acción Física:** Usar un tono reflexivo y profesional al admitir los problemas y detallar cómo se solucionaron.

---

### 🎴 Diapositiva 17: Capítulo 8 — Manuales de Uso (Operativa Core) (slide-8)
* **Texto en Pantalla:** CAPÍTULO 8 // MANUALES DE USO — OPERATIVA CORE - EXPLOTACIÓN DE MÓDULOS CORE Y PRESUPUESTOS.
* **Badges Activos:** `8 NIVELES NAV`, `AI ENRICHED`, `AUTO CALCULUS`, `PDF EXPORT`, `SKILL MATRIX`, `KPI COLOR SEMAP`.
* **Tiempo:** 11:10 - 12:00
* **Discurso Literal:**
  > *"En el Capítulo 8 detallamos los manuales de uso para la operativa core del negocio. Primero, las Fichas Técnicas con navegación jerárquica en 8 niveles y fichas que enriquecen su información con IA. Segundo, el Generador de Presupuestos que calcula automáticamente el IVA del 21% y exporta a PDF en un clic. Tercero, la Matriz de Competencias para controlar la capacitación de la plantilla y, finalmente, un Dashboard de KPIs logísticos con alertas tipo semáforo en verde, amarillo y rojo."*
* **Acción Física:** Gestos descriptivos que sugieran orden y facilidad de uso de la aplicación.

---

### 🎴 Diapositiva 18: Capítulo 8 — Manuales de Uso (Módulos Avanzados) (slide-8b)
* **Texto en Pantalla:** CAPÍTULO 8 // MANUALES DE USO — MÓDULOS AVANZADOS - SIMULADOR DE ALMACÉN, SONEX AI CHATBOT Y DASHBOARD DE INCIDENCIAS.
* **Badges Activos:** `4 STAGES PICKING`, `REALTIME MULTIP`, `4 CHAT MODES`, `CHAT DELIV STATUS`, `IA INCIDENT DIAG`, `2H ALARM BANNER`.
* **Tiempo:** 12:00 - 12:50
* **Discurso Literal:**
  > *"En esta segunda parte del manual de uso, revisamos los módulos interactivos avanzados. El simulador didáctico de picking de almacén permite interactuar colaborativamente gracias a Supabase Presence en tiempo real. Por otro lado, el chatbot SONEX asiste técnicamente mediante 4 modos especializados y un feedback visual de estados de chat. Por último, el Dashboard de Incidencias asiste en averías con IA e incluye un banner de seguridad para incidencias críticas pendientes durante más de dos horas."*
* **Acción Física:** Enfatizar la innovación del simulador multijugador en tiempo real.

---

### 🎴 Diapositiva 19: Capítulo 9 — Resultados Cuantitativos (slide-9)
* **Texto en Pantalla:** CAPÍTULO 9 // RESULTADOS CUANTITATIVOS - EVALUACIÓN ECONÓMICA Y RENDIMIENTO.
* **Badges Activos:** `TCO 0.00€`, `AHORRO 792€/AÑO`, `VALOR 19.000€`, `~12.000 LOC`, `425 TESTS ✓`, `LIGHTHOUSE GREEN`.
* **Tiempo:** 12:50 - 13:30
* **Discurso Literal:**
  > *"El Capítulo 9 cuantifica los resultados. Logramos desplegar una suite con coste de infraestructura de cero euros, lo que se traduce en un ahorro de 792 euros al año en hosting y base de datos, y un valor comercial estimado de desarrollo de 19.000 euros. En términos técnicos, la aplicación cuenta con unas doce mil líneas de código, más de cien componentes, trece hooks y una cobertura de 270 tests unitarios y 155 Playwright E2E (425 en total), logrando un rendimiento excelente en Lighthouse con métricas en verde y un bundle liviano de ciento setenta kilobytes."*
* **Acción Física:** Apuntar al badge de `LIGHTHOUSE GREEN` o `VALOR 19.000€`.

---

### 🎴 Diapositiva 20: Capítulo 9 — Resultados Cualitativos y Validación (slide-9b)
* **Texto en Pantalla:** CAPÍTULO 9 // RESULTADOS CUALITATIVOS - VALOR APORTADO Y VALIDACIÓN.
* **Badges Activos:** `7/7 MÓDULOS COMP`, `CATALOGO REAL`, `LIMITES ACADÉM`, `SIN SAP OFICIAL`, `AUTOEVAL H. ALTA`, `AUTOEVAL H. INTERM`.
* **Tiempo:** 13:30 - 14:15
* **Discurso Literal:**
  > *"En esta segunda sección del Capítulo 9, validamos el aspecto cualitativo del proyecto. Hemos completado con éxito la totalidad de los siete módulos funcionales, demostrando que la IA democratiza la creación de software industrial robusto por estudiantes no informáticos. Sin embargo, reconozemos limitaciones: al ser un proyecto académico carece de soporte oficial y no se conecta con ERPs reales como SAP. El balance académico es extraordinariamente positivo, logrando desarrollar habilidades de nivel alto en interacción con IA y resolución de problemas."*
* **Acción Física:** Tono honesto y maduro, reconociendo limitaciones pero valorando el inmenso aprendizaje práctico.

---

### 🎴 Diapositiva 21: Capítulo 10 — Conclusiones y Líneas a Futuro (slide-10)
* **Texto en Pantalla:** CAPÍTULO 10 // CONCLUSIONES Y TRABAJOS FUTUROS - CUMPLIMIENTO DE OBJETIVOS Y LEGADO DOCENTE.
* **Badges Activos:** `OBJETIVOS CUMPL`, `15 FICHAS IA`, `4 SESIONES FP`, `CORTO: IMAGENES`, `MEDIO: APP PWA`, `LARGO: AGENTES`.
* **Tiempo:** 14:15 - 15:00
* **Discurso Literal:**
  > *"Llegamos al Capítulo 10 de conclusiones. Hemos verificado el cumplimiento total de los objetivos mediante una metodología rigurosa humano-IA. Como legado para futuros alumnos y docentes de FP, aportamos quince fichas de herramientas de IA y un plan formativo de cuatro sesiones para el profesorado. De cara al futuro, establecemos una hoja de ruta: a corto plazo ampliar el catálogo Supabase; a medio plazo crear una app móvil con sincronización IndexedDB offline; y a largo plazo, investigar el uso de agentes de IA para el mantenimiento autónomo del repositorio. Muchas gracias por su atención."*
* **Acción Física:** Postura erguida, sonrisa profesional y agradecimiento al tribunal. Fin de la presentación.

---

## 🛡️ Preparación para la Defensa (Preguntas del Tribunal)

Aquí tienes las 5 preguntas técnicas más probables que el tribunal podría hacerte y cómo responder con autoridad basándote en el código del proyecto:

### ❓ Pregunta 1: *«¿Cómo es posible que cobres 0.00€ en APIs de IA si las llamadas a OpenRouter tienen coste?»*
* **Respuesta Clave:** 
  > *"Utilizamos el agregador OpenRouter consumiendo exclusivamente modelos bajo licencia gratuita (como **DeepSeek-R1-Distill**, **Qwen-2.5** o versiones gratuitas de **Llama 3**). OpenRouter provee endpoints gratuitos para desarrollo a coste cero. Además, implementamos en el cliente un sistema de caché local en variables y control de flujos de tokens para evitar llamadas redundantes de red."*

### ❓ Pregunta 2: *«¿Qué ocurre si la base de datos Supabase se cae en el almacén? ¿Cómo funciona el Stub Client?»*
* **Respuesta Clave:** 
  > *"En `supabaseClient.js` diseñamos una clase proxy utilizando el patrón de diseño decorator sobre las funciones principales `.from()`, `.select()` y `.insert()`. Si Supabase devuelve un error de red o timeout, interceptamos la excepción y el cliente cambia instantáneamente a un modo simulado. Este lee y escribe en archivos estáticos JSON locales (`productsMock.json`) y sincroniza los datos del usuario en el `localStorage` del navegador mediante el prefijo `pfc_` para asegurar que el operario pueda continuar trabajando sin interrupción visual."*

### ❓ Pregunta 3: *«¿Por qué migraste de Firebase Firestore a Supabase PostgreSQL a mitad de proyecto?»*
* **Respuesta Clave:** 
  > *"Firebase Firestore es una base de datos documental no relacional. Al intentar importar nuestro catálogo real de más de cuatro mil productos con múltiples familias y subfamilias, nos encontramos con dos problemas graves: primero, la dificultad de realizar búsquedas predictivas complejas de texto libre sin integrar servicios de terceros muy costosos como Algolia; y segundo, que el límite diario de lecturas gratuitas de Firebase Spark tier se agotaba en pocos minutos de pruebas. Supabase PostgreSQL, al ser relacional y soportar de forma nativa extensiones de búsqueda de texto e índices GIN, nos permitió realizar búsquedas ultra rápidas a coste cero."*

### ❓ Pregunta 4: *«¿Cómo garantizas que las API Keys de la base de datos o de la IA no se expongan en el frontend?»*
* **Respuesta Clave:** 
  > *"Seguimos un principio de seguridad de 'defensa en profundidad'. Las claves de base de datos de Supabase que están en el cliente son únicamente la clave pública anon, la cual no permite saltarse las reglas de Row Level Security (RLS) que limitan la lectura de datos por usuario. Por otro lado, la clave de la API de IA de OpenRouter nunca toca el navegador: las llamadas se envían a través de un proxy intermedio utilizando **Vercel Serverless Functions** (alojado en `app/api/ai.js`). Este script backend inyecta de forma segura la API key desde las variables de entorno de Vercel antes de llamar al servidor externo, manteniendo la credencial oculta del cliente."*

### ❓ Pregunta 5: *«¿Qué diferencia un Requisito Funcional de uno No Funcional en tu suite?»*
* **Respuesta Clave:** 
  > *"Los Requisitos Funcionales describen el comportamiento dinámico de la aplicación: por ejemplo, 'el módulo de presupuestos debe exportar en PDF'. En cambio, los Requisitos No Funcionales definen las restricciones operativas y atributos de calidad del sistema: por ejemplo, 'la exportación de PDF no debe tardar más de 3 segundos' o 'toda la comunicación cliente-servidor debe estar cifrada bajo HTTPS'. Ambos son esenciales para garantizar una suite de software robusta a nivel industrial."*
