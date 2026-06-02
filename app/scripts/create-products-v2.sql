-- TABLA products_v2: Catálogo limpio con 10 categorías finales
-- Reemplaza la tabla products actual con datos verificados

CREATE TABLE IF NOT EXISTS products_v2 (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  
  -- Identificación
  ref_fabricante TEXT,           -- Referencia del fabricante (puede ser NULL)
  name TEXT NOT NULL,            -- Nombre del producto
  brand_name TEXT,               -- Nombre de la marca (Schneider, ABB, etc.)
  
  -- Clasificación
  categoria TEXT NOT NULL CHECK (categoria IN (
    'Protecciones',
    'Autómatas',
    'Robótica',
    'Iluminación',
    'Climatización',
    'Cables',
    'Energías Renovables',
    'Vehículo Eléctrico',
    'Herramientas',
    'Interruptores y Mecanismos'
  )),
  subcategoria TEXT,             -- Subcategoría dentro de la categoría
  gama TEXT,                     -- Gama/serie del producto
  
  -- Datos técnicos (se pueblan con IA)
  descripcion TEXT,              -- Descripción técnica completa
  caracteristicas JSONB,         -- Array de características técnicas
  aplicaciones JSONB,            -- Array de aplicaciones típicas
  normas JSONB,                  -- Normas/certificaciones
  
  -- Multimedia
  image_url TEXT,                -- URL de la imagen
  manual_url TEXT,               -- URL del manual/ficha técnica
  fabricante_url TEXT,           -- URL de la página del fabricante
  
  -- Metadata
  verified BOOLEAN DEFAULT FALSE, -- Si ha sido verificado por IA
  source TEXT,                    -- Origen: 'scrape_sonepar', 'manual', etc.
  original_id BIGINT,             -- ID del producto original en products (para trazabilidad)
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para búsqueda rápida por categoría
CREATE INDEX IF NOT EXISTS idx_products_v2_categoria ON products_v2(categoria);

-- Índice para búsqueda por referencia
CREATE INDEX IF NOT EXISTS idx_products_v2_ref ON products_v2(ref_fabricante);

-- Índice para búsqueda por nombre (text search)
CREATE INDEX IF NOT EXISTS idx_products_v2_name ON products_v2 USING gin(to_tsvector('spanish', name));

-- Índice para búsqueda por marca
CREATE INDEX IF NOT EXISTS idx_products_v2_brand ON products_v2(brand_name);

-- Índice compuesto para navegación jerárquica
CREATE INDEX IF NOT EXISTS idx_products_v2_nav ON products_v2(categoria, subcategoria, gama);
