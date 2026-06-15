# Capa 2: Verificación Semántica mediante IA Visual

La **Capa 2** del sistema realiza una **auditoría semántica y visual** sobre las imágenes clasificadas en la Capa 1 como `pendiente_ia` (~22,080 productos) para verificar que la foto realmente coincide con el producto eléctrico real y no es un modelo incorrecto o un logo residual.

---

## 🛠️ Funcionamiento y Arquitectura

El proceso funciona por lotes controlados:

1. **Lectura DB:** Consulta Supabase en busca de productos con `imagen_verificacion_estado = 'pendiente_ia'` y descarga la URL de la imagen.
2. **Conversión a Base64:** Descarga localmente la imagen y la codifica en un Data URL (Base64) para evitar restricciones de descarga, geobloqueo o CORS por parte de la API del modelo.
3. **Auditoría IA (LMM google/gemini-2.5-flash):** Envía la imagen y los metadatos del catálogo (nombre, marca y subfamilia) al modelo a través de **OpenRouter**, pidiéndole que razone si coinciden semánticamente y que devuelva un formato JSON estricto.
4. **Impacto en Supabase:**
   - Si la imagen **coincide**: actualiza el producto con `imagen_verificacion_estado = 'verificada'` e `imagen_verificada = true`.
   - Si la imagen **no coincide**: actualiza con `imagen_verificacion_estado = 'rechazada_ia'` e `imagen_verificada = false`.
   - Si la imagen **no carga** (falla la descarga local en Node): degrada automáticamente el producto a `imagen_verificacion_estado = 'no_carga'`, permitiendo que el script corrector de la Capa 1 intente encontrar un reemplazo nuevo en la siguiente ronda de mantenimiento.

---

## Scripts Disponibles

### 1. `01-verificar-por-ia.mjs`
Es el script principal de auditoría por IA visual.

*   **Uso básico (lote pequeño de prueba - recomendado):**
    ```bash
    node 01-verificar-por-ia.mjs --limit=10 --concurrency=2
    ```
*   **Parámetros:**
    - `--limit=X`: Límite de productos a procesar en esta ejecución (por defecto `10`, se aconseja ejecutar por lotes controlados).
    - `--marca="Nombre Marca"`: Filtra y procesa únicamente productos de una marca específica (ej. `--marca="Finder"` o `--marca="Eaton"`).
    - `--concurrency=N`: Número de workers concurrentes (por defecto `2`).
    - `--delay=X`: Tiempo de espera en milisegundos entre llamadas de cada worker (por defecto `1500 ms`).
    - `--resume`: Reanuda el progreso desde el archivo de persistencia local `scrape-ia-progress.json`.
    - `--dry-run`: Modo de simulación en consola (muestra las respuestas del modelo sin modificar Supabase).

---

## 🚀 Instrucciones de Uso: Paso a Paso

1. **Paso 1: Ejecutar una simulación controlada (Dry Run)**
   Ejecuta una pequeña prueba de 5 productos para validar la API y los prompts:
   ```bash
   node 01-verificar-por-ia.mjs --dry-run --limit=5
   ```
   Verás en la consola las respuestas en caliente del modelo (e.g. `[Worker 0] ✅ ID 286793 -> COINCIDE (magnetotérmico)`).

2. **Paso 2: Ejecución Real por Lotes**
   Procesa por lotes pequeños (ej. 50 productos de una marca específica como Finder) escribiendo los resultados en base de datos:
   ```bash
   node 01-verificar-por-ia.mjs --marca="Finder" --limit=50 --concurrency=2 --delay=2000
   ```

3. **Paso 3: Verificación de Resultados**
   Una vez procesado el lote, comprueba en la base de datos de Supabase que los registros han sido catalogados como `verificada` o `rechazada_ia`. Los productos que hayan sido rechazados o degradados a `no_carga` pueden ser re-solucionados corriendo los scrapers de adquisición y clasificadores de la Capa 1.
