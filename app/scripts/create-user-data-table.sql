-- ═══════════════════════════════════════════════════════════
-- Migration: Create user_data table + RLS
-- Almacena datos de usuario por módulo (incidencias, kpi,
-- formacion, presupuestos, sonex, analytics, preferencias)
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS user_data (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module VARCHAR(50) NOT NULL,
  key VARCHAR(100) NOT NULL,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, module, key)
);

-- Índice compuesto para búsquedas por usuario+módulo
CREATE INDEX IF NOT EXISTS idx_user_data_user_module ON user_data (user_id, module);

-- ═══════════════════════════════════════════════════════════
-- Row Level Security
-- ═══════════════════════════════════════════════════════════

ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;

-- Cada usuario solo puede leer sus propios datos
DROP POLICY IF EXISTS "Lectura propia" ON user_data;
CREATE POLICY "Lectura propia"
  ON user_data FOR SELECT
  USING (auth.uid() = user_id);

-- Cada usuario solo puede insertar sus propios datos
DROP POLICY IF EXISTS "Inserción propia" ON user_data;
CREATE POLICY "Inserción propia"
  ON user_data FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Cada usuario solo puede actualizar sus propios datos
DROP POLICY IF EXISTS "Actualización propia" ON user_data;
CREATE POLICY "Actualización propia"
  ON user_data FOR UPDATE
  USING (auth.uid() = user_id);

-- Cada usuario solo puede borrar sus propios datos
DROP POLICY IF EXISTS "Borrado propio" ON user_data;
CREATE POLICY "Borrado propio"
  ON user_data FOR DELETE
  USING (auth.uid() = user_id);
