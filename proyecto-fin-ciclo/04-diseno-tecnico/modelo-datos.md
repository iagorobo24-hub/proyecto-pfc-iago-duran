# Modelo de Datos — Cómo se guarda todo

## La historia de los datos

El modelo de datos fue cambiando según evolucionaba el proyecto:

1. **Al principio:** Los datos estaban en archivos JavaScript dentro de la propia web. Había unos 120 productos de prueba. Funcionaba para hacer pruebas pero no valía para producción.
2. **Después:** Migré todo a Firestore (una base de datos NoSQL de Google). Ahí estaban los 400.000+ productos del catálogo real y los datos de usuario.
3. **Ahora:** El **catálogo** está en **Supabase (PostgreSQL)** — tablas `products` y `brands`. Los **datos de usuario** (fichas guardadas, presupuestos, incidencias, KPIs, formación) siguen en **Firestore** (colecciones por usuario).

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

Servicio principal: `app/src/services/catalogService.js`
- `getCategorias()` — Familias únicas con productos
- `getMarcasPorCategoria(familia)` — Marcas que tienen productos en una familia
- `getGamasPorMarcaYCategoria(marca, familia)` — Gamas/subfamilias para legacy
- `getSubfamiliasConTipos(marca, familia)` — Pares (subfamilia, tipo) para DP agrupado
- `getProductosPorSubcategoria(familia, marca, filtros)` — Productos por subcategoría
- `getProductosPorFiltro(familia, marca, gama, tipo)` — Productos por filtro exacto
- `getProductoPorRef(ref)` — Producto por referencia única
- `buscarProductos(termino)` — Búsqueda por nombre

### Categorización en frontend (`categoriaMapping.js`)

Para DISTRIBUCION DE POTENCIA, el mapeo `subfamilia+tipo → (categoria, subcategoria)` está en el frontend:

| Categoría | Subcategorías | Icono |
|-----------|---------------|-------|
| **Protección** | Magnetotérmico modular, MCCB, Diferencial, Sobretensión, Fusibles | 🛡️ |
| **Seccionamiento** | Seccionador, Seccionador CC, Interruptor CC | 🔌 |
| **Accesorios** | Rearme, Control aislamiento, Cajas, Pilotaje, Medida, Distribución, Conmutación, Tomas, Fuentes, Señalización | 🔧 |
| **Control Motor** | Contactor, Relés y control, Pulsadores | ⚙️ |

---

## Firestore: datos de usuario (legado)

Los datos que genera cada usuario al usar las herramientas siguen en Firestore. La estructura es:

### Colección `users/{userId}/fichas`
Fichas técnicas guardadas por el usuario.

### Colección `users/{userId}/presupuestos`
Presupuestos creados:
```
items: [
    { ref: "A9F74110", name: "Interruptor...", cantidad: 5, precio: 25.50 }
]
subtotal: 127.50
iva: 21
total: 154.28
estado: "borrador"              ← borrador / enviado / aceptado
```

### Colección `users/{userId}/incidencias`
Incidencias registradas:
```
titulo: "Producto defectuoso"
descripcion: "El producto llegó dañado..."
categoria: "calidad"             ← calidad / logistica / producto
severidad: "alto"                ← bajo / medio / alto / critico
estado: "abierta"                ← abierta / en_proceso / resuelta
```

### Colección `users/{userId}/kpis`
Configuración de KPIs y valores guardados por el usuario.

### Colección `users/{userId}/formacion`
Matriz de competencias y planes de formación.

Cada usuario solo ve sus propios datos (controlado por `firestore.rules`).

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

| Aspecto | Catálogo (Supabase) | Datos usuario (Firestore) |
|---------|--------------------|---------------------------|
| **Tipo** | SQL (PostgreSQL) | NoSQL |
| **Tablas** | products, brands | users/{uid}/colecciones |
| **Búsqueda** | ilike + OR conditions | Limitada |
| **Auth** | Supabase OAuth | — |
| **Estado** | ✅ Producción | ⏳ Legacy (pendiente migrar) |

---

*Para más detalle técnico, ver [DB_TAXONOMY.md](../../DB_TAXONOMY.md).*
