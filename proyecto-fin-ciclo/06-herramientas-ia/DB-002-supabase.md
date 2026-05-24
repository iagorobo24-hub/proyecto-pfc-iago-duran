---
tool_id: DB-002
nombre: Supabase
version_observada: 2025-2026 (migración completada)
rol_principal: Base de datos PostgreSQL (catálogo de productos) + Autenticación
url: https://supabase.com
---
Supabase es una plataforma open-source que proporciona una API sobre PostgreSQL. Incluye autenticación, base de datos, storage, edge functions y más. Es similar a Firebase pero con base de datos relacional en lugar de NoSQL.

## ¿Para qué lo usé?

Supabase es el **backend principal** del proyecto en su versión actual:

1. **Base de datos PostgreSQL** — Catálogo de productos en tablas `products` y `brands`
2. **Autenticación** — Google OAuth (reemplazó a Firebase Auth)
3. **API REST** — Cliente `@supabase/supabase-js` desde el frontend con anon key

### Migración desde Firestore

El catálogo se migró de Firestore a Supabase por estas razones:

1. **Problemas con Firestore:**
   - Límite de 50K escrituras/día (insuficiente para catálogo de 75K productos)
   - Sin búsqueda full-text (tuve que generar keywords manuales)
   - Queries limitadas (no hay joins ni queries complejas)

2. **Ventajas de Supabase para este proyecto:**
   - PostgreSQL con consultas flexibles (`ilike`, `.or()`, joins)
   - Límites más generosos en plan gratuito (500MB DB, 1GB storage)
   - SQL permite queries complejas
   - Row Level Security (RLS) similar a Firebase Rules

## Estado actual

### ✅ Migración completada

- ✅ Catálogo en Supabase: tablas `products` (~2.400 productos) y `brands`
- ✅ Autenticación: Supabase Auth con Google OAuth
- ✅ Frontend conectado: `catalogService.js` usa `@supabase/supabase-js`
- ✅ Dual navigation: agrupación por categoría (categoriaMapping.js) para DP
- ❌ Datos de usuario: siguen en Firestore (pendiente migrar)

### Tablas en Supabase

**products** — Catálogo de productos:
| Columna | Tipo | Uso |
|---------|------|-----|
| `id` | serial | PK |
| `ref_fabricante` | text | Referencia única |
| `name` | text | Nombre del producto |
| `familia` | text | Categoría principal |
| `subfamilia` | text | Tipo funcional |
| `tipo` | text | Formato físico |
| `marca` | text | Fabricante |
| `brand_id` | int4 | FK → brands |
| `precio` | numeric | Precio |
| `Gama` / `Subgama` | text | Gama comercial |

**brands** — Marcas/fabricantes:
| Columna | Tipo |
|---------|------|
| `id` | int4 (PK) |
| `name` | text |
| `website_url` | text |

### Servicio frontend

`app/src/services/catalogService.js` — 10 métodos:
- `getCategorias()` — Familias únicas con paginación
- `getMarcasPorCategoria(familia)` — Marcas por familia
- `getGamasPorMarcaYCategoria(marca, familia)` — Gamas (legacy)
- `getSubfamiliasConTipos(marca, familia)` — Pares (subfamilia,tipo) para DP
- `getProductosPorSubcategoria(familia, marca, filtros)` — Productos por subcategoría
- `getProductosPorFiltro(familia, marca, gama, tipo)` — Productos por filtro exacto
- `getProductoPorRef(ref)` — Producto por referencia
- `buscarProductos(termino)` — Búsqueda por nombre
2. Crear nuevo proyecto
3. Obtener URL y anon key

### 2. Definir esquema (PostgreSQL)

```sql
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  ref VARCHAR(50) UNIQUE NOT NULL,
  ref_Proyecto PFC VARCHAR(50),
  nombre TEXT NOT NULL,
  marca VARCHAR(100),
  familia VARCHAR(100),
  gama VARCHAR(100),
  tipo VARCHAR(100),
  precio DECIMAL(10,2),
  pvp DECIMAL(10,2),
  stock INTEGER DEFAULT 0,
  pdf_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Búsqueda full-text
ALTER TABLE products ADD COLUMN search_vector tsvector;
CREATE INDEX idx_products_search ON products USING GIN(search_vector);

-- Función para actualizar search_vector
CREATE OR REPLACE FUNCTION update_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('spanish', COALESCE(NEW.nombre, '') || ' ' || COALESCE(NEW.marca, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_search_update
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_search_vector();
```

### 3. Row Level Security (RLS)

```sql
-- Catálogo público
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read products" ON products FOR SELECT USING (true);

-- Datos de usuario (privados)
CREATE TABLE user_data (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  module VARCHAR(50),
  data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own data" ON user_data
  FOR ALL USING (auth.uid() = user_id);
```

## Costes

| Plan | Precio | Límites |
|------|--------|---------|
| **Free** | 0€ | 500MB DB, 1GB storage, 50K usuarios, 2GB bandwidth |
| Pro | €$ | 8GB DB, 100GB storage, ilimitado |

**Coste real:** 0€ (plan gratuito suficiente)

## Comparativa con Firestore

| Aspecto | Firestore | Supabase |
|---------|-----------|----------|
| Tipo | NoSQL documento | SQL relacional |
| Búsqueda full-text | ❌ Manual (keywords) | ✅ Native (`tsvector`) |
| Queries complejas | ❌ Limitadas | ✅ SQL completo |
| Límite lecturas (free) | 50K/día | Ilimitado |
| Límite escrituras (free) | 50K/día | 50K/día |
| Autenticación | ✅ Google, etc. | ✅ Multiple |
| Storage (free) | 1GB | 1GB |
| Open source | ❌ | ✅ |

## Scripts creados (pendientes de usar)

| Script | Función |
|--------|---------|
| `verify-data.mjs` | Verificar productos en Supabase |
| `debug-supabase.mjs` | Análisis de esquema |
| `supabase-analyze.mjs` | Rendimiento de queries |
| `sync-catalog-to-supabase.mjs` | Sincronizar catálogo |
| `apply-schema.mjs` | Crear tablas |

## Próximos pasos

1. Desplegar el esquema en Supabase
2. Ejecutar script de sincronización del catálogo
3. Modificar `catalogService.js` para usar Supabase en lugar de Firestore
4. Mantener Firebase Auth (o migrar a Supabase Auth)

## Lecciones aprendidas (pre-migración)

1. **PostgreSQL > NoSQL para datos estructurados:** Un catálogo de productos tiene relaciones naturales (familia → marca → producto).
2. **La búsqueda full-text cambia todo:** Ya no necesitas generar keywords manualmente.
3. **SQL es más difícil pero más potente:** Tienes que aprender SQL, pero las queries son mucho más flexibles.

## Referencias

- [Supabase](https://supabase.com)
- [Documentación](https://supabase.com/docs)
- [pgvector (búsqueda semántica)](https://supabase.com/docs/guides/database/vectors)

---

**Fecha de elaboración de esta ficha:** Abril 2026
**Estado:** Migración en desarrollo