# CLAUDE.md

<!-- autoskills:compact -->
<!-- Skills: .claude/skills/accessibility, deploy-to-vercel, frontend-design, nodejs-*, playwright-best-practices, seo -->

> Proyecto PFC — Ecosistema web para automatización industrial y logística. Fin de Ciclo.

## Stack rápido

| Capa | Stack |
|------|-------|
| Frontend | React 19 + Vite 7 + React Router v7 + Framer Motion |
| Lenguaje | JS → TS progresivo (`strict: false`, `allowJs: true`) |
| Estilos | CSS Modules + variables CSS |
| Auth | Supabase Auth (Google OAuth) |
| DB | Supabase PostgreSQL — tablas `products` (~5400) + `brands` |
| Datos usuario | Firestore (legacy) — `users/{userId}/...` |
| IA | OpenRouter (Claude Haiku, DeepSeek, Qwen) vía Vercel Functions |
| Testing | Playwright e2e (10 specs) + Vitest unit (~272 tests) |
| Deploy | Vercel (Serverless Functions + SPA) |

| Ruta | Módulo |
|------|--------|
| `/fichas` | Catálogo con navegación jerárquica + enriquecimiento IA |
| `/almacen` | Simulación ciclo de pedido |
| `/incidencias` | Dashboard de fallos industriales |
| `/kpi` | 6 KPIs logísticos con semáforo |
| `/presupuestos` | Generador con referencias del catálogo |
| `/formacion` | Matriz de competencias |
| `/sonex` | Asistente técnico IA |

## Estructura clave

```
app/
├── api/ai.js                 # Vercel Function gateway IA
├── src/
│   ├── components/{auth,fichas,layout,ui}/
│   ├── contexts/             # AuthContext, ThemeContext, ToastContext
│   ├── data/                 # categoriaMapping, hierarchy.json, etc.
│   ├── hooks/                # 11 custom hooks
│   ├── services/             # catalogService.ts (Supabase), anthropicService.ts, firestoreService.js
│   ├── types/{catalog,ai}.ts # Tipos compartidos TS
│   ├── tools/                # 7 módulos página (FichasTecnicas, Presupuestos, Sonex...)
│   ├── App.jsx               # Router + rutas protegidas
│   └── main.jsx              # Entry + providers
├── scripts/                  # Scripts DB (scrapers, migraciones, normalización)
├── e2e/                      # 10 specs Playwright
├── tests/                    # Tests visuales + navegación
├── public/logos/             # 15 logos fabricantes
├── playwright.config.js, vercel.json, vite.config.js
docs/                         # Planes, auditorías, fixes, revisiones
DB_TAXONOMY.md                # Taxonomía maestra DB
EVOLUCION.md                  # Historial de fases
```

## Reglas críticas

1. **Sin nombres de terceros** — Usar "la empresa", "industrial", "catálogo"
2. **Siempre variables CSS** — No colores hardcodeados. Leer modo oscuro abajo
3. **Auth** — Todas las rutas excepto `/login` requieren `ProtectedRoute`
4. **IA** — Prompts genéricos. OpenRouter vía Vercel Functions
5. **Testing** — Playwright e2e + Vitest unit
6. **Git** — `main` prod, feature branches, conventional commits
7. **DB Taxonomy** — Leer [DB_TAXONOMY.md](./DB_TAXONOMY.md) antes de tocar catálogo. Actualizar al finalizar
8. **Documentación en `docs/`** — Planes, análisis, auditorías siempre dentro de `docs/{planes,auditorias,fixes,revisiones}/`. Planes nuevos con prefijo numérico + índice
9. **Registro en EVOLUCION.md** — Cada hito importante como nueva fase numerada
10. **Modo oscuro** — 3 reglas de oro (ver abajo). Detalles en `docs/referencia-dark-mode.md`

## Convenciones

| Concepto | Regla |
|----------|-------|
| Componentes | PascalCase |
| CSS Modules | camelCase.module.css |
| Hooks | `use` + camelCase |
| Variables CSS | kebab-case |
| LocalStorage | prefijo `pfc_` |
| Rutas | kebab-case |

**TS Progresivo:** Servicios nuevos en `.ts`. Al migrar, borrar el `.js`. `any` permitido. Tipos compartidos en `app/src/types/`. `any` en respuestas Supabase (validación runtime con `validateProduct`/`validateBrand`).

**CSS:** Context Pattern con `data-theme="dark"` en `<html>`. Variables semánticas siempre. 3 reglas de oro para modo oscuro: (1) nunca `var(--white)` para fondos, (2) nunca colores hardcodeados, (3) todo componente con `background` necesita su selector dark.

**Navegación catálogo (dual mode):**
- DP agrupado: `Marca → Categoría → Subcategoría → Referencias`
- Legacy (resto): `Marca → Gama → Tipo → Referencias`

**IA:** `useNavegacionFichas` expone `aiFicha`/`aiCargando`. System prompt fuerza JSON estricto. `sanitizeUrl()` en manuales.

**Datos:** Catálogo en Supabase (catalogService.ts). Datos usuario en Firestore (firestoreService.js legado). LocalStorage con prefijo `pfc_`.

## Design System

| Token | Valor |
|-------|-------|
| `--brand-primary` | `#0072CE` |
| `--brand-primary-dark` | `#00569e` |
| `--success/warning/error` | `#10b981` / `#f59e0b` / `#ef4444` |
| Tipografía | IBM Plex Sans |
| Espaciado | xs/sm/md/lg/xl = 4/8/16/24/32px |
| Bordes | sm/md/lg = 4/8/12px |

## Comandos

```bash
npm install && npm run dev    # Dev :5173 (proxy /api → :3001)
npm run build                 # Build producción
npm run test                  # Vitest unit
npx playwright test           # E2E headless
npm run test:ui               # E2E UI mode
```

## Gotchas

- **`var(--white)`** en dark mode = `#1c2439` (gris oscuro) — nunca para fondos
- **SimpleFooter** fondo fijo `#070a10` en dark mode (excepción)
- **Dual navigation** — DP usa categorías, resto usa gama→tipo. Ver `categoriaMapping.js`
- **categoriaMapping.js** tiene claves duplicadas (FOTOVOLTAICA/Fotovoltaica) — JS object gana última
- **DB Taxonomy** tiene separadores en la tabla products que hay que mantener sincronizados con `categoriaMapping.js`
- **Firestore es legacy** — no añadir nuevas colecciones. Datos nuevos → Supabase
- **TS strict: false** — no intentar tipar cada columna Supabase. Validación runtime
