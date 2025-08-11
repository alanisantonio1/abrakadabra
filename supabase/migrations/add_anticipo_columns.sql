
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
