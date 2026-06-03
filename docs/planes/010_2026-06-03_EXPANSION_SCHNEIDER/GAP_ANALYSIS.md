# Gap Analysis: Catálogo Schneider Electric

## Objetivo
Documentar el catálogo completo de Schneider Electric por sectores/mercados, compararlo con los productos actuales en la base de datos Supabase, e identificar las categorías faltantes para planificar el scraping futuro.

## Estado Actual de la BD (proyecto-pfc-iago-duran)

**Total productos Schneider:** 1000 productos (100% validados)
**Fecha análisis:** 16 de junio 2026

### Distribución por Gama Actual

| Gama | Productos | Familia Principal | % del Total |
|------|-----------|-------------------|-------------|
| Multi 9 | 417 | DISTRIBUCION DE POTENCIA | 41.7% |
| Acti 9 iK60 | 180 | DISTRIBUCION DE POTENCIA | 18.0% |
| ComPacT NSX | 169 | DISTRIBUCION DE POTENCIA | 16.9% |
| Acti 9 iC60 | 139 | DISTRIBUCION DE POTENCIA | 13.9% |
| iSW | 18 | DISTRIBUCION DE POTENCIA | 1.8% |
| Acti 9 Vigi | 16 | DISTRIBUCION DE POTENCIA | 1.6% |
| Interruptor diferencial iID | 13 | DISTRIBUCION DE POTENCIA | 1.3% |
| Acti 9 | 13 | DISTRIBUCION DE POTENCIA | 1.3% |
| iTL | 8 | AUTOMATIZACION | 0.8% |
| Acti 9 iCT | 7 | AUTOMATIZACION | 0.7% |
| Señalización | 6 | DISTRIBUCION DE POTENCIA | 0.6% |
| Linergy | 4 | DISTRIBUCION DE POTENCIA | 0.4% |
| iPRC-iPRI | 4 | DISTRIBUCION DE POTENCIA | 0.4% |
| Prisma | 3 | DISTRIBUCION DE POTENCIA | 0.3% |
| Rearmador diferencial | 1 | DISTRIBUCION DE POTENCIA | 0.1% |
| Resi 9 | 1 | DISTRIBUCION DE POTENCIA | 0.1% |
| Medición | 1 | DISTRIBUCION DE POTENCIA | 0.1% |

### Gamas Detalladas

#### Multi 9 (417 productos)
- **Subgamas:** C60BP, C60BPR, C60H, C60H-DC, C60L, C60N, C60SP, N40N
- **Referencias:** M9F*, M9P*, M9U*, A9N*
- **Tipo:** Magnetotérmicos (UL/mercado anglófono)

#### Acti 9 iK60 (180 productos)
- **Subgamas:** iK60H, iK60N
- **Referencias:** A9K*
- **Tipo:** Magnetotérmicos compactos

#### ComPacT NSX (169 productos)
- **Subgamas:** NSX100F/H/M/N/R/S, NSX160F/H/N, NSX250F/H/N
- **Referencias:** C10*, C16*, C25*
- **Tipo:** Interruptores automáticos de caja moldeada (MCCB)

#### Acti 9 iC60 (139 productos)
- **Subgamas:** C60H, iC60H, iC60L, iC60N
- **Referencias:** A9F*, A9N*
- **Tipo:** Magnetotérmicos estándar

---

## Catálogo Completo Schneider Electric por Sectores

### 1. 🔌 DISTRIBUCIÓN DE POTENCIA (LOW VOLTAGE) ✅ PARCIAL

**Estado:** ✅ **BIEN CUBIERTO** (~85% del catálogo actual)

#### 1.1 Protección Modular
- [x] **Interruptores Magnetotérmicos (MCB)**
  - [x] Acti 9 iC60 (139 productos)
  - [x] Acti 9 iK60 (180 productos)
  - [x] Multi 9 C60 (417 productos)
  - [x] Resi 9 (1 producto)
  - [ ] Easy 9 (gama económica - FALTANTE)
  
- [x] **Interruptores Diferenciales (RCCB)**
  - [x] Acti 9 iID (13 productos)
  - [ ] Vigi iID (acoplables - verificar cobertura)
  
- [x] **Interruptores Automáticos Diferenciales (RCBO)**
  - [x] Acti 9 Vigi para iC60 (16 productos)
  - [ ] iCV40 (verificar si está incluido)
  
