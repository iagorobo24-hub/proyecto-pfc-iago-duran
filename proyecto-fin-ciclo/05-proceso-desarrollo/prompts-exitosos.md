# Patrones de prompts que funcionaron

Este documento no pretende coleccionar “prompts mágicos”. Resume patrones que mejoraron el trabajo porque hacían explícitos objetivo, evidencia y criterios de cierre.

## 1. Análisis antes de modificar

```text
Analiza primero el código y la documentación relacionados con [problema].
Distingue lo verificado de lo supuesto. No modifiques nada todavía.
Entrega causa probable, archivos implicados y validaciones necesarias.
```

**Por qué funcionó:** evita que el agente salte directamente a una solución basada en una hipótesis.

## 2. Cambio acotado

```text
Objetivo: [resultado observable].
Alcance autorizado: [archivos/capa].
Fuera de alcance: [refactors/features].
Respeta los contratos existentes y no debilites tests.
Después ejecuta [validaciones] y revisa el diff.
```

## 3. Auditoría

```text
Revisa [área] sin modificar código.
Para cada hallazgo indica evidencia, impacto y si es fallo confirmado,
riesgo plausible o falta de evidencia. No inventes resultados de tests.
```

## 4. Documentación sincronizada

```text
Contrasta la documentación con el código actual.
Corrige únicamente afirmaciones desactualizadas.
Las métricas variables deben llevar fecha/método o eliminarse.
Separa historia del proyecto de estado actual.
```

## 5. Salida estructurada de un modelo

Para datos de aplicación, el prompt puede pedir JSON, pero **el prompt no es una garantía**.

```text
Devuelve únicamente un objeto JSON que siga este esquema: [...].
Si falta un dato, usa null y no lo inventes.
```

Después, el código debe parsear y validar la estructura. Si el dato es crítico (por ejemplo una especificación eléctrica o una norma), además debe contrastarse con una fuente autorizada.

## Patrón que ya no se recomienda

Se elimina como buena práctica cualquier prompt del tipo:

```text
Busca mentalmente la ficha, normativa o URL del fabricante y complétala.
```

Un modelo puede fabricar especificaciones, normas o enlaces plausibles. Para enriquecimiento técnico, el orden seguro es:

1. usar datos reales disponibles;
2. pedir al modelo que explique o estructure esos datos;
3. validar el esquema;
4. mostrar claramente qué contenido es generado;
5. remitir a la documentación oficial para decisiones reales.

## Criterios de un buen prompt de ingeniería

- objetivo observable;
- contexto suficiente;
- restricciones y exclusiones;
- contrato de entrada/salida;
- validaciones;
- acciones Git permitidas;
- condiciones de parada;
- informe final con resultados reales y limitaciones.

La calidad no depende solo de cómo se redacta el prompt, sino de cómo se verifica el trabajo después.
