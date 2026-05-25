# Scripts de gestión del catálogo - Proyecto PFC

Este directorio contiene los scripts de extracción, migración y gestión de productos del catálogo Schneider Electric en Supabase.

## ⚠️ REQUISITO: Variable de entorno

Todos los scripts necesitan la key de Supabase:

```bash
export SONEX_SUPABASE_KEY="tu-key-aqui"
```

Sin esta variable, los scripts usan un placeholder (`eyJhbG...C5wg`) que **no funciona**.

---

## 📦 catlogo supabase-sonex

**Archivo:** `lib/supabase-sonex.js`

Librería compartida con todas las operaciones CRUD contra Supabase.

```javascript
import {
  insertProduct,
  checkRefExists,
  getProductsCount,
  getBrands,
  insertBrand,
  updateProductsByMarca,
  getAllProductIds
} from './lib/supabase-sonex.js';
```

### Funciones

| Función | Descripción |
|---------|-------------|
| `insertProduct(product)` | Inserta un producto en la tabla `products` |
| `checkRefExists(ref)` | Devuelve `true` si `ref_fabricante` ya existe |
| `getProductsCount()` | Devuelve el número total de productos |
| `getBrands()` | Lista todas las marcas (`id, name, website_url`) |
| `insertBrand(brand)` | Inserta una marca nueva |
| `updateProductsByMarca(marca, updates)` | PATCH a todos los productos de una marca |
| `getAllProductIds()` | Lista todos los productos (`id, ref_fabricante, brand_id`) |

### Schema de producto esperado

```javascript
{
  ref_fabricante: string,   // Referencia Schneider (ej: "A9F03102")
  name: string,              // Nombre comercial
  marca: string,             // "Schneider Electric"
  brand_id: number,          // FK a brands.id (Schneider = 456)
  familia: string,           // "DISTRIBUCION DE POTENCIA"
  subfamilia: string,        // "CARRIL DIN" | "CAJA MOLDEADA"
  tipo: string,              // "Interruptor Magnetotérmico"
  Gama: string,              // "Acti 9 iC60" | "ComPacT NSX" | etc.
  Subgama: string,           // "iC60N" | "NSX100N" | "Vigi" | etc.
  imagen: string | null,     // URL de imagen del producto
  pdf_url: string | null,    // URL de hoja de datos PDF
  precio: number             // 0 = sin precio
}
```

---

## 🕷️ scrape-schneider.mjs

**Scraper del catálogo Schneider Electric.**

Extrae productos de las APIs internas de se.com y los inserta en Supabase.

### Uso

```bash
# Todas las gamas, máximo 50 productos por gama
node scripts/scrape-schneider.mjs

# Solo una gama específica
node scripts/scrape-schneider.mjs --gama=ic60
node scripts/scrape-schneider.mjs --gama=nsx

# Modo dry-run (prueba sin guardar en DB)
node scripts/scrape-schneider.mjs --dry-run

# Limitar productos por gama
node scripts/scrape-schneider.mjs --max=10

# Delay entre requests (ms)
node scripts/scrape-schneider.mjs --delay=1000

# Combinado
node scripts/scrape-schneider.mjs --gama=ic60 --max=20 --delay=500
```

### Gamas disponibles

| Clave | Nombre | Range ID | Subfamilia |
|-------|--------|----------|------------|
| `ic60` | Acti 9 iC60 | 7556 | CARRIL DIN |
| `nsx` | ComPacT NSX | 39910531 | CAJA MOLDEADA |
| `vigi` | Acti 9 Vigi para iC60 | 7558 | CARRIL DIN |
| `iid` | Interruptor diferencial Acti 9 iID | 7559 | CARRIL DIN |
| `isw` | iSW | 7566 | CARRIL DIN |
| `ict` | Acti 9 iCT | 7563 | CARRIL DIN |
| `icv40` | Acti9 iCV40 | 65400 | CARRIL DIN |
| `c60ul` | C60 UL CSA IEC | 1104 | CARRIL DIN |
| `iprc` | iPRC - iPRI | 61709 | CARRIL DIN |

> **Nota:** Las gamas `iDPN`, `MTZ` e `iARC` NO están disponibles en la web española de Schneider.
> **iK60:** NO disponible en se.com/es/es (Range API bloqueada por Akamai).
> Usar `scrape-schneider-ik60.mjs` (scraper alternativo con generación de referencias).

### Qué extrae de cada producto

1. **Product page** (`/es/es/product/{ref}/`) → `<title>`, `og:image`, `product-id`
2. **Product card API** (`/products-card/secondary?ids={ref}`) → PDF URL (Product Data Sheet)
3. **Clasificación automática** → Extrae `Gama` y `Subgama` del nombre usando pattern matching

### Archivo de log

El script escribe en `scrape-schneider.log` (ignorado en `.gitignore`). 

