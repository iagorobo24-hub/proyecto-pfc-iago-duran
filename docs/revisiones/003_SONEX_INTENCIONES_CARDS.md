# Revisión 003 — SONEX intenciones y cards

## Objetivo implementado

SONEX incorpora una capa determinista previa a la IA para detectar búsquedas de producto, extraer requisitos técnicos y consultar el catálogo real de Supabase antes de generar la respuesta explicativa.

El flujo queda así:

```txt
Usuario
  -> detector de intención
  -> criterios técnicos
  -> búsqueda Supabase
  -> ranking local
  -> respuesta IA con contexto real
  -> cards React accionables
```

## Consultas cubiertas

Ejemplos validados:

- `Necesito un magnetotérmico curva C de 16A 2P`
- `Busca un diferencial 2P 40A 30mA`
- `Añade a presupuesto un contactor 25A`
- `¿Qué protecciones necesito para una línea monofásica?`

Cuando faltan datos críticos para una búsqueda fiable, SONEX pide aclaración en lugar de inventar una referencia.

## Cards de catálogo

Las cards muestran productos reales del catálogo con:

- Referencia fabricante.
- Nombre, marca, familia y subfamilia.
- Precio si está disponible.
- Specs coincidentes y specs ausentes.
- Acciones para abrir ficha, crear presupuesto nuevo y copiar referencia.

Las alternativas externas quedan reservadas como estructura compatible, pero no se activan sin una fuente verificable para evitar mezclar sugerencias IA con catálogo real.

## Enlaces entre módulos

Fichas Técnicas acepta `?ref=` y resuelve la referencia con `buscarReferenciaDirecta()`.

Presupuestos acepta `?nuevo=1&producto=...&referencia=...&precio=...`, limpia partidas previas y abre el editor con la partida cargada.

## Verificación

- `npm run test`
- `npm run build`
- `npx playwright test e2e/sonex-product-flow.spec.js`
- `npx playwright test e2e/functionality-tests.spec.js`
- `npx playwright test tests/theme-audit.spec.js`
- `npx playwright test`

La matriz completa de Playwright quedó verde tras actualizar expectativas antiguas de Fichas Técnicas y estabilizar la selección de categorías por texto normalizado.
