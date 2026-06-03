# 📊 Auditoría de Productos DOMOTICA / AUTOMATIZACION DE EDIFICIOS

## Problema Reportado
La categoría "Automatización de Edificios" (anteriormente "Domótica") no muestra ningún producto en Fichas Técnicas.

## Diagnóstico

### 1. Verificar en Supabase

Ejecuta esta consulta SQL en el **SQL Editor** de Supabase:

```sql
-- Contar productos por familia similares a domótica
SELECT 
  familia,
  COUNT(*) as productos,
  MIN(id) as primer_id,
  MAX(id) as ultimo_id
FROM products
WHERE 
  familia ILIKE '%DOMOTICA%' 
  OR familia ILIKE '%AUTOMATIZACION%'
GROUP BY familia
ORDER BY productos DESC;
```

### 2. Posibles Escenarios

#### Escenario A: NO hay productos (más probable)
```
familia | productos
--------|----------
(0 filas)
```

**Solución:**
1. Los productos de domótica probablemente tienen `familia = 'DOMOTICA'` en la DB antigua
2. Necesitas actualizar esos registros OR añadir nuevos productos con `familia = 'AUTOMATIZACION DE EDIFICIOS'`

**Script de migración (si existen productos con 'DOMOTICA'):**
```sql
-- Opción 1: Actualizar familia en los productos existentes
UPDATE products
SET familia = 'AUTOMATIZACION DE EDIFICIOS'
WHERE familia ILIKE '%DOMOTICA%';

-- Opción 2: Dejar ambos valores para compatibilidad
-- (catalogService.ts ya soporta ambos)
```

#### Escenario B: Sí hay productos pero con nombre diferente
```
familia                      | productos
----------------------------|----------
DOMOTICA                    | 45
DOMOTICA Y CONTROL          | 12
```

**Solución:** ✅ ¡Ya está soportado!
- `catalogService.ts` tiene: `'DOMOTICA': 'Automatización de Edificios'`
- `catalogService.ts` tiene: `'DOMOTICA Y CONTROL': 'Automatización de Edificios'`
- Los productos se mostrarán correctamente

#### Escenario C: Productos con `familia = 'AUTOMATIZACION DE EDIFICIOS'`
```
familia                      | productos
----------------------------|----------
AUTOMATIZACION DE EDIFICIOS | 57
```

**Solución:** ✅ ¡Perfecto!
- Ya está configurado correctamente
- El problema podría ser de caché o filtro en el frontend

### 3. Verificar en el Frontend

Después de confirmar los datos en Supabase, executa esto en la **consola del navegador** en la página de Fichas Técnicas:

```javascript
// Ver categorías cargadas
const cat = await import('./src/services/catalogService.ts')
const cats = await cat.getCategorias()
console.log('Categorías:', cats)

// Buscar automatización
cats.find(c => c.label.includes('Automatización') || c.label.includes('Domótica'))
```

### 4. Fix Aplicado en `catalogService.ts`

```typescript
const etiquetasFamilias: Record<string, string> = {
  'AUTOMATIZACION DE EDIFICIOS': 'Automatización de Edificios',  // ✅ Nuevo
  'DOMOTICA': 'Automatización de Edificios',                      // ✅ Alias
  'DOMOTICA Y CONTROL': 'Automatización de Edificios',            // ✅ Alias
  // ... más familias
}
```

### 5. Fix Aplicado en `categoryMapping.js`

```javascript
export const FULL_CATEGORY_INFO = {
  "AUTOMATIZACION DE EDIFICIOS": {
    icon: '🏘️',
    desc: 'Domótica, sistemas KNX, videoporteros y mecanismos de control inteligente.',
    tip: 'Asegura la compatibilidad entre dispositivos...'
  }
  // ✅ Categoría disponible ahora
}
```

---

## ✅ Checklist de Verificación

- [ ] Ejecutar SQL query en Supabase para contar productos
- [ ] Si hay 0 productos → Cargar datos o actualizar familia
- [ ] Si hay productos con 'DOMOTICA' → Actualizar a 'AUTOMATIZACION DE EDIFICIOS' (opcional)
- [ ] Limpiar caché del navegador
- [ ] Probar en Fichas Técnicas: seleccionar "Automatización de Edificios" → Ver marcas

---

## Notas Importantes

1. **El código ya está listo** para soportar ambas nomenclaturas (`DOMOTICA` y `AUTOMATIZACION DE EDIFICIOS`)
2. **El problema es casi seguro falta de datos** en la tabla `products` con esa familia
3. **Los commits `609d3f1` y `6a78aaf`** ya actualizaron todo el mapeo necesario