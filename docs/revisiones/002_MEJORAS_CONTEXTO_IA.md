# Mejoras Futuras — Sistema de Contexto en SONEX

## Estado Actual

El asistente SONEX envía el historial completo de la conversación en cada turno (todos los mensajes previos con contenido). Esto funciona pero tiene limitaciones conocidas.

## Problemas Identificados

### 1. Sin límite de tokens en el historial

Cada turno envía el historial completo + system prompt (~700 tokens) + contexto de catálogo (~200-800 tokens según resultados). En conversaciones largas se supera el límite del modelo (Claude 3.5 Haiku: ~200K tokens de contexto).

**Síntoma:** El modelo empieza a ignorar mensajes antiguos, la API truncaintos o la respuesta se degrada.

### 2. Ventana fija (sin sliding window)

Se reenvía todo desde el principio siempre. En apps profesionales se usa una ventana deslizante: solo los últimos N mensajes (ej. últimos 10-20 intercambios).

### 3. Sin resumen de contexto

Cuando la ventana deslizante descarta mensajes antiguos, se pierde el contexto de lo conversado al principio. La solución profesional es generar un resumen periódico del historial descartado e inyectarlo como mensaje del sistema.

### 4. Sin conteo de tokens previo

Antes de enviar el historial no se calcula cuántos tokens ocupa. Una implementación robusta debería medir y recortar dinámicamente para no exceder el límite del modelo.

### 5. Contexto de catálogo solo del último mensaje

El `buildCatalogContext` solo analiza el mensaje actual. En una conversación, el usuario puede referirse a productos mencionados antes. Idealmente el contexto debería considerar también mensajes anteriores.

## Arquitectura Propuesta (Sliding Window + Resumen)

```
Conversación:
  [msg1] user: ¿qué variadores tienes?
  [msg2] asst: Tenemos Altivar de Schneider...
  [msg3] user: ¿cuál es el más pequeño?
  [msg4] asst: El Altivar 12 de 0.18kW...
  ... (siguen 15 intercambios) ...
  [msg22] user: ¿y ese necesita filtro?

Con ventana deslizante de 10:
  Se envían mensajes [13..22] + resumen de [1..12]
```

### Implementación sugerida

1. **Sliding window:** Mantener los últimos N mensajes (N configurable, ej. 20)
2. **Resumen automático:** Cuando se descartan mensajes, pedir a la IA que genere un resumen de 2-3 líneas y guardarlo como `system` message
3. **Conteo de tokens:** Usar `encoding` de Anthropic o `tiktoken` para medir antes de enviar y recortar si es necesario
4. **Límite de seguridad:** No enviar más de ~150K tokens totales (system + catálogo + historial + respuesta)

### Diagrama de flujo propuesto

```
Usuario envía mensaje
  → buildCatalogContext() con mensajes recientes (no solo el último)
  → Calcular tokens del historial + system prompt + contexto
  → Si excede límite: reducir ventana o truncar mensajes más antiguos
  → Enviar a la API
  → Recibir respuesta
  → Si el historial supera el umbral: generar resumen asíncrono
  → Almacenar resumen para próximos turnos
```

## Referencias

- `app/src/tools/Sonex.jsx:129-133` — Construcción del historial (implementación actual)
- `app/src/services/sonexCatalogContext.js` — Contexto de catálogo por mensaje
- Límite Claude 3.5 Haiku: ~200K tokens de contexto
