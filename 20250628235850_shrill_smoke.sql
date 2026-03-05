/*
  # Add items column to quote_requests table

  1. Changes
    - Add `items` column to `quote_requests` table with JSONB data type
    - This column will store the array of items for each quote request

  2. Security
    - No changes to existing RLS policies needed
*/

-- Add items column to quote_requests table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quote_requests' AND column_name = 'items'
  ) THEN
    ALTER TABLE quote_requests ADD COLUMN items JSONB DEFAULT '[]'::jsonb;
  END IF;
END $$;