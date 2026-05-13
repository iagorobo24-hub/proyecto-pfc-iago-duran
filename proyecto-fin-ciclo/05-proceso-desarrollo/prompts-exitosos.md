# Prompts Exitosos — Ejemplos Reales

## Introducción

Esta sección收集prompts que funcionaron bien en el proyecto. Cada uno es un ejemplo real que generó código útil. Se incluyen el contexto, el prompt exacto, y por qué funcionó.

---

## Categoría 1: Componentes UI

### Prompt: Crear componente Card

**Contexto:** Necesitaba un componente reutilizable para mostrar productos en Fichas Técnicas.

**Prompt exacto:**

```
Crea un componente React llamado TarjetaProducto que muestre una tarjeta de producto eléctrico.

Requisitos:
- Usa React hooks (useState, useEffect) - NO clases
- Usa CSS Modules para los estilos
- El componente recibe una prop 'product' con: { ref, name, marca, precio, imagen }
- Muestra: imagen (o placeholder si no hay), nombre, referencia del fabricante, marca como badge
- Cuando se hace click en la tarjeta, debe llamar a una función onSelect(product)
- Diseño: card con sombra suave, border-radius 8px, padding 16px
- Si no hay imagen, muestra un div con el icono de Package de lucide-react
- El componente debe ser responsive - en mobile ocupa el 100%, en desktop max-width 300px

Incluye el CSS Module también.
```

**Resultado:** Componente funcional que se usó en producción.

**Por qué funcionó:**
- Específico sobre las props
- Define comportamiento (onSelect)
- Especifica tecnología (CSS Modules, hooks)
- Da ejemplos de contenido (placeholder)

---

### Prompt: Sistema de thèmes

**Contexto:** Necesitaba implementar modo oscuro/claro.

**Prompt exacto:**

```
Crea un ThemeContext en React que gestione el tema de la aplicación.

Requisitos:
- Dos temas: 'light' y 'dark'
- Usa CSS Custom Properties para los colores
- Lee el tema guardado en localStorage al iniciar
- Si no hay tema guardado, usa 'light' por defecto
- Exporta: ThemeProvider (context provider), useTheme() hook
- El hook devuelve: theme ('light'|'dark'), toggleTheme(), setTheme()
- Cuando cambia el tema, actualiza document.documentElement.setAttribute('data-theme', theme)
- Guarda en localStorage cada vez que cambia

Ejemplo de uso esperado:
const { theme, toggleTheme } = useTheme();
return <button onClick={toggleTheme}>Cambiar a {theme === 'light' ? 'oscuro' : 'claro'}</button>;
```

**Resultado:** ThemeContext completo que se usa actualmente.

**Por qué funcionó:**
- Define claramente inputs/outputs
- Especifica persistencia (localStorage)
- Da ejemplo de uso esperado

---

## Categoría 2: Lógica de negocio

### Prompt: Navegación jerárquica

**Contexto:** Fichas Técnicas necesitaba navegar por familia → marca → gama → producto.

**Prompt exacto:**

```
Crea un hook personalizado useNavegacionJerarquica para las fichas técnicas.

Requisitos:
- El hook gestiona la navegación de 4 niveles: familia → marca → gama → producto
- Estado inicial: { familia: null, marca: null, gama: null, producto: null }
- Props: 
  - hierarchy: objeto con { familias: [{ id, nombre, marcas: [{ id, nombre, gamas: [...] }] }] }
  - productos: array de productos
- Funciones:
  - selectFamilia(id): selecciona familia, resetea marca/gama/producto
  - selectMarca(id): selecciona marca dentro de familia seleccionada, resetea gama/producto
  - selectGama(id): selecciona gama dentro de marca seleccionada, resetea producto
  - selectProducto(product): selecciona producto
  - goBack(): vuelve al nivel anterior
  - reset(): vuelve al inicio
- Selectores derivados (para filtrar productos):
  - getMarcasDisponibles(): marcas de la familia seleccionada
  - getGamasDisponibles(): gamas de la marca seleccionada
  - getProductosFiltrados(): productos que coinciden con familia+marca+gama
- Si no hay selección, los selectores devuelven arrays vacíos o todo el catálogo

El hook debe ser robusto: si se selecciona una familia que no existe, no debe fallar.
```

**Resultado:** Hook robusto que gestiona toda la navegación.

**Por qué funcionó:**
- Define todos los estados posibles
- Explica relaciones entre niveles
- Incluye funciones de "volver" y "reset"
- Considera casos de error

---

### Prompt: Streaming de SONEX

**Contexto:** Las respuestas de SONEX tardaban y quería mostrar progreso.

**Prompt exacto:**

```
Crea un servicio en Javascript para hacer streaming de chat con OpenRouter.

Requisitos:
- Usa fetch con ReadableStream para recibir respuestas chunk a chunk
- El servicio recibe: { messages: [{ role: 'user'|'assistant', content: '...' }] }
- Para cada chunk recibido, llama a un callback onChunk(chunk)
- Cuando termina, llama a onComplete(fullResponse)
- Si hay error, llama a onError(error)
- Incluye timeout de 60 segundos
- Maneja el caso de streaming no soportado (retry sin streaming)

Usa este formato para la llamada a OpenRouter:
POST https://openrouter.ai/api/v1/chat/completions
Headers:
  Authorization: Bearer API_KEY
  Content-Type: application/json
Body:
{
  model: "anthropic/claude-3-haiku",
  messages: messages,
  stream: true
}

El servicio debe funcionar tanto con stream: true como con stream: false.
```

