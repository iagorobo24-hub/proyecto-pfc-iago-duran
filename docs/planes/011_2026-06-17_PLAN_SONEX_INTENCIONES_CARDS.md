# Plan SONEX - Intenciones, cards de producto y enlaces entre modulos

**Fecha:** 2026-06-17
**Estado:** Implementado — core de catalogo, cards y deep links
**Modulo principal:** `/app/sonex`
**Modulos conectados:** `/app/fichas`, `/app/presupuestos`

**Resultado de ejecucion:** se implementaron detector de intencion, parser tecnico, busqueda estructurada en Supabase, ranking local, cards accionables, enlace directo a Fichas Tecnicas y creacion de presupuesto nuevo desde SONEX. La fase de alternativas externas queda preparada a nivel de estructura, pero no activa sin fuente verificable para no mezclar sugerencias IA con catalogo real.

---

## Objetivo

Convertir SONEX en un asistente tecnico capaz de detectar cuando una consulta requiere opciones concretas de producto, buscar primero en el catalogo real de Supabase, mostrar resultados como cards visuales accionables y conectar esas cards con Fichas Tecnicas y Presupuestos.

La experiencia deseada es:

1. El usuario pregunta por una necesidad tecnica, con o sin marca.
2. SONEX detecta intencion, producto y caracteristicas.
3. El sistema consulta el catalogo real antes de responder.
4. Las coincidencias exactas del catalogo aparecen como cards verificadas.
5. Cada card permite abrir la ficha tecnica directamente.
6. Cada card del catalogo permite anadir el producto a un presupuesto nuevo.
7. Cuando falten productos en el catalogo, SONEX puede proponer alternativas externas separadas y claramente marcadas como no verificadas en base de datos.

---

## Estado actual

### SONEX

- `app/src/tools/Sonex.jsx` ya implementa chat, streaming, sesiones, modos, categorias y extraccion posterior de referencias.
- `app/src/services/sonexCatalogContext.js` construye un contexto RAG textual para la IA a partir del mensaje actual.
- El flujo actual es: usuario pregunta -> se genera contexto textual -> responde IA -> se extraen referencias con regex -> se validan contra catalogo.

### Catalogo

- `app/src/services/catalogService.ts` centraliza consultas a Supabase.
- Existen funciones de busqueda libre, busqueda por referencia y navegacion jerarquica.
- La tabla `products` contiene campos suficientes para cards: `ref_fabricante`, `name`, `marca`, `familia`, `subfamilia`, `tipo`, `Gama`, `Subgama`, `imagen`, `pdf_url`, `precio`.

### Fichas Tecnicas

- `app/src/tools/FichasTecnicas.jsx` ya puede seleccionar una referencia y cargar analisis IA mediante `useNavegacionFichas`.
- `useNavegacionFichas.buscarReferenciaDirecta()` ya resuelve una referencia o busqueda por nombre y abre la ficha.
- Falta confirmar e implementar lectura directa de `?ref=` para que una URL de SONEX abra la ficha sin interaccion adicional.

### Presupuestos

- `app/src/components/presupuestos/PresupuestosLayout.jsx` ya lee `producto`, `referencia` y `precio` desde query params.
- `usePresupuestos` ya soporta `ADD_FROM_CATALOG`.
- Falta modo explicito de "presupuesto nuevo" para evitar mezclar productos con partidas existentes.

---

## Decision de arquitectura

La busqueda exacta no debe depender de que la IA mencione referencias en texto libre. El flujo debe invertirse:

```txt
Usuario
  -> detector de intencion
  -> extractor de requisitos tecnicos
  -> busqueda Supabase
  -> ranking de coincidencias
  -> respuesta IA explicativa con contexto real
  -> cards estructuradas renderizadas por React
```

La IA queda como capa de explicacion, comparacion y apoyo tecnico. Supabase queda como fuente de verdad para productos existentes.

---

## Modelo conceptual

### Intencion SONEX

