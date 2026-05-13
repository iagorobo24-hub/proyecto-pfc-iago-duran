# AGENTS.md

> **Guía de proyecto para agentes IA — Proyectos PFC**
>
> Este archivo define cómo los agentes IA deben trabajar con este repositorio. Incluye patrones, convenciones, skills relevantes y reglas específicas del proyecto.

---

## 📋 Resumen del Proyecto

**Proyectos PFC** es un ecosistema de herramientas web para automatización industrial y logística, desarrollado como Proyecto Fin de Ciclo.

### Stack Tecnológico

- **Frontend:** React 19 + Vite 7 + React Router DOM v7
- **Estilos:** CSS Modules + Variables CSS personalizadas
- **Autenticación:** Firebase Auth (Google Sign-In)
- **Base de datos:** Firestore (datos por usuario)
- **IA:** OpenRouter API (Claude 3.5 Haiku, DeepSeek, Qwen)
- **Deploy:** Vercel (Serverless Functions)
- **Testing:** Playwright (e2e tests)

### Módulos Funcionales

| Ruta | Módulo | Descripción |
|------|--------|-------------|
| `/login` | **Login** | Autenticación con Google |
| `/fichas` | **Fichas Técnicas** | Catálogo de productos con navegación jerárquica |
| `/almacen` | **Simulador Almacén** | Simulación de ciclo completo de pedido |
| `/incidencias` | **Dashboard Incidencias** | Registro y diagnóstico de fallos industriales |
| `/kpi` | **KPI Logístico** | 6 KPIs con semáforo e informe ejecutivo |
| `/presupuestos` | **Presupuestos** | Generador de presupuestos con referencias del catálogo |
| `/formacion` | **Formación Interna** | Matriz de competencias y planes personalizados |
| `/sonex` | **SONEX** | Asistente técnico con IA |

### Estructura del Repositorio

```
proyecto-pfc-iago-duran/
├── app/                          # Aplicación React
│   ├── api/                      # Vercel Functions
│   │   └── ai.js                 # Gateway IA (OpenRouter)
│   ├── src/
│   │   ├── components/          # Componentes React
│   │   │   ├── auth/             # LoginPage, ProtectedRoute
│   │   │   ├── layout/           # AppShell, Topbar, Sidebar
│   │   │   └── ui/               # Button, Badge, Input, Card...
│   │   ├── contexts/             # React Contexts
│   │   │   ├── AuthContext.jsx
│   │   │   ├── ThemeContext.jsx
│   │   │   └── ToastContext.jsx
│   │   ├── firebase/             # Firebase config
│   │   ├── data/                 # Catálogo, jerarquía, logos
│   │   ├── hooks/                # Custom hooks (uno por módulo)
│   │   ├── pages/                # LandingPage
│   │   ├── services/             # API services
│   │   ├── styles/               # Variables CSS, animaciones
│   │   ├── tools/                # 7 módulos (componentes de página)
│   │   ├── App.jsx               # Router + rutas protegidas
│   │   └── main.jsx              # Entry point + providers
│   ├── scripts/                  # Scripts de utilidad
│   │   └── sync-catalog-enhanced.mjs
│   ├── public/                   # Assets estáticos
│   ├── firestore.rules           # Reglas de seguridad Firestore
│   ├── firebase.json
│   ├── playwright.config.js
│   ├── vercel.json
│   └── package.json
├── proyecto-fin-ciclo/           # Documentación académica (10 capítulos)
│   ├── 00-README.md
│   ├── 01-resumen-ejecutivo/
│   ├── 02-estado-del-arte/
│   ├── 03-analisis-requisitos/
│   ├── 04-diseno-tecnico/
│   ├── 05-proceso-desarrollo/
│   ├── 06-herramientas-ia/
│   ├── 07-manuales-uso/
│   ├── 08-resultados/
│   ├── 09-conclusiones/
│   └── 10-manual-profesores/
├── diagramas/                    # Diagramas SVG del proyecto
├── EVOLUCION.md                  # Guía cronológica de evolución
├── README.md                     # Documentación principal
└── AGENTS.md                     # Este archivo
```

---

## 🎯 Convenciones del Proyecto

### Nomenclatura

