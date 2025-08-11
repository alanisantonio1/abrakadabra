
# Guía de Migración de Supabase - Columnas Anticipo

## Problema
La aplicación está intentando usar columnas `anticipo_1_amount`, `anticipo_2_amount`, y `anticipo_3_amount` en la tabla `events` de Supabase, pero estas columnas no existen en el esquema actual de la base de datos.

## Solución
Ejecutar la migración SQL para agregar las columnas faltantes.

## Pasos para Resolver

### Opción 1: Usando Supabase Dashboard (Recomendado)

1. **Abrir Supabase Dashboard**
   - Ir a [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Seleccionar su proyecto

2. **Ir al Editor SQL**
   - En el menú lateral, hacer clic en "SQL Editor"
   - Crear una nueva consulta

3. **Ejecutar la Migración**
   - Copiar y pegar el siguiente código SQL:

```sql
-- Migration: Add anticipo columns to events table
-- This migration adds support for tracking multiple partial payments (anticipos)

-- Add anticipo columns to events table
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS anticipo_1_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS anticipo_1_date TEXT,
ADD COLUMN IF NOT EXISTS anticipo_2_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS anticipo_2_date TEXT,
ADD COLUMN IF NOT EXISTS anticipo_3_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS anticipo_3_date TEXT;

-- Update existing events to have default anticipo_1_amount equal to their deposit
UPDATE events 
SET anticipo_1_amount = deposit 
WHERE anticipo_1_amount IS NULL OR anticipo_1_amount = 0;

-- Add comment to document the purpose of these columns
COMMENT ON COLUMN events.anticipo_1_amount IS 'First partial payment amount (required for reservation)';
COMMENT ON COLUMN events.anticipo_1_date IS 'Date when first partial payment was made';
COMMENT ON COLUMN events.anticipo_2_amount IS 'Second partial payment amount (optional)';
COMMENT ON COLUMN events.anticipo_2_date IS 'Date when second partial payment was made';
COMMENT ON COLUMN events.anticipo_3_amount IS 'Third partial payment amount (optional)';
COMMENT ON COLUMN events.anticipo_3_date IS 'Date when third partial payment was made';
```

4. **Ejecutar la Consulta**
   - Hacer clic en "Run" para ejecutar la migración
   - Verificar que no haya errores

### Opción 2: Usando Supabase CLI

1. **Instalar Supabase CLI** (si no está instalado)
```bash
npm install -g supabase
```

2. **Inicializar el proyecto** (si no está inicializado)
```bash
supabase init
```

3. **Crear la migración**
```bash
supabase migration new add_anticipo_columns
```

4. **Editar el archivo de migración**
   - Abrir el archivo creado en `supabase/migrations/`
   - Copiar el contenido del archivo `supabase/migrations/add_anticipo_columns.sql`

5. **Aplicar la migración**
```bash
supabase db push
```

## Verificación

Después de ejecutar la migración, puede verificar que las columnas se agregaron correctamente:

```sql
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'events' 
AND column_name LIKE 'anticipo%'
ORDER BY column_name;
```

## Funcionalidad de las Columnas Anticipo

- **anticipo_1_amount**: Monto del primer anticipo (requerido para reservar)
- **anticipo_1_date**: Fecha del primer anticipo
- **anticipo_2_amount**: Monto del segundo anticipo (opcional)
- **anticipo_2_date**: Fecha del segundo anticipo
- **anticipo_3_amount**: Monto del tercer anticipo (opcional)
- **anticipo_3_date**: Fecha del tercer anticipo

## Después de la Migración

Una vez completada la migración:

1. **Reiniciar la aplicación** para que reconozca las nuevas columnas
2. **Probar la funcionalidad** de anticipos en la aplicación
3. **Verificar** que los eventos se guarden correctamente en Supabase

## Solución de Problemas

Si continúa viendo errores después de la migración:

1. **Verificar que las columnas existen**:
```sql
\d events
```

2. **Limpiar caché de esquema** (reiniciar la aplicación)

3. **Verificar permisos** de la tabla events

4. **Revisar logs** en Supabase Dashboard > Logs

## Contacto

Si tiene problemas con la migración, revise:
- Los logs de Supabase
- Los logs de la aplicación
- La consola del navegador para errores específicos
