# Modelo de Datos — Cómo se guarda todo

## La historia de los datos

El modelo de datos fue cambiando según evolucionaba el proyecto:

1. **Al principio:** Los datos estaban en archivos JavaScript dentro de la propia web. Había unos 120 productos de prueba. Funcionaba para hacer pruebas pero no valía para producción.
2. **Después:** Migré todo a Firestore (una base de datos NoSQL de Google). Ahí estaban los 400.000+ productos del catálogo real y los datos de usuario.
3. **Ahora:** El **catálogo** está en **Supabase (PostgreSQL)** — tablas `products` y `brands`. Los **datos de usuario** (fichas guardadas, presupuestos, incidencias, KPIs, formación) se almacenan en **localStorage** con sincronización a Supabase `user_data` table cuando hay sesión activa.

Este documento explica cómo está organizado todo en la versión actual.

---

## Supabase: el catálogo de productos

El catálogo vive en PostgreSQL. Dos tablas principales:

### Tabla `products`

```
id: 1                          ← Autonumérico (PK)
ref_fabricante: "A9F74110"     ← Referencia del fabricante (única, NOT NULL)
name: "Magnetotérmico, Acti9 iC60N, 1P, 6A, C curva"  ← Nombre completo
familia: "DISTRIBUCION DE POTENCIA"  ← Categoría principal (MAYÚSCULAS con _)
Gama: "Acti 9 iC60"            ← Gama comercial del fabricante (sin normalizar)
Subgama: "iC60N"               ← Subgama dentro de la gama
subfamilia: "Interruptor Magnetotérmico"  ← Tipo funcional (Capitalizado)
tipo: "CARRIL DIN"              ← Formato físico (MAYÚSCULAS)
marca: "Schneider Electric"     ← Nombre del fabricante
brand_id: 456                   ← FK → brands.id
precio: 14.50                   ← Precio unitario (puede ser null)
imagen: "https://..."           ← URL de imagen del producto
pdf_url: "https://..."          ← URL de ficha técnica PDF
documentos: [{"nombre": "...", "url": "..."}]  ← JSONB con enlaces adicionales
```

### Tabla `brands`

```
id: 456                         ← PK
name: "Schneider Electric"      ← Nombre de la marca
website_url: "https://www.se.com"  ← Web de la marca
```

### Acceso a los datos

La comunicación con Supabase se hace desde el frontend directamente (client-side) usando `@supabase/supabase-js`. Las consultas van con la **anon key** pública — la seguridad se gestiona con Row Level Security (RLS) en las tablas.

Servicio principal: `app/src/services/catalogService.ts`
- `getCategorias()` — Familias únicas con productos (1 query + Set dedup)
- `getMarcasPorCategoria(familia)` — Marcas que tienen productos en una familia
- `getGamasPorMarcaYCategoria(marca, familia)` — Gamas/subfamilias para legacy
- `getSubfamiliasConTipos(marca, familia)` — Pares (subfamilia, tipo) para DP agrupado
- `getProductosPorSubcategoria(familia, marca, filtros)` — Productos por subcategoría
- `getProductosPorFiltro(familia, marca, gama, tipo)` — Productos por filtro exacto
- `getProductoPorRef(ref)` — Producto por referencia única
- `buscarProductos(termino)` — Búsqueda por nombre con sanitización
- `buscarProductosConLimite(termino, limite)` — Búsqueda con límite configurable

### Categorización en frontend (`categoriaMapping.js`)

Para DISTRIBUCION DE POTENCIA, el mapeo `subfamilia+tipo → (categoria, subcategoria)` está en el frontend:

| Categoría | Subcategorías | Icono |
|-----------|---------------|-------|
| **Protección** | Magnetotérmico modular, MCCB, Diferencial, Sobretensión, Fusibles | 🛡️ |
| **Seccionamiento** | Seccionador, Seccionador CC, Interruptor CC | 🔌 |
| **Accesorios** | Rearme, Control aislamiento, Cajas, Pilotaje, Medida, Distribución, Conmutación, Tomas, Fuentes, Señalización | 🔧 |
| **Control Motor** | Contactor, Relés y control, Pulsadores | ⚙️ |

---

## Datos de usuario (localStorage + Supabase sync)

Los datos que genera cada usuario al usar las herramientas se almacenan en **localStorage** con la librería `useMemoriaUsuario` (custom hook). Cuando hay sesión activa, se sincronizan con la tabla `user_data` de Supabase.

### Estructura de datos por módulo

- **`pfc_fichas_historial`** — Fichas técnicas consultadas
- **`pfc_presupuestos_historial`** — Presupuestos creados
- **`pfc_incidencias_listado`** — Incidencias registradas
- **`pfc_kpi_historial`** — Resultados de KPIs calculados
- **`pfc_formacion_modulos`** — Módulos de formación
- **`pfc_formacion_empleados`** — Empleados y su progreso
- **`pfc_simulador_historial`** — Resultados del simulador
- **`pfc_analytics_events`** — Eventos de uso (analytics)

---

## Autenticación

**Supabase Auth** con Google OAuth:

```js
supabase.auth.signInWithOAuth({
  provider: 'google',
  options: { redirectTo: window.location.origin }
})
```

El estado de sesión se gestiona en `AuthContext.jsx` mediante:
- `supabase.auth.getSession()` — Recuperar sesión al cargar
- `supabase.auth.onAuthStateChange()` — Escuchar cambios en tiempo real
- `supabase.auth.signOut()` — Cerrar sesión

---

## Datos locales (frontend)

Algunos datos están directamente en el código del frontend:
- **categoriaMapping.js** — Mapeo subfamilia → categoria/subcategoria
- **categoryMapping.js** — Metadatos de familias (iconos, tips)
- **marcasLogos.js** — URLs de logos de fabricantes
- **hierarchy.json** — Árbol de navegación (legacy, ya no usado en producción)

---

## Comparativa rápida

| Aspecto | Catálogo (Supabase) | Datos usuario (Supabase) |
|---------|--------------------|---------------------------|
| **Tipo** | SQL (PostgreSQL) | SQL (PostgreSQL) |
| **Tablas** | `products`, `brands` | `user_data` |
| **Búsqueda** | `ilike` + `OR` + GIN Index | Clave exacta (`module` + `key`) |
| **Auth** | Supabase OAuth | Supabase OAuth |
| **Estado** | ✅ Producción | ✅ Producción ( localStorage offline fallback ) |

---

*Para más detalle técnico, ver [DB_TAXONOMY.md](../../DB_TAXONOMY.md).*
