# Resultados cuantitativos — contrato de evidencia

## Principio

Las métricas de un proyecto cambian con cada commit. Este capítulo deja de congelar números incompatibles de productos, tests, cobertura, bundle o Lighthouse sin su evidencia asociada.

## Métricas estructurales verificadas en el snapshot documental

| Métrica | Evidencia |
|---|---|
| Herramientas funcionales | 7 rutas de herramienta en `app/src/App.jsx` |
| Dashboard Global | ruta índice de `/app` |
| Etapas del Simulador | 5 en `app/src/data/simulador/simuladorData.js` |
| KPIs logísticos | 6 definidos en `app/src/tools/KpiLogistico.jsx` |
| Modos de SONEX | 4 definidos en `app/src/tools/Sonex.jsx` |
| Testing unitario | suites presentes en `app/src/__tests__/` y script `npm run test` |
| Testing E2E | múltiples `.spec.js` presentes en `app/e2e/` y script `npm run test:e2e` |

## Métricas que requieren ejecución o consulta fresca

### Tests

Para publicar “N tests pasan” se debe ejecutar, sobre el commit que se entrega:

```bash
cd app
npm run test
npm run test:e2e
```

El informe debe guardar fecha, commit, comando, código de salida y resumen. La reconciliación documental hecha desde GitHub verifica la **existencia** de las suites, no su estado de ejecución.

### Catálogo

El número de productos, marcas y familias debe obtenerse del backend. El servicio dispone de `getCatalogStats()`; cifras históricas distintas no se presentan como actuales.

### Rendimiento

FCP, LCP, CLS, tamaño de bundle o puntuaciones Lighthouse solo se publican con un informe asociado a una URL/commit, condiciones de prueba y fecha.

### Coste y consumo

Tokens, bandwidth, almacenamiento, invocaciones y costes pertenecen a la cuenta de cada proveedor y necesitan un snapshot fechado.

## Conclusión

El proyecto tiene mecanismos para medir calidad y operación, pero la memoria diferencia **estructura verificable** de **resultado medido**. Esto evita convertir cifras antiguas en evidencia actual.

*Contrato cuantitativo reconciliado — agosto de 2026.*
