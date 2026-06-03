-- ============================================
-- TABLA DE REFERENCIA: NOMBRES CANÓNICOS
-- Generado: 2/6/2026, 13:50:13
-- ============================================

-- Esta tabla sirve como referencia para futuras normalizaciones
-- y para que los filtros de la UI muestren nombres consistentes.

-- ============================================
-- 1. FAMILIAS (7 únicas)
-- ============================================

-- Valores actuales en la DB:
-- "Distribución de potencia" (4127 productos, 1 variantes)
-- "Automatización" (251 productos, 1 variantes)
-- "Instalación" (145 productos, 1 variantes)
-- "Iluminación" (64 productos, 1 variantes)
-- "Automatización de edificios" (49 productos, 1 variantes)
-- "Vehículos eléctricos" (29 productos, 1 variantes)
-- "Fotovoltaica" (24 productos, 1 variantes)

-- ============================================
-- 2. SUBFAMILIAS POR FAMILIA
-- ============================================

-- Familia: Automatización de edificios
--   • Mando Smart (12 prod) - Marcas: undefined
--   • Controlador KNX (9 prod) - Marcas: undefined
--   • Base Conectada (5 prod) - Marcas: undefined
--   • Micromodulo Smart (4 prod) - Marcas: undefined
--   • Pasarela KNX (3 prod) - Marcas: undefined
--   • Sensor KNX (3 prod) - Marcas: undefined
--   • Interface KNX (2 prod) - Marcas: undefined
--   • Acoplador KNX (2 prod) - Marcas: undefined
--   • Telemando (1 prod) - Marcas: undefined
--   • Compensador (1 prod) - Marcas: undefined
--   • Actuador HVAC (1 prod) - Marcas: undefined
--   • Actuador HVAC KNX (1 prod) - Marcas: undefined
--   • Router KNX (1 prod) - Marcas: undefined
--   • Interruptor Rotulo (1 prod) - Marcas: undefined
--   • Detector Movimiento (1 prod) - Marcas: undefined
--   • Actuador KNX (1 prod) - Marcas: undefined
--   • Pulsador Telemando (1 prod) - Marcas: undefined

-- Familia: Automatización
--   • Interruptor Diferencial (247 prod) - Marcas: undefined
--   • Contactor (52 prod) - Marcas: undefined
--   • Contactor Industrial (50 prod) - Marcas: undefined
--   • Elemento de Control (42 prod) - Marcas: undefined
--   • Bloque Mando Osmoz (21 prod) - Marcas: undefined
--   • Autómata Programable (12 prod) - Marcas: undefined
--   • Variador de Frecuencia (7 prod) - Marcas: undefined
--   • Fuente Alimentacion (6 prod) - Marcas: undefined
--   • Módulo de E/S (4 prod) - Marcas: undefined
--   • Arrancador Suave (4 prod) - Marcas: undefined
--   • Pulsador Osmoz (3 prod) - Marcas: undefined

-- Familia: Distribución de potencia
--   • Interruptor Magnetotérmico (3672 prod) - Marcas: undefined
--   • Interruptor Diferencial (247 prod) - Marcas: undefined
--   • Accesorio (94 prod) - Marcas: undefined
--   • Interruptor Seccionador (59 prod) - Marcas: undefined
--   • Contactor (52 prod) - Marcas: undefined
--   • Proteccion Sobretension (42 prod) - Marcas: undefined
--   • Caja Distribucion (29 prod) - Marcas: undefined
--   • Contador Eléctrico (27 prod) - Marcas: undefined
--   • Cortacircuito Fusible (19 prod) - Marcas: undefined
--   • Toma Corriente Industrial (7 prod) - Marcas: undefined
--   • Fuente Alimentacion (6 prod) - Marcas: undefined
--   • Rearmador (6 prod) - Marcas: undefined
--   • Caja Conexion (3 prod) - Marcas: undefined
--   • Conmutador (3 prod) - Marcas: undefined
--   • Control Aislamiento (2 prod) - Marcas: undefined
--   • Central Reporte (2 prod) - Marcas: undefined
--   • Relés de Seguridad (1 prod) - Marcas: undefined
--   • Arrancadores Suaves (1 prod) - Marcas: undefined
--   • Bornas (1 prod) - Marcas: undefined
--   • Timbre (1 prod) - Marcas: undefined
--   • Zumbador (1 prod) - Marcas: undefined
--   • Relés Auxiliares (1 prod) - Marcas: undefined
--   • Relés de Estado Sólido (1 prod) - Marcas: undefined