```ts
type SonexIntent =
  | 'technical_question'
  | 'catalog_lookup'
  | 'product_recommendation'
  | 'product_comparison'
  | 'budget_action'
  | 'clarification_needed'
```

### Requisitos tecnicos extraidos

```ts
interface SonexProductCriteria {
  productType?: string
  family?: string
  subfamily?: string
  brand?: string
  poles?: string
  curve?: string
  amps?: number
  sensitivityMa?: number
  breakingCapacity?: string
  voltage?: string
  quantity?: number
  rawTerms: string[]
  confidence: number
}
```

### Resultado estructurado

```ts
interface SonexCatalogResult {
  source: 'catalog'
  matchType: 'exact' | 'partial' | 'related'
  score: number
  matchedSpecs: string[]
  missingSpecs: string[]
  product: Product
}

interface SonexExternalResult {
  source: 'external_ai'
  matchType: 'suggested'
  score: number
  name: string
  brand?: string
  reference?: string
  specs: string[]
  reason: string
  evidenceUrl?: string
}
```

---

## Fase 0 - Preparacion y linea base

### Objetivo

Asegurar que el cambio se apoya en el estado real del codigo y que no rompe los flujos existentes.

### Tareas

- [ ] Crear rama de trabajo `codex/sonex-intenciones-cards`.
- [ ] Ejecutar baseline:
  - [ ] `npm run test`
  - [ ] `npx playwright test app/e2e/functionality-tests.spec.js`
  - [ ] Test manual rapido de `/app/sonex`, `/app/fichas`, `/app/presupuestos`.
- [ ] Revisar productos reales de la subfamilia objetivo principal:
  - [ ] Contar productos por `familia`.
  - [ ] Contar productos por `subfamilia`.
  - [ ] Verificar nombres y campos tecnicos en `products`.
- [ ] Documentar si hay datos inconsistentes antes de implementar.

### Criterio de salida

Existe una captura clara del estado inicial y se conocen los tests que ya fallan antes del cambio, si los hay.

---

## Fase 1 - Detector de intencion y parser tecnico

### Objetivo

Crear una capa determinista que entienda si el usuario busca productos concretos y que caracteristicas pide.

### Archivos propuestos

- `app/src/services/sonexIntentService.ts`
- `app/src/types/sonex.ts`
- `app/src/__tests__/sonexIntentService.test.ts`

### Tareas

- [ ] Definir tipos compartidos en `types/sonex.ts`.
- [ ] Implementar detector inicial basado en reglas:
  - [ ] Palabras de busqueda: "necesito", "puedo usar", "que referencias", "opciones", "recomienda".
  - [ ] Palabras de producto: magnetotermico, diferencial, contactor, variador, fuente, proteccion, etc.
  - [ ] Intencion de presupuesto: "anadir", "presupuesto", "partida", "oferta".
  - [ ] Intencion comparativa: "compara", "diferencias", "mejor opcion".
- [ ] Implementar extraccion tecnica:
  - [ ] Amperaje: `16A`, `16 A`, `de 16 amperios`.
  - [ ] Polos: `1P`, `1P+N`, `2P`, `3P`, `3P+N`, `4P`.
  - [ ] Curva: `B`, `C`, `D`, `K`, `Z`.
  - [ ] Sensibilidad diferencial: `30mA`, `300 mA`.
  - [ ] Marca mencionada por el usuario, si existe.
  - [ ] Familia/subfamilia inferida.
- [ ] Calcular `confidence`.
- [ ] Si faltan datos criticos, devolver `clarification_needed`.
- [ ] Anadir tests unitarios:
  - [ ] Consulta con marca y caracteristicas completas.
  - [ ] Consulta sin marca y caracteristicas completas.
  - [ ] Consulta ambigua.
  - [ ] Consulta tecnica general sin busqueda de producto.
  - [ ] Consulta con intencion de presupuesto.

### Criterio de salida

El servicio puede convertir mensajes reales en criterios estructurados sin llamar a IA ni a Supabase.

---

