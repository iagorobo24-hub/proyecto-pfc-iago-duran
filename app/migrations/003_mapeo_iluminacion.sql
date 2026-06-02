-- ===================================================
-- MAPEO ILUMINACIÓN - Clasificaciones canónicas COMPLETO
-- Basado en datos REALES de Supabase (64 productos)
-- Ejecutar en Supabase SQL Editor
-- Tabla: mapeo_productos
-- ===================================================

-- Iluminación (64 productos - 100% Legrand)
-- Todos los productos son de tipo EMERGENCIA

INSERT INTO mapeo_productos (familia_destino, subfamilia_canonica, tipo_canonico, gama_canonica, subgama_canonica, marca_canonica)
SELECT 
  'Iluminación' as familia_destino,
  subgama as subfamilia_canonica,
  'EMERGENCIA' as tipo_canonico,
  gama as gama_canonica,
  NULL as subgama_canonica,
  'Legrand' as marca_canonica
FROM (
  SELECT DISTINCT 
    'Subgama' as subgama,
    'Gama' as gama
  FROM products
  WHERE familia = 'Iluminación'
  AND Gama IS NOT NULL
) distinct_gamas
ON CONFLICT (subfamilia_canonica, tipo_canonico, marca_canonica) 
DO UPDATE SET familia_destino = EXCLUDED.familia_destino;

-- Inserción manual basada en el análisis real:
INSERT INTO mapeo_productos (familia_destino, subfamilia_canonica, tipo_canonico, gama_canonica, subgama_canonica, marca_canonica)
VALUES
-- Luminaria Emergencia (41 refs)
('Iluminación','Luminaria Emergencia','EMERGENCIA','B65LED',NULL,'Legrand'),
('Iluminación','Luminaria Emergencia','EMERGENCIA','C3LED',NULL,'Legrand'),
('Iluminación','Luminaria Emergencia','EMERGENCIA','C3LED Autotest',NULL,'Legrand'),
('Iluminación','Luminaria Emergencia','EMERGENCIA','C3LED Estandar',NULL,'Legrand'),
('Iluminación','Luminaria Emergencia','EMERGENCIA','INOXLED',NULL,'Legrand'),
('Iluminación','Luminaria Emergencia','EMERGENCIA','NFL65 Estanca',NULL,'Legrand'),
('Iluminación','Luminaria Emergencia','EMERGENCIA','NT65 Estanca',NULL,'Legrand'),
('Iluminación','Luminaria Emergencia','EMERGENCIA','TEXLED',NULL,'Legrand'),
('Iluminación','Luminaria Emergencia','EMERGENCIA','C3LED Accesorio',NULL,'Legrand'),

-- Accesorio (17 refs)
('Iluminación','Accesorio','EMERGENCIA','C3LED Accesorio',NULL,'Legrand'),
('Iluminación','Accesorio','EMERGENCIA','URA21 Accesorio',NULL,'Legrand'),
('Iluminación','Accesorio','EMERGENCIA','Señalizacion',NULL,'Legrand'),

-- Bateria (5 refs)
('Iluminación','Bateria','EMERGENCIA','Bateria Repuesto',NULL,'Legrand'),

-- Linterna (1 ref)
('Iluminación','Linterna','EMERGENCIA','Linterna',NULL,'Legrand')
ON CONFLICT (subfamilia_canonica, tipo_canonico, marca_canonica) 
DO UPDATE SET familia_destino = EXCLUDED.familia_destino;

-- VERIFICACIÓN
SELECT 
  subfamilia_canonica,
  tipo_canonico,
  COUNT(DISTINCT gama_canonica) as gamas_count,
  marca_canonica
FROM mapeo_productos
WHERE familia_destino = 'Iluminación'
GROUP BY subfamilia_canonica, tipo_canonico, marca_canonica
ORDER BY subfamilia_canonica;