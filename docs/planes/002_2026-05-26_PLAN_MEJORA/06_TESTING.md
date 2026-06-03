# Estrategia de Testing — Plan de Mejora

> Cómo aseguramos que cada cambio no rompe nada

---

## Principios

1. **Test antes de tocar**: siempre ejecutar `npm test` (vitest) + E2E smoke antes de empezar una tarea
2. **Test después de cada cambio unitario**: después de cada modificación a un archivo
3. **Test al final de la fase**: suite completa antes de dar por terminada una fase
4. **No confiar solo en E2E**: los tests unitarios son la red de seguridad para refactors

---

## Baseline (Antes de empezar Fase 1)

```bash
# 1. Unit tests (Vitest)
cd app && npm test

# 2. Build (verificar que compila)
npm run build

# 3. E2E smoke (los más rápidos)
npx playwright test tests/theme-audit.spec.js tests/fichas-navigation.spec.js

# 4. E2E completo (si hay tiempo)
npx playwright test
```

Guardar output de cada uno como referencia. Si algún test falla antes de empezar, documentarlo y decidir si se arregla primero.

---

## Matriz de Tests por Tarea

| Tarea | Tests unitarios | Tests E2E | Tests manuales |
|-------|----------------|-----------|----------------|
| **1.1** Supabase key → .env | `npm test` | — | `npm run build` + inspeccionar bundle |
| **1.2** Migración TS | `npm test` | E2E fichas | `npm run build` sin errores TS |
| **1.3** Eliminar Firestore | `npm test` | — | Verificar que app arranca |
| **1.4** Silenciar console.logs | `npm test` | — | Abrir consola en dev y prod |
| **1.5** Streaming SONEX | `npm test` (mock stream) | E2E analisis-completo (chat) | Enviar mensaje y ver texto aparecer |
| **1.6** Bugfix ruta SONEX | — | E2E fichas + analisis | Click en referencia SONEX → Ficha |
| **2.1** Refactor Fichas | `npm test` | E2E fichas + tabla-marcas | Navegación manual completa |
| **2.2** Refactor Presupuestos | `npm test` | — | Crear + guardar + exportar presupuesto |
| **2.3** Refactor Simulador | `npm test` | — | Simulación completa con incidencias |
| **2.4** CircleLayout → lineal | — | E2E fichas + navegacion | Navegación manual en mobile/desktop |
| **2.5** Virtualizar ProductTable | `npm test` (useProductTable) | E2E tabla-marcas | Cargar 200+ refs y medir rendimiento |
| **2.6** PWA | — | — | Lighthouse audit + instalación manual |
| **2.7** marked+DOMPurify | `npm test` (anthropicService) | E2E analisis (chat) | Probar markdown en SONEX |
| **2.8** Refactor Incidencias | `npm test` | — | CRUD completo de incidencias |
| **2.9** Vistas técnicas agrupadas | `npm test` (useVistaTecnica) | E2E fichas + navegacion | Navegar magneto por curva→polos→calibre y diferencial por tipo→sensibilidad→calibre |
| **3.1** Atajos teclado | `npm test` (useKeyboardShortcuts) | — | Pulsar `?`, Ctrl+1-7, Ctrl+K |
| **3.2** Dashboard ejecutivo | — | E2E navegacion | Verificar ruta `/app` |
| **3.3** PDF profesional | — | — | Exportar PDF y verificar contenido |
| **3.4** Modo oscuro v2 | — | E2E theme-audit | Transición suave, legibilidad |
| **3.5** Tests exhaustivos | `npm test -- --coverage` | E2E completo | Verificar coverage >80% |
| **3.6** Multijugador | — | — | Dos pestañas, misma simulación |
| **3.7** Landing rediseñada | — | E2E visual-verification | Vista manual + Lighthouse |
| **3.8** Analytics | `npm test` (useAnalytics) | — | Verificar eventos en Supabase |

---

## Cómo mockear la IA en tests

Los tests que dependen de IA (SONEX, diagnóstico, KPI) deben mockear `callAnthropicAI`:

```js
// tests/setup.js
vi.mock('../services/anthropicService', () => ({
  callAnthropicAI: vi.fn().mockResolvedValue({
    text: JSON.stringify({
      caracteristicas: ['Característica 1', 'Característica 2'],
      aplicaciones: ['Aplicación 1'],
      normas: ['IEC 60947-2'],
      url_manual: '',
      consejo_tecnico: 'Consejo técnico de prueba'
    })
  }),
  parseAIJsonResponse: vi.fn().mockReturnValue({
    error: false,
    data: {
      caracteristicas: ['Característica 1', 'Característica 2'],
      aplicaciones: ['Aplicación 1'],
      normas: ['IEC 60947-2'],
      url_manual: '',
      consejo_tecnico: 'Consejo técnico de prueba'
    }
  }),
  sanitizeUrl: vi.fn(u => u || '#')
}))
```

---

## E2E Smoke Rápido (<2min)

Para verificación rápida entre cambios:

```bash
npx playwright test \
  tests/theme-audit.spec.js \
  tests/fichas-navigation.spec.js \
  tests/visual-verification.spec.js
```

Esto cubre:
- Todas las 8 páginas cargan en modo claro y oscuro
- Navegación entre herramientas
- Elementos visuales clave presentes

---

## Pipeline CI/CD ideal

```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: cd app && npm ci
      - run: npm test                    # Unit tests
      - run: npm run build              # Build check
      - run: npx playwright install --with-deps
      - run: npx playwright test        # E2E tests
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: app/playwright-report/
```