## Fase 2 - Normalizacion tecnica reutilizable

### Objetivo

Evitar duplicar logica tecnica ya existente en `useProductTable.js`.

### Archivos propuestos

- `app/src/utils/productSpecs.js`
- `app/src/hooks/useProductTable.js`
- `app/src/__tests__/productSpecs.test.js`

### Tareas

- [ ] Extraer funciones puras desde `useProductTable.js`:
  - [ ] `extractPoles`
  - [ ] `extractAmps`
  - [ ] `extractCurve`
  - [ ] `extractSensitivity`
  - [ ] `ampToStandard`
  - [ ] `filterProductsBy`
- [ ] Re-exportar desde `useProductTable.js` para no romper imports actuales.
- [ ] Anadir helpers nuevos:
  - [ ] `extractProductSpecs(product)`
  - [ ] `matchesCriteria(product, criteria)`
  - [ ] `scoreProductMatch(product, criteria)`
- [ ] Mantener compatibilidad con magnetotermicos, diferenciales y caja moldeada.
- [ ] Anadir tests de regresion con productos reales de catalogo.

### Criterio de salida

Fichas Tecnicas sigue funcionando y SONEX puede reutilizar la misma logica de especificaciones.

---

## Fase 3 - Busqueda y ranking en Supabase

### Objetivo

Consultar productos reales del catalogo de forma eficiente y devolver resultados ordenados por ajuste tecnico.

### Archivos propuestos

- `app/src/services/sonexProductSearch.ts`
- `app/src/__tests__/sonexProductSearch.test.ts`
- Cambios pequenos en `app/src/services/catalogService.ts`

### Tareas

- [ ] Crear `searchProductsForCriteria(criteria)`.
- [ ] Anadir consultas de catalogo necesarias:
  - [ ] Buscar por subfamilia y marca opcional.
  - [ ] Buscar por familia y terminos libres.
  - [ ] Limitar resultados antes del filtrado en cliente.
- [ ] Filtrar con `matchesCriteria`.
- [ ] Rankear resultados:
  - [ ] Coincidencia exacta de subfamilia.
  - [ ] Coincidencia de marca si el usuario la pidio.
  - [ ] Coincidencia de amperaje.
  - [ ] Coincidencia de polos.
  - [ ] Coincidencia de curva.
  - [ ] Coincidencia de sensibilidad.
  - [ ] Penalizacion por campos ausentes o nombres genericos.
- [ ] Devolver:
  - [ ] `exactMatches`
  - [ ] `partialMatches`
  - [ ] `relatedMatches`
  - [ ] `needsClarification`
- [ ] Evitar N+1 queries.
- [ ] Anadir tests con mocks de `catalogService`.

### Criterio de salida

Una consulta como "magnetotermico 2P curva C 16A" devuelve productos reales ordenados y explicables.

---

## Fase 4 - Orquestacion del turno en SONEX

### Objetivo

Separar la respuesta textual de la IA de los datos estructurados que renderiza React.

### Archivos propuestos

- `app/src/services/sonexTurnOrchestrator.ts`
- `app/src/tools/Sonex.jsx`
- `app/src/hooks/useSonex.js`

### Tareas

- [ ] Crear `handleSonexTurn(userMessage, state)`.
- [ ] Flujo para busqueda de catalogo:
  - [ ] Detectar intencion.
  - [ ] Extraer criterios.
  - [ ] Consultar Supabase.
  - [ ] Generar contexto compacto con productos reales.
  - [ ] Llamar a IA para explicacion.
  - [ ] Devolver `assistantMessage` con `catalogCards`.
- [ ] Flujo para consulta tecnica general:
  - [ ] Mantener comportamiento actual con streaming.
- [ ] Flujo para aclaracion:
  - [ ] No consultar catalogo si faltan datos criticos.
  - [ ] Pedir una pregunta concreta al usuario.
- [ ] Persistir mensajes con campos estructurados:
  - [ ] `referencias`
  - [ ] `catalogCards`
  - [ ] `externalCards`
  - [ ] `criteria`
  - [ ] `intent`
