# Modelo de Datos

## Visión general

El modelo de datos ha evolucionado durante el proyecto:
- **Inicial:** Arrays JavaScript en el frontend (mock data)
- **Actual:** Firestore con sincronización desde scraping
- **Futuro:** Supabase (PostgreSQL)

Este documento describe el modelo actual en Firestore.

---

## Colecciones

### Colección: `productos`

Catálogo de productos sincronizado desde scraping de sonepar.es.

```javascript
{
  ref_fabricante: "ABCC123456",      // Referencia del fabricante
  name: "Interruptor automático 10A", // Nombre del producto
  familia: "Protecciones",           // Familia principal
  subfamilia: "Interruptores",       // Subfamilia (gama)
  tipo: " magnetotérmico",            // Tipo específico
  marca: "Schneider",                // Marca
  marca_id: "schneider_electric",    // ID de marca (para filtros)
  desc: "Descripción técnica...",    // Descripción
  precio: null,                      // No disponible (preguntar)
  image: "https://...",              // URL de imagen
  url: "https://sonepar.es/...",     // Enlace a producto
  keywords: ["interruptor", "10a", ...], // Búsqueda texto
  lastUpdated: timestamp
}
```

**Índices:**
- `familia` + `marca` + `subfamilia` (compuesto)
- `keywords` (array contains)

---

### Colección: `usuarios`

Perfiles de usuario (creados automáticamente en login).

```javascript
{
  uid: "google_123456789",           // ID de Firebase
  email: "usuario@gmail.com",        // Email
  displayName: "Juan Pérez",         // Nombre completo
  photoURL: "https://...",           // Foto de perfil
  createdAt: timestamp,
  role: "user",                      // user | admin
  preferencias: {
    tema: "dark",                    // dark | light
    idioma: "es"
  }
}
```

---

### Colección: `presupuestos`

Presupuestos guardados por usuario.

```javascript
{
  usuario_id: "google_123456789",
  items: [
    {
      ref_fabricante: "ABCC123456",
      name: "Interruptor automático 10A",
      cantidad: 5,
      precio_unitario: 25.50
    }
  ],
  subtotal: 127.50,
  iva: 21,
  total: 154.28,
  createdAt: timestamp,
  estado: "borrador" | "enviado" | "aceptado"
}
```

---

### Colección: `incidencias`

Registro de incidencias por usuario.

```javascript
{
  usuario_id: "google_123456789",
  titulo: "Producto defectuoso",
  descripcion: "El producto llegó dañado...",
  categoria: "calidad",              // calidad | logistica | producto
  severidad: "alto",                 // bajo | medio | alto | critico
  estado: "abierta",                 // abierta | en_proceso | resuelta
  createdAt: timestamp,
  updatedAt: timestamp,
  resueltaPor: "google_987654321",
  resolucion: "Producto cambiado..."
}
```

---

### Colección: `formacion`

Seguimiento de formación por usuario.

```javascript
{
  usuario_id: "google_123456789",
  curso_id: "curso_001",
  estado: "completado",              // no_iniciado | en_curso | completado
  fecha_inicio: timestamp,
  fecha_fin: timestamp,
  nota: 85
}
```

---

## Datos no sincronizados (locales)

### hierarchy.json

Archivo local con la jerarquía de familias/marcas/gamas:

```javascript
{
  familias: [
    {
      id: "iluminacion",
      nombre: "Iluminación",
      marcas: [
        {
          id: "philips",
          nombre: "Philips",
          gamas: [
            { id: "led", nombre: "LED" },
            { id: "convencional", nombre: "Convencional" }
          ]
        }
      ]
    }
  ]
}
```

**Uso:** Navegación en Fichas Técnicas, filtros de catálogo.

---

### catalogoSonepar.js

Archivo legacy con productos mock (120 referencias originales).

```javascript
export const productosSonepar = [
  {
    ref: "ABB123",
    name: "Interruptor automático...",
    marca: "ABB",
    familia: "Protecciones",
    precio: 15.99
  },
  // ... 120 productos
]
```

**Uso:** Solo en desarrollo, reemplazado por Firestore.

---

## Modelo de datos en Supabase (futuro)

### Tabla: products

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ref_fabricante VARCHAR(50) UNIQUE,
  name TEXT NOT NULL,
  familia VARCHAR(100),
  subfamilia VARCHAR(100),
  tipo VARCHAR(100),
  marca VARCHAR(100),
  brand_id UUID REFERENCES brands(id),
  description TEXT,
  image_url TEXT,
  product_url TEXT,
  keywords TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para búsqueda
CREATE INDEX idx_products_familia ON products(familia);
CREATE INDEX idx_products_marca ON products(marca);
CREATE INDEX idx_products_brand ON products(brand_id);
CREATE INDEX idx_products_keywords ON products USING GIN(keywords);
```

### Tabla: brands

```sql
CREATE TABLE brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  slug VARCHAR(100) UNIQUE,
  logo_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Tabla: users (usando Supabase Auth)

```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  display_name TEXT,
  photo_url TEXT,
  role VARCHAR(20) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Comparativa: Firestore vs Supabase

| Aspecto | Firestore | Supabase |
|---------|-----------|----------|
| **Tipo** | NoSQL | Relacional (PostgreSQL) |
| **Schema** | Flexible | Estricto |
| **Búsqueda texto** | Limitada | Full-text search |
| **Límite escrituras** | 50K/día (Spark) | 500MB storage |
| **Join** | No nativo | Sí |
| **Coste** | Spark gratis | Gratis |

**Conclusión:** Supabase es mejor para este caso de uso.

---

*Modelo de datos documentado: Mayo 2026*
*Ver también: scripts de sincronización en app/scripts/*
