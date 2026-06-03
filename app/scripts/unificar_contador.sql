-- ============================================
-- UNIFICACIÓN: Contador eléctrico → Contador Eléctrico
-- ============================================
-- Ejecutar en: Supabase SQL Editor
-- URL: https://fncmzrnmzmuhlullkrud.supabase.co
-- ============================================

BEGIN;

-- 1. Verificar cuántos registros hay con la variante en minúscula
SELECT 
  subfamilia,
  COUNT(*) as afectados
FROM products
WHERE subfamilia = 'Contador eléctrico'
GROUP BY subfamilia;
-- Debería mostrar: Contador eléctrico | 2 (según lo que dijiste)

-- 2. UNIFICAR
UPDATE products 
SET subfamilia = 'Contador Eléctrico' 
WHERE subfamilia = 'Contador eléctrico';

-- 3. Verificar que la unificación funcionó
SELECT 
  subfamilia,
  COUNT(*) as total
FROM products
WHERE LOWER(REPLACE(subfamilia, 'é', 'e')) LIKE '%contador electrico%'
GROUP BY subfamilia
ORDER BY total DESC;
-- Debería mostrar solo: Contador Eléctrico | (total unificado)

-- 4. Confirmar stats finales
SELECT 
  'subfamilia' as campo, 
  COUNT(DISTINCT subfamilia) as valores_unicos 
FROM products
UNION ALL
SELECT 
  'tipo' as campo, 
  COUNT(DISTINCT tipo) as valores_unicos 
FROM products
UNION ALL
SELECT 
  'Gama' as campo, 
  COUNT(DISTINCT "Gama") as valores_unicos 
FROM products
UNION ALL
SELECT 
  'Subgama' as campo, 
  COUNT(DISTINCT "Subgama") as valores_unicos 
FROM products;

-- ============================================
-- RESULTADO ESPERADO:
-- subfamilia | 63
-- tipo       | 23
-- Gama       | 107
-- Subgama    | 324
-- ============================================

-- 5. COMMIT (descomentar para confirmar)
COMMIT;

-- Si algo salió mal, usar en su lugar:
-- ROLLBACK;