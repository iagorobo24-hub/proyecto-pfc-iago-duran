# Manual de usuario — Fichas Técnicas

## Objetivo

El módulo permite localizar y consultar productos del catálogo conectado a Supabase. La cantidad de productos es un dato de base de datos y **no se fija en este manual**.

## Acceso

Ruta: `/app/fichas`.

## Formas de localizar un producto

### Navegación por catálogo

La interfaz guía al usuario por los niveles disponibles en los datos: familia/categoría, marca, subfamilia o grupo, tipo y, cuando procede, gama comercial y subgama. La profundidad exacta depende del producto y de la taxonomía disponible.

El breadcrumb permite volver a niveles anteriores sin reiniciar toda la navegación.

### Búsqueda

La barra lateral permite buscar por nombre o referencia. Una referencia recibida en la URL mediante `?ref=...` también puede abrirse directamente si existe en catálogo.

## Ficha de producto

La ficha usa datos del catálogo para mostrar, según disponibilidad:

- nombre y referencia de fabricante;
- marca y clasificación;
- imagen;
- precio si existe;
- URL de ficha/PDF cuando forma parte del registro;
- información adicional generada por IA.

El usuario puede copiar una referencia y enviar un producto al editor de Presupuestos.

## Enriquecimiento con IA

El enriquecimiento generado por IA es **información auxiliar**, no una fuente técnica oficial. Puede ser incompleto o incorrecto. Para normativa, características eléctricas, compatibilidad, instalación, certificaciones o seguridad se debe contrastar la respuesta con documentación del fabricante y fuentes normativas vigentes.

Un prompt no garantiza que una especificación, norma o URL generada sea verdadera.

## Si no aparecen resultados

- reducir la búsqueda a nombre o referencia;
- comprobar que la familia/marca seleccionada contiene datos;
- volver un nivel mediante el breadcrumb;
- recordar que la aplicación depende de la disponibilidad del backend para consultar el catálogo real.

*Manual reconciliado con la implementación del repositorio — agosto de 2026.*
