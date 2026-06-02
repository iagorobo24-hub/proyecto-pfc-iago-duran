# 📊 Análisis Catálogo Schneider Electric - Supabase

**Fecha:** 27 de mayo de 2026  
**Estado:** ✅ 364 productos validados (100%)  
**Proyecto:** proyecto-pfc-iago-duran

---

## 1. Resumen Ejecutivo

### 1.1 ESTADO ACTUAL

| Métrica | Valor |
|---------|-------|
| Total productos Schneider | **364** |
| Validados manualmente | **364** (100%) |
| Pendientes de validación | **0** |
| Familias cubiertas | **2** |
| Gamas distintas | **15** |

### 1.2 DISTRIBUCIÓN POR MARCA (BD Completa)

- **Schneider Electric:** 364 productos
- **Legrand:** 353 productos
- **Siemens:** 283 productos

**Total BD:** 1.000 productos

---

## 2. Estructura Actual del Catálogo Schneider

### 2.1 POR FAMILIA > SUBFAMILIA > GAMA

```
📁 AUTOMATIZACION (6 productos)
  📂 Contactor (2)
    ▸ Acti 9 iCT: 2 productos ✓
  📂 Elemento de Control (4)
    ▸ iTL: 4 productos ✓

📁 DISTRIBUCION DE POTENCIA (358 productos)
  📂 Accesorio (13)
    ▸ Linergy: 4 productos ✓
    ▸ Prisma: 3 productos ✓
    ▸ Señalizacion: 6 productos ✓
  📂 Interruptor Diferencial (28)
    ▸ Acti 9: 10 productos ✓
    ▸ Acti 9 Vigi para iC60: 10 productos ✓
    ▸ Interruptor diferencial Acti 9 iID: 8 productos ✓
  📂 Interruptor Magnetotérmico (311)
    ▸ Acti 9 iC60: 62 productos ✓
    ▸ Acti 9 iK60: 3 productos ✓
    ▸ ComPacT NSX: 66 productos ✓
    ▸ Multi 9: 179 productos ✓
    ▸ Resi 9: 1 producto ✓
  📂 Contador eléctrico (1)
    ▸ Medición: 1 producto ✓
  📂 Proteccion Sobretension (4)
    ▸ iPRC - iPRI: 4 productos ✓
  📂 Rearmador (1)
    ▸ Rearmador diferencial: 1 producto ✓
```

---

## 3. Problemas Detectados en Nomenclatura

### 3.1 INCONSISTENCIAS IDENTIFICADAS

#### ❌ Problema 1: Nombres en inglés
- **Ejemplo:** `Multi 9 - C60SP - MCB - 2P - 16 A - B Curve`
- **Debería ser:** `Interruptor magnetotérmico Multi 9 C60SP, 2P, 16A, curva B`

#### ❌ Problema 2: Formato inconsistente
Algunos usan:
- Comas: `Magnetotérmico, Acti9 iC60L, 4P, 63 A, K curva`
- Guiones: `Multi 9 - C60SP - MCB - 2P`
- Punto y coma: `Interruptor diferencial; Acti9 iID; 4P; 40A`

#### ❌ Problema 3: Orden de especificaciones variable
- Unos ponen: `2P, 16A, curva C`
- Otros ponen: `16 A, 2 polos, C curva`

#### ❌ Problema 4: Typos y tildes incorrectas
- `Señalizacion` → debería ser `Señalización`
- `Proteccion` → debería ser `Protección`

#### ❌ Problema 5: Nombres incompletos
- Producto con nombre: `PRC` (sin contexto)
- Producto con nombre: `4 Conexiones NG-INS125 Linergy DX 125A` (formato confuso)

---

## 4. Patrón de Nomenclatura Propuesto

### 4.1 ESTRUCTURA ESTÁNDAR

```
[Tipo de producto] [Gama], [Especificaciones técnicas]
```

### 4.2 ESPECIFICACIONES EN ORDEN

**Para interruptores magnetotérmicos:**
```
Interruptor magnetotérmico [Gama], [Nº polos]P, [Amperios]A, [Curva] curva, [Poder corte]kA
```
**Ejemplo:** `Interruptor magnetotérmico Acti9 iC60N, 3P, 16A, C curva, 6kA`

