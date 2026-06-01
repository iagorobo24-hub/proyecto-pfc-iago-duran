-- ============================================
-- MIGRACIÓN COMPLETA DE FAMILIAS
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- 1. Vehículos eléctricos (12 productos)
UPDATE products 
SET familia = 'Vehículos eléctricos' 
WHERE familia = 'VEHICULOS_ELECTRICOS';

-- 2. Automatización industrial (102 productos)
UPDATE products 
SET familia = 'Automatización' 
WHERE familia = 'AUTOMATIZACION';

UPDATE products 
SET familia = 'Automatización' 
WHERE familia IN ('AUTOMATIZACION INDUSTRIAL', 'CONTROL Y AUTOMATIZACION INDUSTRIAL', 'AUTOMACION INDUSTRIAL');

-- 3. Automatización de edificios / Domótica (26 productos)
UPDATE products 
SET familia = 'Automatización de edificios' 
WHERE familia = 'AUTOMATIZACION DE EDIFICIOS';

UPDATE products 
SET familia = 'Automatización de edificios' 
WHERE familia IN ('DOMOTICA', 'DOMOTICA Y CONTROL');

-- 4. Distribución de potencia (694 productos)
UPDATE products 
SET familia = 'Distribución de potencia' 
WHERE familia = 'DISTRIBUCION DE POTENCIA';

-- 5. Fotovoltaica (8 productos)
UPDATE products 
SET familia = 'Fotovoltaica' 
WHERE familia = 'FOTOVOLTAICA';

-- 6. Iluminación (57 productos)
UPDATE products 
SET familia = 'Iluminación' 
WHERE familia = 'ILUMINACION';

UPDATE products 
SET familia = 'Iluminación' 
WHERE familia = 'LUMINARIAS';

-- 7. Instalación (101 productos)
UPDATE products 
SET familia = 'Instalación' 
WHERE familia = 'INSTALACION';

UPDATE products 
SET familia = 'Instalación' 
WHERE familia IN ('CANALIZACION', 'CANALIZACIONES', 'BANDEJAS');

-- 8. Cables (estandarizar)
UPDATE products 
SET familia = 'Cables' 
WHERE familia = 'CABLES';

UPDATE products 
SET familia = 'Cables' 
WHERE familia IN ('CABLES DE BAJA TENSION', 'CABLES DE MEDIA TENSION', 'CABLES DE ALTA TENSION');

-- 9. Climatización
UPDATE products 
SET familia = 'Climatización' 
WHERE familia IN ('CLIMATIZACION', 'HVAC', 'CLIMA');

-- 10. Comunicación
UPDATE products 
SET familia = 'Comunicación' 
WHERE familia = 'COMUNICACION';

-- 11. Herramientas
UPDATE products 
SET familia = 'Herramientas' 
WHERE familia = 'HERRAMIENTAS';

-- 12. Protección
UPDATE products 
SET familia = 'Protección' 
WHERE familia = 'PROTECCION';

-- 13. Fontanería
UPDATE products 
SET familia = 'Fontanería' 
WHERE familia = 'FONTANERIA';

-- 14. Energías renovables
UPDATE products 
SET familia = 'Energías renovables' 
WHERE familia = 'ENERGIAS RENOVABLES';

-- ============================================
-- VERIFICACIÓN FINAL
-- ============================================
SELECT 
  familia,
  COUNT(*) as total_productos
FROM products
GROUP BY familia
ORDER BY total_productos DESC;

-- Resultado esperado:
-- Distribución de potencia     | 694
-- Automatización               | 102
-- Instalación                  | 101
-- Iluminación                  | 57
-- Automatización de edificios  | 26
-- Vehículos eléctricos         | 12
-- Fotovoltaica                 | 8
-- etc.