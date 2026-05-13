# MANUAL PARA PROFESORES — Proyecto Fin de Ciclo con IA Generativa

> **Nota:** Este manual está pensado para que cualquier profesor del ciclo de Automatización y Robótica Industrial (o ciclos similares) pueda utilizar la experiencia y documentación de este proyecto como recurso didáctico para cursos futuros.

---

## 1. Introducción

Este proyecto demuestra que un estudiante de ciclo formativo puede, utilizando herramientas de IA generativa gratuitas y de vanguardia, desarrollar una aplicación web profesional que resuelve necesidades reales de una empresa del sector eléctrico.

### 1.1 ¿Qué demuestra este proyecto?

1. **Viabilidad técnica:** Un estudiante sin experiencia previa en desarrollo web puede crear una SPA completa con autenticación, base de datos, API de IA y despliegue en producción.

2. **Herramientas gratuitas son suficientes:** Todas las herramientas usadas son gratuitas o tienen tier gratuito generoso. No se necesita inversión económica.

3. **Metodología replicable:** El proceso de trabajo (prompt → iteración → testing) es aplicable a cualquier proyecto.

4. **Coste cero en producción:** La aplicación está en producción en Vercel + Firebase Spark sin ningún coste.

### 1.2 ¿Por qué es relevante para el ciclo?

El ciclo de Automatización y Robótica Industrial forma técnicos que trabajarán con:
- PLCs yautómatas programables
- SCADAs y sistemas de supervisión
- Redes industriales (Profibus, Modbus, etc.)
- IoT y sensores
- **Software de gestión y visualización** ← Este proyecto cubre este aspecto

Aunque el proyecto no es de automatización pura, demuestra competencias transferibles:
- Análisis de requisitos con el cliente (la empresa)
- Diseño de soluciones técnicas
- Implementación y pruebas
- Documentación

---

## 2. Las 5 herramientas esenciales que todo alumno debería conocer

### 2.1 Herramientas de desarrollo con IA

| Herramienta | Tipo | Coste | Uso principal |
|-------------|------|-------|--------------|
| **Claude Web** | Chat/web | Gratis | Diseño de arquitectura, prototipos |
| **Windsurf IDE** | IDE con IA | Gratis (ilimitado) | Coding en tiempo real |
| **OpenCode CLI** | Agente terminal | Gratis (modelos NVIDIA) | Refactorización, scripts |

### 2.2 Herramientas de infraestructura

| Herramienta | Tipo | Coste | Uso principal |
|-------------|------|-------|--------------|
| **GitHub** | Control de versiones | Gratis | Almacenar código, colaboración |
| **Vercel** | Hosting + serverless | Gratis (tier hobby) | Desplegar aplicaciones web |

### 2.3 ¿Por qué estas 5 y no otras?

- **Sin coste:** Todas tienen tier gratuito suficiente para proyectos académicos
- **Sin autenticación compleja:** OpenCode y Vercel no requieren cuenta compleja
- **De vanguardia:** Son las herramientas que están redefiniendo cómo se programa
- **Complementarias:** Cada una cubre una fase diferente del desarrollo

---

## 3. Plan de actividades propuesto (4 sesiones)

### Sesión 1: Introducción a la IA generativa para desarrollo (2h)

**Objetivo:** Que los alumnos entiendan qué es la IA generativa y cómo puede ayudarles en su trabajo.

**Contenido:**
1. Qué es un modelo de lenguaje (LLM) y cómo funciona [15 min]
2. Demostración: pidiéndole a Claude que diseñe un programa en Python para calcular temperaturas en un PLC [30 min]
3. Diferencia entre chat web y herramientas de coding [15 min]
4. Actividad: Primer contacto con Claude Web [45 min]
   - Crear cuenta en claude.ai
   - Pedir un programa simple (ej: calculadora de secciones de cable)
   - Discutir resultados

**Material necesario:**
- Ordenadores con acceso a internet
- Cuentas de claude.ai (gratis)

**Entregable:**
- Programa generado por cada alumno + screenshot de la conversación

---

### Sesión 2: IDE con IA + Control de versiones (2h)

**Objetivo:** Instalar y configurar Windsurf IDE + GitHub

**Contenido:**
1. Instalación de Windsurf [20 min]
2. Configuración básica + conexión a GitHub [20 min]
3. Conceptos de control de versiones (commit, push, branch, merge) [30 min]
4. Actividad: Hacer un commit en GitHub desde Windsurf [45 min]

**Material necesario:**
- Ordenadores con acceso a internet
- Cuenta de GitHub (gratis)
- Windsurf instalado

**Entregable:**
- Repositorio GitHub con al menos 3 commits documentados

---

### Sesión 3: Deployment en Vercel (2h)

**Objetivo:** Desplegar una aplicación web simple en producción

**Contenido:**
1. Concepto de hosting y CDN [15 min]
2. Registro en Vercel + conexión con GitHub [20 min]
3. Qué es una Serverless Function [15 min]
4. Actividad: Desplegar la calculadora de la Sesión 1 en Vercel [60 min]
   - Crear repo en GitHub
   - Conectar a Vercel
   - Ver el resultado en la URL de producción

**Material necesario:**
- Repositorio de la Sesión 2
- Cuenta de Vercel (gratis)

**Entregable:**
- URL pública de la aplicación desplegada

---

### Sesión 4: Proyecto en grupo — Aplicación para la empresa (2h)

**Objetivo:** Aplicar todo lo aprendido en un proyecto simplificado

**Actividad:** En grupos de 2-3, diseñar y prototipar (solo mockup, no código) una herramienta web para técnicos eléctricos.