### Archivo de reporte

Después de cada ejecución genera `scrape-schneider-report.json`:

```json
{
  "total": 62,
  "saved": 62,
  "skipped": 0,
  "errors": 0,
  "byGama": {
    "icv40": { "total": 62, "saved": 62, "skipped": 0, "errors": 0 }
  }
}
```

### Ejemplo real de ejecución

```
node scripts/scrape-schneider.mjs --gama=ic60 --max=5 --dry-run

# Salida:
#   📂 Gama: Acti 9 iC60 (range ID: 7556)
#      📋 5 productos encontrados
#   [1/5] ✅ A9F03102 | Magnetotérmico, Acti9 iC60N, 1P, 2 A, B curva...
#     📄 PDF: https://www.se.com/.../A9F03102
```

---

## 🔧 migrate-columns.mjs

**Migra las columnas de la tabla `products` (ejecutado una sola vez).**

### Problema original

Los productos tenían la estructura de columnas incorrecta:
- `subfamilia` contenía "CARRIL DIN" / "CAJA MOLDEADA" → debía ser `tipo`
- `tipo` contenía "Interruptor Magnetotérmico" → debía ser `Gama`

### Qué hace

1. `subfamilia` → mueve a `tipo`
2. `tipo` → mueve a `Gama`
3. `subfamilia` = "Interruptor Magnetotérmico" (valor fijo)
4. `Subgama` = extrae del nombre (iC60N, iC60H, NSX100N, etc.)

### Uso

```bash
# Requiere variable de entorno
export SONEX_SUPABASE_KEY="..."

node scripts/migrate-columns.mjs
```

### Resultado esperado

```
📦 2026 productos cargados

=== RESUMEN ===
✅ Migrados: 2026
❌ Errores: 0

📊 Distribución por Gama > Subgama:
  Acti 9 iC60 > iC60N: 400
  Acti 9 iC60 > iC60H: 120
  ComPacT NSX > NSX100N: 80
  ...
```

---

## 🔧 fix-migration.mjs

**Corrige la migración si quedó mal. Usa el campo `name` para reconstruir `Gama` y `Subgama`.**

### Cuándo usarlo

Si después de `migrate-columns.mjs` los valores de `Gama`/`Subgama` son incorrectos o nulos.

### Diferencia con migrate-columns.mjs

- `migrate-columns.mjs` mueve datos entre columnas existentes
- `fix-migration.mjs` reconstruye `Gama` y `Subgama` desde cero usando el `name`

### Uso

```bash
export SONEX_SUPABASE_KEY="..."
node scripts/fix-migration.mjs
```

---

## 🏷️ setup-schneider-brand.mjs

**Configura la marca "Schneider Electric" en la tabla `brands` y asigna `brand_id` a todos los productos.**

### Uso

```bash
export SONEX_SUPABASE_KEY="..."
node scripts/setup-schneider-brand.mjs
```

### Pasos que ejecuta

1. Busca si "Schneider Electric" ya existe en `brands`
2. Si no existe, la crea (`name: "Schneider Electric"`, `website_url: "https://www.se.com/es/es/"`)
3. Obtiene el `brand_id` generado (normalmente 456)
4. Cuenta productos sin `brand_id`
5. Actualiza todos los productos "Schneider Electric" con el `brand_id`

### Salida esperada

```
=== CONFIGURAR MARCA SCHNEIDER ELECTRIC ===

📝 Creando marca Schneider Electric...
✅ Marca creada: { id: 456, name: 'Schneider Electric', ... }

📋 Schneider brand_id: 456

📦 Total productos: 2026
📦 Productos sin brand_id: 0

🔄 Actualizando productos de Schneider Electric...
✅ 2026 productos actualizados con brand_id=456

=== RESUMEN FINAL ===
📦 Productos con brand_id Schneider: 2026
📦 Productos sin brand_id: 0
```

---

## 🗂️ lib/supabase-sonex.js

Ver sección "Cliente Supabase" arriba.

---

## 🚀 Patrón de uso típico (sesión completa)

```bash
# 1. Configurar entorno
export SONEX_SUPABASE_KEY="..."

# 2. Si es la primera vez: configurar marca
node scripts/setup-schneider-brand.mjs

# 3. Scrapea Schneider (ejemplo: solo iC60, 100 productos)
node scripts/scrape-schneider.mjs --gama=ic60 --max=100 --delay=300

# 4. Si las columnas están mal: migrar
node scripts/migrate-columns.mjs

# 5. Verificar con el catálogo web (localhost:5173)
```
---

## 🕷️ scrape-schneider-ik60.mjs

**Scraper específico para Acti9 iK60 (gama NO disponible en Range API pública).**

### Problema

La gama iK60 usa `rangeId = 7557` (NO 7569), pero el endpoint `/ranges/{id}/products` de se.com está bloqueado por Akamai WAF para este rango en todos los países. La web española no comercializa iK60.

