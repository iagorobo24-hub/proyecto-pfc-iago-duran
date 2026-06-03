# Fase 1: Cimientos (Días 1-5)

> **Objetivo**: Seguridad, Arquitectura, UX inmediata
> **Impacto**: 🔴 Crítico — Sin esto la app no debería ir a producción

---

## 1.1 — Mover clave Supabase a variables de entorno

**Esfuerzo**: 30min | **Impacto**: 🔴 Seguridad

### Problema
`app/src/services/catalogService.js:10` tiene la `supabaseKey` hardcodeada:
```js
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOi...';
```
El fallback hardcodeado significa que la clave viaja en el bundle de producción visible en DevTools.

### Solución
Eliminar el fallback. La variable DEBE venir de `.env`.

### Archivos a modificar
- `app/src/services/catalogService.js` — eliminar fallback hardcodeado
- `app/.env` — verificar que existe con la key
- `app/src/supabase/supabaseClient.js` — verificar que también usa env y no hardcode

### Tareas
- [ ] Leer `catalogService.js` línea 10 y eliminar el string hardcodeado
- [ ] Leer `supabaseClient.js` y verificar que usa `import.meta.env.VITE_SUPABASE_ANON_KEY`
- [ ] Verificar que `app/.env` existe con la key correcta
- [ ] Ejecutar `npm run build` para verificar que no se rompe
- [ ] Ejecutar `npm test` para verificar tests unitarios

### Tests a ejecutar después
```bash
npm test                                       # Unit tests
npx playwright test tests/theme-audit.spec.js  # Smoke test básico
```

---

## 1.2 — Migración progresiva a TypeScript

**Esfuerzo**: 2 días | **Impacto**: 📐 Arquitectura

### Problema
0 tipos en 7 herramientas + 12 hooks + 5 servicios. Cada refactor es a ciegas.

### Solución
No migrar todo de golpe. Enfocar en:
1. `catalogService.js` — el servicio más crítico (656 líneas, 17 funciones)
2. `useNavegacionFichas.js` — el hook más complejo (640 líneas)
3. `anthropicService.js` — interfaz con la IA

Estrategia **progresiva**: `.ts` + tipos base → `tsconfig.json` parcial → expandir.

### Archivos a crear/modificar
- `app/tsconfig.json` — configuración base
- `app/src/services/catalogService.ts` — migrar de .js
- `app/src/services/anthropicService.ts` — migrar de .js
- `app/src/types/catalog.ts` — tipos compartidos (Product, Brand, Category, etc.)
- `app/src/types/ai.ts` — tipos de IA (AIResponse, AIFicha, etc.)
- `app/vite.config.js` — verificar que acepta .ts

### Tareas
- [ ] Crear `tsconfig.json` en la raíz de `app/`
- [ ] Crear `src/types/catalog.ts` con interfaces Product, Brand, Category
- [ ] Crear `src/types/ai.ts` con interfaces AIRequest, AIResponse, AIFicha
- [ ] Migrar `catalogService.js` → `.ts` con tipado completo
- [ ] Migrar `anthropicService.js` → `.ts`
- [ ] Verificar que `npm run build` funciona con archivos .ts
- [ ] NO migrar el resto todavía (fase 2)

### Tests a ejecutar después
```bash
npm test                                       # Unit tests (confirmar que siguen pasando)
npx playwright test tests/fichas-navigation.spec.js  # Smoke catálogo
npm run build                                  # Build sin errores
```

---

## 1.3 — Eliminar dead code FirestoreService

**Esfuerzo**: 1h | **Impacto**: 🧹 Deuda técnica

### Problema
`app/src/services/firestoreService.js` (142 líneas) importa `firebaseConfig.js` que es un MOCK. Este código NO se usa en runtime (todo va a localStorage via `useMemoriaUsuario.js`), pero:
1. Sigue siendo importable y puede causar errores
2. Crea confusión sobre el modelo de persistencia real
3. Firebase (12MB en node_modules) se podría eliminar

### Solución
1. Marcar `firestoreService.js` como deprecado con comentario
2. Eliminar todas las importaciones de firestoreService en hooks
3. No eliminar Firebase de package.json todavía (puede haber scripts que lo usen)

### Archivos a modificar
- `app/src/services/firestoreService.js` — añadir banner DEPRECATED
- Buscar importaciones de firestoreService en `hooks/` y `tools/`

### Tareas
- [ ] Buscar todas las importaciones de `firestoreService` en el código
- [ ] Verificar que ninguna se usa activamente
- [ ] Añadir banner DEPRECATED a `firestoreService.js`
- [ ] Si hay importaciones activas, reemplazarlas por `useMemoriaUsuario`

### Tests a ejecutar después
```bash
npm test                                       # Unit tests
npx playwright test tests/theme-audit.spec.js tests/fichas-navigation.spec.js  # Smoke
```

---

## 1.4 — Silenciar console.logs en producción

**Esfuerzo**: 30min | **Impacto**: ⚡ Performance/Seguridad

### Problema
`catalogService.js` tiene console.log en CADA función (getCategorias, getMarcasPorCategoria, etc.). En producción esto:
1. Expone estructura de datos al usuario en DevTools
2. Impacta rendimiento (I/O a console)
3. Aspecto no profesional

