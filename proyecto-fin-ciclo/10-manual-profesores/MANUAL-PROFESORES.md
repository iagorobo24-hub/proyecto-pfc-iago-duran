# Manual para profesorado — proyectos técnicos asistidos por IA

## Propósito

Este material utiliza el PFC como caso de estudio para enseñar desarrollo asistido por IA con un principio central: **el alumno conserva la responsabilidad sobre requisitos, decisiones, validación y defensa**.

No se propone una herramienta concreta como obligatoria. Los servicios, planes y modelos cambian; la metodología debe sobrevivir a esos cambios.

## Objetivos docentes

Al finalizar el itinerario el alumno debería poder:

- formular un problema técnico y criterios de aceptación;
- usar un asistente de IA con contexto y límites claros;
- revisar código o documentación generada;
- utilizar Git para conservar trazabilidad;
- ejecutar validaciones y leer sus resultados;
- distinguir dato medido, inferencia y opinión;
- identificar cuándo una respuesta necesita fuente normativa/oficial.

## Itinerario de cuatro sesiones

### Sesión 1 — Del problema al prompt verificable

- qué puede y qué no puede garantizar un LLM;
- transformar una necesidad en requisitos observables;
- crear un prompt con objetivo, entradas, límites y criterio de cierre;
- ejercicio: comparar una respuesta vaga con otra verificable.

### Sesión 2 — IA + Git + revisión

- repositorio, diff, commit y reversibilidad;
- generar un cambio pequeño con asistencia IA;
- revisar el diff antes de aceptarlo;
- ejercicio: localizar una suposición incorrecta del agente.

### Sesión 3 — Pruebas y evidencia

- diferencia entre “parece funcionar” y “está verificado”;
- build, lint, pruebas unitarias y E2E;
- interpretar un fallo sin modificar tests para ocultarlo;
- ejercicio: documentar comando, resultado y limitaciones.

### Sesión 4 — Mini proyecto y defensa

- diseñar una solución pequeña en grupo;
- documentar qué hizo la IA y qué verificó el equipo;
- presentar decisiones, evidencias y límites;
- evaluar el resultado, no el volumen de contenido generado.

## Reglas de seguridad y autoría

- Las normas del centro determinan qué uso de IA, atribución y ayuda externa están permitidos.
- El alumno debe poder explicar el código y las decisiones que presenta.
- No se aceptan especificaciones eléctricas, normativa, compatibilidades o procedimientos de seguridad generados sin contraste con fuentes oficiales.
- Un *system prompt* no garantiza verdad, seguridad ni JSON válido.
- Un test verde no justifica una implementación si el resultado es evidentemente incorrecto.

## Evaluación recomendada

Priorizar:

1. definición del problema y alcance;
2. calidad de la solución;
3. trazabilidad de decisiones;
4. validación y evidencia;
5. comprensión técnica;
6. comunicación y límites reconocidos.

La cantidad de herramientas IA utilizadas no es un criterio de calidad por sí sola.

## Materiales del repositorio

- `05-proceso-desarrollo/`: metodología y patrones de prompts.
- `06-herramientas-ia/`: fichas históricas de herramientas utilizadas.
- `07-manuales-uso/`: comportamiento actual de la aplicación.
- `08-resultados/`: contrato de evidencia y resultados.
- `10-manual-profesores/`: actividades, evaluación y guía rápida.

*Manual docente reconciliado — agosto de 2026.*
