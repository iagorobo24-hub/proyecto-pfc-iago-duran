# Manual de usuario — KPI Logístico

## Objetivo

Calcular indicadores de un turno logístico a partir de datos introducidos por el usuario. Los valores de ejemplo no son datos reales de una delegación.

## Acceso

Ruta: `/app/kpi`.

## Datos de entrada

El formulario solicita, entre otros:

- pedidos completados;
- horas de turno;
- operarios;
- líneas expedidas;
- errores de picking;
- tiempo de ciclo medio;
- ubicaciones ocupadas y totales;
- devoluciones;
- turno y delegación.

Los campos mínimos para calcular son pedidos, horas y líneas expedidas.

## Seis KPIs actuales

| KPI | Cálculo/uso |
|---|---|
| Pedidos/hora | Pedidos completados / horas |
| Error de picking | Errores / líneas expedidas × 100 |
| Tiempo de ciclo | Valor medio introducido |
| Ocupación | Ubicaciones ocupadas / totales × 100 |
| Devoluciones | Devoluciones / líneas expedidas × 100 |
| Productividad | Relación de pedidos, operarios y horas frente a la capacidad de referencia del simulador |

Cada KPI se representa con un semáforo según los benchmarks definidos en el código del módulo.

## Informe IA y gráficos

Después del cálculo, el módulo puede solicitar a la IA un resumen del turno. También muestra una comparativa de valores y un histórico de pedidos/hora.

El informe IA es explicativo; no sustituye un sistema BI ni una medición corporativa validada.

## Historial y PDF

Los cálculos se conservan en un historial limitado y el resultado actual puede exportarse a PDF.

*Manual reconciliado con la implementación del repositorio — agosto de 2026.*