**Para interruptores diferenciales:**
```
Interruptor diferencial [Gama], [Nº polos]P, [Amperios]A, [Sensibilidad]mA, [Tipo]
```
**Ejemplo:** `Interruptor diferencial Acti9 iID, 4P, 40A, 30mA, tipo AC`

**Para contactores:**
```
Contactor modular [Gama], [Amperios]A, [Nº polos]P, [Contactos NA/NC], [Tensión bobina]V
```
**Ejemplo:** `Contactor modular Acti9 iCT, 25A, 2P, 2NA, 230V CA`

**Para telerruptores:**
```
Telerruptor [Gama], [Nº polos]P, [Amperios]A, [Tensión]V
```
**Ejemplo:** `Telerruptor iTL, 1P, 16A, 230V CA`

**Para protectores de sobretensión:**
```
Protector sobretensiones [Gama], [Tipo], [Nº polos], [Icn]kA, [Uc]V
```
**Ejemplo:** `Protector sobretensiones Acti9 iPRC, Tipo 2, 1P+N, 40kA, 340V`

**Para accesorios:**
```
[Nombre accesorio] para [Gama], [Especificación]
```
**Ejemplo:** `Repartidor vertical Prisma VDIS, 160A, 66 agujeros`

---

## 5. Validación de Referencias por Gama

### 5.1 MULTI 9 (179 productos) ✅

**Referencias verificadas:** Prefijos `M9F`, `A9N`, `A9F`
- **M9F:** Multi 9 estándar (UL/mercado americano)
- **A9N/A9F:** Acti 9 / Multi 9 (mercado europeo)

**Estado:** ✅ Correctamente clasificada como `DISTRIBUCION DE POTENCIA > Interruptor Magnetotérmico`

**Acción requerida:** 
- Estandarizar nombres (actualmente mezclan inglés/español)
- Unificar formato de especificaciones

### 5.2 ACTI 9 IC60 (62 productos) ✅

**Referencias verificadas:** Prefijos `A9F`, `A9N`
- Gama profesional de interruptores magnetotérmicos

**Estado:** ✅ Correctamente clasificada

**Acción requerida:**
- Unificar formato: algunos usan "Disyuntor en miniatura", otros "Magnetotérmico"
- **Recomendación:** Usar siempre "Interruptor magnetotérmico"

### 5.3 COMPACT NSX (66 productos) ✅

**Referencias verificadas:** Prefijos `C10N`, `C16F`, `C16N`, etc.
- Formato: `C[Amperaje][Tipo][Polos]`
  - `C10` = NSX100, `C16` = NSX160, `C25` = NSX250

**Estado:** ✅ Correctamente clasificada como `DISTRIBUCION DE POTENCIA > Interruptor Magnetotérmico`

**Acción requerida:**
- Mejorar nombres: algunos muy cortos (`Interruptor automatico ComPacT NSX100N 50kA AC 3P3R 80A TMD`)
- Añadir información de disparador (TMD, Micrologic)

### 5.4 ACTI 9 VIGI PARA IC60 (10 productos) ✅

**Referencias verificadas:** Prefijos `A9V`
- Bloques diferenciales acoplables a iC60

**Estado:** ✅ Correctamente clasificada como `DISTRIBUCION DE POTENCIA > Interruptor Diferencial`

**Acción requerida:**
- Unificar nombres: Algunos dicen "Vigi iC60", otros "Quick Vigi iC60"
- Especificar siempre: Tipo (A, AC, A-SI), Sensibilidad, Selectividad

### 5.5 INTERRUPTOR DIFERENCIAL ACTI 9 IID (8 productos) ✅

**Referencias verificadas:** Prefijos `A9R`
- Interruptores diferenciales puros (no acoplables)

**Estado:** ✅ Correctamente clasificada

**Acción requerida:**
- Estandarizar: algunos dicen "RCCB" (inglés), otros "Interruptor diferencial residual"
- **Recomendación:** Usar siempre "Interruptor diferencial"

### 5.6 ACTI 9 IK60 (3 productos) ✅

**Referencias verificadas:** Prefijos `A9K`
- Versión compacta de iC60

**Estado:** ✅ Correctamente clasificada

### 5.7 ACTI 9 ICT (2 productos) ✅

