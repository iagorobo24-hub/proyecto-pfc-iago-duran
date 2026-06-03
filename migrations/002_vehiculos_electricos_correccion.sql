-- ============================================
-- CORRECCIÓN COMPLETA: Vehículos eléctricos
-- ============================================
-- Análisis del backup: 31 productos total
--   • 23 con subfamilia "Punto Recarga" 
--   • 7 con subfamilia "VEHICULOS_ELECTRICOS" (Schneider Electric, CARRIL DIN)
--   • 1 con subfamilia "Accesorio"
-- ============================================

-- 1. Corregir los 7 productos con subfamilia mal puesta
-- Estos son los Schneider Electric de carril DIN
UPDATE products
SET subfamilia = 'Cargadores de carril DIN'
WHERE (
  familia = 'Vehículos eléctricos' 
  AND subfamilia = 'VEHICULOS_ELECTRICOS'
)
OR (
  familia = 'VEHICULOS_ELECTRICOS' 
  AND subfamilia = 'VEHICULOS_ELECTRICOS'
)
OR (
  subfamilia = 'VEHICULOS_ELECTRICOS'
  AND tipo = 'CARRIL DIN'
  AND marca = 'Schneider Electric'
);

-- 2. Actualizar familia si todavía está en mayúsculas
UPDATE products
SET familia = 'Vehículos eléctricos'
WHERE familia = 'VEHICULOS_ELECTRICOS';

-- 3. Estandarizar a plural (mejor consistencia)
UPDATE products
SET subfamilia = 'Puntos de recarga'
WHERE (
  familia = 'Vehículos eléctricos' AND subfamilia = 'Punto Recarga'
)
OR (
  familia = 'VEHICULOS_ELECTRICOS' AND subfamilia = 'Punto Recarga'
);

UPDATE products
SET subfamilia = 'Accesorios'
WHERE (
  familia = 'Vehículos eléctricos' AND subfamilia = 'Accesorio'
)
OR (
  familia = 'VEHICULOS_ELECTRICOS' AND subfamilia = 'Accesorio'
);

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Contar por familia, subfamilia y tipo
SELECT 
  familia,
  subfamilia,
  tipo,
  COUNT(*) as total,
  STRING_AGG(DISTINCT marca, ', ') as marcas
FROM products
WHERE 
  (familia ILIKE '%vehicul%' OR familia ILIKE '%VEHICULOS%')
  OR subfamilia ILIKE '%vehicul%'
  OR (marca = 'Schneider Electric' AND tipo = 'CARRIL DIN')
GROUP BY familia, subfamilia, tipo
ORDER BY familia, subfamilia, tipo;

-- RESULTADO ESPERADO:
-- familia                  | subfamilia            | tipo      | total | marcas
-- -------------------------+-----------------------+-----------+-------+---------------
-- Vehículos eléctricos     | Accesorios            | RECARGA   |   1   | Legrand
-- Vehículos eléctricos     | Cargadores de carril  | CARRIL DIN|   7   | Schneider Electric
-- Vehículos eléctricos     | Puntos de recarga     | RECARGA   |  23   | Legrand
--
-- TOTAL: 31 productos