
-- ============================================
-- SCRIPT DE CONFIGURACIÓN DE SUPABASE
-- Abrakadabra Events App
-- ============================================
-- 
-- INSTRUCCIONES:
-- 1. Abre: https://supabase.com/dashboard/project/hfagsrdboeoxfdzpzgnn/sql
-- 2. Copia y pega este script completo
-- 3. Presiona "Run" para ejecutar
-- 4. Verifica que no haya errores
-- 5. Regresa a la app y verifica la configuración
--
-- ============================================

-- Crear tabla de eventos
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  child_name TEXT NOT NULL,
  package_type TEXT NOT NULL CHECK (package_type IN ('Abra', 'Kadabra', 'Abrakadabra')),
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  deposit DECIMAL(10,2) NOT NULL DEFAULT 0,
  remaining_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  is_paid BOOLEAN NOT NULL DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Columnas para anticipos (pagos parciales)
  anticipo_1_amount DECIMAL(10,2) DEFAULT 0,
  anticipo_1_date TEXT,
  anticipo_2_amount DECIMAL(10,2) DEFAULT 0,
  anticipo_2_date TEXT,
  anticipo_3_amount DECIMAL(10,2) DEFAULT 0,
  anticipo_3_date TEXT
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Crear política RLS para permitir todas las operaciones
-- (Esta es una app interna, no requiere autenticación de usuarios)
CREATE POLICY "Allow all operations on events" ON events
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Crear índice en la columna date para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);

-- Crear índice en created_at para ordenamiento
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at DESC);

-- Crear función para actualizar automáticamente updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para actualizar updated_at en cada UPDATE
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VERIFICACIÓN
-- ============================================
-- Ejecuta esta consulta para verificar que la tabla se creó correctamente:
-- SELECT * FROM events LIMIT 1;
--
-- Si no hay errores, ¡la configuración está completa! ✅
-- ============================================