**Referencias verificadas:** Prefijos `A9C`
- Contactores modulares

**Estado:** ✅ Correctamente clasificada como `AUTOMATIZACION > Contactor`

### 5.8 ITL (4 productos) ✅

**Referencias verificadas:** Prefijos `A9C`
- Telerruptores (interruptores de impulso)

**Estado:** ✅ Correctamente clasificada como `AUTOMATIZACION > Elemento de Control`

**Acción requerida:**
- Unificar formato de tensión: algunos dicen `230VCA`, otros `230V CA`

### 5.9 IPRC - IPRI (4 productos) ✅

**Referencias verificadas:** Prefijos `A9L`
- Protectores de sobretensión transitoria

**Estado:** ✅ Correctamente clasificada como `DISTRIBUCION DE POTENCIA > Proteccion Sobretension`

**Acción requerida:**
- Corregir nombre de gama: `iPRC - iPRI` → `Acti9 iPRC/iPRI`
- Producto con nombre "PRC" necesita nombre completo

### 5.10 LINERGY (4 productos) ✅

**Referencias verificadas:** Prefijos `LVS`
- Repartidores modulares de carril DIN

**Estado:** ✅ Correctamente clasificada como `DISTRIBUCION DE POTENCIA > Accesorio`

### 5.11 PRISMA (3 productos) ✅

**Referencias verificadas:** Prefijos `A9X`
- Accesorios para cuadros Prisma

**Estado:** ✅ Correctamente clasificada

### 5.12 SEÑALIZACION (6 productos) ⚠️

**Referencias verificadas:** Prefijos `A9E`
- Pilotos de señalización iIL

**Estado:** ⚠️ Nombre de gama incorrecto
- **Corrección:** `Señalizacion` → `Señalización`

**Acción requerida:**
- Corregir tilde en nombre de gama
- Estandarizar nombres: algunos en mayúsculas (`PILOTO IIL SIMPLE`), otros no

### 5.13 RESI 9 (1 producto) ✅

**Referencias verificadas:** Prefijos `R9F`
- Gama residencial de interruptores

**Estado:** ✅ Correctamente clasificada

### 5.14 MEDICIÓN (1 producto) ⚠️

**Referencias verificadas:** Prefijos `M8650`
- Analizadores de potencia

**Estado:** ⚠️ Nombre en inglés
- **Actual:** `M8650 power monitor 128 MB - 60 Hz - 9S. - Ethernet ((*))`
- **Recomendación:** `Analizador de potencia M8650, 128MB, Ethernet`

### 5.15 REARMADOR DIFERENCIAL (1 producto) ⚠️

**Referencias verificadas:** Prefijos `A9C`
- Rearmadores automáticos (ARA)

**Estado:** ⚠️ Nombre muy abreviado
- **Actual:** `Reconectad. autom. ARA aux. iC60 1-2P`
- **Recomendación:** `Rearmador automático iC60, auxilar, 1-2P`

---

## 6. Catálogo Completo Schneider Electric - Mercados No Cubiertos

### 6.1 MERCADOS ACTUALES EN BD

✅ **Cubiertos:**
- Distribución de Potencia (Baja tensión)
- Automatización Industrial (básica)

❌ **NO cubiertos (oportunidades de expansión):**

#### 🏠 RESIDENCIAL Y PEQUEÑO COMERCIAL
- [ ] Interruptores y enchufes (Odace, Merten, Unica)
- [ ] Domótica (Wiser by Schneider)
- [ ] Cuadros residenciales (Resi9 - solo 1 producto actual)

#### 💡 CONTROL DE ILUMINACIÓN
- [ ] Reguladores
- [ ] Sensores de presencia
- [ ] Sistemas DALI/KNX

#### 🔋 ENERGÍA Y SOLAR
- [ ] Inversores solares
- [ ] Almacenamiento en baterías
- [ ] Cargadores de vehículo eléctrico (EVlink)

#### 🖥️ IT Y CENTROS DE DATO
- [ ] SAIs/UPS (APC by Schneider)
- [ ] Racks y armarios (NetShelter)
- [ ] Refrigeración de precisión
- [ ] PDUs (Regletas inteligentes)

