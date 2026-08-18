# Manual de usuario — SONEX

## Objetivo

SONEX es un asistente técnico conversacional integrado con el catálogo. Combina contexto del repositorio de productos con un modelo de IA a través del gateway `/api/ai`.

## Acceso

Ruta: `/app/sonex`.

## Modos actuales

SONEX ofrece **cuatro modos**:

| Modo | Finalidad |
|---|---|
| **Búsqueda** | Localizar referencias y especificaciones |
| **Comparativa** | Comparar opciones y diferencias |
| **Asistencia** | Orientar selección y compatibilidad |
| **Formación** | Explicar conceptos, instalación y uso |

## Conversación e historial

El módulo mantiene sesiones de conversación. Se pueden crear, cambiar y eliminar sesiones. Para cada turno utiliza contexto reciente y, cuando procede, resultados reales de catálogo.

## Productos y referencias

SONEX dispone de flujos específicos para buscar productos y mostrar tarjetas de resultados. Cuando detecta una referencia en texto, la valida contra el catálogo antes de tratarla como producto existente.

Desde una referencia validada se puede:

- abrir Fichas Técnicas;
- añadir el producto a un presupuesto;
- copiar la referencia.

## Modelo de IA

No existe un modelo permanente que pueda documentarse como “el modelo de SONEX” para siempre. En el snapshot reconciliado del repositorio, SONEX solicita `google/gemini-2.5-flash` y el gateway dispone de modelos alternativos/fallbacks. Esta selección puede cambiar con el código.

## Límites de seguridad

SONEX puede equivocarse. Las respuestas sobre normativa, sección de conductores, protecciones, compatibilidad, instalación o seguridad **deben verificarse con normativa vigente, documentación oficial del fabricante y criterio profesional**. La instrucción del prompt de “no inventar” reduce riesgo, pero no garantiza exactitud.

La versión actual no documenta una exportación de conversación a PDF porque esa función no forma parte del componente verificado.

## Atajos globales

Los atajos pertenecen al shell de la aplicación: `Ctrl/Cmd+1…7` navega entre herramientas, `Ctrl/Cmd+B` alterna la barra lateral, `Ctrl/Cmd+K` activa búsqueda global y `?` abre la ayuda de atajos cuando el foco no está en un campo de texto.

*Manual reconciliado con la implementación del repositorio — agosto de 2026.*