**Pasos:**
1. Elegir un problema real (ej: calculadora de circuitos, selector de protecciones, etc.)
2. Diseñar 3 pantallas en papel o Figma
3. Pedir a Claude que genere el mockup HTML/CSS
4. Desplegar en Vercel (si da tiempo)

**Entregable:**
- Mockup funcional en URL de Vercel
- Prompt usado para generarlo
- Documentación de qué hicieron y qué hizo la IA

---

## 4. Rúbrica de evaluación sugerida

### Para proyectos que usen IA generativa

| Criterio | Excelente (10) | Bueno (8) | Suficiente (6) | Insuficiente (4) |
|----------|---------------|-----------|---------------|------------------|
| **Uso de herramientas IA** | Usa 3+ herramientas de forma estratégica | Usa 2 herramientas con criterio | Usa 1 herramienta de forma básica | No usa herramientas IA |
| **Calidad del código generado** | Código bien estructurado, con tests y documentación | Código funcional con estructura clara | Código que funciona pero desorganizado | Código roto o incompleto |
| **Prompt engineering** | Prompts específicos con contexto, constraints y ejemplos | Prompts claros con contexto | Prompts genéricos | Copia prompts sin entenderlos |
| **Validación y testing** | Tests automáticos + pruebas manuales documentadas | Pruebas manuales detalladas | Pruebas básicas | Sin pruebas |
| **Documentación** | README completo + documentación de herramientas usadas | README claro | Documentación mínima | Sin documentación |
| **Autonomía vs. Dependencia de IA** | Usa IA como amplificador, mantiene criterio propio | Buena dependencia, poco criterio propio | Dependencia excesiva de IA | Copia código sin entenderlo |

### Preguntas de validación (para la defensa)

1. *¿Qué prompt usaste para generar X? Explica por qué funciona.*
2. *Si el código generado por IA tuviera un bug, ¿cómo lo encontrarías?*
3. *¿Qué partes del proyecto las hizo la IA y cuáles tú?*
4. *¿Cómo mejoraste el código generado por IA?*
5. *¿Qué limitaciones tiene usar IA generativa para desarrollo?*

---

## 5. Preguntas frecuentes de los alumnos

### "¿Puedo usar esto para todo el proyecto?"

Sí, pero con criterio. El tribunal evaluará el resultado final, no si usaste IA o no. Si la IA genera código que no entiendes, no podrás defenderlo ni adaptarlo.

### "¿El código de IA cuenta como plagio?"

No, si lo documentas y entiendes. El plagio es presentar código de otra persona como propio sin attribution. Usar IA generativa para generar código es como usar un compilador que autocompleta código: el trabajo está en guiar, revisar y mejorar.

### "¿Qué pasa si la IA me da código incorrecto?"

La IA genera código con errores. Tu trabajo es:
1. Entender qué hace el código
2. Probarlo exhaustivamente
3. Corregir los errores

Si no sabes si el código es correcto, es que no deberías usarlo.

### "¿Cuánto código puedo pedir que me genere?"

Todo lo que necesites, pero:
- El 100% del código puede ser generado por IA
- El 100% del diseño, requisitos y validación debe ser tuyo
- La documentación y defensa debe ser enteramente tuya

---

## 6. Recursos adicionales

### Documentación de las herramientas

Ver la carpeta `proyecto-fin-ciclo/06-herramientas-ia/` donde hay fichas técnicas detalladas de:

- Claude Web (AI-001)
- GitHub Copilot (AI-002)
- Vercel (AI-003)
- Windsurf (AI-004)
- OpenCode CLI (AI-007)
- OpenRouter (API-001)
- Firebase (DB-001)
- Playwright (SCRAPE-001)

### Enlaces útiles

| Recurso | URL |
|---------|-----|
| Claude | https://claude.ai |
| Windsurf | https://codeium.com/windsurf |
| OpenCode | https://opencode.ai |
| GitHub | https://github.com |
| Vercel | https://vercel.com |
| OpenRouter | https://openrouter.ai |
| Documentación React | https://react.dev |
| Documentación Vite | https://vitejs.dev |

### Libros recomendados

- *Hands-On Generative AI with Transformers* — O'Reilly
- *Practical AI for Healthcare Professionals* — Routledge (ejemplos transferibles)

---

## 7. Recomendaciones para futuros proyectos

### Lo que funcionó bien en este proyecto

1. **Empezar simple:** Los primeros componentes fueron artefactos JSX independientes, no una SPA completa.
2. **Iterar rápido:** Cada día había una versión nueva funcional, aunque imperfecta.
3. **Documentar mientras trabajas:** EVOLUCION.md se actualizaba en cada sesión.
4. **Usar herramientas gratuitas:** Nunca necesitas pagar por herramientas de desarrollo.

### Lo que se podría mejorar

1. **Tests desde el principio:** Añadir tests E2E con Playwright antes de refactorizar.
2. **Validación con usuarios reales:** Probar la aplicación con técnicos de la empresa durante el desarrollo.
3. **Integración continua:** GitHub Actions para build y tests automáticos.

---

## 8. Licencia y reutilización

Este proyecto y su documentación están bajo licencia **MIT**. Puedes:

- ✅ Usar las fichas de herramientas en clase
- ✅ Adaptar el plan de actividades
- ✅ Copiar la estructura de documentación para otros proyectos
- ✅ Usar el código como referencia (con atribución)

---

*Manual elaborado en Mayo 2026*
*Proyecto: "Proyecto PFC — Suite de herramientas web para técnicos eléctricos"*
*Autor: Iago (iagorobo24-hub)*
*Ciclo: Automatización y Robótica Industrial*

---

**Nota final:** Este manual es un documento vivo. Si lo usas, por favor contribuye mejorando los materiales para los próximos alumnos. La educación mejora con la experiencia compartida.