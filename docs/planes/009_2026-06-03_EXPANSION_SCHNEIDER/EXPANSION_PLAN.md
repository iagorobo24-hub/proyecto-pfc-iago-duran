# 🎯 PLAN: Ampliación Catálogo Schneider Electric

## 📊 ESTADO ACTUAL (2026-05-27)

**Total productos Schneider en BD:** 1,000 productos

### Familias PRESENTES en la BD:

| Familia | Productos | Gamas | Estado |
|---------|-----------|-------|---------|
| **Acti9** | 335 | iC60, iK60, Vigi | ✅ Completo |
| **Acti9 iSW** | 18 | iSW (interruptores seccionadores) | ✅ Completo |
| **Acti9 iTL** | 8 | iTL (contactores de impulsos) | ✅ Parcial |
| **ComPacT NSX** | 169 | NSX (caja moldeada) | ✅ Completo |
| **Multi9** | ~400 | C60, NG125 | ✅ Completo |
| **Prisma** | 3 | Cuadros distribución | ⚠️ Mínimo |
| **Linergy** | 4 | Canales cable | ⚠️ Mínimo |
| **Medición** | 1 | Contadores | ⚠️ Mínimo |

---

## ❌ FAMILIAS FALTANTES (PRIORITARIAS)

### 1. **Easy9** - 🔴 ALTA PRIORIDAD
- **Descripción:** Gama económica para distribución residencial
- **Productos típicos:**
  - Magnetotérmicos EZ9 (1P, 2P, 3P, 4P)
  - Diferenciales EZ9
  - Interruptores automáticos
  - Cuadros modulares
- **Referencias típicas:** EZ9F*, EZ9R*, EZ9D*
- **Volumen estimado:** 200-400 productos
- **Fuente recomendada:** PDF catálogo Easy9 SE

### 2. **TeSys** - 🔴 ALTA PRIORIDAD
- **Descripción:** Automatización industrial - контакторы, guardamotores
- **Productos típicos:**
  - Contactoras LC1D, LC1F
  - Guardamotores GV2, GV3, GV7
  - Relés térmicos LRD, LRT
  - Auxiliares LAD, LAE
- **Referencias típicas:** LC1D*, GV2ME*, GV3*, LRD*
- **Volumen estimado:** 500-800 productos
- **Fuente recomendada:** SE DataHub / Distribuidores

### 3. **Harmony** - 🟡 MEDIA PRIORIDAD
- **Descripción:** Pulsadores, señalización, interfaces homem-máquina
- **Productos típicos:**
  - Pulsadores XB4, XB5, XAL
  - Torres de señalización XV
  - Joysticks, pedales
- **Referencias típicas:** XB4*, XB5*, XAL*, XV*
- **Volumen estimado:** 300-500 productos

### 4. **Modicon** - 🟡 MEDIA PRIORIDAD
- **Descripción:** PLCs para automatización industrial
- **Productos típicos:**
  - PLCs M221, M241, M251, M262
  - PLCs M580 (premium)
  - Módulos TM3, TM5
- **Referencias típicas:** TM221*, TM241*, BMX*
- **Volumen estimado:** 200-400 productos

### 5. **Altivar** - 🟡 MEDIA PRIORIDAD
- **Descripción:** Variadores de frecuencia, arrancadores suaves
- **Productos típicos:**
  - Variadores ATV12, ATV32, ATV320
  - Variadores ATV61, ATV71 (industrial)
  - Arrancadores ATS22, ATS48
- **Referencias típicas:** ATV12*, ATV320*, ATS22*
- **Volumen estimado:** 200-300 productos

### 6. **Odace** - 🟢 BAJA PRIORIDAD (Residencial)
- **Descripción:** Interruptores, enchufes para instalación residencial
- **Productos típicos:**
  - Interruptores, conmutadores
  - Enchufes Schuko, USB
  - Mecanismos estéticos
- **Volumen estimado:** 100-200 productos

### 7. **APC** - 🟢 BAJA PRIORIDAD (IT Power)
- **Descripción:** SAIs, protección energética
- **Productos típicos:**
  - Back-UPS: BE*, BX*, BR*
  - Smart-UPS: SMT*, SMC*, SRT*
  - Symmetra: SYA*, SYH*
- **Volumen estimado:** 100-150 productos

---

## 🎯 RECOMENDACIÓN DE IMPLEMENTACIÓN

### Fase 1: **Easy9** (Distribución Residencial Económica)
**Justificación:**
- Complementa Multi9 y Acti9 en gama baja
- Alta demanda en instalación residencial
- Catálogo cerrado y estable (~200 refs)
- Fácil de scrapear desde distribuidores

**Acción:** Buscar PDF catálogo oficial o scrapear desde distribuidores (Sonepar, Rexel)

### Fase 2: **TeSys** (Automatización Industrial)
**Justificación:**
- Esencial para técnicos industriales
- Catálogo extenso pero bien estructurado
- Referencias muy estandarizadas (LC1D, GV2ME)

**Acción:** Scrapear desde SE DataHub o distribuidores industriales

### Fase 3: **Harmony** (Señalización y Control)
**Justificación:**
- Complementa TeSys para cuadros industriales completos
- Alto margen comercial

---

## 📝 FUENTES DE DATOS DISPONIBLES

### ✅ Confirmadas accesibles:
1. **Sonepar.es** - Requiere navegador (anti-bot)
2. **TME.eu** - API accesible pero limitada
3. **SE DataHub** - Portal oficial de descargas

### ❌ Bloqueadas/Problemas:
1. **se.com** - Access Denied para scrapers
2. **Google Search** - CAPTCHA
3. **Rexel.es** - Timeout

---

## 🛠️ PRÓXIMOS PASOS

1. **Confirmar con usuario** qué familia priorizar (recomiendo Easy9)
2. **Obtener lista de referencias** desde:
   - PDFs oficiales de Schneider
   - Scraping de distribuidores (Sonepar, TME)
   - API de SE DataHub
3. **Estructurar datos** según patrón actual:
   - `name`: "[Tipo] [Gama], [Especificaciones]"
   - `Gama`: "Easy9"
   - `Subgama`: "Easy9 Magnetotérmicos", "Easy9 Diferenciales", etc.
   - `ref_fabricante`: Referencia oficial (EZ9F34306, etc.)
   - `VALIDADO_MANUAL`: true
4. **Insertar en Supabase** por lotes de 50-100 productos

---

## 📌 NOTAS TÉCNICAS

- **Naming pattern:** Mantener estándar actual: `[Tipo] [Gama], [Polos], [Amperios], [Curva/Especificación]`
- **Subfamilias:** Agrupar por tipo de producto dentro de cada gama
- **Validación:** Marcar como `VALIDADO_MANUAL=true` si siguen patrón estandarizado
- **Origen:** Documentar fuente de cada lote en campo nuevo `fuente_datos` (a implementar)

---

**Documento generado:** 2026-05-27
**Autor:** Hermes Agent (NexoDigital PFC)