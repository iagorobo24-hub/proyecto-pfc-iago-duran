# 🔄 MIGRACIÓN DE FAMILIAS - Nombres Uniformes

## OBJETIVO
Unificar nombres de familias en DB e interfaz para que sean IDÉNTICOS.

## ESTADO ACTUAL (PROBLEMA)
- DB: `VEHICULOS_ELECTRICOS`, `AUTOMATIZACION`, `DOMOTICA`, etc. (MAYÚSCULAS, sin tildes)
- UI: Intenta mostrar "Vehículos Eléctricos", "Automatización", etc. (con mapeo)
- Problema: Inconsistencias, barras bajas, confusiones

## ESTADO DESEADO
- DB y UI usan **exactamente los mismos nombres**:
  - `Vehículos eléctricos` (no `VEHICULOS_ELECTRICOS`)
  - `Automatización` (no `AUTOMATIZACION`)
  - `Automatización de edificios` (no `AUTOMATIZACION DE EDIFICIOS`)
  - `Distribución de potencia` (no `DISTRIBUCION DE POTENCIA`)
  - `Fotovoltaica` (no `FOTOVOLTAICA`)
  - `Iluminación` (no `ILUMINACION`)
  - `Instalación` (no `INSTALACION`)
  - `Cables` (se queda igual)

## BENEFICIOS
1. ✅ Sin mapeos complejos
2. ✅ Sin barras bajas
3. ✅ Con tildes correctas
4. ✅ DB legible por humanos
5. ✅ UI = DB (misma fuente de verdad)

## PLAN DE EJECUCIÓN

### Paso 1: Actualizar DB (Supabase)
```sql
-- Vehículos eléctricos
UPDATE products SET familia = 'Vehículos eléctricos' WHERE familia = 'VEHICULOS_ELECTRICOS';

-- Automatización (industrial)
UPDATE products SET familia = 'Automatización' WHERE familia = 'AUTOMATIZACION';

-- Automatización de edificios (domótica)
UPDATE products SET familia = 'Automatización de edificios' WHERE familia IN ('AUTOMATIZACION DE EDIFICIOS', 'DOMOTICA', 'DOMOTICA Y CONTROL');

-- Distribución de potencia
UPDATE products SET familia = 'Distribución de potencia' WHERE familia = 'DISTRIBUCION DE POTENCIA';

-- Fotovoltaica
UPDATE products SET familia = 'Fotovoltaica' WHERE familia = 'FOTOVOLTAICA';

-- Iluminación
UPDATE products SET familia = 'Iluminación' WHERE familia = 'ILUMINACION';

-- Instalación
UPDATE products SET familia = 'Instalación' WHERE familia = 'INSTALACION';

-- Cables (se queda igual, pero estandarizar variantes)
UPDATE products SET familia = 'Cables' WHERE familia IN ('CABLES', 'CABLES DE BAJA TENSION', 'CABLES DE MEDIA TENSION');
```

### Paso 2: Actualizar `catalogService.ts`
- `etiquetasFamilias` ya no necesita mapeo complejo
- Solo normalizar variantes a un nombre canónico

### Paso 3: Actualizar `categoryMapping.js`
- `FULL_CATEGORY_INFO` usa las mismas claves que la DB
- `CATEGORY_IDS` mapea IDs cortos a nombres completos

### Paso 4: Verificar UI
- Sidebar muestra nombres exactos de DB
- Fichas técnicas navega correctamente
- Breadcrumbs consistentes

## FAMILIAS CANÓNICAS (lista final)

| Nombre canónico | IDs antiguos (a migrar) |
|-----------------|------------------------|
| `Cables` | `CABLES`, `CABLES DE BAJA TENSION`, etc. |
| `Automatización` | `AUTOMATIZACION`, `AUTOMATIZACION INDUSTRIAL`, `CONTROL Y AUTOMATIZACION INDUSTRIAL` |
| `Automatización de edificios` | `AUTOMATIZACION DE EDIFICIOS`, `DOMOTICA`, `DOMOTICA Y CONTROL` |
| `Distribución de potencia` | `DISTRIBUCION DE POTENCIA` |
| `Fotovoltaica` | `FOTOVOLTAICA` |
| `Iluminación` | `ILUMINACION`, `LUMINARIAS` |
| `Instalación` | `INSTALACION`, `CANALIZACION`, `CANALIZACIONES`, `BANDEJAS` |
| `Vehículos eléctricos` | `VEHICULOS_ELECTRICOS`, `VEHICULO ELECTRICO` |
| `Climatización` | `CLIMATIZACION`, `HVAC`, `CLIMA` |
| `Comunicación` | `COMUNICACION` |
| `Herramientas` | `HERRAMIENTAS` |
| `Protección` | `PROTECCION` |
| `Fontanería` | `FONTANERIA` |
| `Energías renovables` | `ENERGIAS RENOVABLES` |

---

**Total familias canónicas:** 14  
**Total variantes a migrar:** ~30+