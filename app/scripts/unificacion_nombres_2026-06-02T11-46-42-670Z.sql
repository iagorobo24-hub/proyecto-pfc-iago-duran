-- ============================================
-- UNIFICACIÓN DE NOMBRES - SUPABASE
-- Generado: 2/6/2026, 13:46:42
-- Total productos: 4689
-- ============================================

-- INSTRUCCIONES:
-- 1. Revisa el reporte de variaciones primero
-- 2. Ejecuta este SQL en Supabase SQL Editor
-- 3. Verifica los cambios con un SELECT antes de COMMIT
-- 4. Los cambios son IRREVERSIBLES sin backup
-- ============================================

BEGIN;

-- ============================================
-- UNIFICACIÓN: SUBFAMILIA
-- Variaciones encontradas: 1
-- ============================================

-- Variación 1: "Contador Eléctrico" (1 variantes)
UPDATE products SET subfamilia = 'Contador Eléctrico' WHERE subfamilia = 'Contador eléctrico';

-- No hay variaciones para unificar en tipo

-- No hay variaciones para unificar en Gama

-- No hay variaciones para unificar en Subgama


-- ============================================
-- VERIFICACIÓN POST-UNIFICACIÓN
-- ============================================

-- Verificar cuántos registros únicos hay ahora por campo
SELECT 
  'subfamilia' as campo, 
  COUNT(DISTINCT subfamilia) as unicos 
FROM products
UNION ALL
SELECT 
  'tipo' as campo, 
  COUNT(DISTINCT tipo) as unicos 
FROM products
UNION ALL
SELECT 
  'Gama' as campo, 
  COUNT(DISTINCT "Gama") as unicos 
FROM products
UNION ALL
SELECT 
  'Subgama' as campo, 
  COUNT(DISTINCT "Subgama") as unicos 
FROM products;

-- Si todo está bien, hacer COMMIT:
-- COMMIT;

-- Si algo salió mal, hacer ROLLBACK:
-- ROLLBACK;
