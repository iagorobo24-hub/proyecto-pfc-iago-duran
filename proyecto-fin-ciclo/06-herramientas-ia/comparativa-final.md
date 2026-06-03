# 06 — HERRAMIENTAS DE IA: Comparativa Final

> *"¿Qué herramienta usar en cada situación después de probar 15+ opciones?"*

Este capítulo presenta una comparativa detallada de todas las herramientas de IA evaluadas durante el proyecto, con recomendaciones específicas para cada caso de uso. La experiencia práctica ha demostrado que **no existe una herramienta universal**: cada una tiene fortalezas en escenarios específicos.

---

## 6.1 Metodología de Evaluación

### Criterios de Comparación

Cada herramienta ha sido evaluada según los siguientes criterios (escala 1-5):

| Criterio | Descripción | Peso |
|----------|-------------|------|
| **Facilidad de uso** | Curva de aprendizaje, calidad de interfaz | 20% |
| **Potencia de razonamiento** | Calidad de respuestas, complejidad de análisis | 25% |
| **Velocidad** | Tiempo de respuesta en queries típicas | 15% |
| **Coste** | Relación calidad/precio, tier gratuito | 20% |
| **Integración** | Facilidad de integración en workflows | 10% |
| **Fiabilidad** | Consistencia de resultados, uptime | 10% |

### Escala de Puntuación

- ⭐⭐⭐⭐⭐ (5): Excelente, supera expectativas
- ⭐⭐⭐⭐ (4): Muy bueno, recomendable
- ⭐⭐⭐ (3): Aceptable, útil en某些场景
- ⭐⭐ (2): Deficiente, con limitaciones importantes
- ⭐ (1): No recomendable

---

## 6.2 Tabla Comparativa General

### Herramientas Conversacionales (Web/Chat)

| Herramienta | Facilidad | Razonamiento | Velocidad | Coste | Integración | Fiabilidad | **Puntuación** | **Uso Recomendado** |
|-------------|-----------|--------------|-----------|-------|------------|------------|----------------|-------------------|
| **Claude (Anthropic)** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | **4.4** | Arquitectura, código complejo, análisis |
| **ChatGPT Plus** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | **4.1** | Código rutinario, documentation, brainstorming |
| **Gemini Advanced** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | **3.8** | Búsqueda de información, multimodal |
| **Windsurf (Cascade)** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | **4.2** | Coding completo, auto-complete |

### Agentes CLI (Terminal)

| Herramienta | Facilidad | Razonamiento | Velocidad | Coste | Integración | Fiabilidad | **Puntuación** | **Uso Recomendado** |
|-------------|-----------|--------------|-----------|-------|------------|------------|----------------|-------------------|
| **GitHub Copilot** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | **4.3** | Autocompletado en tiempo real |
| **OpenCode (NVIDIA)** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | **4.2** | Agente autónomo, debugging, refactoring |
| **Devin (Cognition)** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | **3.5** | PRs automáticos, tareas largas |
| **Qwen CLI** | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐ | **3.2** | Cerrado desde abri 2026 |
| **Gemini CLI** | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐ | **3.1** | Experimental, limitado |

### APIs y Gateways

| Herramienta | Facilidad | Razonamiento | Velocidad | Coste | Integración | Fiabilidad | **Puntuación** | **Uso Recomendado** |
|-------------|-----------|--------------|-----------|-------|------------|------------|----------------|-------------------|
| **OpenRouter** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | **4.4** | Gateway universal, failover automático |
| **Anthropic API** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | **4.2** | Uso directo de Claude, control total |

---

## 6.3 Análisis Detallado por Herramienta

### 6.3.1 Claude (Anthropic) — ⭐⭐⭐⭐⭐ (4.4/5)

**Resumen:** El mejor modelo para tareas que requieren razonamiento profundo, arquitectura de sistemas y código de alta calidad.

#### Fortalezas

1. **Razonamiento superior**: Claude 3.5 Sonnet demuestra comprensión contextual excepcional. En pruebas de arquitectura, propuso soluciones que habrían tomado días brainstormear manualmente.

2. **Context window amplio**: 200K tokens permiten analizar archivos completos de código fuente sin truncation, crítico para refactoring de componentes grandes.

