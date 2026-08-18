# Diseño UI/UX

## Principios

La aplicación utiliza un sistema visual común basado en CSS Modules, variables CSS, layout compartido y componentes reutilizables. El objetivo es mantener consistencia entre siete herramientas con necesidades distintas.

## Estructura de interfaz

`AppShell` organiza la zona autenticada con navegación común y un `<Outlet>` para las rutas. El Dashboard Global funciona como entrada y cada herramienta mantiene su propia interfaz dentro del mismo sistema.

## Sistema de diseño

Las fuentes canónicas de colores, espaciado, radios, tipografía y tema son los archivos de estilos del repositorio, especialmente `app/src/styles/variables.css` y los módulos CSS de cada componente. Este documento evita duplicar todos los valores para que no quede desactualizado si cambia el diseño.

### Componentes recurrentes

- botones con variantes de acción;
- inputs/selects;
- tarjetas y badges;
- breadcrumbs y layouts de selección;
- estados de carga, vacío y error;
- tablas/listados;
- gráficos mediante Recharts en los módulos que lo requieren.

## Tema

Existe soporte de tema claro/oscuro a través del contexto de tema y variables CSS. Las capturas versionadas del capítulo 08 incluyen evidencia visual de ambos estados.

## Responsive

La UI incluye comportamiento adaptativo y existe una auditoría Playwright/responsive en el repositorio. No se afirma cumplimiento perfecto en todos los dispositivos sin ejecutar una validación fresca.

## Teclado

El shell define atajos globales:

- `Ctrl/Cmd + 1…7`: navegar a las herramientas;
- `Ctrl/Cmd + B`: alternar sidebar;
- `Ctrl/Cmd + K`: búsqueda global cuando corresponde;
- `?`: ayuda de atajos;
- `Esc`: cerrar la ayuda de atajos.

Los manuales no inventan atajos distintos por módulo si no existen en el código.

## Accesibilidad

El código contiene elementos semánticos, labels/roles ARIA y soporte de teclado en varios componentes. Eso constituye trabajo de accesibilidad, pero **no equivale a certificar cumplimiento WCAG AA**. Para hacer esa afirmación se necesitaría una auditoría específica, reproducible y fechada.

## Criterio de evolución

Los cambios visuales deben preservar consistencia, legibilidad y comportamiento responsive sin convertir un ajuste cosmético en un refactor funcional.

*Diseño reconciliado — agosto de 2026.*
