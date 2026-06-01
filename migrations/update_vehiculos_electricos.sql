-- ============================================
-- FIX: Actualizar VEHICULOS_ELECTRICOS → VEHICULOS ELECTRICOS
-- ============================================

-- 1. Verificar cuántos productos tienen la familia antigua
SELECT COUNT(*) as productos_con_barra_baja
FROM products
WHERE familia = 'VEHICULOS_ELECTRICOS';

-- Resultado esperado: ~31 productos (del backup)

-- 2. Actualizar todos los productos a la nueva nomenclatura
UPDATE products
SET familia = 'VEHICULOS ELECTRICOS'
WHERE familia = 'VEHICULOS_ELECTRICOS';

-- 3. Verificar que el cambio se aplicó correctamente
SELECT 
  familia,
  COUNT(*) as total
FROM products
WHERE familia IN ('VEHICULOS ELECTRICOS', 'VEHICULOS_ELECTRICOS')
GROUP BY familia;

-- Resultado esperado:
-- VEHICULOS ELECTRICOS | 31 (o el número que haya)
-- (0 filas con VEHICULOS_ELECTRICOS)

-- 4. (OPCIONAL) Actualizar también si hay variantes
UPDATE products
SET familia = 'VEHICULOS ELECTRICOS'
WHERE familia = 'VEHICULO ELECTRICO';  -- Singular

-- ============================================
-- VERIFICACIÓN FINAL
-- ============================================
SELECT 
  familia,
  COUNT(*) as productos,
  STRING_AGG(ref_fabricante, ', ' ORDER BY ref_fabricante LIMIT 5) as primeros_5_refs
FROM products
WHERE familia = 'VEHICULOS ELECTRICOS'
GROUP BY familia;

-- Expected:
-- familia: VEHICULOS ELECTRICOS
-- productos: 31 (aproximadamente)
-- primeros_5_refs: lista de referencias de ejemplo