3. **Análisis de código estático**: Excelente identificando anti-patterns, vulnerabilidades potenciales y oportunidades de optimización.

4. **Documentación técnica**: Genera documentación clara, bien estructurada, con ejemplos funcionales.

#### Debilidades

1. **Rate limits estrictos**: Even with Pro subscription, intensive usage can hit limits.
2. **Coste**: $20/mes para Pro, pero vale la pena para uso profesional.
3. **No tiene acceso a internet**: Solo conoce datos hasta su training cut-off.

#### Casos de Uso Óptimos

```
✅ DISEÑO DE ARQUITECTURA
   "Necesito diseñar una arquitectura de microservices para una app de 
   inventario con 50k productos. Considera PostgreSQL, Redis cache, y 
   CQRS pattern."
   
✅ REFACTORING COMPLEJO
   "Tengo un componente React de 800 líneas que hace demasiado. 
   Propón una separación en componentes más pequeños siguiendo 
   principios SOLID."
   
✅ ANÁLISIS DE REQUISITOS
   "Analiza estos requisitos funcionales y detecta inconsistencias, 
   ambigüedades o gaps técnicos."
```

#### Configuración Recomendada

```javascript
// OpenRouter (recomendado) - incluye Claude
const config = {
  model: 'anthropic/claude-3.5-sonnet',
  max_tokens: 4096,
  temperature: 0.7
};

// API Directa (más control)
const config = {
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 4096,
  temperature: 0.7,
  system: "Eres un arquitecto de software senior especializado en React."
}
```

---

### 6.3.2 GitHub Copilot — ⭐⭐⭐⭐⭐ (4.3/5)

**Resumen:** El mejor complemento para desarrollo day-to-day. Invisible pero invaluable.

#### Fortalezas

1. **Zero friction**: Se integra en VSCode sin setup. Autocompletado en tiempo real mientras escribes.

2. **Contexto de código**: Understands the current file and project structure.

3. **Multilanguage**: Soporta todos los lenguajes principales (JS, TS, Python, Go, Rust, etc.).

4. **Chat integrado**: Copilot Chat permite preguntas contextuales sin cambiar de ventana.

#### Debilidades

1. **Profundidad limitada**: No es ideal para tareas arquitectónicas complejas.
2. **Dependencia de contexto**: Quality degrades if code is messy or poorly documented.
3. **Code smell ocasional**: A veces sugiere código que "funciona" pero no es idiomático.

#### Casos de Uso Óptimos

```
✅ AUTOCOMPLETADO RUTINARIO
   while (condition) {
     // Copilot sugiere el body completo
   }
   
✅ BOILERPLATE CODE
   // Escribe "axios.get" y Copilot completa with error handling
   
✅ TEST GENERATION
   /// Genera tests unitarios para esta función
```

#### Configuración Recomendada

```json
// .vscode/settings.json
{
  "github.copilot.enable": {
    "*": true,
    "yaml": false,
    "plaintext": false
  },
  "github.copilot.inlineSuggest.enable": true,
  "github.copilot.chatCodeBubble.enable": true
}
```

---

### 6.3.3 OpenRouter — ⭐⭐⭐⭐⭐ (4.4/5)

**Resumen:** El mejor gateway para acceso a múltiples modelos con failover automático.

#### Fortalezas

1. **Multi-modelo**: Acceso a 100+ modelos desde un solo API endpoint.

2. **Failover automático**: Si un modelo falla, redirige a otro automáticamente.

3. **Modelos gratuitos**: Acceso a modelos free como Qwen, Gemma, Mistral sin coste.

4. **Unified API**: Un solo format para todos los modelos.

#### Debilidades

1. **Latencia adicional**: Cada request pasa por OpenRouter, añadiendo ~50-100ms.
2. **Coste variable**: Algunos modelos son costosos; requiere monitoring.
3. **No todos los modelos disponibles**: Algunos requieren API keys propias.

#### Casos de Uso Óptimos

