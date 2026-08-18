# Evolución reciente de la IA aplicada al desarrollo

## Contexto

Entre 2020 y 2026 los modelos de lenguaje pasaron de completar texto y código a integrarse en editores, terminales y flujos de trabajo capaces de leer repositorios, proponer cambios y ejecutar herramientas. Este PFC se desarrolló durante esa transición y utilizó varias generaciones de asistentes.

## Hitos relevantes para el proyecto

- **Asistentes conversacionales:** facilitaron explicación, diseño y prototipado.
- **Autocompletado en IDE:** redujo trabajo repetitivo durante la implementación.
- **Agentes sobre repositorios:** permitieron inspeccionar varios archivos, editar, ejecutar comandos y preparar cambios.
- **Gateways multi-modelo:** hicieron posible desacoplar la aplicación de un único proveedor de IA.

Las marcas, planes gratuitos y modelos concretos cambian con rapidez. Por eso este capítulo no intenta mantener un catálogo comercial actualizado; las fichas del capítulo 06 documentan principalmente **cómo se usaron durante el PFC**.

## Qué cambió en el rol del alumno

La disponibilidad de IA redujo la barrera para empezar un proyecto web, pero no eliminó las tareas que determinan su calidad:

1. definir el problema;
2. decidir el alcance;
3. revisar lo generado;
4. probar el comportamiento;
5. contrastar fuentes;
6. documentar decisiones y límites.

Un alumno puede ser productivo antes de dominar todo el stack, pero eso no equivale a dominio profesional automático. La capacidad de explicar y verificar el resultado sigue siendo necesaria.

## Riesgos observados

- código convincente pero incorrecto;
- referencias, APIs o normas inventadas;
- cambios fuera del alcance pedido;
- dependencia de una herramienta o proveedor;
- aceptación de un informe de agente sin revisar el diff o los tests;
- documentación que queda obsoleta mientras el código evoluciona.

## Aplicación al PFC

El proyecto evolucionó desde prototipos aislados hacia una SPA integrada y desde un backend inicial basado en Firebase hacia Supabase. También cambió la combinación de modelos y agentes utilizados. Esa evolución es parte del aprendizaje y explica por qué la documentación separa ahora **historia del proyecto** de **estado actual del repositorio**.

## Conclusión

La aportación educativa no es que “cualquiera pueda crear software profesional sin saber programar”, sino que las herramientas generativas permiten avanzar más rápido **si se combinan con comprensión, control de versiones, pruebas y evidencia**.

*Capítulo reconciliado — agosto de 2026.*
