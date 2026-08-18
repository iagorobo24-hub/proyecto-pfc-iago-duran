---
tool_id: API-001
nombre: OpenRouter
rol_en_el_pfc: gateway/proveedor de acceso a modelos de IA
estado_documental: parte de la arquitectura actual
---

# OpenRouter

## Papel actual

`app/api/ai.js` usa OpenRouter como proveedor principal del gateway de IA y admite Groq como alternativa. El frontend llama a `/api/ai`; la clave privada permanece en variables de entorno del servidor.

## Qué resuelve

- interfaz común para diferentes modelos;
- cambio de modelo sin exponer claves al cliente;
- fallbacks definidos por la aplicación;
- streaming para flujos como SONEX.

## Estado del código auditado

La allowlist contiene varios identificadores de modelo y el gateway tiene una lista de fallbacks. SONEX solicita en el snapshot auditado `google/gemini-2.5-flash` (sin sufijo `:free`). Por ello se elimina la afirmación de que toda la IA de producción sea necesariamente gratuita.

## Seguridad

El gateway valida tamaño, cantidad de mensajes, tokens y modelo. Los prompts siguen siendo datos no confiables desde el punto de vista del proveedor y las respuestas del modelo requieren validación según su uso.

## Coste

El coste efectivo depende de modelos, créditos, volumen y condiciones vigentes. Se documenta en resultados como dato observado/estimado, no como propiedad de OpenRouter.
