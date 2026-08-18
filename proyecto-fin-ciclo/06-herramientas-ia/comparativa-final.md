# Comparativa final de herramientas

La comparación se centra en **tipo de acceso y control**, porque precios, modelos y cuotas cambian demasiado rápido para ser un criterio documental estable.

| Enfoque | Ejemplos usados | Contexto disponible | Puede modificar archivos | Puede ejecutar comandos | Riesgo principal |
|---|---|---|---|---|---|
| Chat web | Claude Web | Lo aportado a la conversación | No directamente | No | Falta de contexto real |
| Asistente de editor | Copilot, Windsurf | Archivo/proyecto según integración | Sí | Variable | Aceptar sugerencias locales sin comprobar contratos |
| Agente CLI | Qwen CLI, Gemini CLI, OpenCode | Filesystem/repositorio | Sí | Sí | Cambios amplios o acciones Git no deseadas |
| Agente remoto | Devin | Repositorio/tarea asignada | Sí, vía Git | Según entorno | Autonomía con supuestos incorrectos |
| Agente general | Hermes | Dependiente de instalación | Dependiente | Dependiente | Confundir capacidades de una sesión con capacidades permanentes |

## Selección por tarea

### Ideación o explicación

Un chat web es suficiente si se aporta el contexto necesario y no se confunde la respuesta con evidencia.

### Edición pequeña y repetitiva

Un asistente de editor reduce fricción. La revisión del diff sigue siendo necesaria.

### Cambios que cruzan muchos archivos

Un agente con acceso al repositorio y terminal es más eficaz, siempre que existan límites claros: alcance, tests, Git permitido y condiciones de parada.

### Trabajo autónomo/remoto

Conviene cuando el resultado llega como un diff/commit revisable. No se debe fusionar por confianza en la marca del agente.

## Infraestructura del producto

Vercel, Supabase y OpenRouter no compiten con los agentes de desarrollo: son piezas del producto desplegado. Firebase se conserva como antecedente histórico y Playwright como herramienta de automatización/testing.

## Criterios aprendidos

1. acceso al contexto;
2. capacidad real de ejecutar/verificar;
3. reversibilidad de los cambios;
4. trazabilidad Git;
5. privacidad/permisos;
6. coste actual, consultado en el momento y no heredado de una ficha antigua.

## Conclusión

La herramienta más útil fue la que reducía trabajo sin eliminar el control. La metodología final del PFC prioriza **evidencia y revisión** por encima de elegir un proveedor concreto.