- [ ] Mantener compatibilidad con sesiones antiguas.
- [ ] Limitar historial enviado a IA usando ventana corta.

### Criterio de salida

SONEX puede responder con texto + cards sin depender de extraer referencias desde la respuesta generada.

---

## Fase 5 - UI de cards en SONEX

### Objetivo

Mostrar resultados de producto de forma clara, visual, accionable y consistente con el diseno del proyecto.

### Archivos propuestos

- `app/src/components/sonex/SonexProductCard.jsx`
- `app/src/components/sonex/SonexProductResults.jsx`
- `app/src/tools/Sonex.module.css`

### Tareas

- [ ] Crear card de producto del catalogo:
  - [ ] Imagen con `ProductImage`.
  - [ ] Referencia.
  - [ ] Nombre.
  - [ ] Marca.
  - [ ] Familia/subfamilia/gama.
  - [ ] Precio si existe.
  - [ ] Badges de caracteristicas coincidentes.
  - [ ] Badge de coincidencia: exacta, parcial, relacionada.
- [ ] Acciones:
  - [ ] "Ver ficha".
  - [ ] "Anadir a presupuesto".
  - [ ] "Copiar referencia".
- [ ] Crear bloque de resultados:
  - [ ] Seccion "En catalogo".
  - [ ] Seccion "Alternativas fuera del catalogo" si aplica.
  - [ ] Estado vacio y estado de carga.
- [ ] Usar variables CSS.
- [ ] Anadir selectors dark para nuevos fondos.
- [ ] Revisar mobile:
  - [ ] Cards apiladas.
  - [ ] Botones con tamano tactil suficiente.
  - [ ] Texto sin desbordes.

### Criterio de salida

Cada respuesta de busqueda muestra cards utiles, no solo botones pequenos con referencias.

---

## Fase 6 - Deep link con Fichas Tecnicas

### Objetivo

Que una card de SONEX abra directamente la ficha completa del producto, incluyendo el analisis IA ya existente.

### Archivos propuestos

- `app/src/tools/FichasTecnicas.jsx`
- `app/src/hooks/useNavegacionFichas.js`
- `app/e2e/sonex-product-flow.spec.js`

### Tareas

- [ ] Anadir lectura de `useSearchParams` en Fichas Tecnicas.
- [ ] Soportar `?ref=REFERENCIA`.
- [ ] Al montar:
  - [ ] Si existe `ref`, llamar a `buscarReferenciaDirecta(ref)`.
  - [ ] Evitar doble llamada con `useRef`.
  - [ ] Mostrar estado de carga.
  - [ ] Si no existe la referencia, mostrar aviso util.
- [ ] Opcional: soportar `?q=texto` para busquedas desde buscador global.
- [ ] Mantener navegacion manual intacta.
- [ ] Anadir test E2E:
  - [ ] Ir a `/app/fichas?ref=...`.
  - [ ] Ver ficha del producto.
  - [ ] Ver bloque de analisis IA o fallback.

### Criterio de salida

`/app/fichas?ref=REF` abre directamente la ficha adecuada.

---

## Fase 7 - Deep link con Presupuestos

### Objetivo

Que una card de SONEX pueda crear un presupuesto nuevo con el producto ya cargado.

### Archivos propuestos

- `app/src/components/presupuestos/PresupuestosLayout.jsx`
- `app/src/hooks/usePresupuestos.js`
- `app/e2e/sonex-product-flow.spec.js`

### Tareas

- [ ] Definir query params finales:
  - [ ] `nuevo=1`
  - [ ] `referencia=REF`
  - [ ] `producto=NOMBRE`
  - [ ] `precio=PRECIO`
- [ ] Al detectar `nuevo=1`:
  - [ ] Limpiar partidas actuales.
  - [ ] Crear numero nuevo de presupuesto.
  - [ ] Anadir producto.
  - [ ] Navegar a `/app/presupuestos/editor`.