```javascript
// Configuración con failover
const openrouter = new OpenRouter({
  apiKey: process.env.OPENROUTER_KEY,
  fallback: {
    primary: 'anthropic/claude-3-haiku',
    secondary: 'google/gemini-pro',
    tertiary: 'openai/gpt-3.5-turbo'
  }
});

// Streaming para UX fluida
const stream = await openrouter.chat({
  messages: [{ role: 'user', content: prompt }],
  stream: true
});
```

---

### 6.3.4 Windsurf (Cascade) — ⭐⭐⭐⭐ (4.2/5)

**Resumen:** IDE con IA integrada que reemplaza Copilot para coding completo.

#### Fortalezas

1. **Agente de coding completo**: No solo autocompletado, sino ejecución de tareas enteras.

2. **Context awareness**: Mantiene contexto de la sesión completa, no solo archivo actual.

3. **Command palette IA**: Ejecuta comandos naturales como "refactor this component".

4. **Sin límite de mensajes**: Unlike Copilot, no tiene límites de usage.

#### Debilidades

1. **Consumo de recursos**: Más pesado que VSCode + Copilot.
2. **Curva de aprendizaje**: Más features = más tiempo para dominar.
3. **Menos maduro**: Producto más nuevo, algunos bugs ocasionales.

#### Casos de Uso Óptimos

```
✅ REFACTORING AUTOMATIZADO
   "Select all components in the fichas folder and extract common 
   styles to a shared CSS module."
   
✅ FEATURE COMPLETA
   "Create a new hook for handling pagination with URL sync. 
   Include TypeScript types and JSDoc comments."
```

---

### 6.3.5 Devin (Cognition) — ⭐⭐⭐ (3.5/5)

**Resumen:** Agente autónomo prometedor pero con limitaciones en producción.

#### Fortalezas

1. **Autonomous problem solving**: Puede trabajar en tareas de forma independiente durante horas.

2. **PR automation**: Crea PRs automáticamente con descripción y tests.

3. **Code review**: Analiza PRs y sugiere mejoras automáticamente.

#### Debilidades

1. **Coste elevado**: $500/mes para equipos, prohibitively expensive for individuals.
2. **Speed**: Tareas simples pueden tomar más tiempo que haciéndolas manualmente.
3. **Reliability issues**: Ocasionalmente genera código que no compila o rompe tests.

#### Casos de Uso Óptimos

```
✅ PRs AUTOMÁTICOS
   Devin monitorea branches y crea PRs automatically with:
   - Descripción generada
   - Tests unitarios
   - changelog
   
⚠️ USAR CON SUPERVISIÓN
   Nunca hacer merge sin revisar el código generado
```

---

## 6.4 Recomendaciones por Escenario

### 6.4.1 Desarrollo de Nuevo Módulo

| Fase | Herramienta | Por qué |
|------|-------------|---------|
| **1. Diseño** | Claude | Razonamiento arquitectónico superior |
| **2. Boilerplate** | Copilot / Windsurf | Genera código base rápidamente |
| **3. Lógica compleja** | Claude + OpenRouter | Análisis profundo con Claude |
| **4. Testing** | Windsurf | Generación automática de tests |
| **5. Documentation** | Claude | Documentación clara y estructurada |

### 6.4.2 Debugging Complejo

| Prioridad | Herramienta | Estrategia |
|-----------|-------------|------------|
| **1ª** | Claude | Pega el error completo, solicita análisis |
| **2ª** | OpenCode | Agente autónomo para explorar el codebase |
| **3ª** | Copilot Chat | Preguntas rápidas sobre código específico |

### 6.4.3 Refactoring

| Tipo | Herramienta | Enfoque |
|------|-------------|---------|
| **Micro (1-5 archivos)** | Copilot | Autocompletado + suggestions in-place |
| **Meso (5-20 archivos)** | Windsurf | Command palette para transformaciones |
| **Macro (20+ archivos)** | Claude | Diseño de nueva arquitectura primero |

### 6.4.4 Documentación

| Tipo | Herramienta | Ventaja |
|------|-------------|---------|
| **README** | Claude | Estructura + contenido de calidad |
| **JSDoc** | Copilot | Inline, sin cambiar de contexto |
| **API Docs** | Claude + OpenRouter | Generación desde código |
| **Manuales usuario** | Claude | Lenguaje natural, ejemplos claros |

---

## 6.5 Comparativa de Costes

