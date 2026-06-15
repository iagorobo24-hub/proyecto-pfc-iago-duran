# Scrapers de Adquisición de Imágenes

Esta carpeta contiene los scrapers finales y optimizados utilizados para alimentar y corregir las URLs de imágenes de los productos en la base de datos (Supabase) cuando estas no existen o son marcas de agua/logos.

---

## Scrapers Disponibles

### 1. `scrape-via-sonepar.mjs`
Extrae las imágenes oficiales de alta resolución desde la nueva plataforma e-commerce de Sonepar España utilizando Playwright en segundo plano (headless browser).
*   **Propósito:** Es la primera opción de adquisición debido a que las imágenes son oficiales y están vinculadas directamente a la referencia del fabricante.
*   **Uso básico:**
    ```bash
    node scrape-via-sonepar.mjs --concurrency=4 --delay=1500
    ```
*   **Parámetros:**
    - `--brand=Eaton`: Filtra y procesa únicamente los productos de una marca específica.
    - `--concurrency=N`: Número de hilos/páginas de Playwright concurrentes (por defecto `2`).
    - `--delay=X`: Tiempo de espera en milisegundos entre peticiones (para evitar sobrecarga).
    - `--limit=X`: Limita el número de productos procesados en esta corrida.
    - `--resume`: Reanuda el progreso desde el archivo temporal `scrape-sonepar-progress.json`.
    - `--dry-run`: Modo simulación (no escribe en Supabase).

### 2. `scrape-via-search-engine.mjs`
Busca imágenes reales de productos en la web utilizando el motor de búsqueda DuckDuckGo Image API (con peticiones HTTP optimizadas usando el motor nativo de Node `fetch` para eludir bloqueos).
*   **Propósito:** Se utiliza como fallback secundario para aquellas referencias que no disponen de imagen en el e-commerce de Sonepar.
*   **Uso básico:**
    ```bash
    node scrape-via-search-engine.mjs --brand=Finder --concurrency=3 --delay=2000
    ```
*   **Parámetros:**
    - `--brand=Nombre`: Marca objetivo (**Obligatoria si se quiere ejecutar de manera segura**).
    - `--concurrency=N`: Hilos concurrentes de descarga de metadatos (por defecto `2`).
    - `--delay=X`: Tiempo de retraso entre llamadas (se aconseja `>= 2000 ms` para DuckDuckGo para evitar baneos de IP).
    - `--limit=X`: Límite de productos a buscar.
    - `--resume`: Reanuda el progreso desde `scrape-search-progress.json`.
    - `--dry-run`: Simulación de consola.

### 3. `scrape-schneider-real-images.mjs`
Scraper especializado para Schneider Electric. Utiliza patrones de la CDN oficial de Schneider (`download.schneider-electric.com`) e intenta resolver y validar las URLs de fotos reales mediante peticiones directas de HEAD, y raspado HTML de fallback de la página del fabricante.
*   **Propósito:** Evita el uso de buscadores genéricos para Schneider Electric, garantizando fotos de alta resolución oficiales para esta marca.
*   **Uso básico:**
    ```bash
    node scrape-schneider-real-images.mjs --delay=100
    ```
*   **Parámetros:**
    - `--delay=X`: Demora entre peticiones de validación (por defecto `100 ms`).
    - `--limit=X`: Límite de productos.
    - `--resume`: Reanuda el progreso.
    - `--dry-run`: Simulación de consola.

---

## 🚀 Guía de Ejecución Recomendada

Si deseas poblar de imágenes productos nuevos sin imagen, sigue este flujo de trabajo:

1.  **Fase 1: Poblar con Sonepar (Oficial e-commerce)**
    Intenta extraer la imagen oficial de Sonepar (aplica a todas las marcas):
    ```bash
    node scrape-via-sonepar.mjs --concurrency=4 --delay=1500
    ```

2.  **Fase 2: Schneider Electric (CDN Fabricante)**
    Para los productos de Schneider Electric que sigan sin foto oficial tras la Fase 1, corre el extractor especializado:
    ```bash
    node scrape-schneider-real-images.mjs --delay=100
    ```

3.  **Fase 3: DuckDuckGo Fallback (Buscador)**
    Para el resto de marcas y referencias que sigan con logos o sin foto, ejecuta el buscador web marca por marca, controlando el retraso para evitar baneos:
    ```bash
    node scrape-via-search-engine.mjs --brand="Eaton" --concurrency=3 --delay=2000
    node scrape-via-search-engine.mjs --brand="ABB" --concurrency=3 --delay=2000
    node scrape-via-search-engine.mjs --brand="Finder" --concurrency=3 --delay=2000
    ...
    ```

4.  **Fase 4: Clasificar y validar**
    Corre el clasificador de la Capa 1 para actualizar los metadatos en base de datos:
    ```bash
    # (Desde la carpeta de Capa 1)
    node ../capa-1-clasificacion/01-clasificar-imagenes.mjs
    ```
