# Presentación de las herramientas de la aplicación

La suite reúne **7 herramientas funcionales** bajo un mismo `AppShell` y un **Dashboard Global**. La enumeración siguiente corresponde a las rutas definidas en `app/src/App.jsx`.

| Herramienta | Ruta | Función actual |
|---|---|---|
| Fichas Técnicas | `/app/fichas` | Explorar y buscar catálogo, abrir fichas y consultar enriquecimiento asistido por IA |
| Simulador Almacén | `/app/almacen` | Entrenar el ciclo recepción → ubicación → picking → verificación → expedición |
| Incidencias | `/app/incidencias` | Registrar, filtrar, diagnosticar y seguir incidencias; exportar informe PDF |
| KPI Logístico | `/app/kpi` | Calcular seis indicadores operativos, guardar histórico, visualizar y exportar |
| Presupuestos | `/app/presupuestos` | Seleccionar productos, editar presupuesto, calcular IVA, guardar y generar PDF |
| Formación Interna | `/app/formacion` | Gestionar empleados, módulos, progreso, alertas y plan asistido por IA |
| SONEX | `/app/sonex` | Consultar el catálogo y cuestiones técnicas mediante un asistente conversacional |

El Dashboard Global (`/app`) resume y enlaza estas herramientas. No se cuenta como módulo funcional independiente para evitar la antigua contradicción entre “7” y “8” módulos.

## Elementos transversales

- Autenticación mediante Supabase y `ProtectedRoute` para el área privada.
- Persistencia híbrida en varios módulos mediante `useUserData` (Supabase + respaldo local).
- Tema claro/oscuro y navegación común.
- Atajos globales (`Ctrl/Cmd + 1…7`, `Ctrl/Cmd + B`, `Ctrl/Cmd + K` y `?`).
- Gateway `/api/ai` para las llamadas de IA.
- Generación de PDF en los módulos que la implementan.

## Sobre la IA

No todas las herramientas usan el mismo modelo. El proveedor/modelo es una decisión técnica configurable por módulo y por el gateway. Por ello la memoria evita frases como “la aplicación usa Claude” o “todo funciona con un único modelo gratuito”.

## Alcance de las recomendaciones técnicas

Las funciones de IA son de apoyo. Una respuesta sobre normativa, seguridad eléctrica, sección de conductores, compatibilidad, mantenimiento o instalación debe verificarse contra documentación oficial y criterio profesional antes de aplicarse en un entorno real.
