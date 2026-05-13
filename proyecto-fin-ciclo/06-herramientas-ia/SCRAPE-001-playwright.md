---
tool_id: SCRAPE-001
nombre: Playwright
version_observada: 2025-2026
rol_principal: Testing E2E y web scraping (automatización de navegador)
url: https://playwright.dev
---
Playwright es una herramienta de Microsoft para controlar navegadores con código. La usé principalmente para hacer scraping del catálogo de productos: abría el navegador, navegaba por las categorías y extraía los datos automáticamente. También sirve para tests.

## ¿Qué es?

Playwright es una herramienta de Microsoft para **automatización de navegadores**. Originalmente diseñada para testing E2E, también se usa para web scraping avanzado.

## ¿Para qué lo usé?

### 1. Web Scraping del catálogo la empresa

Playwright fue fundamental para extraer los datos de Proyectos PFC.es:

- Navegación automática por categorías
- Extracción de productos (referencias, nombres, precios, marcas)
- Manejo de paginación infinita
- Interceptación de peticiones HTTP para obtener datos estructurados

El scraper está en: `app/Proyectos PFC-catalog-scraper/`

### 2. Testing E2E (en teoría)

Según la documentación de EVOLUCION.md, se desarrolló una suite de 14 tests E2E que verificaban:
- Login con Google
- Responsive en 3 breakpoints
- Navegación entre módulos
- Sidebar y dark mode
- Performance

**Nota:** Los archivos de tests se perdieron en commits posteriores (mencionado en EVOLUCION.md).

## ¿Cómo lo usé para scraping?

### Script básico de scraping

```javascript
import { chromium } from '@playwright/test'

async function scrapeCatalog() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  
  // Interceptar respuestas JSON
  await page.route('**/api/**', route => {
    const json = route.request().response()
    // Guardar datos...
    route.continue()
  })
  
  await page.goto('https://www.Proyectos PFC.es/catalogo')
  await page.waitForSelector('.product-list')
  
  const products = await page.$$eval('.product-item', items =>
    items.map(item => ({
      ref: item.dataset.ref,
      name: item.querySelector('.name').textContent,
      price: item.querySelector('.price').textContent
    }))
  )
  
  await browser.close()
  return products
}
```

## ¿Cómo lo configuré?

```javascript
// playwright.config.js
export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: 'http://localhost:5173',
    headless: true,
    viewport: { width: 1280, height: 720 },
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
    { name: 'mobile', use: { ...devices['iPhone 13'] } },
  ]
})
```

## Ventajas que encontré

| Aspecto | Valoración |
|---------|-----------|
| Automatización de navegador real | ⭐⭐⭐⭐⭐ |
| Interceptación de peticiones | ⭐⭐⭐⭐⭐ |
| Soporte multi-navegador (Chromium, Firefox, WebKit) | ⭐⭐⭐⭐⭐ |
| Integración con Node.js | ⭐⭐⭐⭐⭐ |
| Testing E2E robusto | ⭐⭐⭐⭐⭐ |
| Documentación | ⭐⭐⭐⭐ |

## Limitaciones que encontré

1. **Scraping anti-bot:** la empresa.es eventualmente bloqueó las peticiones automatizadas.
2. **Velocidad:** Un scraper con Playwright es más lento que uno con requests + BeautifulSoup.
3. **Recursos:** Ejecutar un navegador consume mucha RAM.

## El scraper que construí

El scraper final (`v12 - THE ULTIMATE HARVESTER`) usaba:
- Interceptación de peticiones HTTP en lugar de parsing de HTML
- 1,169 combinaciones de Familia + Marca
- Generación de keywords de búsqueda para cada producto
- Exportación a JSON estructurado

## Lecciones aprendidas

1. **Interceptar peticiones > parsing HTML:** Los sitios modernos generan contenido con JS; es más fácil interceptar la respuesta JSON de la API que parsear el HTML.
2. **El scraping tiene límites legales y técnicos:** la empresa.es eventualmente bloqueó el acceso automatizado.
3. **Playwright es mejor para testing que para scraping:** Para scraping puro, herramientas como Puppeteer o Cheerio son más ligeras.

## Comparativa con alternativas

| Aspecto | Playwright | Puppeteer | Cheerio |
|---------|-----------|-----------|---------|
| Automatización navegador | ✅ | ✅ | ❌ |
| Velocidad | ⭐⭐⭐ | ⭐⭐⭐⭐ | N/A |
| Facilidad de uso | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Ligereza | ❌ (necesita navegador) | ❌ (necesita navegador) | ✅ (solo parsing) |
| Mejor para | Testing, scraping complejo | Scraping, automation | Parsing de HTML estático |

## El futuro: MCP Server

En el repo veo que tienes configurado `.playwright-mcp/` - esto indica que Playwright también se está usando como MCP server para que agentes de IA lo controlen.

## Referencias

- [Playwright](https://playwright.dev)
- [Documentación](https://playwright.dev/docs/intro)
- [Playwright CLI](https://playwright.dev/docs/cli)

---

**Fecha de elaboración de esta ficha:** Abril 2026