# Capa 1: Clasificación de Imágenes y Corrección de Caídas

La **Capa 1** es el primer filtro técnico del sistema de mantenimiento de imágenes de la base de datos de productos. Funciona sin utilizar inteligencia artificial ni Playwright, operando a nivel de protocolo de red y hashes.

## Propósito de la Capa 1
1. **Verificar la disponibilidad de las imágenes:** Descargar la imagen de cada producto directamente de su URL.
2. **Detectar imágenes rotas (`no_carga`):** Si la URL responde con un código de error (distinto de 200) o si no es del tipo MIME de imagen (`image/*`), el producto se clasifica como `no_carga`.
3. **Detectar placeholders o imágenes genéricas (`posible_generico`):** 
   - Imágenes de tamaño inferior a **1.5 KB** (suelen ser iconos de "imagen no disponible" o logos pequeños).
   - Imágenes con el **mismo hash SHA-256 exacto** repetido en 3 o más productos distintos.
4. **Validar imágenes aptas (`pendiente_ia`):** Imágenes que se descargan correctamente y son únicas. Pasan a la Capa 2 para su auditoría semántica.

---

## Estado Actual de la Base de Datos (Última Actualización: 15/06/2026)

Tras corregir los fallos mediante los scrapers y correr el validador final, la cobertura técnica es la siguiente:

- **Imágenes Rotas (`no_carga`):** **0 productos** en todo el catálogo (100% resueltas).
- **Pendientes de IA (`pendiente_ia`):** **22,084 productos** (únicas y descargables).
- **Imágenes Genéricas / Placeholders (`posible_generico`):** ~8,952 productos.
- **Sin imagen en DB (`NULL` o vacío):** **120 productos** en total.

---

## Scripts de esta Capa

### 1. `01-clasificar-imagenes.mjs`
Es el script principal que analiza y actualiza el estado de las imágenes en Supabase.
* **Uso básico:**
  ```bash
  node 01-clasificar-imagenes.mjs
  ```
  *(Por defecto, solo procesa productos cuyo estado `imagen_verificacion_estado` sea `NULL`).*
* **Parámetros disponibles:**
  - `--force`: Fuerza la clasificación de todo el catálogo (los 31,000+ productos). **Atención:** Tarda varios minutos.
  - `--marca="Nombre Marca"`: Filtra la clasificación solo para una marca específica (ej. `Finder` o `Schneider Electric`).
  - `--limit=X`: Limita el número de productos a procesar.
  - `--dry-run`: Simulación en consola sin escribir nada en Supabase.

### 2. `02-corregir-residuales-no-carga.mjs`
Script de mantenimiento reactivo. Consulta automáticamente Supabase buscando productos clasificados como `no_carga`, busca un reemplazo en DuckDuckGo usando `fetch` nativo y, si encuentra una imagen válida (> 1.5 KB, HTTP 200), actualiza la URL y resetea su verificación a `NULL` para que sea evaluada de nuevo por el clasificador.
* **Uso básico:**
  ```bash
  node 02-corregir-residuales-no-carga.mjs
  ```
* **Parámetros disponibles:**
  - `--dry-run`: Simulación de consola.
  - `--delay=2000`: Tiempo de espera en milisegundos entre búsquedas (recomendado para evitar bloqueos del buscador).

---

## 🚀 Instrucciones de Uso: Paso a Paso

Si en el futuro detectas o sospechas que hay imágenes caídas en el catálogo:

1. **Paso 1: Ejecutar la clasificación rápida**
   ```bash
   node 01-clasificar-imagenes.mjs
   ```
   Esto clasificará los nuevos productos añadidos. Si deseas re-evaluar todo el catálogo, añade `--force`.

2. **Paso 2: Corregir las imágenes rotas detectadas**
   Si el resumen final muestra productos en `no_carga` (ej. `no_carga: 15`), ejecuta:
   ```bash
   node 02-corregir-residuales-no-carga.mjs --delay=2000
   ```
   El script buscará reemplazos oficiales y actualizará Supabase.

3. **Paso 3: Confirmar la re-clasificación**
   Como el Paso 2 restablece el estado de verificación de las imágenes corregidas a `NULL`, vuelve a ejecutar el clasificador:
   ```bash
   node 01-clasificar-imagenes.mjs
   ```
   Comprueba en el resumen final que el contador de `no_carga` ha vuelto a **0**.
