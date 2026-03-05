/*
  # Fix quote_requests table structure

  1. New Table Structure
    - `quote_requests` table with all required columns
    - `items` column as JSONB for storing array of items
    - Proper constraints and defaults

  2. Security
    - Enable RLS on `quote_requests` table
    - Allow public insert for quote form
    - Restrict read/update/delete to authenticated users only

  3. Performance
    - Add indexes for common queries
    - Auto-update trigger for updated_at column
*/

-- Drop the table if it exists to start fresh
DROP TABLE IF EXISTS quote_requests CASCADE;

-- Create the quote_requests table with complete structure
CREATE TABLE quote_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  address text NOT NULL,
  service_type text NOT NULL DEFAULT 'residential',
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  additional_info text,
  preferred_date date,
  status text NOT NULL DEFAULT 'Pending',
  estimated_price numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;

-- Create security policies
CREATE POLICY "Anyone can create quote requests"
  ON quote_requests
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Only authenticated users can view quote requests"
  ON quote_requests
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "authenticated_update_quote_requests"
  ON quote_requests
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "authenticated_delete_quote_requests"
  ON quote_requests
  FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX idx_quote_requests_status ON quote_requests(status);
CREATE INDEX idx_quote_requests_created_at ON quote_requests(created_at DESC);
CREATE INDEX idx_quote_requests_service_type ON quote_requests(service_type);
CREATE INDEX idx_quote_requests_email ON quote_requests(email);

-- Create function to automatically update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for automatic updated_at updates
CREATE TRIGGER update_quote_requests_updated_at
    BEFORE UPDATE ON quote_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Verify the table was created successfully
DO $$
DECLARE
    items_column_exists BOOLEAN;
    table_exists BOOLEAN;
BEGIN
    -- Check if table exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' 
        AND table_name = 'quote_requests'
    ) INTO table_exists;
    
    -- Check if items column exists with correct type
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' 
        AND table_name = 'quote_requests' 
        AND column_name = 'items'
        AND data_type = 'jsonb'
    ) INTO items_column_exists;
    
    IF table_exists AND items_column_exists THEN
        RAISE NOTICE 'SUCCESS: Table quote_requests created successfully with items column (jsonb)';
    ELSE
        RAISE EXCEPTION 'ERROR: Failed to create table properly. Table exists: %, Items column exists: %', table_exists, items_column_exists;
    END IF;
END $$;