### Solución: Generación de referencias + APIs auxiliares

El scraper genera las **180 referencias A9K** a partir del patrón estandarizado:

```
A9K[X][PP][AA]
  X  = subgama: 0=iK60N (6kA), 1=iK60H (10kA)
  PP = polo+curva: 11-14/16 (B) o 21-24/26 (C)
  AA = amperaje: 06, 10, 16, 20, 25, 32, 40, 50, 63
```

Ejemplo: `A9K02116` → `X=0` (K60N), `PP=21` (1P/C), `AA=16` (16A)

### Fuentes de datos

| Dato | Origen | Funciona |
|------|--------|----------|
| Nombre | Generado del patrón A9K | ✅ Siempre |
| PDF | `products-card/secondary` API (ES locale) | ✅ ~50% |
| Imagen | `shop-sg.se.com` (Magento catalog) | ✅ ~100% |
| Precio | No disponible | ❌ |

### Referencias generadas

| Subgama | kA | Poles | Ref. totales |
|---------|----|-------|-------------|
| iK60N | 6kA | 1P/2P/3P/4P + 1P+N | ~90 |
| iK60H | 10kA | 1P/2P/3P/4P | ~90 |

### Uso

```bash
# Todas las referencias
node scripts/scrape-schneider-ik60.mjs

# Dry-run (prueba sin guardar)
node scripts/scrape-schneider-ik60.mjs --dry-run

# Limitar cantidad (ej: 20)
node scripts/scrape-schneider-ik60.mjs --max=20

# Guardar lista de referencias como JSON
node scripts/scrape-schneider-ik60.mjs --save-refs
```

### Clasificación automática

| Campo | Valor |
|-------|-------|
| `familia` | DISTRIBUCION DE POTENCIA |
| `subfamilia` | Interruptor Magnetotérmico |
| `tipo` | CARRIL DIN |
| `Gama` | Acti 9 iK60 |
| `Subgama` | iK60N / iK60H |
| `marca` | Schneider Electric |

---

## 🔄 Sincronización incremental
El scraper **`checkRefExists(ref)`** antes de insertar, así que puedes ejecutar el mismo comando múltiples veces sin duplicados:

- Productos ya existentes → se saltan (`⏭️`)
- Productos nuevos → se insertan (`✅`)

Esto permite sincronización incremental: ejecutar el scraper periódicamente para añadir nuevos productos.

---

## 📊 Tabla `products` - Schema completo

| Columna | Tipo | Descripción | Ejemplo |
|---------|------|-------------|---------|
| `id` | bigint | PK, auto | 1 |
| `ref_fabricante` | text | Referencia Schneider | "A9F03102" |
| `name` | text | Nombre comercial | "Magnetotérmico, Acti9 iC60N..." |
| `marca` | text | Nombre marca | "Schneider Electric" |
| `brand_id` | bigint | FK → brands.id | 456 |
| `familia` | text | Familia normalizada | "DISTRIBUCION DE POTENCIA" |
| `subfamilia` | text | Tipo físico | "CARRIL DIN" / "CAJA MOLDEADA" |
| `tipo` | text | Categoría producto | "Interruptor Magnetotérmico" |
| `Gama` | text | Gama Schneider | "Acti 9 iC60" |
| `Subgama` | text | Subgama | "iC60N" |
| `imagen` | text | URL imagen | "https://..." |
| `pdf_url` | text | URL PDF | "https://..." |
| `precio` | numeric | Precio (0 = sin dato) | 0 |

---

## 📁 Archivos

```
app/scripts/
├── README.md                       ← Este archivo
├── scrape-schneider.mjs           ← Scraper principal (14 gamas)
├── scrape-schneider-ik60.mjs      ← Scraper iK60 (generación refs)
├── scrape-schneider.log           ← Log de ejecución (ignorado)
├── scrape-schneider-report.json   ← Último reporte
├── referencias-ik60.json          ← Lista generada de refs A9K
├── migrate-columns.mjs            ← Migración de columnas
├── fix-migration.mjs              ← Corrección de migración
├── setup-schneider-brand.mjs      ← Setup de marca
├── normalize-legrand.mjs          ← Normalizador Legrand
├── normalize-taxonomy.mjs         ← Normalizador taxonomía DB
├── fetch-legrand-images.mjs       ← Scraper imágenes Legrand (Firecrawl)
└── lib/
    └── supabase-sonex.js          ← Cliente API Supabase
```

## ❌ Script eliminado: sync-catalog-enhanced.mjs

Este script fue eliminado porque:
- Usaba Firebase Firestore (obsoleto, ahora se usa Supabase)
- Leía de un JSON local (`sonepar-catalog-scraper/catalogo-final-v12.json`)

**Ya no debe usarse.**