# Plan Maestro de Mejora

> De 6/10 a 10/10 en 22 días de trabajo efectivo
> 3 fases, 21 acciones, priorizadas por impacto/esfuerzo

---

## Fase 1: Cimientos (Días 1-5)
**Objetivo: Seguridad, Arquitectura, UX inmediata**

| # | Acción | Esfuerzo | Impacto | Dependencias |
|---|--------|----------|---------|-------------|
| 1.1 | Mover clave Supabase a variables de entorno | 30min | 🔴 Seguridad | Ninguna |
| 1.2 | Migración progresiva a TypeScript | 2 días | 📐 Arquitectura | 1.1 |
| 1.3 | Eliminar dead code FirestoreService | 1h | 🧹 Deuda | Ninguna |
| 1.4 | Silenciar console.logs en producción | 30min | ⚡ Perf/Seguridad | Ninguna |
| 1.5 | Streaming de respuestas IA en SONEX | 1 día | ✨ UX | 1.2 (parcial) |
| 1.6 | Bugfix: ruta SONEX → Fichas | 15min | 🐛 Bug | Ninguna |

**Testeo post-fase**: Ejecutar `npm run test` + `npx playwright test tests/theme-audit.spec.js tests/fichas-navigation.spec.js`

---

## Fase 2: Refactorización (Días 6-14)
**Objetivo: Calidad de código, mantenibilidad, PWA, vistas técnicas**

| # | Acción | Esfuerzo | Impacto | Dependencias |
|---|--------|----------|---------|-------------|
| 2.1 | Refactor FichasTecnicas (884→3 componentes) | 1 día | 🏗️ Mantenibilidad | 1.2 |
| 2.2 | Refactor Presupuestos (666→rutas anidadas) | 1 día | 🏗️ Mantenibilidad | 1.2 |
| 2.3 | Refactor SimuladorAlmacén (481→4 componentes) | 1 día | 🏗️ Testing | 1.2 |
| 2.4 | Reemplazar CircleLayout por navegación lineal | 2 días | 🎨 UX | 2.1 |
| 2.5 | Virtualizar ProductTable (react-window) | 1 día | ⚡ Performance | 2.1 |
| 2.6 | Implementar PWA (service worker + manifest) | 2 días | 📡 Offline | Ninguna |
| 2.7 | Reescribir procesarMarkdown con marked+DOMPurify | 1 día | 🔒 Seguridad | Ninguna |
| 2.8 | Refactor DashboardIncidencias (302→componentes) | 1 día | 🏗️ Mantenibilidad | 1.2 |
| 2.9 | Vistas técnicas agrupadas (magneto/diferencial por curva, polos, calibre) | 2 días | 🎯 UX Diferencial | 2.1, 2.4 |

**Testeo post-fase**: Suite completa unit tests + E2E

---

## Fase 3: Excelencia (Días 15-22)
**Objetivo: Diferenciación, polish, impacto visual**

| # | Acción | Esfuerzo | Impacto | Dependencias |
|---|--------|----------|---------|-------------|
| 3.1 | Sistema de atajos de teclado (Ctrl+K, Ctrl+1-7) | 1 día | 🚀 Productividad | 2.1 |
| 3.2 | Dashboard ejecutivo global (`/app/`) | 2 días | 🎯 Visión | 2.1, 2.2, 2.3 |
| 3.3 | Exportación PDF profesional (jspdf+html2canvas) | 2 días | 📄 Profesional | 2.2 |
| 3.4 | Modo oscuro v2 (transiciones suaves, paleta optimizada) | 1 día | 🎨 UI | Ninguna |
| 3.5 | Tests exhaustivos (80% coverage hooks + integración) | 3 días | ✅ Calidad | 2.1, 2.2, 2.3, 2.8 |
| 3.6 | Simulador multijugador (Supabase Realtime) | 3 días | 🎮 Diferenciador | 2.3 |
| 3.7 | Landing page rediseñada con demo interactiva | 2 días | 🚀 Conversión | Ninguna |
| 3.8 | Analytics de uso (herramientas + búsquedas fallidas) | 1 día | 📊 Datos | Ninguna |

**Testeo post-fase**: Suite completa + test de regresión visual

---

## Matriz de Priorización (Impacto × Esfuerzo)

```
Alto impacto
    │
    │  1.1 1.6   1.5  2.9
    │  2.7       2.4  2.6
    │            3.1  3.2
    │  1.3 1.4   2.1  2.2  2.3  2.5  2.8  3.5
    │            3.3  3.4  3.7  3.8
    │                   3.6
    │
    └───────────────────────────────→
    Bajo esfuerzo          Alto esfuerzo
```

**Conclusión**: Atacar primero el cuadrante superior-izquierdo (alto impacto, bajo esfuerzo): 1.1, 1.3, 1.4, 1.6, 2.7.

---

## Presupuesto de Tiempo

| Fase | Días | % del proyecto | Acumulado |
|------|------|----------------|-----------|
| Fase 1: Cimientos | 5 | 23% | 23% |
| Fase 2: Refactor | 9 | 41% | 64% |
| Fase 3: Excelencia | 8 | 36% | 100% |
| **Total** | **22** | **100%** | |

## Criterios de Éxito por Fase

**Fase 1**:
- [ ] Test `npm test` pasa sin modificaciones
- [ ] Clave Supabase solo en `.env` (no hardcodeada)
- [ ] SONEX responde con streaming (no spinner+splash)
- [ ] Ruta SONEX→Fichas funciona
- [ ] Consola limpia en producción

**Fase 2**:
- [ ] Todos los componentes <300 líneas
- [ ] Unit test coverage hooks >60%
- [ ] PWA installable con manifest
- [ ] Sin XSS en SONEX
- [ ] Navegación sin CircleLayout
- [ ] Magnetotérmicos navegables por curva → polos → calibre
- [ ] Diferenciales navegables por tipo → sensibilidad → polos → calibre

**Fase 3**:
- [ ] Unit test coverage >80%
- [ ] Todos los E2E pasan en CI
- [ ] App instalable como PWA offline-first
- [ ] Dashboard ejecutivo funcional
- [ ] Atajos de teclado implementados
- [ ] PDF exportable profesional