- **Componentes:** PascalCase (`LoginPage.jsx`, `AppShell.jsx`)
- **Archivos CSS:** camelCase.module.css (`Sonex.module.css`)
- **Hooks:** camelCase con prefijo `use` (`useAuth`, `useFichas`)
- **Variables CSS:** kebab-case (`--brand-primary`, `--brand-primary-dark`)
- **LocalStorage keys:** Prefijo `pfc_` (`pfc_fichas_historial`, `pfc_presupuestos_historial`)
- **Rutas:** kebab-case (`/fichas-tecnicas`, `/simulador-almacen`)

### Variables CSS

El proyecto usa un sistema de diseño personalizado con variables CSS:

```css
/* Colores de marca */
--brand-primary: #0072CE;
--brand-primary-dark: #00569e;

/* Colores semánticos */
--success: #10b981;
--warning: #f59e0b;
--error: #ef4444;

/* Espaciado */
--spacing-xs: 0.25rem;
--spacing-sm: 0.5rem;
--spacing-md: 1rem;
--spacing-lg: 1.5rem;
--spacing-xl: 2rem;

/* Bordes */
--radius-sm: 0.25rem;
--radius-md: 0.5rem;
--radius-lg: 0.75rem;
```

**IMPORTANTE:** Nunca uses colores hardcodeados. Siempre usa variables CSS del sistema de diseño.

### Patrones de Componentes

#### Componentes con Estilos Scoped

```jsx
import styles from './MiComponente.module.css';

export default function MiComponente() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Título</h1>
    </div>
  );
}
```

#### Custom Hooks por Módulo

Cada módulo tiene su propio custom hook:

```jsx
// hooks/useFichas.js
export function useFichas() {
  const [fichas, setFichas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Lógica del módulo...

  return { fichas, loading, error, /* acciones */ };
}
```

#### Context Pattern para Estado Global

```jsx
// contexts/AuthContext.jsx
export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // Lógica de autenticación...

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}
```

### Patrones de Datos

#### LocalStorage Keys

Todas las keys de localStorage usan el prefijo `pfc_`:

```javascript
// ✅ Correcto
localStorage.setItem('pfc_fichas_historial', JSON.stringify(data));
localStorage.setItem('pfc_presupuestos_historial', JSON.stringify(data));

// ❌ Incorrecto
localStorage.setItem('fichas_historial', JSON.stringify(data));
localStorage.setItem('Proyectos PFC_presupuestos', JSON.stringify(data));
```

#### Firestore Collections

```javascript
// Estructura de collections
users/{userId}/fichas/{fichaId}
users/{userId}/presupuestos/{presupuestoId}
users/{userId}/incidencias/{incidenciaId}
users/{userId}/kpis/{kpiId}
users/{userId}/formacion/{empleadoId}
```

---

## 🛠 Skills Relevantes de Hermes

Cuando trabajes con este proyecto, carga estos skills de Hermes:

### Desarrollo Web

- **frontend-design** — Para crear componentes UI con alta calidad de diseño
- **nodejs-best-practices** — Para patrones de desarrollo Node.js
- **nodejs-backend-patterns** — Para patrones de backend (Express/Fastify)

### Testing

- **playwright-best-practices** — Para escribir tests e2e con Playwright
- **test-driven-development** — Para seguir TDD (RED-GREEN-REFACTOR)

### Git y GitHub

- **git-repo-workflow** — Para operaciones git estándar
- **github-code-review** — Para revisar PRs
- **github-pr-workflow** — Para el ciclo de vida de PRs

### Calidad de Código

- **requesting-code-review** — Para revisiones pre-commit
- **systematic-debugging** — Para debugging sistemático
- **code-refactoring-verification** — Para verificar refactorizaciones

### Planificación

- **writing-plans** — Para escribir planes de implementación
- **subagent-driven-development** — Para ejecutar planes vía subagentes

### DevOps

- **vercel-deployment** — Para desplegar a Vercel

### Documentación

- **hermes-agent-skill-authoring** — Para crear skills del proyecto

---

## 📝 Reglas Específicas

### 1. Sin Referencias a Terceros

**IMPORTANTE:** Este proyecto NO debe tener referencias a empresas o marcas específicas.

- ✅ Usar: "la empresa", "industrial", "catálogo de productos"
- ❌ Evitar: Nombres de empresas, marcas específicas

### 2. Sistema de Diseño

- Siempre usa variables CSS del sistema de diseño
- No uses colores hardcodeados
- Mantén consistencia en espaciado y bordes

