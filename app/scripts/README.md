# Scripts de Gestión del Catálogo y Taxonomía - Proyecto PFC

Este directorio contiene todas las utilidades de adquisición de datos (scrapers), normalización y mantenimiento de la base de datos de productos y marcas en Supabase.

---

## 📁 Estructura del Directorio

El directorio está organizado de manera modular según la función de cada script:

```
app/scripts/
├── README.md                       # Este archivo de documentación
├── lib/
│   └── supabase-sonex.js           # Cliente API REST unificado para Supabase
├── data/
│   └── range-ids/                  # Configuraciones y mapeos de gamas en formato JSON
├── backups/                        # Backups locales en formato JSON de marcas y productos
├── database-normalizacion/         # Ciclo secuencial de normalización de taxonomía
│   ├── 00-backup-db.mjs            # Respaldo previo a cambios
│   ├── 01-clean-placeholders.mjs   # Eliminación de productos de pruebas
│   ├── 02-verify-taxonomy.mjs      # Auditoría de estado taxonómico
│   ├── 03-fix-contactores.mjs      # Corrección de nombres de subfamilia
│   ├── 04-fix-siemens-families.mjs # Ajuste de familias Siemens
│   ├── 05-normalize-automatizacion.mjs # Normalización de Automatización
│   ├── 06-normalize-instalacion.mjs    # Normalización de Instalación
│   ├── 07-normalize-ve-fv.mjs      # Normalización de Vehículos Eléctricos y Fotovoltaica
│   ├── 08-normalize-tipos.mjs      # Normalización de tipos de montaje
│   ├── 09-update-mapping-files.mjs # Regenera mapeos del frontend
│   └── run-all.mjs                 # Orquestador del ciclo completo de normalización
├── scrapers-catalogo/              # Adquisición e importación de catálogos oficiales por marcas
│   ├── scrape-schneider.mjs        # Scraper Schneider Electric (API pública)
│   ├── scrape-schneider-ik60.mjs   # Generador e importador de gama iK60 (A9K)
│   ├── scrape-schneider-complete.mjs # Importación masiva Schneider Electric
│   ├── scrape-siemens.mjs          # Scraper Siemens por decodificación de patrones
│   ├── crawl-siemens-categories.mjs # Rastreador de categorías de Siemens
│   ├── crawl-siemens-simple.mjs    # Rastreador simple Siemens
│   ├── scrape-abb-official.mjs     # Importador ABB (Sonepar + Robótica)
│   ├── scrape-circutor-official.mjs # Scraper Circutor (Playwright)
│   ├── scrape-eaton-official.mjs   # Scraper Eaton (Playwright)
│   ├── scrape-finder-official.mjs  # Scraper Finder (Playwright)
│   ├── scrape-phoenix-official.mjs # Scraper Phoenix Contact (Playwright)
│   ├── scrape-legrand.mjs          # Scraper Legrand base (Playwright)
│   └── scrape-legrand-ampliado.mjs # Ampliación de categorías Legrand
├── utilidades-mantenimiento/       # Ajustes puntuales e inicialización administrativa
│   ├── assign-siemens-images.mjs   # Mapeo inteligente de imágenes Siemens
│   ├── assign_all_representative_images.mjs # Mapeador de imágenes representativas por gama
│   ├── setup-schneider-brand.mjs   # Configuración de marca Schneider
│   ├── import-massive-brands.mjs   # Importación masiva de marcas auxiliares
│   ├── cleanup_eaton_duplicates.mjs # Limpieza de registros duplicados en Eaton
│   ├── repair-names.mjs            # Corrección de caracteres y nombres corruptos
│   ├── resolve-images-from-chunks.mjs # Mapeo de imágenes desde chunks locales
│   └── fix-migration.mjs           # Corrección del esquema de base de datos
└── verificacion-imagenes/          # Sistema activo de validación inteligente por visión artificial
    ├── capa-1-clasificacion/       # Clasificación y filtrado primario
    ├── capa-2-ia/                  # Validación inteligente de imágenes por visión LMM (Gemini)
    └── scrapers-adquisicion/       # Adquisición y scraping de URLs de imágenes
```

---

## 🚀 Instrucciones de Uso

### ⚠️ Requisito: Variables de Entorno

Todos los scripts requieren credenciales de Supabase. Asegúrate de tener configurado tu archivo `.env` en la raíz de `app/` o exportar la variable en la terminal:

```bash
export SONEX_SUPABASE_KEY="tu-supabase-service-role-key"
```

---

### 🔄 Ciclo de Normalización de Taxonomía

Para ejecutar todo el pipeline de limpieza y normalización taxonómica del catálogo en orden (fases 00 a 09):

```bash
# Ejecutar una simulación (Dry Run) sin modificar la base de datos
node scripts/database-normalizacion/run-all.mjs --dry-run

# Ejecutar el ciclo completo real
node scripts/database-normalizacion/run-all.mjs
```

También se puede ejecutar cada paso de forma individual:

```bash
node scripts/database-normalizacion/00-backup-db.mjs
node scripts/database-normalizacion/02-verify-taxonomy.mjs
```

---

### 🕷️ Extracción e Importación de Catálogos (Scrapers)

Los scrapers pueblan e importan el catálogo de productos marcas específicas:

```bash
# Ejemplo: Importar catálogo base de Schneider
node scripts/scrapers-catalogo/scrape-schneider.mjs --gama=ic60 --max=20

# Ejemplo: Importar catálogo de Siemens
node scripts/scrapers-catalogo/scrape-siemens.mjs --gama=sl6 --max=10
```

---

### 🤖 Verificación de Imágenes por Visión Artificial

Módulo encargado de clasificar y validar las imágenes de catálogo mediante modelos LMM de visión artificial (NVIDIA NIM / Gemini):

```bash
# Continuar la verificación de imágenes pendiente
node scripts/verificacion-imagenes/capa-2-ia/01-verificar-por-ia.mjs --resume --limit=100 --concurrency=4
```

*Para más detalles del flujo de visión artificial, consulta el [README de Verificación](verificacion-imagenes/capa-2-ia/README.md).*