-- ===================================================
-- POBLADO DE MAPEO_PRODUCTOS (FV + VEHICULO ELECTRICO)
-- Ejecutar en Supabase SQL Editor
-- Tabla destino: mapeo_productos
-- columnas: (familia_destino, subfamilia_canonica, tipo_canonico, gama_canonica, subgama_canonica, marca_canonica)
-- ===================================================

-- FOTOVOLTAICA
INSERT INTO mapeo_productos (familia_destino, subfamilia_canonica, tipo_canonico, gama_canonica, subgama_canonica, marca_canonica)
VALUES
('Fotovoltaica','Cajas combinadoras','CARRIL DIN',NULL,NULL,'Legrand'),
('Fotovoltaica','Cajas combinadoras','Cajas para FV',NULL,NULL,'Legrand'),
('Fotovoltaica','Interruptores CC','CARRIL DIN',NULL,NULL,'Legrand'),
('Fotovoltaica','Protecciones sobretensión','CARRIL DIN',NULL,NULL,'Legrand'),
('Fotovoltaica','Seccionador CC','CARRIL DIN',NULL,NULL,'Legrand')
ON CONFLICT (subfamilia_canonica, tipo_canonico, marca_canonica) DO UPDATE
SET familia_destino = EXCLUDED.familia_destino;

-- VEHICULOS ELECTRICOS
INSERT INTO mapeo_productos (familia_destino, subfamilia_canonica, tipo_canonico, gama_canonica, subgama_canonica, marca_canonica)
VALUES
('Vehículos eléctricos','Accesorios','CARRIL DIN',NULL,NULL,'Legrand'),
('Vehículos eléctricos','Puntos de recarga','RECARGA','Green''up One',NULL,'Legrand'),
('Vehículos eléctricos','Puntos de recarga','RECARGA','Green''up Home',NULL,'Legrand'),
('Vehículos eléctricos','Puntos de recarga','RECARGA','Green''up Premium',NULL,'Legrand'),
('Vehículos eléctricos','Protección para recarga','CARRIL DIN','Acti9 iID (tipo B EV)',NULL,'Schneider Electric')
ON CONFLICT (subfamilia_canonica, tipo_canonico, marca_canonica) DO UPDATE
SET familia_destino = EXCLUDED.familia_destino;

-- VERIFICACION (solo columnas existentes)
SELECT familia_destino, subfamilia_canonica, tipo_canonico, gama_canonica, subgama_canonica, marca_canonica
FROM mapeo_productos
WHERE familia_destino IN ('Fotovoltaica','Vehículos eléctricos')
ORDER BY COALESCE(familia_destino,''), COALESCE(subfamilia_canonica,''), COALESCE(tipo_canonico,'');