### 3. Autenticación

- Todas las rutas excepto `/login` requieren autenticación
- Usa `ProtectedRoute` para envolver rutas protegidas
- Maneja estados de carga y error en auth

### 4. IA y Prompts

- Los prompts de IA deben ser genéricos, sin referencias a empresas
- Usa OpenRouter API vía Vercel Functions
- Maneja errores de API gracefully

### 5. Testing

- Escribe tests e2e con Playwright para flujos críticos
- Usa Page Object Model para componentes complejos
- Prueba responsive design (desktop, tablet, mobile)

### 6. Documentación

- Mantén la documentación en `proyecto-fin-ciclo/` actualizada
- Usa formato markdown con tablas y listas
- Incluye ejemplos de código cuando sea relevante

### 7. Git Workflow

- Usa branch `main` para producción
- Crea feature branches para cambios: `feature/nombre-feature`
- Escribe commits descriptivos siguiendo conventional commits
- Haz PRs con descripciones claras

---

## 🚀 Comandos Comunes

### Desarrollo

```bash
# Entrar al directorio de la app
cd app

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Build de producción
npm run build

# Preview de producción
npm run preview

# Ejecutar tests
npm run test

# Ejecutar tests con UI
npm run test:ui
```

### Scripts de Utilidad

```bash
# Sincronizar catálogo a Firestore
cd app
node scripts/sync-catalog-enhanced.mjs
```

### Git

```bash
# Ver estado
git status

# Crear rama feature
git checkout -b feature/nombre-feature

# Commit con mensaje descriptivo
git commit -m "feat: descripción del cambio"

# Push a rama feature
git push origin feature/nombre-feature
```

---

## 🔍 Debugging

### Problemas Comunes

#### Firebase Auth no funciona

1. Verifica que `firebaseConfig.js` tiene las credenciales correctas
2. Revisa Firebase Console → Authentication → Sign-in method
3. Verifica que el dominio está en Authorized Domains

#### Firestore Rules bloquean operaciones

1. Revisa `app/firestore.rules`
2. Verifica que las reglas permiten lectura/escritura para usuarios autenticados
3. Usa Firebase Console → Firestore → Rules para probar

#### LocalStorage no persiste

1. Verifica que estás usando el prefijo `pfc_`
2. Revisa que no hay errores de cuota
3. Verifica que el navegador no está en modo incógnito

#### IA API falla

1. Verifica que `OPENROUTER_API_KEY` está en `.env`
2. Revisa logs de Vercel Functions
3. Verifica que el modelo está disponible en OpenRouter

### Herramientas de Debugging

```bash
# Ver logs de Firebase
# Firebase Console → Firestore → Usage

# Ver logs de Vercel
vercel logs

# Debug con Chrome DevTools
# F12 → Console, Network, Application

# Debug React con React DevTools
# Instala extensión de Chrome
```

---

## 📚 Recursos Externos

### Documentación

