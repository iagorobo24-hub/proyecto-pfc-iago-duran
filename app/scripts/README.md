# Scripts de gestión del catálogo - Proyecto PFC

Este directorio contiene los scripts de extracción, migración y gestión de productos del catálogo en Supabase.

## ⚠️ REQUISITO: Variable de entorno

Todos los scripts necesitan la key de Supabase:

```bash
export SONEX_SUPABASE_KEY="tu-key-aqui"
```

Sin esta variable, los scripts usan un placeholder que **no funciona**.

---

## 📦 Cliente supabase-sonex

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
  ref_fabricante: string,   // Referencia fabricante (ej: "A9F03102" o "5SL6106-6")
  name: string,              // Nombre comercial
  marca: string,             // "Schneider Electric" o "Siemens"
  brand_id: number,          // FK a brands.id
  familia: string,           // "DISTRIBUCION DE POTENCIA"
  subfamilia: string,        // "Interruptor Magnetotérmico"
  tipo: string,              // "CARRIL DIN" o "CAJA MOLDEADA"
  Gama: string,              // "Acti 9 iC60" o "5SL6"
  Subgama: string,           // "iC60N" o "5SL6 B curva"
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

| Clave | Nombre | Range ID |
|-------|--------|----------|
| `ic60` | Acti 9 iC60 | 7556 |
| `nsx` | ComPacT NSX | 39910531 |
| `vigi` | Acti 9 Vigi para iC60 | 7558 |
| `iid` | Interruptor diferencial Acti 9 iID | 7559 |
| `isw` | iSW | 7566 |
| `ict` | Acti 9 iCT | 7563 |

> **Nota:** Las gamas `iDPN`, `MTZ` e `iARC` NO están disponibles en la web española de Schneider.

---

## 🕷️ scrape-schneider-ik60.mjs

**Scraper específico para Acti9 iK60 (gama NO disponible en Range API pública).**

### Problema

La gama iK60 usa `rangeId = 7557`, pero el endpoint está bloqueado por Akamai WAF.

### Solución: Generación de referencias + APIs auxiliares

El scraper genera las **180 referencias A9K** a partir del patrón estandarizado:

```
A9K[X][PP][AA]
  X  = subgama: 0=iK60N (6kA), 1=iK60H (10kA)
  PP = polo+curva: 11-14/16 (B) o 21-24/26 (C)
  AA = amperaje: 06, 10, 16, 20, 25, 32, 40, 50, 63
```

### Uso

```bash
# Todas las referencias
node scripts/scrape-schneider-ik60.mjs

# Dry-run (prueba sin guardar)
node scripts/scrape-schneider-ik60.mjs --dry-run

# Limitar cantidad (ej: 20)
node scripts/scrape-schneider-ik60.mjs --max=20
```

---

## 🕷️ scrape-siemens.mjs

**Scraper para productos Siemens (interruptores magnetotérmicos y MCCB).**

### Problema

Siemens **no expone una API pública accesible** como Schneider Electric.

### Solución: Generación de referencias desde patrones conocidos

El scraper genera referencias desde los patrones del catálogo Siemens y verifica disponibilidad en mallmall.siemens.com.

### Gamas soportadas

| Clave | Gama | Descripción | Patrón de referencia |
|-------|------|-------------|---------------------|
| `sl6` | 5SL6 | MCB estándar, 6kA | 5SL6[1-4][16][00-99]-[0-9] |
| `sy7` | 5SY7 | MCB gama superior, 10kA | 5SY7[1-4][16][00-99]-[0-9] |
| `sy4` | 5SY4 | MCB industrial, 6kA | 5SY4[1-4][16][00-99]-[0-9] |
| `va2` | 3VA2 | MCCB (caja moldeada) | 3VA2[00-99][00-99]-[A-Z0-9]+ |

### Patrón de referencias Siemens

Los interruptores 5SL6/5SY7/5SY4 siguen el formato:

```
5SL6[X][Y][ZZ]-[W]
  X = polos: 1=1P, 2=2P, 3=3P, 4=4P
  Y = curva: 1=B, 6=C
  ZZ = amperaje: 01=1A, 06=6A, 10=10A, 16=16A, 20=20A, ..., 63=63A
  W = versión
```

**Ejemplos:**
- `5SL6106-6` → 1P, B curva, 6A, 6kA
- `5SL6463-6` → 4P, C curva, 63A, 6kA
- `5SY7210-7` → 2P, B curva, 10A, 10kA

### Uso

```bash
# Todas las gamas (5SL6, 5SY7, 5SY4, 3VA2)
node scripts/scrape-siemens.mjs

# Solo una gama específica
node scripts/scrape-siemens.mjs --gama=sl6
node scripts/scrape-siemens.mjs --gama=sy7

# Modo dry-run (prueba sin guardar en DB)
node scripts/scrape-siemens.mjs --dry-run

# Limitar productos por gama
node scripts/scrape-siemens.mjs --max=20

# Delay entre requests (ms)
node scripts/scrape-siemens.mjs --delay=1000

# Combinado
node scripts/scrape-siemens.mjs --gama=sl6 --max=10 --delay=500
```

### Qué extrae de cada producto

1. **Decodificación automática** → Extrae polos, curva, amperaje de la referencia
2. **mallmall.siemens.com** → Nombre comercial, imagen (si está disponible)
3. **PDF detection** → Intenta obtener hoja técnica desde `/api/products/{ref}/documents`

### Diferencias con Schneider

| Aspecto | Schneider | Siemens |
|---------|-----------|---------|
| API pública | ✅ Range API + Product Card | ❌ No disponible |
| Generación de refs | ❌ No (solo IDs de API) | ✅ Sí (patrones conocidos) |
| Disponibilidad | ~100% de productos | ~30-50% (mallmall limitado) |
| Imágenes | ✅ Directas | ⚠️ CDN Siemens (puede fallar) |
| PDFs | ✅ Product Card API | ⚠️ Route API (no siempre) |

### Nota importante

Algunas referencias generadas pueden no existir realmente en el catálogo de Siemens. El scraper verifica disponibilidad en mallmall.siemens.com y solo guarda los productos que existen. Esto es normal: genera ~100-200 referencias, pero solo ~30-50% estarán disponibles.

---

## 🔄 Sincronización incremental

Todos los scrapers usan `checkRefExists(ref)` antes de insertar, así que puedes ejecutar el mismo comando múltiples veces sin duplicados:

- Productos ya existentes → se saltan (`⏭️`)
- Productos nuevos → se insertan (`✅`)

Esto permite sincronización incremental: ejecutar el scraper periódicamente para añadir nuevos productos.

---

## ❌ Scripts eliminados

### sync-catalog-enhanced.mjs

Este script fue eliminado porque:
- Usaba Firebase Firestore (obsoleto, ahora se usa Supabase)
- Leía de un JSON local (`sonepar-catalog-scraper/catalogo-final-v12.json`)

**Ya no debe usarse.**

---

## 📁 Archivo completo

```
app/scripts/
├── README.md                       ← Este archivo
├── scrape-schneider.mjs           ← Scraper Schneider (14 gamas, API pública)
├── scrape-schneider-ik60.mjs      ← Scraper iK60 (generación de refs A9K)
├── scrape-siemens.mjs             ← Scraper Siemens (generación de refs 5SL6/5SY7)
├── scrape-schneider.log           ← Log de ejecución (ignorado)
├── scrape-schneider-report.json   ← Último reporte Schneider
├── scrape-siemens-report.json     ← Último reporte Siemens
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