- [x] **Interruptores en Carga (Switch Disconnectors)**
  - [x] iSW (18 productos)
  - [ ] iINV (interruptores solares - FALTANTE)
  
- [x] **Protectores de Sobretensión (SPD)**
  - [x] iPRC - iPRI (4 productos)
  - [ ] iPRC2, iC60F (específicos - FALTANTES)

#### 1.2 Interruptores de Caja Moldeada (MCCB)
- [x] **ComPacT NSX** (169 productos)
  - [x] NSX100 (100A)
  - [x] NSX160 (160A)
  - [x] NSX250 (250A)
  - [ ] NSX400/630 (alta potencia - FALTANTES)
  - [ ] NSXm (mini - FALTANTE)

#### 1.3 Interruptores Automáticos (ACB)
- [ ] **ComPacT NSXm** - FALTANTE
- [ ] **MasterPacT** (MTZ, NW, NA) - FALTANTE
- [ ] **EasyPacT** (CVS, TVS) - FALTANTE

#### 1.4 Cuadros y Distribución
- [x] **Prisma** (3 productos) - accesorios básicos
  - [ ] Prisma P, Prisma E (completo - FALTANTE)
  - [ ] Prisma iPM - FALTANTE
- [x] **Linergy** (4 productos) - repartidores modulares
- [ ] **Canalizaciones** (Omnirex, Canalis) - FALTANTE
- [ ] **Tableros modulares** (Mosaic, Tableros Pro) - FALTANTE

#### 1.5 DLP/DLPlus (Canales de Cableado) ✅ COMPLETO
- [x] **DLP Monobloc** (categorizado pero sin contar en las 1000 refs)
- [x] **DLPlus** (categorizado pero sin contar en las 1000 refs)

---

### 2. 🏭 AUTOMATIZACIÓN INDUSTRIAL ⚠️ PARCIAL

**Estado:** ⚠️ **MUY PARCIAL** (<5% del sector)

#### 2.1 Control y Mando
- [x] **Contactores Modulares**
  - [x] Acti 9 iCT (7 productos)
  
- [x] **Telerruptores**
  - [x] iTL (8 productos)
  
- [ ] **Contactores Industriales** - FALTANTE
  - [ ] Tesys D (LC1D)
  - [ ] Tesys F (LC1F)
  - [ ] Tesys K (LC1K)
  - [ ] Tesys M (LC1M)
  
- [ ] **Relés** - FALTANTE
  - [ ] Zelio (relés programables)
  - [ ] Harmony (relés de interfaz)
  - [ ] Tesys (relés térmicos)

#### 2.2 Automatización Programable
- [ ] **PLCs (Controladores Lógicos)** - FALTANTE
  - [ ] Modicon M221, M241, M251
  - [ ] Modicon M340, M580
  - [ ] Twido (gama baja)
  - [ ] Zelio Smart (nano PLCs)
  
- [ ] **HMI (Pantallas Táctiles)** - FALTANTE
  - [ ] Magelis (GTU, GTO, GTUO)
  - [ ] Harmony HMIGTO
  
- [ ] **Control de Movimiento** - FALTANTE
  - [ ] Variadores Altivar (ATV)
  - [ ] Servoaccionamientos Lexium
  - [ ] Motores Telemecanique

#### 2.3 Sensores y Seguridad
- [ ] **Sensores Industriales** - FALTANTE
  - [ ] Sensores inductivos (OsiSense)
  - [ ] Sensores capacitivos
  - [ ] Sensores fotoeléctricos (OsiSense XU)
  - [ ] Sensores de presión
  - [ ] Finales de carrera (OsiSense XC)
  
- [ ] **Seguridad Industrial** - FALTANTE
  - [ ] Relés de seguridad (Preventa)
  - [ ] Cortinas de luz
  - [ ] Escáneres de zonas
  - [ ] Pulsadores de emergencia

---

### 3. 🏠 RESIDENCIAL Y PEQUEÑO COMERCIO ❌ AUSENTE

**Estado:** ❌ **PRÁCTICAMENTE AUSENTE** (solo 1 producto Resi 9)

#### 3.1 Mecanismos (Interruptores y Enchufes)
- [ ] **Odace** - FALTANTE
  - Interruptores, conmutadores, cruzamientos
  - Bases de enchufe 16A, 32A
  - Reguladores, temporizadores
  