- [React 19 Docs](https://react.dev/)
- [Vite Docs](https://vitejs.dev/)
- [Firebase Docs](https://firebase.google.com/docs)
- [Playwright Docs](https://playwright.dev/)
- [OpenRouter Docs](https://openrouter.ai/docs)

### Herramientas

- [Firebase Console](https://console.firebase.google.com/)
- [Vercel Dashboard](https://vercel.com/dashboard)
- [GitHub Repo](https://github.com/iagorobo24-hub/proyecto-pfc-iago-duran)

---

## 🎨 Design System

### Colores

| Variable | Valor | Uso |
|----------|-------|-----|
| `--brand-primary` | `#0072CE` | Color principal de marca |
| `--brand-primary-dark` | `#00569e` | Variante oscura de marca |
| `--success` | `#10b981` | Estados de éxito |
| `--warning` | `#f59e0b` | Estados de advertencia |
| `--error` | `#ef4444` | Estados de error |

### Tipografía

- **Font family:** IBM Plex Sans
- **Font sizes:** Usar variables CSS `--text-xs`, `--text-sm`, `--text-md`, `--text-lg`, `--text-xl`

### Espaciado

- **xs:** `0.25rem` (4px)
- **sm:** `0.5rem` (8px)
- **md:** `1rem` (16px)
- **lg:** `1.5rem` (24px)
- **xl:** `2rem` (32px)

### Bordes

- **sm:** `0.25rem` (4px)
- **md:** `0.5rem` (8px)
- **lg:** `0.75rem` (12px)

---

## 🔄 Flujo de Trabajo Recomendado

### Para Nuevas Features

1. **Planificación**
   - Escribe un plan en `writing-plans` skill
   - Define requisitos y aceptación

2. **Desarrollo**
   - Crea rama feature
   - Sigue TDD si aplica
   - Usa patrones del proyecto

3. **Testing**
   - Escribe tests e2e con Playwright
   - Prueba responsive design
   - Verifica accesibilidad

4. **Review**
   - Usa `requesting-code-review` skill
   - Corrige issues encontrados

5. **Deploy**
   - Merge a main
   - Despliega a Vercel
   - Verifica en producción

### Para Bugs

1. **Diagnóstico**
   - Usa `systematic-debugging` skill
   - Identifica root cause

2. **Fix**
   - Crea rama fix
   - Aplica solución
   - Escribe tests de regresión

3. **Verificación**
   - Usa `code-refactoring-verification` skill
   - Confirma que el fix funciona

4. **Deploy**
   - Merge a main
   - Despliega a Vercel

---

## 📊 Métricas y KPIs

### Código

- **Coverage de tests:** Objetivo > 80%
- **Linter:** 0 errores, 0 warnings
- **Build time:** < 30s

### Performance

- **Lighthouse:** > 90 en todas las categorías
- **FCP:** < 1.8s
- **LCP:** < 2.5s

### UX

- **Accesibilidad:** WCAG 2.2 AA compliant
- **Responsive:** Funciona en desktop, tablet, mobile
- **Error rate:** < 1% en producción

---

## 🎓 Aprendizaje y Mejora Continua

### Skills a Crear

Considera crear skills para:

1. **Patrones de componentes del proyecto** — Componentes reutilizables comunes
2. **Patrones de hooks** — Custom hooks patterns específicos del proyecto
3. **Testing patterns** — Patrones de testing específicos del proyecto
4. **Deployment patterns** — Patrones de despliegue específicos

### Documentación a Mantener

- Mantén `EVOLUCION.md` actualizado con cambios importantes
- Actualiza `proyecto-fin-ciclo/` con nuevas features
- Revisa y actualiza `AGENTS.md` periódicamente

---

## 🤝 Colaboración

### Code Review

- Usa `github-code-review` skill para PRs
- Revisa: lógica, seguridad, performance, accesibilidad
- Da feedback constructivo y accionable

### Comunicación

- Usa issues de GitHub para bugs y features
- Escribe descripciones claras y detalladas
- Incluye screenshots cuando sea relevante

---

## 📌 Notas Importantes

### Seguridad

- Nunca commits API keys o secrets
- Usa Firebase Security Rules para proteger datos
- Valida inputs en cliente y servidor
- Sanitiza datos de usuario

### Performance

- Lazy load componentes cuando sea posible
- Optimiza imágenes y assets
- Usa code splitting para bundles grandes
- Cachea respuestas de API cuando sea apropiado

### Accesibilidad

- Usa atributos ARIA correctamente
- Soporta navegación por teclado
- Proporciona alt text para imágenes
- Usa colores con suficiente contraste

---

## 🎯 Objetivos del Proyecto

### Corto Plazo

- [ ] Mejorar coverage de tests al 80%
- [ ] Optimizar performance (Lighthouse > 90)
- [ ] Mejorar accesibilidad (WCAG 2.2 AA)
- [ ] Añadir más módulos funcionales

### Medio Plazo

- [ ] Migrar a Next.js (opcional)
- [ ] Añadir tests de integración
- [ ] Mejorar documentación técnica
- [ ] Añadir monitoring y analytics

### Largo Plazo

- [ ] Expandir a más industrias
- [ ] Añadir features de colaboración
- [ ] Mejorar IA con más context
- [ ] Publicar como open source

---

## 📞 Soporte

### Para Preguntas

- Revisa `EVOLUCION.md` para contexto histórico
- Busca en issues de GitHub
- Consulta documentación externa

### Para Problemas

- Usa `systematic-debugging` skill
- Crea issue en GitHub con detalles
- Incluye logs y screenshots

---

**Última actualización:** Mayo 2026  
**Versión:** 3.0.0  
**Mantenedor:** iagorobo24-hub