- [ ] Si solo llega `referencia`, opcionalmente recuperar el producto desde Supabase para asegurar nombre y precio actualizados.
- [ ] Evitar duplicados al refrescar la pagina:
  - [ ] Limpiar query params con `navigate(..., { replace: true })`.
  - [ ] Usar guard de procesamiento por referencia.
- [ ] Anadir toast claro.
- [ ] Anadir test E2E:
  - [ ] Click en "Anadir a presupuesto".
  - [ ] Ver editor.
  - [ ] Ver referencia en una partida.

### Criterio de salida

La accion "Anadir a presupuesto" crea un presupuesto limpio y navegable desde SONEX.

---

## Fase 8 - Alternativas externas no presentes en catalogo

### Objetivo

Proponer opciones no disponibles en Supabase sin mezclarlas con productos verificados.

### Decision

Las alternativas externas deben aparecer separadas y marcadas como "Fuera del catalogo". No deben tener boton directo de "Anadir a presupuesto" salvo que se conviertan en partida manual editable.

### Archivos propuestos

- `app/api/product-research.js`
- `app/src/services/sonexExternalResearch.ts`
- `app/src/components/sonex/SonexExternalProductCard.jsx`

### Tareas

- [ ] Implementar fase inicial con IA sin navegacion web:
  - [ ] Prompt generico.
  - [ ] JSON estricto.
  - [ ] Maximo 3 alternativas.
  - [ ] Sin inventar disponibilidad en el catalogo.
- [ ] Anadir validacion runtime del JSON.
- [ ] Anadir disclaimer visual:
  - [ ] "Alternativa no verificada en catalogo".
  - [ ] "Revisar documentacion del fabricante antes de presupuestar".
- [ ] Anadir accion opcional:
  - [ ] "Usar como partida manual".
  - [ ] Llevar a presupuesto con descripcion editable y referencia vacia o marcada como externa.
- [ ] Si se decide busqueda web real:
  - [ ] Implementarla solo en Vercel Function.
  - [ ] Revisar CSP.
  - [ ] Definir fuentes permitidas.
  - [ ] Guardar URL de evidencia.

### Criterio de salida

SONEX distingue visualmente entre productos reales del catalogo y alternativas sugeridas por IA.

---

## Fase 9 - Seguridad, fiabilidad y rendimiento

### Objetivo

Evitar regresiones, costes innecesarios y respuestas enganosas.

### Tareas

- [ ] No renderizar HTML en campos de producto.
- [ ] Mantener `sanitizeUrl()` en enlaces externos.
- [ ] Limitar numero de cards:
  - [ ] Maximo 5 exactas.
  - [ ] Maximo 5 parciales.
  - [ ] Maximo 3 externas.
- [ ] Evitar llamadas IA cuando el catalogo ya resuelve y solo hace falta respuesta breve.
- [ ] Evitar consultas amplias sin filtros.
- [ ] Anadir cache por mensaje normalizado + criterios.
- [ ] Mantener rate limit existente en `/api/ai`.
- [ ] Anadir tracking:
  - [ ] `sonex_intent_detected`
  - [ ] `sonex_catalog_results`
  - [ ] `sonex_open_ficha`
  - [ ] `sonex_add_budget`
  - [ ] `sonex_external_results`

### Criterio de salida

El flujo es estable, limitado y auditable.

---

## Fase 10 - Testing completo

### Unit tests

- [ ] `sonexIntentService.test.ts`
- [ ] `sonexProductSearch.test.ts`
- [ ] `productSpecs.test.js`
- [ ] Tests de compatibilidad en `useProductTable.test.js`.
- [ ] Tests de `sonexCatalogContext` si se mantiene como fallback.

### Component tests

- [ ] Render de card con producto completo.
- [ ] Render de card sin imagen.
- [ ] Render de producto sin precio.
- [ ] Click en "Ver ficha".
- [ ] Click en "Anadir a presupuesto".

### E2E

