# Fase 3: Excelencia (Días 13-20)

> **Objetivo**: Diferenciación, polish, impacto visual que impresione
> **Impacto**: 🚀 De producto funcional a producto wow

---

## 3.1 — Sistema de atajos de teclado

**Esfuerzo**: 1 día | **Impacto**: 🚀 Productividad

### Atajos propuestos
| Atajo | Acción |
|-------|--------|
| `Ctrl+K` | Búsqueda global (modal overlay) |
| `Ctrl+1` | Fichas Técnicas |
| `Ctrl+2` | Simulador Almacén |
| `Ctrl+3` | Dashboard Incidencias |
| `Ctrl+4` | KPI Logístico |
| `Ctrl+5` | Presupuestos |
| `Ctrl+6` | Formación Interna |
| `Ctrl+7` | SONEX |
| `?` | Mostrar overlay de atajos |
| `Escape` | Cerrar cualquier modal/overlay |
| `Ctrl+B` | Toggle sidebar |
| `Ctrl+,` | Abrir ajustes |

### Implementación
Hook `useKeyboardShortcuts.js` que registra/desregistra event listeners. Los shortcuts deben mostrar un overlay al pulsar `?`.

### Archivos
- `app/src/hooks/useKeyboardShortcuts.js` (NUEVO)
- `app/src/components/layout/KeyboardShortcutsOverlay.jsx` (NUEVO)
- `app/src/components/layout/AppShell.jsx` — integrar hook

---

## 3.2 — Dashboard ejecutivo global (`/app/`)

**Esfuerzo**: 2 días | **Impacto**: 🎯 Visión

### Concepto
Cuando el usuario entra en `/app/` (hoy redirige a SONEX), mostrar un dashboard con:
1. **Widgets de resumen** de cada herramienta
2. **Métricas vivas**: últimas fichas vistas, incidencias críticas sin resolver, último KPI, presupuestos pendientes
3. **Acceso rápido** a la herramienta más relevante según el contexto

### Componentes
- `DashboardGlobal.jsx` (NUEVO en `tools/`) — orquestador
- `DashboardWidget.jsx` (NUEVO en `components/ui/`) — widget reutilizable
- Widgets específicos: `FichasWidget`, `IncidenciasWidget`, `KPISummary`, etc.

### UX
- Diseño tipo "grid de tarjetas" 2×2 o 3×3
- Cada widget muestra: icono + métrica clave + última acción + CTA
- Las tarjetas tienen hover sutil y transiciones suaves

---

## 3.3 — Exportación PDF profesional

**Esfuerzo**: 2 días | **Impacto**: 📄 Profesional

### Problemática actual
`Presupuestos.jsx` usa `window.print()` sobre un portal. Resultado: inconsistente entre navegadores, malo en mobile. `DashboardIncidencias.jsx` no tiene exportación.

### Solución
Librería `jspdf` + `html2canvas` para generar PDFs profesionales:
- **Presupuestos**: plantilla profesional con logo, datos cliente, tabla de partidas, IVA, total, condiciones
- **Incidencias**: ficha de diagnóstico imprimible para el técnico en campo
- **KPI**: informe ejecutivo con tabla de KPIs y gráfico

### Archivos
- `app/src/utils/pdfGenerator.js` (NUEVO) — generador PDF unificado
- `app/src/tools/Presupuestos.jsx` — reemplazar window.print por jspdf
- `app/src/tools/DashboardIncidencias.jsx` — añadir botón exportar PDF

---

## 3.4 — Modo oscuro v2

**Esfuerzo**: 1 día | **Impacto**: 🎨 UI

### Qué mejorar
El modo oscuro actual es correcto funcionalmente pero sin polish:
1. Transición instantánea (sin animación)
2. Paleta de grises fría (azulados)
3. No hay adaptación de imágenes/logos

### Mejoras
1. Transición suave con `transition: background-color 0.3s, color 0.3s` en el body
2. Paleta cálida para modo oscuro (ámbar en vez de azul para acentos)
3. Logos con filtro CSS para modo oscuro (brillo + contraste)
4. Scrollbar adaptada al tema

---

## 3.5 — Tests exhaustivos

**Esfuerzo**: 3 días | **Impacto**: ✅ Calidad

### Objetivo
80%+ coverage en hooks + 90% en utils + tests de integración para los 7 flujos principales.

### Prioridad
1. Hooks principales: `useNavegacionFichas`, `useSonex`, `usePresupuestos`, `useDashboardIncidencias`
2. Servicios: `catalogService`, `anthropicService`
3. Utils: `storage.js`, `validate.js`, `normalizarCategoria.js`
4. Integración: flujo Fichas → Presupuestos (URL params)

### Estrategia
Los componentes ya están cubiertos por E2E. Enfocar tests unitarios en la lógica de negocio (hooks + servicios).

---

## 3.6 — Simulador multijugador

**Esfuerzo**: 3 días | **Impacto**: 🎮 Diferenciador

### Concepto
Usar Supabase Realtime para que múltiples operarios puedan competir en el mismo pedido simultáneamente. Ranking en tiempo real.

### Implementación
1. Canal Realtime por sesión de simulación
2. Cada operario ve su tiempo + el de los demás en tiempo real
3. Al finalizar, ranking con nombre y puntuación
4. Historial global (no solo por usuario)

---

## 3.7 — Landing page rediseñada

**Esfuerzo**: 2 días | **Impacto**: 🚀 Conversión

### Mejoras
1. Hero con demo interactiva (no solo screenshots estáticos)
2. Testimonios reales de usuarios técnicos
3. Vídeo demostrativo de 30s del flujo principal
4. Precios/planes section (si aplica)
5. Comparativa "Antes vs Después" de la productividad

---

## 3.8 — Analytics de uso

**Esfuerzo**: 1 día | **Impacto**: 📊 Datos

### Qué medir
- Qué herramientas se usan más (pageviews por ruta)
- Búsquedas en Fichas Técnicas que no encuentran resultados
- Errores de IA (prompts que fallan)
- Tiempo medio por herramienta
- Feature adoption (atajos de teclado, etc.)

### Implementación
- Custom hook `useAnalytics` que envía eventos a Supabase
- Dashboard interno para el admin (o exportación a PostHog/Plausible)

---

## Checklist de Verificación Post-Fase 3

- [ ] Atajos de teclado funcionales (pulsar `?` muestra overlay)
- [ ] Dashboard ejecutivo en `/app/` (no redirige a SONEX)
- [ ] PDF profesional exportable desde Presupuestos e Incidencias
- [ ] Modo oscuro con transiciones suaves
- [ ] 80% test coverage
- [ ] Simulador multijugador funcional (opcional si no hay tiempo)
- [ ] Landing page con demo interactiva
- [ ] Analytics capturando datos de uso