# 📋 Plan de Fixes Restantes - Proyectos PFC

## ✅ COMPLETADO (Commit `609d3f1`)

### FIX 1-2: Nombres de familias en base de datos
- ✅ `VEHICULOS_ELECTRICOS` → `VEHÍCULOS ELÉCTRICOS` (sin barra baja)
- ✅ `DOMOTICA` / `DOMOTICA Y CONTROL` → `AUTOMATIZACIÓN DE EDIFICIOS`
- **Archivo:** `app/src/services/catalogService.ts` (etiquetasFamilias)

### FIX 3: Texto "filtros" → "opciones"
- ✅ Cambiado "X filtros" → "X opciones" en Fichas Técnicas
- **Archivo:** `app/src/components/fichas/FichasTecnicasContent.jsx:201`

### FIX 4: Navegación duplicada
- ✅ Eliminateda navegación de TopBar (ahora solo en Sidebar)
- ✅ Limpieza de código: removidos imports unused (useState, useEffect, NavLink, Menu, X)
- **Archivo:** `app/src/components/layout/Topbar.jsx`

### FIX 5: Logo en Sidebar colapsado
- ✅ Reducido icono de 22px → 18px cuando está colapsado
- **Archivo:** `app/src/components/layout/Sidebar.jsx:31`

### FIX 6: Exportar PDF en KPI Logístico
- ✅ **YA FUNCIONA** - La función existe en `pdfGenerator.js:152` (`generarPDFKPICompleto`)
- Botón está presente en UI, solo aparece DESPUÉS de calcular KPIs (condicional `{kpis && ...}`)
- **No requiere cambios** - el comportamiento es correcto

---

## ⏳ PENDIENTES

### FIX 7: Dashboard - Datos reales unificados en Supabase
**Problema:** Dashboard actual usa `useMemoriaUsuario` (localStorage por usuario). El usuario quiere datos globales de todos los usuarios.

**Solución requerida:**
1. Crear tabla `dashboard_metrics` en Supabase con:
   - `user_id`, `tool`, `action`, `timestamp`, `metadata`
2. Modificar cada herramienta para insertar eventos en Supabase (no solo localStorage)
3. Crear endpoint/ruta que agregue datos de todos los usuarios
4. Actualizar `DashboardGlobal.jsx` para leer de Supabase en lugar de localStorage

**Complejidad:** ALTA - Requiere cambios en migraciones de DB + múltiples hooks

---

### FIX 8: Grilla para cartas de referencias (múltiples columnas)
**Problema:** Cuando seleccionas todas las familias/gamas, solo hay una columna central. Debería mostrar múltiples columnas.

**Archivos a modificar:**
- `app/src/components/fichas/StepReferencias.jsx`
- `app/src/tools/FichasTecnicas.module.css` (añadir clase `.cardGrid` con `display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr))`)

**Complejidad:** BAJA

---

### FIX 9: Breadcrumb en Fichas Técnicas
**Problema:** Al seleccionar categoría → marcas, el breadcrumb deja de pintarse/actualizarse.

**Archivos a auditar:**
- `app/src/hooks/useNavegacionFichas.js` (gestiona el estado de navegación)
- `app/src/components/fichas/FichasTecnicasContent.jsx` (renderHeader function)

**Complejidad:** MEDIA - Requiere debuggear el flujo de estado

---

### FIX 10: Automatización de edificios (DB vacío)
**Problema:** La categoría "Automatización de Edificios" (ex-Domótica) no muestra datos - probablemente no haya productos en DB con esa familia.

**Acción requerida:**
1. Verificar en Supabase si existen productos con `familia = 'DOMOTICA'` o `'AUTOMATIZACION DE EDIFICIOS'`
2. Si existen: actualizar el mapping en `catalogService.ts`
3. Si NO existen:需要 añadir productos o avisar al usuario

**Complejidad:** MEDIA - Depende del estado actual de la DB

---

### FIX 11: Unificación completa de nombres
**Problema:** Asegurar que TODOS los nombres de familias/categorías sean consistentes entre:
- DB (tabla `products.familia`)
- UI (catálogo en Sidebar de Fichas)
- Selectores (Fichas Técnicas)

**Verificar:**
- `app/src/data/etiquetasSubcategoria.js`
- `app/src/utils/normalizarCategoria.js`
- `app/src/services/catalogService.ts`

**Complejidad:** BAJA (una vez completados fixes 1-2)

---

### FIX 12: Test navegación end-to-end por selectores
**Tarea:** Verificar que puedes llegar a CADA producto usando TODOS los selectores:
Familia → Marca → Gama → Tipo → (Subgama) → Referencia

**Proceso:**
1. Listar todas las familias únicas en DB
2. Para cada familia: marcas disponibles → gamas → tipos → referencias
3. Verificar que cada combinación tiene al menos 1 producto
4. Testear en la UI que la navegación no se rompe

**Complejidad:** ALTA - Requiere script de auditoría + test manual

---

## 📊 RESUMEN DE COMPLEJIDAD

| Fix | Complejidad | Tiempo Est. | Prioridad |
|-----|-----------|-------------|-----------|
| FIX 7 (Dashboard DB) | ALTA | 2-3h | MEDIA |
| FIX 8 (Grilla cartas) | BAJA | 30min | ALTA |
| FIX 9 (Breadcrumb) | MEDIA | 1h | ALTA |
| FIX 10 (DB Domótica) | MEDIA | 1h | ALTA |
| FIX 11 (Unificación) | BAJA | 30min | MEDIA |
| FIX 12 (E2E test) | ALTA | 2h+ | BAJA |

**Total estimado:** 6-8 horas

---

## 🚀 PRÓXIMOS PASOS

1. **Fix 8 (Grilla)** - Quick win, mejora UX inmediato
2. **Fix 9 (Breadcrumb)** - Bug crítico de navegación
3. **Fix 10 (DB Domótica)** - Verificar datos en Supabase
4. **Fix 11 (Unificación)** - Consistencia de nombres
5. **Fix 12 (E2E)** - Auditoría completa
6. **Fix 7 (Dashboard DB)** - Feature grande, dejar para último

---

**Último commit:** `609d3f1` (2026-06-01)
**Push completado:** ✅ `origin/main`