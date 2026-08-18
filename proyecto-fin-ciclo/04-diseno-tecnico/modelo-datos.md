# Modelo de datos

## Estado actual

La implementación actual se apoya en **Supabase/PostgreSQL**. Firebase/Firestore forma parte de la evolución histórica y no debe mezclarse con el esquema vigente.

## Catálogo

### `products`

El código consulta, entre otros, estos campos:

- `id`
- `ref_fabricante`
- `name`
- `imagen`
- `marca`
- `brand_id`
- `familia`
- `subfamilia`
- `tipo`
- `precio`
- `Gama`
- `Subgama`
- `pdf_url`

La navegación no presupone un único árbol rígido. `catalogService.ts` permite combinar familia, marca, subfamilia/tipo y filtros comerciales según los datos disponibles.

### `brands`

Asocia identificadores de fabricante con su nombre. El servicio mantiene cachés en memoria para resolver nombres/IDs sin repetir consultas innecesarias.

### `vw_unique_families`

Vista utilizada por `getCategorias()` para recuperar familias únicas sin descargar todo el catálogo.

## Datos de usuario

`useUserData` trabaja con una tabla `user_data` con la identidad del usuario, módulo, clave y contenido serializable. El acceso remoto se combina con respaldo local para mejorar continuidad y migrar datos previos.

La seguridad efectiva de esa tabla depende de las políticas RLS configuradas en el proyecto Supabase; la existencia del hook cliente no demuestra por sí sola que todas las políticas estén correctas.

## Estadísticas del catálogo

`getCatalogStats()` consulta recuentos de productos, marcas y familias. Por ello la memoria **no fija 4.689, 75.000 o 400.000 productos como constante**. Si se necesita el número para la defensa, debe obtenerse de esa fuente o de una consulta equivalente y fecharse.

## Tipos y validación

Parte del catálogo está tipada en TypeScript (`types/catalog.ts`) y los datos recuperados pasan por validadores del cliente. Esto reduce errores de forma, pero no convierte datos externos o generados por IA en información técnica verificada.

## Historia de migración

Firestore fue utilizado en etapas previas. La migración a Supabase se documenta como una decisión de arquitectura ya materializada en el código actual, no como trabajo futuro.