#### 🏭 AUTOMATIZACIÓN INDUSTRIAL (avanzada)
- [ ] Variadores de frecuencia (Altivar)
- [ ] Servomotores y servovariadores
- [ ] PLCs (Modicon)
- [ ] Pantallas HMI
- [ ] Sensores industriales (Telemecanique Sensors)

#### ⚡ SEGURIDAD ELÉCTRICA
- [ ] Relés de seguridad
- [ ] Cortinas de luz
- [ ] Pulsadores de emergencia
- [ ] Selectores y setas de emergencia

#### 🌡️ CLIMATIZACIÓN
- [ ] Termostatos
- [ ] Control de HVAC

#### 🔌 CONECTIVIDAD
- [ ] PeveNet (PROFINET)
- [ ] EtherNet/IP
- [ ] Gateways de comunicación

---

## 7. Plan de Acción Recomendado

### FASE 1: Estandarización de Nombres (Prioridad: ALTA)

**Objetivo:** Corregir los 364 productos actuales para que sigan el patrón estandarizado.

**Lotes propuestos:**

1. **Lote Multi 9 (179 productos)**
   - Traducir nombres en inglés
   - Unificar formato: `Interruptor magnetotérmico Multi 9 [Subgama], [Nº polos]P, [Amperios]A, [Curva] curva`

2. **Lote Acti 9 iC60 (62 productos)**
   - Cambiar "Disyuntor en miniatura" → "Interruptor magnetotérmico"
   - Estandarizar orden de specs

3. **Lote ComPacT NSX (66 productos)**
   - Mejorar nombres con información completa de disparador

4. **Lote Diferenciales (28 productos)**
   - Unificar terminología (quitar "RCCB", "Vigi")

5. **Lote Resto de gamas (29 productos)**
   - iTL, iCT, iPRC, Linergy, Prisma, Señalización, etc.

### FASE 2: Corregir Errores de Clasificación (Prioridad: MEDIA)

- [ ] Corregir `Señalizacion` → `Señalización`
- [ ] Corregir `Proteccion` → `Protección`
- [ ] Revisar nombres de subfamilias en inglés

### FASE 3: Expansión del Catálogo (Prioridad: BAJA)

**Orden recomendado por importancia comercial:**

1. **Residencial** (Odace, Unica) - Alta demanda en Sonepar
2. **EV Charging** (EVlink) - Mercado en crecimiento
3. **Solar** - Tendencia en auge
4. **UPS/IT** (APC) - Complementario a distribución
5. **Automatización avanzada** (Altivar, Modicon) - Para industrial

---

## 8. Conclusión

El catálogo actual de Schneider Electric en la base de datos está **completamente validado** (100%), pero presenta **inconsistencias significativas en la nomenclatura** que deben corregirse para:

1. **Mejorar la búsqueda:** Nombres estandarizados facilitan encontrar productos
2. **Evitar confusiones:** Unificar terminología técnica en español
3. **Preparar para expansión:** Una base limpia permite añadir nuevos productos consistentemente

**Recomendación inmediata:** Ejecutar la FASE 1 de estandarización, começando por el lote Multi 9 (179 productos, 49% del total).

---

## Anexo A: Referencias de Prefijos Schneider

| Prefijo | Gama | Tipo de producto |
|---------|------|------------------|
| A9F | Acti 9 / Multi 9 | Magnetotérmicos |
| A9N | Acti 9 / Multi 9 | Magnetotérmicos (ref anteriores) |
| A9R | Acti 9 iID | Diferenciales puros |
| A9V | Acti 9 Vigi | Bloques diferenciales |
| A9C | Acti 9 | Contactores, Telerruptores, Rearmadores |
| A9K | Acti 9 iK60 | Magnetotérmicos compactos |
| A9L | Acti 9 iPRC | Protectores sobretensión |
| A9E | Acti 9 iIL | Pilotos señalización |
| A9X | Prisma | Accesorios cuadros |
| C10/C16/C25 | ComPacT NSX | Interruptores caja moldeada |
| LVS | Linergy | Repartidores modulares |
| M9F | Multi 9 | Magnetotérmicos (UL) |
| R9F | Resi 9 | Gama residencial |

---

*Documento generado automáticamente desde análisis de Supabase - 27/05/2026*