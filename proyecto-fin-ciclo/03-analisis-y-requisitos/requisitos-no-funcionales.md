# Requisitos no funcionales

Los RNF se formulan como **objetivos y propiedades verificables**. “Existe implementación” no significa automáticamente “cumplimiento demostrado”; cuando falta una medición fresca se indica expresamente.

## RNF-01 — Rendimiento

- La interfaz no debe bloquearse durante navegación y búsqueda de catálogo.
- Se utiliza carga diferida de rutas y optimizaciones de consulta/caché.
- Cualquier cifra de FCP, LCP, bundle o tiempo de interacción debe venir de un informe de rendimiento asociado al commit. No se mantiene aquí una cifra histórica como garantía actual.

## RNF-02 — Usabilidad y accesibilidad

- Diseño responsive para móvil, tablet y escritorio.
- Navegación común, tema claro/oscuro y atajos globales.
- Uso de roles/atributos accesibles donde están implementados.
- WCAG AA se considera **objetivo**, no certificación: no se declara cumplimiento global sin auditoría de accesibilidad completa.

## RNF-03 — Seguridad

Implementación observada:

- `ProtectedRoute` protege el área privada.
- Claves privadas de IA permanecen en la función serverless, no en el bundle del cliente.
- Gateway con allowlist de modelos, límites de mensajes/tamaño, CORS y rate limiting.
- Cabeceras de seguridad en `vercel.json`, incluida CSP.
- Sanitización de Markdown con DOMPurify.

Limitación: el gateway puede devolver detalles del error del proveedor en algunas respuestas 502. Por ello no se afirma “ausencia total de fuga de detalles” hasta endurecer y verificar ese comportamiento.

## RNF-04 — Datos y resiliencia

- Supabase es la dependencia principal de autenticación y catálogo.
- `useUserData` implementa persistencia híbrida para varios datos de usuario y respaldo local.
- Sin credenciales o conectividad, ciertas áreas pueden degradarse; **no se promete funcionamiento offline completo del catálogo ni sincronización automática universal**.

## RNF-05 — Escalabilidad y disponibilidad

El diseño usa servicios gestionados y consultas acotadas, pero no se declara capacidad demostrada para “1M de productos”, “100 usuarios concurrentes” ni un porcentaje de uptime. Son objetivos que necesitarían pruebas de carga/telemetría y, en su caso, SLA contractual del plan utilizado.

## RNF-06 — Mantenibilidad

- Código organizado por componentes, hooks, servicios, contextos y utilidades.
- TypeScript se adopta de forma progresiva en parte del código.
- Git conserva el historial de cambios.
- La documentación académica debe mantenerse sincronizada con el código antes de generar los artefactos de entrega.

## RNF-07 — Coste

El proyecto se diseñó con fuerte preferencia por herramientas gratuitas o de bajo coste. Sin embargo, “coste cero permanente” **no es un requisito técnico garantizable**: planes, cuotas y modelos cambian, y SONEX utiliza en el snapshot auditado un modelo que no lleva sufijo `:free`.

La memoria registra coste observado e hipótesis económicas por separado en `08-resultados/presupuesto.md`.

## RNF-08 — Testing

- `app/package.json` define Vitest y Playwright.
- El repositorio contiene suites unitarias y múltiples archivos E2E `.spec.js`.
- Existe el comando `test:all`.
- La cobertura y el número de tests verdes **no se declaran como actuales** sin ejecutar la suite sobre el commit de referencia.

## Estado de cumplimiento

| Área | Estado documental |
|---|---|
| Rendimiento | Implementación parcial; medición fresca pendiente |
| Usabilidad | Implementado en gran parte; auditoría completa pendiente |
| Seguridad | Controles implementados; no se presenta como auditoría de seguridad cerrada |
| Datos/resiliencia | Implementado con limitaciones explícitas |
| Escalabilidad/disponibilidad | No demostradas mediante carga/SLA propio |
| Mantenibilidad | Implementada y mejorable |
| Coste | Histórico/variable, no garantía |
| Testing | Infraestructura y suites existentes; resultado fresco pendiente |

*RNF reconciliados con el snapshot auditado en agosto de 2026.*
