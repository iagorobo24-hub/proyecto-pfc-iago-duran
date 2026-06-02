-- ===================================================
-- MAPEO CONSOLIDADO: AUTOMATIZACIÓN + EDIFICIOS + POTENCIA
-- Generado automáticamente desde Supabase
-- Total: 1300 productos (251 + 49 + 1000)
-- ===================================================

-- AUTOMATIZACIÓN (251 productos)
INSERT INTO mapeo_productos (familia_destino, subfamilia_canonica, tipo_canonico, gama_canonica, marca_canonica)
VALUES
('Automatización','Arrancador Suave','Soft Starter','Soft Starter','Schneider Electric'),
('Automatización','Autómata Programable','Autómata Programable','Autómata Programable','Schneider Electric'),
('Automatización','Autómata Programable','MODULAR','6ES7','Siemens'),
('Automatización','Bloque Mando Osmoz','CARRIL DIN','Osmoz','Legrand'),
('Automatización','Bloque Mando Osmoz','CARRIL DIN','Acti 9 Osmoz','Legrand'),
('Automatización','Contactor Industrial','Contactor Industrial','Contactor Industrial','Schneider Electric'),
('Automatización','Contactor','CARRIL DIN','Acti 9 iCT','Schneider Electric'),
('Automatización','Elemento de Control','CARRIL DIN','Control Modular','Legrand'),
('Automatización','Elemento de Control','CARRIL DIN','Crepuscular','Legrand'),
('Automatización','Elemento de Control','CARRIL DIN','Interruptor Horario','Legrand'),
('Automatización','Elemento de Control','CARRIL DIN','Minuteria','Legrand'),
('Automatización','Elemento de Control','CARRIL DIN','Temporizador','Legrand'),
('Automatización','Elemento de Control','CARRIL DIN','iTL','Legrand'),
('Automatización','Fuente Alimentacion','CARRIL DIN','Fuente Conmutada','Legrand'),
('Automatización','Interruptor Diferencial','CARRIL DIN','Acti9 iCV40','Schneider Electric'),
('Automatización','Módulo de E/S','Módulo I/O','Módulo I/O','Schneider Electric'),
('Automatización','Pulsador Osmoz','CARRIL DIN','Osmoz','Legrand'),
('Automatización','Variador de Frecuencia','Variador Frecuencia','Variador Frecuencia','Schneider Electric')
ON CONFLICT (subfamilia_canonica, tipo_canonico, marca_canonica) 
DO UPDATE SET familia_destino = EXCLUDED.familia_destino;

-- AUTOMATIZACIÓN DE EDIFICIOS (49 productos)
INSERT INTO mapeo_productos (familia_destino, subfamilia_canonica, tipo_canonico, gama_canonica, marca_canonica)
VALUES
('Automatización de edificios','Acoplador KNX','CARRIL DIN','KNX','Legrand'),
('Automatización de edificios','Actuador HVAC KNX','CARRIL DIN','KNX HVAC','Legrand'),
('Automatización de edificios','Actuador HVAC','CARRIL DIN','Smather Netatmo','Legrand'),
('Automatización de edificios','Actuador KNX','CARRIL DIN','KNX','Legrand'),
('Automatización de edificios','Base Conectada','EMPOTRAR','Hogar Conectado','Legrand'),
('Automatización de edificios','Base Conectada','SUPERFICIE','Hogar Conectado','Legrand'),
('Automatización de edificios','Compensador','CARRIL DIN','Hogar Conectado','Legrand'),
('Automatización de edificios','Controlador KNX','CARRIL DIN','KNX','Legrand'),
('Automatización de edificios','Detector Movimiento','SUPERFICIE','Hogar Conectado','Legrand'),
('Automatización de edificios','Interface KNX','CARRIL DIN','KNX','Legrand'),
('Automatización de edificios','Interruptor Rotulo','CARRIL DIN','Seguridad Rotulos','Legrand'),
('Automatización de edificios','Mando Smart','SUPERFICIE','Hogar Conectado','Legrand'),
('Automatización de edificios','Micromodulo Smart','CARRIL DIN','Hogar Conectado','Legrand'),
('Automatización de edificios','Pasarela KNX','CARRIL DIN','KNX DALI','Legrand'),
('Automatización de edificios','Pulsador Telemando','CARRIL DIN','Telemando','Legrand'),
('Automatización de edificios','Router KNX','CARRIL DIN','KNX','Legrand'),
('Automatización de edificios','Sensor KNX','EMPOTRAR','Green-I','Legrand'),
('Automatización de edificios','Telemando','CARRIL DIN','Telemando','Legrand')
ON CONFLICT (subfamilia_canonica, tipo_canonico, marca_canonica) 
DO UPDATE SET familia_destino = EXCLUDED.familia_destino;