### 6.5.1 Coste Mensual Real (Uso Profesional Moderado)

| Herramienta | Tier | Coste/mes | Valoración |
|------------|------|-----------|------------|
| **Claude Pro** | Pro | $20 | 💰💰💰💰💰 Excelente valor |
| **GitHub Copilot** | Pro | $10 | 💰💰💰💰💰 Muy bueno |
| **ChatGPT Plus** | Plus | $20 | 💰💰💰💰 Bueno |
| **Windsurf** | Pro | $15 | 💰💰💰💰 Muy bueno |
| **OpenRouter** | Pay-as-you-go | ~$5-20 | 💰💰💰💰💰 Flexible |
| **Devin** | Team | $500 | 💰💰 Caro para uso individual |

### 6.5.2 Alternativas Gratuitas

| Herramienta | Coste | Limitación | Uso Recomendado |
|------------|-------|------------|-----------------|
| **Claude Haiku** | Free (OpenRouter) | Rate limits | Queries rápidas |
| **GPT-3.5 Turbo** | Free (OpenRouter) | Rate limits | Queries simples |
| **Gemini Pro** | Free (OpenRouter) | Rate limits | Búsqueda de info |
| **Qwen 2.5** | Free | Limitado | Coding básico |

---

## 6.6 workflow Recomendado

Basado en la experiencia del proyecto, el workflow óptimo es:

