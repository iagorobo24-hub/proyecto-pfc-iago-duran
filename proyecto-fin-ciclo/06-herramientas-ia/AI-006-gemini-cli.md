---
tool_id: AI-006
nombre: Gemini CLI
rol_en_el_pfc: agente de terminal
estado_documental: uso histórico
---

# Gemini CLI

## Uso en el PFC

Gemini CLI se utilizó para tareas que requerían leer el proyecto, proponer/modificar archivos y ejecutar comandos desde terminal.

## Casos de uso

- análisis de código existente;
- creación o refactor de componentes;
- scripts y tareas repetitivas;
- diagnóstico de errores;
- preparación de cambios antes de commit.

## Limitaciones

La autenticación, cuotas y modelos disponibles dependen del servicio. No se documentan como constantes. Tampoco se acepta como evidencia una afirmación del agente de que “los tests pasan”: la evidencia es la salida real del comando ejecutado sobre el commit correspondiente.

## Lección

Los agentes de terminal aportan autonomía, pero aumentan la necesidad de proteger el estado Git, revisar el diff y limitar acciones destructivas.
