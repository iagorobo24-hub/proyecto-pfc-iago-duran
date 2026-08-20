# CLAUDE.md — guía operativa del repositorio

## Objetivo

Este repositorio contiene el PFC de Iago Durán Romera: una SPA React/Vite con siete herramientas funcionales, Dashboard Global, Supabase, funciones serverless de IA, pruebas y documentación académica.

## Fuente de verdad

Antes de modificar algo, separar:

1. **Código y configuración actual** — determina qué comportamiento existe.
2. **`proyecto-fin-ciclo/01-10`** — documentación académica fuente.
3. **Artefactos derivados** — DOCX, diagramas y presentaciones; deben regenerarse desde las fuentes.
4. **Documentación histórica** — `EVOLUCION.md`, planes y auditorías pueden describir estados antiguos y no deben reutilizarse como estado actual sin comprobarlos.

## Inspección previa obligatoria

Para una tarea técnica:

- comprobar rama/HEAD y estado disponible;
- leer los archivos responsables y sus contratos;
- revisar tests relacionados;
- distinguir bug confirmado, riesgo plausible y documentación obsoleta;
- no asumir que una cifra o una afirmación de otro agente sigue vigente.

## Alcance

Aplicar el cambio mínimo que resuelva el objetivo. No convertir una corrección en refactor general, migración o funcionalidad nueva. No modificar código para hacer coincidir documentación antigua; si el producto actual es correcto, se actualiza la documentación.

## Git

- No reescribir historia ni hacer `force-push`.
- No borrar trabajo ajeno o local sin autorización.
- Revisar el diff real antes de commit/push.
- No confundir cambio local, commit, push, PR, merge, CI y despliegue.
- La evidencia de un commit solo vale para ese estado del repositorio.

## Validación

Ejecutar las validaciones relevantes al alcance. Para cambios de producto, considerar desde `app/`:

```bash
npm run lint
npm run test
npm run test:e2e
npm run build
```

Playwright debe ser autocontenido: `playwright.config.js` arranca el servidor Vite para E2E. El workflow `.github/workflows/ci.yml` define la batería automática de lint, Vitest, build y Playwright para cambios versionados.

No es obligatorio ejecutar toda la batería para un cambio puramente documental, pero debe declararse qué se ejecutó y qué no. Un test verde no sustituye la revisión del comportamiento ni justifica debilitar una prueba válida.

## Hechos canónicos actuales del PFC

- 7 herramientas funcionales + 1 Dashboard Global.
- Frontend React/Vite con React Router.
- Supabase como backend principal de autenticación y datos; Firebase es legado/historia.
- `/api/ai` actúa como gateway serverless, admite varios modelos/proveedores y exige una sesión Supabase válida mediante Bearer token.
- Las claves de los proveedores de IA permanecen en servidor; el navegador no debe llamar directamente a OpenRouter/Groq.
- No existe un único modelo de IA global.
- Existen suites Vitest y Playwright; el número de tests verdes debe medirse por commit.
- La sección de actividad del Dashboard es analítica local del navegador, no analítica global.
- Los recuentos del catálogo son datos de base de datos y deben fecharse.
- El proyecto es académico y no se presenta como integración oficial con sistemas corporativos.

## IA y datos técnicos

Una salida generada por IA no es una fuente normativa ni de fabricante. Para especificaciones eléctricas, compatibilidad, instalación, mantenimiento, seguridad o normativa:

`dato real/fuente oficial → modelo puede explicar/estructurar → esquema valida → usuario verifica antes de uso real`

Un system prompt no garantiza JSON válido ni exactitud factual.

## Documentación

Al actualizar la memoria:

- separar estado actual de historia;
- no congelar precios, cuotas, modelos, catálogo, Lighthouse, cobertura o tests sin fecha/método;
- preservar una única convención de requisitos;
- mantener manuales alineados con el código;
- actualizar capítulos fuente antes de los derivados.

## Informe final de una tarea

Indicar de forma separada:

- diagnóstico;
- cambios realizados;
- validaciones ejecutadas y resultados observados;
- estado Git relevante;
- limitaciones;
- acciones no realizadas;
- trabajo pendiente real.