```
┌─────────────────────────────────────────────────────────────────────┐
│                    WORKFLOW INTEGRADO DE IA                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  DISEÑO                    DESARROLLO                REVISIÓN        │
│  ┌─────────┐              ┌─────────┐             ┌─────────┐      │
│  │ Claude  │              │ Windsurf│────────────▶│ Copilot │      │
│  │ (chat)  │              │ (IDE)   │  código     │ (inline)│      │
│  └────┬────┘              └────┬────┘             └────┬────┘      │
│       │                        │                        │          │
│       │ arquitectura           │ implementación          │ review   │
│       │ decisiones             │ features                │ suggest  │
│       ▼                        ▼                        ▼          │
│  ┌─────────┐              ┌─────────┐             ┌─────────┐    │
│  │ OpenRouter│             │ OpenCode│             │ Devin   │    │
│  │ (API)   │              │ (CLI)   │             │ (PRs)   │    │
│  └─────────┘              └────┬────┘             └────┬────┘    │
│       │                        │                        │          │
│       │ contexto LLM           │ debugging              │ testing  │
│       ▼                        ▼                        ▼          │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 6.7 Lecciones Aprendidas

### 6.7.1 Qué Funcionó Bien

1. **Combinación de herramientas**: Usar Claude para diseño + Copilot para implementación reduce tiempo total significativamente.

2. **OpenRouter como abstraction layer**: Permite cambiar de modelo sin cambiar código.

3. **Prompts estructurados**: Invertir tiempo en bien prompts = mejores resultados.

4. **Fallback strategy**: Siempre tener un plan B cuando una IA falla.

### 6.7.2 Qué No Funcionó

1. **Dependencia excesiva de Devin**: Confiar demasiado en código generado sin revisión.

2. **Ignorar rate limits**: Sobrecargar una API = bloqueo temporal de toda la aplicación.

3. **No documentar prompts**: Prompts buenos se olvidan;需要一个 systema de storage.

### 6.7.3 Recomendaciones Finales

1. **Inicia con Claude Pro**: La mejor inversión inicial por su versatilidad.
2. **Añade Copilot después**: Mejora productividad en día a día.
3. **Usa OpenRouter para producción**: Permite failover y modelos gratuitos.
4. **Evita Devin hasta tener presupuesto**: $500/mes no justificado para proyectos individuales.

---

## 6.8 Matriz de Decisión Rápida

| Si necesitas... | Usa... |
|-----------------|--------|
| Diseñar arquitectura | Claude |
| Escribir código rutinario | Copilot / Windsurf |
| Debuggear algo complejo | Claude + contexto del error |
| Generar tests | Windsurf |
| Crear PR automáticamente | Devin |
| Acceso API barato | OpenRouter |
| Queries rápidas gratuitas | Claude Haiku (OpenRouter) |
| Documentación técnica | Claude |
| Multimodal (imágenes + texto) | Gemini |
| Coding ilimitado barato | Windsurf |

---

## 📝 NOTA DE ACTUALIZACIÓN: Capítulo 6 en el MEMORIA_PFC_V5.docx

*Actualización realizada el 03/06/2026 - Commit 65ce3cb*

### ✅ Estado del Capítulo 6 en el V5

El documento `MEMORIA_PFC_V5.docx` **integra y expande** este contenido en dos ubicaciones:

#### 1. **Capítulo 6 - HERRAMIENTAS E IA UTILIZADAS** (9.7KB, 44 párrafos)

Lista las 10 herramientas principales usadas en el proyecto:
- 6.1 Claude Web (Anthropic)
- 6.2 GitHub Copilot
- 6.3 Vercel
- 6.4 Windsurf IDE
- 6.5 Qwen CLI
- 6.6 Gemini CLI
- 6.7 OpenCode CLI
- 6.8 OpenRouter
- 6.9 Firebase
- 6.10 Supabase

**Estado:** Listado básico con descripciones. Menos detallado que este archivo.

#### 2. **Anexo A - FICHAS DE HERRAMIENTAS** (17.6KB, 240 párrafos)

**Excelentes fichas técnicas detalladas** para cada una de las 10 herramientas. Cada ficha incluye:
- ¿Qué es?
- ¿Para qué lo usé en el proyecto?
- ¿Cómo lo usé? (flujo de trabajo)
- Ejemplos de uso real
- Ventajas y limitaciones encontradas
- Lecciones aprendidas
- Comparativa con alternativas
- Referencias

### 📊 Comparativa: Este Archivo vs Capítulo 6 + Anexo A del V5

| Contenido | Este Archivo | V5 Capítulo 6 | V5 Anexo A | Mejor En |
|-----------|-------------|--------------|------------|----------|
| **Tabla comparativa general** | ✅ Completa | ❌ No tiene | ❌ No tiene | **Este archivo** |
| **Puntuaciones (1-5)** | ✅ 15 herramientas | ❌ No tiene | ⚠️ Parcial | **Este archivo** |
| **Matriz de decisión** | ✅ Rápida | ❌ No tiene | ❌ No tiene | **Este archivo** |
| **Workflow integrado** | ✅ Detallado | ❌ No tiene | ⚠️ Parcial | **Este archivo** |
| **Fichas individuales** | ⚠️ 8 herramientas | ⚠️ Listado | ✅ 10 fichas completas | **V5 Anexo A** |
| **Ejemplos de prompts** | ✅ Varios | ❌ No tiene | ✅ Ejemplos reales | **V5 Anexo A** |
| **Configuraciones técnicas** | ⚠️ Algunas | ⚠️ Básico | ✅ Completas | **V5 Anexo A** |
| **Lecciones aprendidas** | ✅ Sí | ❌ No tiene | ✅ Detalladas | **V5 Anexo A** |

### 💡 Valor de Este Archivo

Este archivo `comparativa-final.md` **complementa perfectamente** al V5:

1. **Visión panorámica**: Las tablas comparativas generales NO están en el V5
2. **Puntuaciones objetivas**: El sistema de rating 1-5 por criterios no está en el V5
3. **Matriz de decisión rápida**: La tabla final de "Si necesitas X, usa Y" no está en el V5
4. **Workflow integrado de 5 pasos**: No documentado en el V5

### 🎯 Recomendación

**Mantener este archivo** como **herramienta de consulta rápida**:
- ✅ Las tablas comparativas son únicas y valiosas
- ✅ La matriz de decisión es útil para tomar decisiones rápidas
- ✅ Las puntuaciones objetivas ayudan a priorizar inversiones

**Para la memoria del PFC:** El V5 Anexo A es más completo en fichas individuales.

**Para uso práctico:** Este archivo es mejor para decisiones rápidas.

---

*Archivo original creado: 03/06/2026 (sesión nocturna)*
*Actualización V5: 03/06/2026 08:45*

*Capítulo 06 — Comparativa Final de Herramientas IA*
*Última actualización: Junio 2026*
*Basado en 6 meses de uso intensivo con +15 herramientas evaluadas*