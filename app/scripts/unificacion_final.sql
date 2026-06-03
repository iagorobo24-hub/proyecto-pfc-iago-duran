-- ============================================
-- UNIFICACIÓN DE DATOS - SUPABASE
-- Generado: 2026-06-02
-- Total productos: 4,689
-- ============================================
--
-- PROPÓSITO: Unificar nombres en la DB para que
-- los filtros de la UI muestren valores consistentes
-- sin hardcodear nada en el código.
--
-- ESTADO ACTUAL:
-- ✅ Familias: 7 (sin variaciones)
-- ⚠️ Subfamilias: 63 (1 variación menor)
-- ✅ Tipos: 23 (sin variaciones)
-- ✅ Gamas: 107 (sin variaciones)
-- ✅ Subgamas: 324 (sin variaciones)
-- ============================================

BEGIN;

-- ============================================
-- 1. UNIFICAR "Contador eléctrico" → "Contador Eléctrico"
-- ============================================
-- Esta es la ÚNICA variación encontrada en toda la DB
-- Afecta a 27 productos en total

UPDATE products 
SET subfamilia = 'Contador Eléctrico' 
WHERE subfamilia = 'Contador eléctrico';

-- Verificar cuántos se actualizaron
-- Debería mostrar 1 o más dependiendo de cuántos había con la variante en minúscula
SELECT 'Actualizados: ' || COUNT(*) as resultado 
FROM products 
WHERE subfamilia = 'Contador Eléctrico';

-- ============================================
-- 2. VERIFICACIÓN FINAL
-- ============================================
-- Confirmar que ahora solo hay 1 valor único para "contador electrico" normalizado

SELECT 
  subfamilia,
  COUNT(*) as total
FROM products
WHERE LOWER(REPLACE(subfamilia, 'é', 'e')) LIKE '%contador electrico%'
GROUP BY subfamilia;

-- Debería mostrar solo 1 fila: "Contador Eléctrico"

-- ============================================
-- 3. ESTADÍSTICAS POST-UNIFICACIÓN
-- ============================================

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

-- Resultado esperado:
-- subfamilia | 63
-- tipo       | 23
-- Gama       | 107
-- Subgama    | 324

-- ============================================
-- COMMIT o ROLLBACK
-- ============================================
-- Si todo está correcto:
COMMIT;

-- Si algo salió mal (descomentar):
-- ROLLBACK;

-- ============================================
-- CONSULTAS DE REFERENCIA
-- ============================================
-- Estas consultas muestran la distribución actual de datos

--_TOP 10 SUBFAMILIAS POR CANTIDAD--
SELECT 
  subfamilia,
  COUNT(*) as total_productos,
  COUNT(DISTINCT familia) as familias,
  COUNT(DISTINCT marca) as marcas
FROM products
WHERE subfamilia IS NOT NULL
GROUP BY subfamilia
ORDER BY total_productos DESC
LIMIT 20;

--_TOP 10 GAMAS POR CANTIDAD--
SELECT 
  "Gama",
  COUNT(*) as total_productos,
  COUNT(DISTINCT familia) as familias
FROM products
WHERE "Gama" IS NOT NULL
GROUP BY "Gama"
ORDER BY total_productos DESC
LIMIT 20;

--_DISTRIBUCIÓN POR FAMILIA--
SELECT 
  familia,
  COUNT(*) as total_productos,
  COUNT(DISTINCT subfamilia) as subfamilias_unicas,
  COUNT(DISTINCT tipo) as tipos_unicos
FROM products
WHERE familia IS NOT NULL
GROUP BY familia
ORDER BY total_productos DESC;