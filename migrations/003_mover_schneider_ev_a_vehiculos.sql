-- ============================================
-- MOVER productos Schneider EV a Vehículos eléctricos
-- ============================================
-- Productos afectados: 5 interruptores diferenciales tipo B EV
-- refs: A9Z51463, A9Z51225, A9Z51240, A9Z51440, A9Z51216
-- ============================================

-- 1. Mover los 5 productos de Schneider Electric tipo B EV
-- De: Distribución de potencia → Interruptor Diferencial
-- A:  Vehículos eléctricos → Protección para recarga
UPDATE products
SET 
  familia = 'Vehículos eléctricos',
  subfamilia = 'Protección para recarga'
WHERE 
  marca = 'Schneider Electric'
  AND ref_fabricante IN (
    'A9Z51463',  -- Acti9 iID - 4P - 63A - 30mA - tipo B EV
    'A9Z51225',  -- Acti9 iID - 2P - 25A - 30mA - tipo B EV
    'A9Z51240',  -- Acti9 iID - 2P - 40A - 30mA - tipo B EV
    'A9Z51440',  -- Acti9 iID - 4P - 40A - 30mA - tipo B EV
    'A9Z51216'   -- Acti9 iID - 2P - 16A - 30mA - tipo B EV
  );

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- 1. Verificar productos movidos
SELECT 
  familia,
  subfamilia,
  tipo,
  marca,
  ref_fabricante,
  name
FROM products
WHERE ref_fabricante IN (
  'A9Z51463', 'A9Z51225', 'A9Z51240', 'A9Z51440', 'A9Z51216'
);

-- Resultado esperado:
-- familia              | subfamilia             | tipo       | marca              | ref_fabricante | name
-- ---------------------+------------------------+------------+--------------------+----------------+-------------------
-- Vehículos eléctricos | Protección para recarga| CARRIL DIN | Schneider Electric | A9Z51463       | Acti9 iID...
-- (5 filas)

-- 2. Verificación completa de Vehículos eléctricos
SELECT 
  familia,
  subfamilia,
  tipo,
  COUNT(*) as total,
  STRING_AGG(DISTINCT marca, ', ') as marcas
FROM products
WHERE familia = 'Vehículos eléctricos'
GROUP BY familia, subfamilia, tipo
ORDER BY subfamilia, tipo;

-- RESULTADO ESPERADO:
-- familia              | subfamilia              | tipo       | total | marcas
-- ---------------------+-------------------------+------------+-------+------------------
-- Vehículos eléctricos | Accesorios              | RECARGA    |   1   | Legrand
-- Vehículos eléctricos | Cargadores de carril DIN| CARRIL DIN |   0   | (vacío)
-- Vehículos eléctricos | Puntos de recarga       | RECARGA    |  23   | Legrand
-- Vehículos eléctricos | Protección para recarga | CARRIL DIN |   5   | Schneider Electric
--
-- TOTAL: 29 productos

-- 3. Conteo final
SELECT 
  COUNT(*) as total_vehiculos_electricos
FROM products
WHERE familia = 'Vehículos eléctricos';