- [ ] **Merten** - FALTANTE
  - Gama premium (diseño arquitectónico)
  - Sistemas KNX integrados
  
- [ ] **Wiser** - FALTANTE
  - Domótica residencial
  - Termostatos inteligentes
  - Control por app

#### 3.2 Protección Residencial
- [x] **Resi 9** (1 producto) - MUY PARCIAL
  - [ ] Resi 9 completo (MCBs, diferenciales, protecciones)

#### 3.3 Gestión de Energía Residencial
- [ ] **Cuadros Residenciales** - FALTANTE
  - [ ] Tableros modulares domésticos
  - [ ] Protectores contra sobretensiones residenciales
  
- [ ] **Recarga de Vehículos Eléctricos** - FALTANTE
  - [ ] Wallbox EV Charging
  - [ ] Cables y conectoresMode 3

---

### 4. 🏢 EDIFICIOS Y CLIMATIZACIÓN (BUILDING AUTOMATION) ❌ AUSENTE

**Estado:** ❌ **AUSENTE**

#### 4.1 Gestión Técnica del Edificio (BMS)
- [ ] **EcoStruxure Building** - FALTANTE
  - [ ] Controladores de climatización
  - [ ] Gestión de iluminación
  - [ ] Supervisión energética

#### 4.2 Control de Iluminación
- [ ] **Iluminación** - FALTANTE
  - [ ] Balastos electrónicos
  - [ ] Drivers LED
  - [ ] Detectores de presencia
  - [ ] Relés de iluminación

#### 4.3 Climatización y Ventilación
- [ ] **Termostatos y Controladores** - FALTANTE
- [ ] **Ventilconvectores** - FALTANTE
- [ ] **Válvulas motorizadas** - FALTANTE

---

### 5. 🖥️ IT POWER & COOLING (APC BY SCHNEIDER) ❌ AUSENTE

**Estado:** ❌ **AUSENTE** (productos APC - acquired by Schneider)

#### 5.1 SAIs / UPS
- [ ] **UPS Monofásicos** - FALTANTE
  - [ ] Back-UPS (doméstico)
  - [ ] Smart-UPS (profesional)
  
- [ ] **UPS Trifásicos** - FALTANTE
  - [ ] Symmetra
  - [ ] Galaxy

