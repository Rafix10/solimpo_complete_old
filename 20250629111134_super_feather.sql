/*
  # Corrigir tabela quote_requests

  1. Verificações e correções
    - Verificar se a tabela existe
    - Adicionar colunas em falta se necessário
    - Configurar RLS e políticas corretamente
  
  2. Estrutura final da tabela
    - id (uuid, primary key)
    - name (text, not null)
    - email (text, not null) 
    - phone (text, not null)
    - address (text, not null)
    - service_type (text, default 'residential')
    - items (jsonb, default '[]')
    - additional_info (text)
    - preferred_date (date)
    - status (text, default 'Pending')
    - estimated_price (numeric)
    - created_at (timestamptz, default now())
    - updated_at (timestamptz, default now())

  3. Segurança
    - RLS ativado
    - Políticas para inserção pública e gestão por admin
*/

-- Primeiro, vamos garantir que a tabela existe com a estrutura correta
CREATE TABLE IF NOT EXISTS quote_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  address text NOT NULL,
  service_type text NOT NULL DEFAULT 'residential',
  items jsonb DEFAULT '[]'::jsonb,
  additional_info text,
  preferred_date date,
  status text DEFAULT 'Pending',
  estimated_price numeric,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Verificar e adicionar colunas que possam estar em falta
DO $$
BEGIN
  -- Verificar se a coluna items existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quote_requests' AND column_name = 'items'
  ) THEN
    ALTER TABLE quote_requests ADD COLUMN items jsonb DEFAULT '[]'::jsonb;
  END IF;

  -- Verificar se a coluna service_type existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quote_requests' AND column_name = 'service_type'
  ) THEN
    ALTER TABLE quote_requests ADD COLUMN service_type text NOT NULL DEFAULT 'residential';
  END IF;

  -- Verificar se a coluna additional_info existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quote_requests' AND column_name = 'additional_info'
  ) THEN
    ALTER TABLE quote_requests ADD COLUMN additional_info text;
  END IF;

  -- Verificar se a coluna preferred_date existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quote_requests' AND column_name = 'preferred_date'
  ) THEN
    ALTER TABLE quote_requests ADD COLUMN preferred_date date;
  END IF;

  -- Verificar se a coluna status existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quote_requests' AND column_name = 'status'
  ) THEN
    ALTER TABLE quote_requests ADD COLUMN status text DEFAULT 'Pending';
  END IF;

  -- Verificar se a coluna estimated_price existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quote_requests' AND column_name = 'estimated_price'
  ) THEN
    ALTER TABLE quote_requests ADD COLUMN estimated_price numeric;
  END IF;
END $$;

-- Ativar Row Level Security
ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes para evitar conflitos
DROP POLICY IF EXISTS "Permitir inserção pública de pedidos" ON quote_requests;
DROP POLICY IF EXISTS "Permitir leitura por utilizadores autenticados" ON quote_requests;
DROP POLICY IF EXISTS "Permitir atualização por utilizadores autenticados" ON quote_requests;
DROP POLICY IF EXISTS "Permitir eliminação por utilizadores autenticados" ON quote_requests;

-- Criar políticas de segurança
CREATE POLICY "Allow public insert for quote requests"
  ON quote_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated read for quote requests"
  ON quote_requests
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated update for quote requests"
  ON quote_requests
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated delete for quote requests"
  ON quote_requests
  FOR DELETE
  TO authenticated
  USING (true);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_quote_requests_status ON quote_requests(status);
CREATE INDEX IF NOT EXISTS idx_quote_requests_created_at ON quote_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_quote_requests_service_type ON quote_requests(service_type);

-- Verificar se tudo está correto
DO $$
BEGIN
  RAISE NOTICE 'Tabela quote_requests configurada com sucesso';
END $$;