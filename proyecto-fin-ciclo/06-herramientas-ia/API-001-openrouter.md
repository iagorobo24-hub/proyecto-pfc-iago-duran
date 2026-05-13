---
tool_id: API-001
nombre: OpenRouter
version_observada: 2025-2026
rol_principal: Gateway unificado de APIs de IA (modelos gratuitos y de pago)
url: https://openrouter.ai
---
OpenRouter es un sitio que junta todos los modelos de IA en una sola API. En vez de tener que registrarte en Anthropic, Google, OpenAI y mil más, usas una sola clave y accedes a todos. Y lo mejor: tiene modelos gratuitos de verdad.

## ¿Qué es?

OpenRouter es un **agregador de APIs de IA** que unifica el acceso a múltiples modelos (Claude, GPT, Gemini, DeepSeek, Qwen, etc.) bajo una sola API. Su principal ventaja: ofrece **modelos gratuitos** de alta calidad.

## ¿Para qué lo usé?

### Gateway de IA para producción

En `app/api/ai.js` configuré un endpoint serverless en Vercel que actúa como gateway:

```javascript
// El frontend llama a /api/ai
// El backend reenvía a OpenRouter
// Así la API key nunca está expuesta en el cliente
```

### Modelos gratuitos que utilicé

| Modelo | Proveedor | Calidad | Uso |
|--------|-----------|---------|-----|
| Claude 3.5 Haiku | Anthropic | ⭐⭐⭐⭐ | Respuestas rápidas en SONEX |
| DeepSeek R1 | DeepSeek | ⭐⭐⭐⭐⭐ | Razonamiento complejo |
| Qwen 2.5 72B | Qwen | ⭐⭐⭐⭐ | General |
| Gemini Flash 1.5 | Google | ⭐⭐⭐ | Rápido |

## ¿Cómo lo integré?

### 1. Obtener API key

1. Creé cuenta en openrouter.ai
2. Copié la API key (empieza por `sk-or-...`)
3. La configuré solo en Vercel (nunca en el repo)

### 2. Endpoint en Vercel (`app/api/ai.js`)

```javascript
export default async function handler(req, res) {
  const { provider = 'openrouter', model, messages } = req.body
  
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ model, messages })
  })
  
  return res.json(await response.json())
}
```

### 3. Uso desde el frontend

```javascript
const { text } = await callAnthropicAI({
  provider: 'openrouter',
  model: 'anthropic/claude-3.5-haiku',
  messages: [{ role: 'user', content: '...' }]
})
```

## Costes

| Tier | Modelos | Coste |
|------|---------|-------|
| **Gratis** | Claude 3.5 Haiku, DeepSeek R1, Qwen 72B, Gemini Flash | 0€ |
| **Pago** | GPT-4o, Claude 3.5 Sonnet, etc. | Por token |

Para este proyecto: **0€** (usé solo modelos gratuitos)

## Ventajas que encontré

| Aspecto | Valoración |
|---------|-----------|
| Modelos gratuitos de calidad | ⭐⭐⭐⭐⭐ |
| Unificación de múltiples proveedores | ⭐⭐⭐⭐⭐ |
| API compatible con OpenAI | ⭐⭐⭐⭐⭐ |
| Dashboard con uso y estadísticas | ⭐⭐⭐⭐ |
| Rate limits generosos (free tier) | ⭐⭐⭐⭐ |

## Limitaciones que encontré

1. **Rate limits en gratuito:** Los modelos free tienen límites por minuto/día.
2. **Latencia variable:** Depende del modelo y la hora del día.
3. **Configuración inicial compleja:** Necesitas entender cómo funcionan las APIs de IA.

## El problema que resolvió

Antes de OpenRouter:
- Intenté usar la API de Anthropic directamente → CORS y coste
- Intenté usar Claude en la web → Solo prototipos, no producción
- OpenRouter solved: API unificada + modelos gratuitos = producción gratis

## Lecciones aprendidas con esta herramienta

1. **Nunca expongas API keys:** Usa un proxy backend (Vercel Function) para ocultar la clave.
2. **Los modelos gratuitos son viables:** Para un proyecto académico, no necesitas pagar.
3. **La latencia importa:** Claude 3.5 Haiku es rápido (~1s), DeepSeek R1 puede tardar (~5s).

## Comparativa con alternativas

| Aspecto | OpenRouter | API directa Anthropic | API directa OpenAI |
|---------|-----------|----------------------|-------------------|
| Coste gratuito | ✅ Muchos modelos | ❌ De pago | ❌ De pago |
| Diversidad de modelos | ✅ 100+ | ❌ Solo Claude | ❌ Solo GPT |
| API unificada | ✅ | ❌ | ❌ |
| Latencia | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

## Referencias

- [OpenRouter](https://openrouter.ai)
- [Modelos gratuitos](https://openrouter.ai/models?free=true)
- [Documentación API](https://openrouter.ai/docs)

---

**Fecha de elaboración de esta ficha:** Abril 2026