-- DISTRIBUCIÓN DE POTENCIA (1000 productos)
INSERT INTO mapeo_productos (familia_destino, subfamilia_canonica, tipo_canonico, gama_canonica, marca_canonica)
VALUES
('Distribución de potencia','Accesorio','CAJA MOLDEADA','DPX³ Accesorio','Legrand'),
('Distribución de potencia','Accesorio','CARRIL DIN','Borna Tierra','Legrand'),
('Distribución de potencia','Accesorio','CARRIL DIN','Cortacircuito Accesorio','Legrand'),
('Distribución de potencia','Accesorio','CARRIL DIN','Cubrebornas','Legrand'),
('Distribución de potencia','Accesorio','CARRIL DIN','Mosaic','Legrand'),
('Distribución de potencia','Accesorio','CARRIL DIN','Obturador','Legrand'),
('Distribución de potencia','Accesorio','CARRIL DIN','Proteccion Bornas','Legrand'),
('Distribución de potencia','Accesorio','CUADRO DISTRIBUCION','Linergy','Schneider Electric'),
('Distribución de potencia','Accesorio','CUADRO DISTRIBUCION','Prisma','Schneider Electric'),
('Distribución de potencia','Accesorio','ENVOLVENTE','Practibox Accesorio','Legrand'),
('Distribución de potencia','Accesorio','Piloto luminoso','A9E Pulsadores','Schneider Electric'),
('Distribución de potencia','Accesorio','Piloto luminoso','Señalizacion','Schneider Electric'),
('Distribución de potencia','Arrancadores Suaves','MONTAJE EN PARED','3RW4','Siemens'),
('Distribución de potencia','Bornas','CARRIL DIN','5TB4','Siemens'),
('Distribución de potencia','Caja Conexion','ENVOLVENTE','Plexo³','Legrand'),
('Distribución de potencia','Caja Distribucion','ENVOLVENTE','Nedbox','Legrand'),
('Distribución de potencia','Caja Distribucion','ENVOLVENTE','Practibox','Legrand'),
('Distribución de potencia','Central Reporte','CARRIL DIN','Control Aislamiento','Legrand'),
('Distribución de potenza','Conmutador','CARRIL DIN','Conmutador','Legrand'),
('Distribución de potencia','Contactor','CARRIL DIN','5TT5','Siemens'),
('Distribución de potencia','Contador eléctrico','CARRIL DIN','Medición','Schneider Electric'),
('Distribución de potencia','Control Aislamiento','CARRIL DIN','Control Aislamiento','Legrand'),
('Distribución de potencia','Cortacircuito Fusible','CARRIL DIN','Cortacircuito Seccionable','Legrand'),
('Distribución de potencia','Interruptor Diferencial','CARRIL DIN','5SY7','Siemens'),
('Distribución de potencia','Interruptor Diferencial','CARRIL DIN','Acti 9','Schneider Electric'),
('Distribución de potencia','Interruptor Diferencial','CARRIL DIN','Acti 9 Vigi para iC60','Schneider Electric'),
('Distribución de potencia','Interruptor Diferencial','CARRIL DIN','Interruptor diferencial Acti 9 iID','Schneider Electric'),
('Distribución de potencia','Interruptor Diferencial','CARRIL DIN','RX³ Diferencial','Legrand'),
('Distribución de potencia','Interruptor Diferencial','CARRIL DIN','TX³ Diferencial','Legrand'),
('Distribución de potencia','Interruptor Magnetotérmico','CAJA MOLDEADA','ComPacT NSX','Schneider Electric'),
('Distribución de potencia','Interruptor Magnetotérmico','CAJA MOLDEADA','DPX³ 250','Legrand'),
('Distribución de potencia','Interruptor Magnetotérmico','CAJA MOLDEADA','DPX³ 250 HP','Legrand'),
('Distribución de potencia','Interruptor Magnetotérmico','CARRIL DIN','3VA2','Siemens'),
('Distribución de potencia','Interruptor Magnetotérmico','CARRIL DIN','5JS6','Siemens'),
('Distribución de potencia','Interruptor Magnetotérmico','CARRIL DIN','5SL3','Siemens'),
('Distribución de potencia','Interruptor Magnetotérmico','CARRIL DIN','5SL30','Siemens'),
('Distribución de potencia','Interruptor Magnetotérmico','CARRIL DIN','5SL4','Siemens'),
('Distribución de potencia','Interruptor Magnetotérmico','CARRIL DIN','5SL58','Siemens'),
('Distribución de potencia','Interruptor Magnetotérmico','CARRIL DIN','5SL6','Siemens'),
('Distribución de potencia','Interruptor Magnetotérmico','CARRIL DIN','5SL60','Siemens'),
('Distribución de potencia','Interruptor Magnetotérmico','CARRIL DIN','5SY4','Siemens'),
('Distribución de potencia','Interruptor Magnetotérmico','CARRIL DIN','5SY6','Siemens'),
('Distribución de potencia','Interruptor Seccionador','CARRIL DIN','Vistop','Legrand'),
('Distribución de potencia','Interruptor Seccionador','CARRIL DIN','iSW','Schneider Electric'),
('Distribución de potencia','Proteccion Sobretension','CARRIL DIN','Limitador Sobretension','Legrand'),
('Distribución de potencia','Proteccion Sobretension','CARRIL DIN','iPRC - iPRI','Schneider Electric'),
('Distribución de potencia','Proteccion Sobretension','EMPOTRAR','Mosaic','Legrand'),
('Distribución de potencia','Rearmador','CARRIL DIN','Rearmador diferencial','Schneider Electric'),
('Distribución de potencia','Relés de Seguridad','CARRIL DIN','3RK1','Siemens'),
('Distribución de potencia','Timbre','CARRIL DIN','Señalizacion Acustica','Legrand'),
('Distribución de potencia','Toma Corriente Industrial','SUPERFICIE','Toma Industrial','Legrand'),
('Distribución de potencia','Zumbador','CARRIL DIN','Señalizacion Acustica','Legrand')
ON CONFLICT (subfamilia_canonica, tipo_canonico, marca_canonica) 
DO UPDATE SET familia_destino = EXCLUDED.familia_destino;

-- VERIFICACIÓN FINAL
SELECT 
  familia_destino,
  COUNT(DISTINCT subfamilia_canonica) as subfamilias,
  COUNT(DISTINCT gama_canonica) as gamas,
  COUNT(DISTINCT marca_canonica) as marcas,
  COUNT(*) as entradas_mapeo
FROM mapeo_productos
WHERE familia_destino IN ('Automatización', 'Automatización de edificios', 'Distribución de potencia')
GROUP BY familia_destino
ORDER BY familia_destino;