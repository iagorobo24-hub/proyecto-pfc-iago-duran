# Manual de usuario — Presupuestos

## Objetivo

Crear y guardar presupuestos académicos a partir del catálogo disponible. El módulo no sustituye un sistema comercial/ERP ni garantiza que los precios sean tarifas oficiales vigentes.

## Acceso

Ruta: `/app/presupuestos`.

## Flujo

1. Crear un presupuesto nuevo.
2. Buscar un producto por referencia o nombre, o navegar por categorías.
3. Añadir productos desde el catálogo o recibirlos desde Fichas/SONEX.
4. Editar partidas y datos del cliente.
5. Revisar base, IVA configurado y total.
6. Guardar el presupuesto.
7. Generar la vista PDF cuando corresponda.

El módulo genera un número de presupuesto local y conserva un historial limitado.

## Búsqueda

La barra lateral empieza a buscar al introducir al menos dos caracteres. Los resultados muestran referencia, nombre y marca; Enter selecciona el primer resultado cuando hay sugerencias.

## Cálculos

Los importes se calculan a partir de las partidas y del porcentaje de IVA configurado en los datos del presupuesto. No se debe interpretar un precio de catálogo como oferta contractual sin validación comercial.

## Gestión

La vista de gestión permite recuperar y eliminar presupuestos guardados. Al cargar uno se restauran sus partidas y datos en el editor.

## Integración con otros módulos

Fichas Técnicas y SONEX pueden abrir el editor de Presupuestos con una referencia preseleccionada.

*Manual reconciliado con la implementación del repositorio — agosto de 2026.*