-- Familia: Fotovoltaica
--   • Seccionador CC (12 prod) - Marcas: undefined
--   • Cajas combinadoras (6 prod) - Marcas: undefined
--   • Accesorios (3 prod) - Marcas: undefined
--   • Protecciones sobretensión (2 prod) - Marcas: undefined
--   • Interruptores CC (2 prod) - Marcas: undefined

-- Familia: Iluminación
--   • Accesorio (94 prod) - Marcas: undefined
--   • Luminaria Emergencia (41 prod) - Marcas: undefined
--   • Bateria (5 prod) - Marcas: undefined
--   • Linterna (1 prod) - Marcas: undefined

-- Familia: Instalación
--   • Contador Eléctrico (27 prod) - Marcas: undefined
--   • Canal Instalacion (24 prod) - Marcas: undefined
--   • Canal Cuadros (24 prod) - Marcas: undefined
--   • Minicanal (24 prod) - Marcas: undefined
--   • Bandeja Portacables (24 prod) - Marcas: undefined
--   • Canalizacion (24 prod) - Marcas: undefined

-- Familia: Vehículos eléctricos
--   • Puntos de recarga (23 prod) - Marcas: undefined
--   • Protección para recarga (5 prod) - Marcas: undefined
--   • Accesorios (3 prod) - Marcas: undefined

-- ============================================
-- 3. TIPOS POR SUBFAMILIA
-- ============================================

-- "CARRIL DIN" (3566 productos)
--   Familias: Vehículos eléctricos, Distribución de potencia, Fotovoltaica, Automatización de edificios, Automatización
--   Variantes: CARRIL DIN

-- "CAJA MOLDEADA" (714 productos)
--   Familias: Distribución de potencia
--   Variantes: CAJA MOLDEADA

-- "EMERGENCIA" (64 productos)
--   Familias: Iluminación
--   Variantes: EMERGENCIA

-- "Contactor Industrial" (50 productos)
--   Familias: Automatización
--   Variantes: Contactor Industrial

-- "CANALES" (48 productos)
--   Familias: Instalación
--   Variantes: CANALES

-- "ENVOLVENTE" (36 productos)
--   Familias: Distribución de potencia
--   Variantes: ENVOLVENTE

-- "Contador eléctrico" (24 productos)
--   Familias: Instalación
--   Variantes: Contador eléctrico

-- "RECARGA" (24 productos)
--   Familias: Vehículos eléctricos
--   Variantes: RECARGA

-- "MINICANALES" (24 productos)
--   Familias: Instalación
--   Variantes: MINICANALES

-- "BANDEJAS" (24 productos)
--   Familias: Instalación
--   Variantes: BANDEJAS

-- "CANALIZACION" (24 productos)
--   Familias: Instalación
--   Variantes: CANALIZACION

-- "SUPERFICIE" (21 productos)
--   Familias: Automatización de edificios, Distribución de potencia
--   Variantes: SUPERFICIE

-- "Piloto luminoso" (14 productos)
--   Familias: Distribución de potencia
--   Variantes: Piloto luminoso

-- "Autómata Programable" (11 productos)
--   Familias: Automatización
--   Variantes: Autómata Programable

-- "EMPOTRAR" (11 productos)
--   Familias: Automatización de edificios, Distribución de potencia
--   Variantes: EMPOTRAR

-- "CUADRO DISTRIBUCION" (10 productos)
--   Familias: Distribución de potencia
--   Variantes: CUADRO DISTRIBUCION

-- "Variador Frecuencia" (7 productos)
--   Familias: Automatización
--   Variantes: Variador Frecuencia

-- "Cajas para FV" (6 productos)
--   Familias: Fotovoltaica
--   Variantes: Cajas para FV

-- "Módulo I/O" (4 productos)
--   Familias: Automatización
--   Variantes: Módulo I/O

-- "Soft Starter" (4 productos)
--   Familias: Automatización
--   Variantes: Soft Starter

-- "MODULAR" (1 productos)
--   Familias: Automatización
--   Variantes: MODULAR

-- "MONTAJE EN PARED" (1 productos)
--   Familias: Distribución de potencia
--   Variantes: MONTAJE EN PARED

-- "EMPLAZAMIENTO PANELE" (1 productos)
--   Familias: Instalación
--   Variantes: EMPLAZAMIENTO PANELE

-- ============================================
-- 4. GAMAS COMERCIALES (Campo: "Gama")
-- ============================================

-- Total gamas únicas: 107

