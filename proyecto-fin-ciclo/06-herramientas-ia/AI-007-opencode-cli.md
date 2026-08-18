---
tool_id: AI-007
nombre: OpenCode CLI
rol_en_el_pfc: agente de terminal para repositorios
estado_documental: utilizado en el flujo de desarrollo
---

# OpenCode CLI

## Uso en el PFC

OpenCode se utilizó para analizar repositorios, implementar cambios, ejecutar comandos y preparar commits desde equipos de desarrollo.

## Fortalezas en este proyecto

- trabajo directo sobre el árbol del repositorio;
- capacidad de inspeccionar múltiples archivos;
- ejecución de build/tests;
- útil para tareas largas de estabilización y documentación.

## Reglas de uso aprendidas

1. inspeccionar rama, `git status` y diff antes de cambiar;
2. no asumir que el informe del agente coincide con el estado real;
3. no hacer `force-push` ni reescribir historia sin autorización;
4. sincronizar con remoto antes del push y resolver conflictos preservando ambas fuentes válidas;
5. reportar comandos y resultados observados.

## Coste/modelos

La versión antigua ligaba OpenCode a proveedores/modelos concretos y a “coste cero”. Esa relación no es un hecho estable de la herramienta: depende de la configuración elegida. La ficha conserva el workflow, no un proveedor ni tarifa determinados.