#### 5.2 Infraestructura de Data Center
- [ ] **Racks y Armarios** - FALTANTE
  - [ ] NetShelter (armarios 19")
  - [ ] Accesorios para racks
  
- [ ] **Refrigeración** - FALTANTE
  - [ ] Aire acondicionado de precisión
  - [ ] Refrigeración por pasillo

---

### 6. ☀️ ENERGÍA SOLAR Y GESTIÓN ENERGÉTICA ❌ AUSENTE

**Estado:** ❌ **AUSENTE**

#### 6.1 Energía Solar Fotovoltaica
- [ ] **Inversores Solares** - FALTANTE
  - [ ] Conext (trifásicos)
  - [ ] Invertia (monofásicos)
  
- [ ] **Protecciones DC** - FALTANTE
  - [ ] iINV (interruptores seccionadores DC)
  - [ ] Protecciones combinadas AC/DC

#### 6.2 Almacenamiento de Energía
- [ ] **Baterías** - FALTANTE
- [ ] **Sistemas de gestión de baterías (BMS)** - FALTANTE

#### 6.3 Monitorización Energética
- [x] **Medición** (1 producto) - MUY PARCIAL
  - [ ] Analizadores de redes PowerTag
  - [ ] Contadores de energía
  - [ ] Sensores de corriente
  - [ ] Gateways de comunicación

---

### 7. 🔐 SEGURIDAD Y VIGILANCIA ❌ AUSENTE

**Estado:** ❌ **AUSENTE**

#### 7.1 Control de Accesos
- [ ] **Lectores de tarjetas** - FALTANTE
- [ ] **Cerraduras eléctricas** - FALTANTE
- [ ] **Controladores de acceso** - FALTANTE

#### 7.2 CCTV y Videovigilancia
- [ ] **Cámaras IP** - FALTANTE
- [ ] **Grabadoras NVR** - FALTANTE
- [ ] **Software de gestión de vídeo** - FALTANTE

---

### 8. 🚗 MOVILIDAD ELÉCTRICA ❌ AUSENTE

**Estado:** ❌ **AUSENTE**

#### 8.1 Carga de Vehículos Eléctricos
- [ ] **Puntos de carga** - FALTANTE
  - [ ] Wallbox (doméstico)
  - [ ] station (comercial)
  
- [ ] **Gestión de flotas** - FALTANTE
- [ ] **Software de carga** - FALTANTE

---

## Resumen de Cobertura

| Sector | Estado | Productos en BD | % Estimado de Cobertura |
|--------|--------|-----------------|-------------------------|
| 🔌 Distribución Potencia | ✅ Parcial (bien cubierto) | ~950 | ~85% |
| 🏭 Automatización Industrial | ⚠️ Muy parcial | ~25 | <5% |
| 🏠 Residencial | ❌ Ausente | 1 | <1% |
| 🏢 Building Automation | ❌ Ausente | 0 | 0% |
| 🖥️ IT Power & Cooling | ❌ Ausente | 0 | 0% |
| ☀️ Energía Solar | ❌ Ausente | 0 | 0% |
| 🔐 Seguridad | ❌ Ausente | 0 | 0% |
| 🚗 Movilidad Eléctrica | ❌ Ausente | 0 | 0% |

**Total:** 1000 productos Schneider en BD

---

## Prioridades de Scraping Recomendadas

### Prioridad 1: Completar Distribución de Potencia
- [ ] **Easy 9** (gama económica)
- [ ] **ComPacT NSX400/630** (alta potencia)
- [ ] **EasyPacT CVS** (gama estándar)
- [ ] **MasterPacT MTZ** (alta gama)
- [ ] **Canalizaciones** (Omnirex, Canalis)

### Prioridad 2: Automatización Industrial (gama completa)
- [ ] **Contactores Tesys** (LC1D, LC1F, LC1K)
- [ ] **Relés Zelio/Harmony**
- [ ] **PLCs Modicon** (M221, M241, M340)
- [ ] **Sensores OsiSense**
- [ ] **Variadores Altivar** (ATV12, ATV320, ATV630)

### Prioridad 3: Residencial y Pequeño Comercial
- [ ] **Odace** (mecanismos)
- [ ] **Wiser** (domótica)
- [ ] **Resi 9 completo**

### Prioridad 4: IT Power & Cooling (APC)
- [ ] **Back-UPS / Smart-UPS**
- [ ] **Racks NetShelter**

### Prioridad 5: Energía Solar
- [ ] **Inversores Conext/Invertia**
- [ ] **Protecciones DC iINV**

---

## URLs para Scraping (una vez superado el bloqueo)

```
https://www.se.com/es/es/work/products/distribution/protection-and-modular-switching/
https://www.se.com/es/es/work/products/distribution/moulded-case-circuit-breakers/
https://www.se.com/es/es/work/products/distribution/air-circuit-breakers/
https://www.se.com/es/es/work/products/automation-and-control/contactors/
https://www.se.com/es/es/work/products/automation-and-control/plcs/
https://www.se.com/es/es/work/products/automation-and-control/sensors/
https://www.se.com/es/es/work/products/residential/switches-and-sockets/
https://www.se.com/es/es/work/products/building-automation/
https://www.se.com/es/es/work/products/it-power-cooling/ups/
https://www.se.com/es/es/work/products/solar-and-energy-storage/
```

---

## Notas Técnicas

- **Prefijos de referencia Schneider:**
  - `A9F/A9N` → Acti 9 / Multi 9 (magnetotérmicos)
  - `A9K` → iK60
  - `A9R` → Diferenciales iID
  - `A9V` → Vigi
  - `A9C2*` → Contactores iCT
  - `A9C3*` → Telerruptores iTL
  - `A9L` → iPRC/iPRI (sobretensión)
  - `C10/C16/C25*` → ComPacT NSX
  - `LVS` → Linergy
  - `R9F` → Resi 9
  - `LC1D*` → Tesys D (contactores)
  - `X*` → Sensores OsiSense
  - `ATV*` → Variadores Altivar
  - `M221/M241*` → PLCs Modicon
  - `APC*` → Productos APC (UPS)

- **Bloqueo web:** El sitio `se.com` tiene protección anti-scraping. Alternativas:
  1. Usar API oficial (si disponible)
  2. Datahub de Schneider (datahub.se.com)
  3. Scraping con rotación de IPs y delays
  4. Descarga de CSVs de distribuidores

- **Fecha de última actualización:** 2026-06-16