**Resultado:** Servicio de streaming que se usa actualmente.

**Por qué funcionó:**
- Define claramente los callbacks
- Maneja errores y timeouts
- Explica el formato de la API

---

## Categoría 3: Scripts y herramientas

### Prompt: Script de scraping

**Contexto:** Necesitaba obtener el catálogo de productos de Proyectos PFC.es.

**Prompt exacto:**

```
Crea un script de scraping con Playwright que obtenga el catálogo de productos de la empresa.

Requisitos:
- Usa Playwright con Chromium
- Navega a https://www.Proyectos PFC.es/catalogo
- Para cada categoría del menú lateral:
  - Haz click para expandir
  - Para cada subcategoría:
    - Haz click para ver los productos
    - Espera a que carguen los productos (等待 grid con productos)
    - Extrae: nombre, referencia, precio, marca, imagen, URL
    - Si hay paginación, navega por todas las páginas
- Guarda los datos en un archivo JSON con estructura:
  [
    {
      "familia": "Iluminación",
      "subfamilia": "Bombillas LED",
      "nombre": "Bombilla LED E27 10W",
      "referencia": "AB123456",
      "precio": 5.99,
      "marca": "Philips",
      "imagen": "https://...",
      "url": "https://..."
    }
  ]
- Maneja errores: si una categoría falla, continúa con la siguiente y registra el error
- Ejecuta con: node scraping.js
- Necesita credenciales de Playwright instaladas

El script debe ser robusto contra cambios en la web.
```

**Resultado:** Script que eventually obtuvo 75K+ productos (con múltiples iteraciones).

**Por qué funcionó:**
- Define la estructura de salida exactamente
- Explica cómo manejar paginación
- Incluye manejo de errores

---

### Prompt: Script de sincronización

**Contexto:** Necesitaba sincronizar el JSON del catálogo a Firestore.

**Prompt exacto:**

```
Crea un script Node.js que sincronice productos desde un JSON a Firestore.

Requisitos:
- Lee el archivo: Proyectos PFC-catalog-scraper/catalogo-final.json
- Configura Firebase Admin SDK con service-account.json
- Por cada producto del JSON:
  - Inserta o actualiza en colección 'productos' de Firestore
  - El documento usa ref_fabricante como ID
  - Añade campo 'lastUpdated' con timestamp
- Procesa en batches de 500 documentos (límite de Firestore)
- Muestra progreso: "Procesados X de Y" cada 100 productos
- Al final muestra: "Sincronización completada: X documentos"
- Maneja errores: si falla uno, continúa y muestra error

Usa estos campos del JSON:
ref_fabricante, name, familia, subfamilia, tipo, marca, image, url
Mapea a Firestore:
ref_fabricante → ref_fabricante
name → name
familia → familia
subfamilia → subfamilia
tipo → tipo
marca → marca
image → image
url → url
lastUpdated → serverTimestamp()
```

**Resultado:** Script que sincronizó el catálogo a Firestore.

**Por qué funcionó:**
- Especifica el formato exacto de entrada y salida
- Define tamaño de batch
- Incluye logging de progreso

---

## Categoría 4: Estructura de proyecto

### Prompt: Estructura inicial

**Prompt exacto:**

```
Genera la estructura de carpetas para un proyecto React con Vite.

Requisitos:
- Estructura moderna de proyecto React
- Carpeta src/ con:
  - components/ (componentes reutilizables)
  - pages/ (componentes de página/rutas)
  - hooks/ (custom hooks)
  - services/ (lógica de negocio, APIs)
  - contexts/ (React contexts)
  - styles/ (CSS global, variables)
  - data/ (datos estáticos, mocks)
- Incluye package.json con dependencias:
  - react, react-dom
  - react-router-dom
  - vite
  - firebase
- Incluye vite.config.js básico
- Incluye .gitignore básico para Node

No generes código, solo la estructura y configuración básica.
```

**Resultado:** Estructura base que se usó para iniciar el proyecto.

**Por qué funcionó:**
- Define lo que necesita y lo que NO necesita
- Especifica dependencias exactas

---

## Patrones comunes en prompts exitosos

### 1. Define las props/inputs exactamente

```
MALO: "Crea un componente de botón"
BUENO: "Crea un Button con props: variant (primary/secondary), 
        size (sm/md/lg), disabled (boolean), onClick (function)"
```

### 2. Especifica la tecnología

```
"...usa React hooks (useState, useEffect), NO clases"
"...usa CSS Modules, NO styled-components"
"...usa async/await, NO then/catch"
```

### 3. Da el formato de salida

```
"...guarda en JSON con estructura: [{ campo1, campo2 }]"
"...el hook devuelve: { data, loading, error }"
```

### 4. Incluye casos edge

```
"...si no hay imagen, muestra un placeholder"
"...si la API falla, lanza excepción"
"...maneja arrays vacíos"
```

### 5. Establece restricciones

```
"...NO uses librerías externas além de las especificadas"
"...el código debe ser TypeScript"
"...máximo 100 líneas"
```

---

## Conclusión

Los mejores prompts son aquellos que:
1. **Son específicos** — Definen exactamente lo que necesitan
2. **Son completos** — Incluyen contexto,约束, ejemplos
3. **Son verificables** — Se puede saber si el resultado es correcto
4. **Son iterables** — Se pueden mejorar si no funcionan

---

*Prompts documentados: Mayo 2026*
*Ver también: EVOLUCION.md para contexto de cada fase*
