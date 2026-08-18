---
tool_id: SCRAPE-001
nombre: Playwright
rol_en_el_pfc: automatización de navegador, E2E y scraping histórico
estado_documental: testing actual + uso histórico de scraping
---

# Playwright

## Dos usos diferentes

### 1. Scraping histórico

Durante la construcción del catálogo se utilizaron navegadores automatizados y distintas estrategias de extracción. Ese trabajo forma parte de la historia del dataset; no implica que el catálogo actual se sincronice automáticamente con scraping en cada ejecución.

### 2. Testing E2E actual

`app/e2e/` contiene múltiples archivos `.spec.js`, helpers y auditorías responsive. `package.json` expone `test:e2e` y `test:all`.

La documentación antigua hablaba primero de 14 tests perdidos y después de “7 specs”. El árbol actual contiene **más de siete specs**, por lo que se elimina el número fijo. Para afirmar cuántos casos pasan hay que ejecutar Playwright en el commit correspondiente.

## Qué aporta

- navegación en un navegador real;
- validación de flujos completos;
- capturas y diagnóstico visual;
- posibilidad de probar breakpoints y comportamiento integrado.

## Lección

Una suite E2E existente no garantiza que esté verde. El resultado válido es la ejecución fresca, con código de salida y log conservados.