- [ ] SONEX muestra cards para consulta de producto.
- [ ] SONEX -> Fichas abre referencia exacta.
- [ ] SONEX -> Presupuestos crea partida.
- [ ] Modo mobile sin solapes.
- [ ] Dark mode de cards.

### Comandos

```bash
npm run test
npx playwright test app/e2e/sonex-product-flow.spec.js
npx playwright test app/tests/theme-audit.spec.js
```

### Criterio de salida

El flujo principal queda cubierto sin depender de respuestas reales de IA en tests E2E.

---

## Fase 11 - Documentacion y evolucion

### Tareas

- [ ] Actualizar `docs/revisiones/002_MEJORAS_CONTEXTO_IA.md` si se implementa sliding window.
- [ ] Actualizar `EVOLUCION.md` cuando el flujo este implementado.
- [ ] Actualizar `DB_TAXONOMY.md` solo si se modifica taxonomia, campos o criterios de clasificacion.
- [ ] Documentar ejemplos de prompts:
  - [ ] Busqueda exacta con marca.
  - [ ] Busqueda exacta sin marca.
  - [ ] Consulta ambigua.
  - [ ] Comparativa.
  - [ ] Paso a presupuesto.

### Criterio de salida

La documentacion refleja el comportamiento real implementado.

---

## Roadmap recomendado

### Sprint 1 - Catalogo interno

Prioridad maxima. Implementar intencion, busqueda Supabase, cards y enlaces a fichas.

Entregables:

- Detector de intencion.
- Busqueda y ranking internos.
- Cards de catalogo.
- Deep link a Fichas Tecnicas.

### Sprint 2 - Presupuestos

Conectar la decision tecnica con accion comercial.

Entregables:

- Boton "Anadir a presupuesto".
- `nuevo=1`.
- E2E SONEX -> Presupuestos.

### Sprint 3 - Alternativas externas

Anadir opciones fuera del catalogo con separacion clara.

Entregables:

- Cards externas.
- Validacion JSON.
- Disclaimer.
- Opcion de partida manual.

### Sprint 4 - Pulido profesional

Mejorar robustez, UX y observabilidad.

Entregables:

- Cache.
- Tracking.
- Mobile/dark mode.
- Sliding window para contexto largo.

---

## Riesgos y mitigaciones

| Riesgo | Impacto | Mitigacion |
|--------|---------|------------|
| La IA inventa referencias | Alto | Cards del catalogo salen solo de Supabase |
| Busquedas demasiado amplias | Medio | Filtros por subfamilia/familia y limite de resultados |
| Usuario pide marca sin resultados | Medio | Mostrar parciales y preguntar si acepta otras marcas |
| Query params duplican partidas | Medio | `replace: true` y guard de procesamiento |
| Alternativas externas parecen verificadas | Alto | Separacion visual y disclaimer obligatorio |
| Tests E2E flakey por IA | Alto | Mock de `/api/ai` en tests del flujo |
| Cambios rompen `useProductTable` | Medio | Re-export y tests de regresion |

---

## Definicion de terminado

- [ ] SONEX detecta busquedas de producto con caracteristicas tecnicas.
- [ ] SONEX muestra cards reales del catalogo.
- [ ] Las cards usan datos de Supabase, no texto generado.
- [ ] Click en card abre ficha tecnica directa.
- [ ] "Anadir a presupuesto" abre presupuesto nuevo con partida cargada.
- [ ] Alternativas externas aparecen separadas.
- [ ] Tests unitarios y E2E principales pasan.
- [ ] Dark mode y mobile revisados.
- [ ] Indice de planes actualizado.

---

## Notas de implementacion

- No anadir nuevas colecciones en Firestore.
- Servicios nuevos preferiblemente en TypeScript.
- Mantener prompts genericos.
- No hardcodear colores en CSS.
- No introducir nombres de terceros en textos nuevos de UI; usar marca solicitada, fabricante o catalogo cuando aplique.
- Si se modifica el catalogo o la taxonomia, leer y actualizar `DB_TAXONOMY.md`.
