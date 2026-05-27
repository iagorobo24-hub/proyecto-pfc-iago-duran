-- ═══════════════════════════════════════════════════════════
-- Migration: Create testimonios table + RLS
-- Ejecutar en Supabase SQL Editor (Dashboard → SQL Editor)
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS testimonios (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  nombre TEXT NOT NULL,
  email TEXT,
  texto TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para ordenar por fecha descendente
CREATE INDEX IF NOT EXISTS idx_testimonios_created_at ON testimonios (created_at DESC);

-- ═══════════════════════════════════════════════════════════
-- Row Level Security
-- ═══════════════════════════════════════════════════════════

ALTER TABLE testimonios ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede leer todos los testimonios (público)
DROP POLICY IF EXISTS "Lectura pública de testimonios" ON testimonios;
CREATE POLICY "Lectura pública de testimonios"
  ON testimonios FOR SELECT
  USING (true);

-- Cualquiera puede insertar (incluso sin autenticar)
DROP POLICY IF EXISTS "Inserción pública de testimonios" ON testimonios;
CREATE POLICY "Inserción pública de testimonios"
  ON testimonios FOR INSERT
  WITH CHECK (true);

-- Solo el autor puede actualizar su testimonio
DROP POLICY IF EXISTS "Actualización por autor" ON testimonios;
CREATE POLICY "Actualización por autor"
  ON testimonios FOR UPDATE
  USING (auth.uid() = user_id);

-- Solo el autor puede borrar su testimonio
DROP POLICY IF EXISTS "Borrado por autor" ON testimonios;
CREATE POLICY "Borrado por autor"
  ON testimonios FOR DELETE
  USING (auth.uid() = user_id);
