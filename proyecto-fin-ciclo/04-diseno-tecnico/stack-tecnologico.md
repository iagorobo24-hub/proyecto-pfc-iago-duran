# Stack Tecnológico

## Decisiones de tecnología

Este documento explica **por qué** se eligió cada tecnología, considerando el contexto de un proyecto de ciclo formativo sin presupuesto.

---

## Capa de presentación

### React 19 + Vite 7

| Aspecto | Decisión | Razón |
|---------|----------|-------|
| **Framework** | React 19 | Más moderno, mejor rendimiento |
| **Build tool** | Vite 7 | Rápido, buena DX, fácil configuración |
| **Routing** | React Router v7 | Estándar de facto, bien documentado |

**Alternativas considered:**
- Vue/Nuxt: Conocimientos previos limitados
- Next.js: Overkill para SPA, más complejo
- Svelte: Menor ecosistema

**Veredicto:** React + Vite es la opción con mejor equilibrio entre modernidad, comunidad y curva de aprendizaje.

---

### Estilos

| Aspecto | Decisión | Razón |
|---------|----------|-------|
| **Metodología** | CSS Modules | Scope automático, sin runtime |
| **Variables** | CSS Custom Properties | Tema claro/oscuro, consistencia |
| **Iconos** | lucide-react | Ligeros, consistentes, buenos para producción |
| **Tipografía** | IBM Plex Sans | Profesional, legible, gratuita (Google Fonts) |

**Alternativas considered:**
- Tailwind CSS: Aprendizaje adicional, prefiero CSS tradicional
- Styled Components: Runtime overhead
- Emotion: Similar a styled, sin ventajas claras

**Veredicto:** CSS Modules + Variables es suficiente para proyectos medianos. Si el proyecto crece, considerar Tailwind.

---

### Visualización de datos

| Librería | Uso | Razón |
|----------|-----|-------|
| **Recharts** | Gráficos de KPIs | React-native, buena documentación |
| **HTML/CSS** | Indicadores de semáforo | Suficiente para 3 estados |

**Alternativas considered:**
- Chart.js: Más popular pero menos "React"
- D3.js: Overkill para gráficos simples
- Victory: Buena pero menos documentación

**Veredicto:** Recharts para gráficos, CSS para indicadores simples.

---

## Autenticación y Backend

### Firebase (Auth + Firestore)

| Servicio | Decisión | Razón |
|----------|----------|-------|
| **Auth** | Firebase Auth | Integración Google Sign-In trivial |
| **Base de datos** | Firestore | Schema flexible, buena integración React |

**Alternativas considered:**
- Supabase: Mejor escalabilidad, pero más complejo de empezar
- MongoDB Atlas: Requiere más configuración
- PostgreSQL tradicional: Overkill para este caso

**Problemas encontrados:**
- Firestore tiene límite de 50K escrituras/día (Spark)
- Búsqueda por texto limitada

**Veredicto:** Firebase es fácil para empezar, pero Supabase sería mejor para producción.

---

### API de IA

| Servicio | Decisión | Razón |
|----------|----------|-------|
| **Gateway** | OpenRouter | Unifica múltiples proveedores, tier gratuito |
| **Modelos** | Claude 3.5 Haiku, DeepSeek, Qwen | Gratuitos, buena calidad |

**Alternativas considered:**
- Anthropic directo: Solo Claude, coste
- OpenAI directo: Coste por token
- Groq: Rápido pero menos modelos gratuitos

**Veredicto:** OpenRouter es ideal para proyectos académicos.

---

### Serverless

| Servicio | Decisión | Razón |
|----------|----------|-------|
| **Functions** | Vercel Functions | Integrado con Vercel, gratis |
| **API Key** | Proxy serverless | Oculta clave del cliente |

**Alternativas considered:**
- Firebase Functions: Más caro en tiers gratuitos
- AWS Lambda: Complejo de configurar
- Cloudflare Workers: Bueno pero menor integración

**Veredicto:** Vercel Functions es la opción más integrada y gratuita.

---

## Deployment

### Vercel

| Aspecto | Decisión | Razón |
|---------|----------|-------|
| **Hosting** | Vercel | Deploy automático desde GitHub |
| **CDN** | Vercel Edge | Rápido globalmente |
| **SSL** | Automático | Lets Encrypt incluido |
| **Dominio** | proyectos-sonepar.vercel.app | Gratis |

**Alternativas considered:**
- Netlify: Similar, pero Vercel mejor para Vite/React
- GitHub Pages: Limitado para SPAs con routing
- Render: Bueno pero menos integrado con React

**Veredicto:** Vercel es la opción más fácil para proyectos React modernos.

---

## Testing

### Playwright

| Aspecto | Decisión | Razón |
|---------|----------|-------|
| **E2E** | Playwright | Moderno, buen DX, multi-browser |
| **Scraping** | Playwright | Mejor que Puppeteer para sitios dinámicos |

**Alternativas considered:**
- Cypress: Más popular pero menos moderno
- Puppeteer: Solo Chrome
- Selenium: Muy antiguo

**Veredicto:** Playwright es el estándar emergente para E2E.

---

## Herramientas de desarrollo

| Herramienta | Uso | Razón |
|-------------|-----|-------|
| **VSCode** | Editor principal | Amplio ecosistema |
| **Windsurf** | Coding con IA | Coding ilimitado gratis |
| **Git** | Control de versiones | Estándar |
| **GitHub** | Repositorio remoto | Integración Vercel |

---

## Resumen del stack

```
Frontend:        React 19 + Vite 7 + React Router v7
Estilos:         CSS Modules + Variables CSS
Iconos:          lucide-react
Gráficos:        Recharts

Auth:            Firebase Auth
Base de datos:   Firestore (→ Supabase en迁移)
API de IA:       OpenRouter → Vercel Functions

Testing:         Playwright
Deployment:      Vercel
Control:         GitHub
```

---

## Tecnologías que NO usamos y por qué

| Tecnología | Razón |
|------------|-------|
| **TypeScript** | Curva de aprendizaje adicional, el proyecto era para aprender React primero |
| **Tailwind CSS** | Prefiero CSS tradicional, sin preferencia personal |
| **Redux** | React Context es suficiente |
| **GraphQL** | Overkill para Firestore |
| **Next.js** | Solo necesitamos SPA, no SSR |
| **Docker** | No hay backend propio que containerizar |

---

## Decisiones de migración

### Firebase → Supabase (en curso)

**Razón:**
- Firestore tiene límite de escrituras
- PostgreSQL es más familiar para el ciclo
- Supabase tiene mejor tier gratuito

**Estado:** Scripts de migración desarrollados, ejecución pendiente.

---

*Stack tecnológico documentado: Mayo 2026*
*Ver también: EVOLUCION.md para historial de cambios*