### Solución
Wrapper de logging condicional:
```js
const debug = import.meta.env.DEV ? console.log : () => {}
```

### Archivos a modificar
- `app/src/services/catalogService.js` — reemplazar console.log por logger condicional
- Crear utility `src/utils/logger.js` si se va a usar en más sitios

### Tareas
- [ ] Crear `src/utils/logger.js` con logger condicional
- [ ] Reemplazar todos los `console.log/error/warn` en `catalogService.js`
- [ ] Verificar que `console.error` se mantiene en producción (errores sí queremos verlos)
- [ ] Revisar otros servicios (`anthropicService.js`, `brandLogoService.js`)

### Tests a ejecutar después
```bash
npm test
```

---

## 1.5 — Streaming de respuestas IA en SONEX

**Esfuerzo**: 1 día | **Impacto**: ✨ UX (el cambio más visible)

### Problema
SONEX hace una llamada POST a `/api/ai` y espera la respuesta completa. El usuario ve un spinner 3-6s. Los técnicos en el sector están acostumbrados a herramientas tipo ChatGPT con streaming.

### Solución
Implementar SSE (Server-Sent Events) o ReadableStream para que el texto aparezca character-by-character. Esto requiere cambios en:
- Frontend: `Sonex.jsx` + `anthropicService.js` (soporte streaming)
- Backend: `api/ai.js` (Vercel Function — devolver stream)

### Arquitectura de Streaming

**Backend (`api/ai.js`)**:
```
POST /api/ai?stream=true
→ OpenRouter API con stream: true
→ Vercel Function envía chunks SSE
→ Content-Type: text/event-stream
```

**Frontend (`anthropicService.js`)**:
```js
export async function callAnthropicAIStream(body, onChunk) {
  const response = await fetch('/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...body, stream: true })
  });
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    onChunk(decoder.decode(value));
  }
}
```

**SONEX (`Sonex.jsx`)**:
```jsx
// Estado: texto parcial de la respuesta
const [streamingText, setStreamingText] = useState('');
const [isStreaming, setIsStreaming] = useState(false);

const handleSendStream = async (msg) => {
  setIsStreaming(true);
  setStreamingText('');
  await callAnthropicAIStream(
    { messages: [{ role: 'user', content: msg }] },
    (chunk) => setStreamingText(prev => prev + chunk)
  );
  setIsStreaming(false);
  // Guardar mensaje completo cuando termine
};
```

### Archivos a modificar
- `app/src/services/anthropicService.js` — añadir `callAnthropicAIStream`
- `app/src/tools/Sonex.jsx` — reemplazar `handleSendMessage` por versión streaming
- `app/api/ai.js` — soporte para `stream: true`

### Tareas
- [ ] Verificar que OpenRouter soporta streaming (sí, vía `stream: true`)
- [ ] Modificar `api/ai.js` para detectar `stream: true` y devolver SSE
- [ ] Añadir `callAnthropicAIStream()` a `anthropicService.js` (en `.ts` si ya migramos)
- [ ] Modificar `Sonex.jsx` para usar streaming
- [ ] Añadir estado `streamingText` para el texto parcial
- [ ] Manejar edge cases: error en medio del stream, rate limiting, abort (si usuario cambia de chat)
- [ ] UX: intercalar "SONEX está escribiendo..." + texto parcial que aparece

### Tests a ejecutar después
```bash
npm test                                       # Unit tests (mock de streaming)
npx playwright test e2e/analisis-completo.spec.js  # E2E Sonex
```

---

## 1.6 — Bugfix: ruta SONEX → Fichas

**Esfuerzo**: 15min | **Impacto**: 🐛 Bug

### Problema
En `Sonex.jsx:81`, `irAFicha` navega a `/fichas?ref=...` pero el router está definido como `/app/fichas` (dentro de AppShell). Todas las rutas protegidas están bajo `/app/`.

### Solución
Cambiar `navigate(\`/fichas?ref=...\`)` por `navigate(\`/app/fichas?ref=...\`)`.

### Archivos a modificar
- `app/src/tools/Sonex.jsx` — línea 81

### Tareas
- [ ] Encontrar y corregir la ruta en `irAFicha`
- [ ] Verificar también `irAPresupuesto` (línea 82)
- [ ] Verificar que `FichasTecnicas.jsx` recibe y procesa `searchParams` correctamente

### Tests a ejecutar después
```bash
npx playwright test tests/fichas-navigation.spec.js
```

---

## Checklist de Verificación Post-Fase 1 — ✅ COMPLETADA

- [x] `npm test` — todos los unit tests pasan (119 tests, 3 suites)
- [x] `npm run build` — build sin errores (2926 módulos transformados)
- [x] SONEX con streaming funcional (texto aparece chunk por chunk)
- [x] Sin claves hardcodeadas en el bundle (solo env vars)
- [x] Consola limpia en producción (logger condicional)
- [x] Ruta SONEX → Ficha Técnica funciona (`/app/fichas?ref=`)
- [x] Firestore no se importa en runtime (0 imports activos)
- [x] TypeScript compila sin errores (catalogService.ts + anthropicService.ts)
- [ ] ~~E2E~~ — Pendiente de ejecución manual (requiere servidor en funcionamiento)