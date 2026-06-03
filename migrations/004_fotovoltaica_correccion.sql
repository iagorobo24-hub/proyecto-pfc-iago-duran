-- ============================================
-- CORRECCIÓN COMPLETA: Fotovoltaica
-- ============================================
-- Análisis del backup: 43 productos total
-- 
-- Problemas detectados:
--   1. Subfamilia "Fotovoltaica" (19 productos) - redundante con la familia
--   2. Tipo "Controlador Solar" (18 productos) - debería ser más específico
--   3. Tipo "FOTOVOLTAICA" en Cajas Combinadoras (6 productos) - mal puesto
--   4. Familia en mayúsculas "FOTOVOLTAICA" - estandarizar
--
-- Estructura propuesta:
--   ├── Inversores y reguladores (19)
--   ├── Seccionadores CC (12)
--   ├── Cajas combinadoras (6)
--   ├── Protecciones sobretensión (2)
--   ├── Interruptores CC (2)
--   └── Accesorios (2)
-- ============================================

-- 1. Estandarizar familia a case normal con tilde
UPDATE products
SET familia = 'Fotovoltaica'
WHERE familia = 'FOTOVOLTAICA';

-- 2. Corregir subfamilia "Fotovoltaica" → "Inversores y reguladores"
-- Estos son los 18 controladores solares + 1 monitor CC
UPDATE products
SET subfamilia = 'Inversores y reguladores'
WHERE familia = 'Fotovoltaica'
  AND subfamilia = 'Fotovoltaica';

-- 3. Corregir subfamilia "Caja Combinadora" → "Cajas combinadoras" (plural, consistente)
UPDATE products
SET subfamilia = 'Cajas combinadoras'
WHERE familia = 'Fotovoltaica'
  AND subfamilia = 'Caja Combinadora';

-- 4. Corregir tipo "FOTOVOLTAICA" en cajas combinadoras → "Cajas para FV"
UPDATE products
SET tipo = 'Cajas para FV'
WHERE familia = 'Fotovoltaica'
  AND subfamilia = 'Cajas combinadoras'
  AND tipo = 'FOTOVOLTAICA';

-- 5. Estandarizar otras subfamilias a plural (consistencia)
UPDATE products
SET subfamilia = 'Protecciones sobretensión'
WHERE familia = 'Fotovoltaica'
  AND subfamilia = 'Proteccion Sobretension';

UPDATE products
SET subfamilia = 'Interruptores CC'
WHERE familia = 'Fotovoltaica'
  AND subfamilia = 'Interruptor CC';

UPDATE products
SET subfamilia = 'Accesorios'
WHERE familia = 'Fotovoltaica'
  AND subfamilia = 'Accesorio';

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- 1. Verificación completa por subfamilia y tipo
SELECT 
  familia,
  subfamilia,
  tipo,
  COUNT(*) as total,
  STRING_AGG(DISTINCT marca, ', ') as marcas
FROM products
WHERE familia = 'Fotovoltaica'
GROUP BY familia, subfamilia, tipo
ORDER BY subfamilia, tipo;

-- RESULTADO ESPERADO:
-- familia       | subfamilia              | tipo              | total | marcas
-- --------------+-------------------------+-------------------+-------+------------------
-- Fotovoltaica  | Accesorios              | CARRIL DIN        |   2   | Legrand
-- Fotovoltaica  | Cajas combinadoras      | Cajas para FV     |   6   | Legrand
-- Fotovoltaica  | Inversores y reguladores| Controlador Solar |  18   | Schneider Electric
-- Fotovoltaica  | Inversores y reguladores| Monitor CC        |   1   | Legrand
-- Fotovoltaica  | Interruptores CC        | CARRIL DIN        |   2   | Schneider Electric
-- Fotovoltaica  | Protecciones sobretensión| CARRIL DIN       |   2   | Schneider Electric
-- Fotovoltaica  | Seccionadores CC        | CARRIL DIN        |  12   | Schneider Electric
--
-- TOTAL: 43 productos

-- 2. Conteo total
SELECT 
  COUNT(*) as total_fotovoltaica
FROM products
WHERE familia = 'Fotovoltaica';

-- 3. Ejemplos por subfamilia
SELECT 
  subfamilia,
  tipo,
  marca,
  ref_fabricante,
  name,
  "Gama"
FROM products
WHERE familia = 'Fotovoltaica'
ORDER BY subfamilia, tipo
LIMIT 10;