# Lecciones aprendidas

## Planificar lo suficiente antes de generar código

Los primeros prototipos aislados permitieron validar ideas, pero aumentaron el coste de integración posterior. La lección no es evitar prototipos, sino definir desde el inicio qué será desechable y qué contrato deberá respetar la versión integrada.

## Las credenciales privadas no pertenecen al frontend

En una etapa temprana se expuso una clave de API. La corrección fue introducir una función serverless que conserva la credencial en variables de entorno. La configuración pública de ciertos SDK no debe confundirse con secretos privados.

## Los tests forman parte del producto

Hubo una fase histórica en la que pruebas E2E se perdieron o quedaron desalineadas. El repositorio actual vuelve a contener Vitest y Playwright. La lección es mantener las pruebas versionadas, ejecutarlas después de cambios relevantes y no citar cifras antiguas como resultado actual.

## Verificar el contrato de los datos

Uno de los bugs de enriquecimiento IA estuvo relacionado con la forma esperada por un validador/parser. La corrección de un bug concreto no justifica eliminar la validación como regla general.

**Regla actual:**

`modelo genera → parser interpreta → esquema/contrato valida → fuente oficial verifica los datos críticos → UI consume`

Un *system prompt* puede mejorar el formato esperado, pero **no garantiza JSON válido ni verdad factual**.

## Diferenciar fuente real de contenido generado

Para fichas, normativa o instalación eléctrica, una respuesta del modelo no es una fuente técnica. Referencias, características, certificados, manuales y recomendaciones de seguridad deben provenir del catálogo o de documentación oficial cuando la decisión tenga consecuencias reales.

## Los datos son más difíciles que la interfaz

La extracción, limpieza, taxonomía y consulta del catálogo exigieron más iteración de la prevista. Supabase y las vistas/consultas optimizadas resolvieron parte del problema, pero la cifra de productos sigue siendo un dato de base de datos que debe medirse, no repetirse desde documentos antiguos.

## Las herramientas cambian

Durante el PFC cambiaron agentes, modelos, planes y accesos gratuitos. Por eso las fichas del capítulo 06 documentan **uso histórico** y evitan prometer que una herramienta seguirá siendo gratuita o ilimitada.

## Validar con usuarios

El proyecto obtuvo requisitos y contexto del entorno de prácticas, pero la validación de producto con usuarios reales fue limitada. Una demo o una conversación sobre necesidades no equivale a un estudio de usabilidad ni a validación masiva.

## Documentar con evidencia

Git, commits y documentación ayudan a reconstruir decisiones, pero un documento escrito por un agente no se considera automáticamente cierto. Las afirmaciones importantes se contrastan con código, configuración, pruebas o una fuente externa fechada.

## Síntesis

La IA fue útil como acelerador de análisis, implementación y documentación. El trabajo evaluable sigue siendo la capacidad de **definir, revisar, probar, corregir y explicar** el sistema.