-- "ComPacT NSX" (643 prod)
-- "Acti 9 iC60" (526 prod)
-- "Multi 9" (520 prod)
-- "5SY4" (420 prod)
-- "5SL4" (306 prod)
-- "5SY7" (283 prod)
-- "Acti 9 iK60" (180 prod)
-- "5SY6" (175 prod)
-- "5SL6" (170 prod)
-- "5SL3" (145 prod)
-- "5SY5" (90 prod)
-- "Acti 9 Vigi para iC60" (74 prod)
-- "Interruptor diferencial Acti 9 iID" (74 prod)
-- "Acti9 iCV40" (54 prod)
-- "Acti 9 iCT" (50 prod)
-- "Acti 9" (36 prod)
-- "iSW" (36 prod)
-- "5JS6" (32 prod)
-- "5SP4" (32 prod)
-- "5SL60" (30 prod)
-- "iTL" (24 prod)
-- "DPX³ 250 HP" (24 prod)
-- "DPX³ Accesorio" (24 prod)
-- "Limitador Sobretension" (24 prod)
-- "Señalizacion" (24 prod)
-- "DLP Monobloc" (24 prod)
-- "Lina 25" (24 prod)
-- "DLPlus" (24 prod)
-- "Omega" (24 prod)
-- "LBplus" (24 prod)
-- "Hogar Conectado" (23 prod)
-- "Vistop" (23 prod)
-- "DPX³ 250" (23 prod)
-- "5SL30" (22 prod)
-- "Acti 9 Osmoz" (20 prod)
-- "Cortacircuito Seccionable" (19 prod)
-- "B65LED" (18 prod)
-- "Practibox" (17 prod)
-- "Resi 9" (17 prod)
-- "KNX" (15 prod)
-- "Nedbox" (14 prod)
-- "iPRC - iPRI" (14 prod)
-- "Green'up Premium" (12 prod)
-- "5SL58" (12 prod)
-- "Seccionador DC" (12 prod)
-- "RX³ Magnetotermico" (10 prod)
-- "Mosaic" (9 prod)
-- "Green'up Home" (8 prod)
-- "Interruptor Horario" (7 prod)
-- "Cubrebornas" (7 prod)
-- ... y 57 gamas más

-- ============================================
-- 5. SUBGAMAS (Campo: "Subgama")
-- ============================================

-- Total subgamas únicas: 324

-- "iC60L" (198 prod)
-- "iC60N" (184 prod)
-- "5SY4 Curva B" (182 prod)
-- "C60SP" (161 prod)
-- "iC60H" (130 prod)
-- "5SY4 Curva C" (130 prod)
-- "5SY6 Curva C" (114 prod)
-- "5SY4 Curva D" (108 prod)
-- "5SL6 Curva C" (108 prod)
-- "5SY7 Curva C" (108 prod)
-- "5SY7 Curva D" (108 prod)
-- "5SL4 Curva D" (108 prod)
-- "5SL4 Curva C" (108 prod)
-- "NSX100H" (103 prod)
-- "5SL3 Curva C" (96 prod)
-- "NSX250H" (95 prod)
-- "C60N" (91 prod)
-- "C60BP" (90 prod)
-- "iK60N" (90 prod)
-- "5SL4 Curva B" (90 prod)
-- "iK60H" (90 prod)
-- "5SL6 Curva B" (62 prod)
-- "5SY6 Curva B" (61 prod)
-- "5SY7 Curva B" (60 prod)
-- "C60H" (59 prod)
-- "NSX100F" (58 prod)
-- "iID 25-63A" (55 prod)
-- "5SY5 Curva C" (54 prod)
-- "NSX100N" (49 prod)
-- "5SL3 Curva B" (49 prod)
-- "Vigi" (45 prod)
-- "iCV40N" (45 prod)
-- "C60H-DC" (45 prod)
-- "C60BPR" (39 prod)
-- "5SY5 Curva B" (36 prod)
-- "General" (34 prod)
-- "C60L" (34 prod)
-- "Accesorios" (32 prod)
-- "NSX250R" (32 prod)
-- "NSX250N" (32 prod)
-- "NSX100R" (32 prod)
-- "NSX400H" (32 prod)
-- "Quick Vigi" (29 prod)
-- "NSX250F" (29 prod)
-- "NSX160F" (28 prod)
-- "NSX160N" (26 prod)
-- "NSX160H" (26 prod)
-- "NSX630H" (26 prod)
-- "5SL30 Curva C" (22 prod)
-- "5SL60 Curva C" (22 prod)
-- ... y 274 subgamas más