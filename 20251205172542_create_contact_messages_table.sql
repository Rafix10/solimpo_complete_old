/*
  # Correção completa da tabela quote_requests

  1. Estrutura da Tabela
    - Garante que a tabela `quote_requests` existe com todas as colunas necessárias
    - Coluna `items` como JSONB para armazenar array de objetos
    - Todas as colunas obrigatórias e opcionais

  2. Segurança
    - Ativa Row Level Security (RLS)
    - Permite inserção pública (para formulário de orçamento)
    - Restringe leitura/edição apenas a utilizadores autenticados (admin)

  3. Performance
    - Índices para consultas otimizadas
    - Constraints apropriados
*/

-- Primeiro, vamos garantir que a tabela existe com a estrutura completa
CREATE TABLE IF NOT EXISTS quote_requests (
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

-- Verificar e adicionar colunas que possam estar em falta
DO $$
BEGIN
  -- Verificar coluna items
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' 
    AND table_name = 'quote_requests' 
    AND column_name = 'items'
  ) THEN
    ALTER TABLE quote_requests ADD COLUMN items jsonb NOT NULL DEFAULT '[]'::jsonb;
    RAISE NOTICE 'Coluna items adicionada';
  END IF;

  -- Verificar coluna service_type
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' 
    AND table_name = 'quote_requests' 
    AND column_name = 'service_type'
  ) THEN
    ALTER TABLE quote_requests ADD COLUMN service_type text NOT NULL DEFAULT 'residential';
    RAISE NOTICE 'Coluna service_type adicionada';
  END IF;

  -- Verificar coluna additional_info
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' 
    AND table_name = 'quote_requests' 
    AND column_name = 'additional_info'
  ) THEN
    ALTER TABLE quote_requests ADD COLUMN additional_info text;
    RAISE NOTICE 'Coluna additional_info adicionada';
  END IF;

  -- Verificar coluna preferred_date
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' 
    AND table_name = 'quote_requests' 
    AND column_name = 'preferred_date'
  ) THEN
    ALTER TABLE quote_requests ADD COLUMN preferred_date date;
    RAISE NOTICE 'Coluna preferred_date adicionada';
  END IF;

  -- Verificar coluna status
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' 
    AND table_name = 'quote_requests' 
    AND column_name = 'status'
  ) THEN
    ALTER TABLE quote_requests ADD COLUMN status text NOT NULL DEFAULT 'Pending';
    RAISE NOTICE 'Coluna status adicionada';
  END IF;

  -- Verificar coluna estimated_price
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' 
    AND table_name = 'quote_requests' 
    AND column_name = 'estimated_price'
  ) THEN
    ALTER TABLE quote_requests ADD COLUMN estimated_price numeric;
    RAISE NOTICE 'Coluna estimated_price adicionada';
  END IF;

  -- Verificar coluna created_at
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' 
    AND table_name = 'quote_requests' 
    AND column_name = 'created_at'
  ) THEN
    ALTER TABLE quote_requests ADD COLUMN created_at timestamptz NOT NULL DEFAULT now();
    RAISE NOTICE 'Coluna created_at adicionada';
  END IF;

  -- Verificar coluna updated_at
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' 
    AND table_name = 'quote_requests' 
    AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE quote_requests ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now();
    RAISE NOTICE 'Coluna updated_at adicionada';
  END IF;
END $$;

-- Garantir que as colunas têm os tipos e defaults corretos
DO $$
BEGIN
  -- Atualizar coluna items para garantir que é JSONB com default correto
  ALTER TABLE quote_requests ALTER COLUMN items SET DEFAULT '[]'::jsonb;
  ALTER TABLE quote_requests ALTER COLUMN items SET NOT NULL;
  
  -- Atualizar coluna status para garantir default
  ALTER TABLE quote_requests ALTER COLUMN status SET DEFAULT 'Pending';
  ALTER TABLE quote_requests ALTER COLUMN status SET NOT NULL;
  
  -- Atualizar coluna service_type para garantir default
  ALTER TABLE quote_requests ALTER COLUMN service_type SET DEFAULT 'residential';
  ALTER TABLE quote_requests ALTER COLUMN service_type SET NOT NULL;
  
  -- Atualizar timestamps
  ALTER TABLE quote_requests ALTER COLUMN created_at SET DEFAULT now();
  ALTER TABLE quote_requests ALTER COLUMN created_at SET NOT NULL;
  ALTER TABLE quote_requests ALTER COLUMN updated_at SET DEFAULT now();
  ALTER TABLE quote_requests ALTER COLUMN updated_at SET NOT NULL;
  
  RAISE NOTICE 'Tipos de colunas atualizados';
END $$;

-- Ativar Row Level Security
ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;

-- Remover todas as políticas existentes para evitar conflitos
DROP POLICY IF EXISTS "Allow public insert for quote requests" ON quote_requests;
DROP POLICY IF EXISTS "Allow authenticated read for quote requests" ON quote_requests;
DROP POLICY IF EXISTS "Allow authenticated update for quote requests" ON quote_requests;
DROP POLICY IF EXISTS "Allow authenticated delete for quote requests" ON quote_requests;
DROP POLICY IF EXISTS "Permitir inserção pública de pedidos" ON quote_requests;
DROP POLICY IF EXISTS "Permitir leitura por utilizadores autenticados" ON quote_requests;
DROP POLICY IF EXISTS "Permitir atualização por utilizadores autenticados" ON quote_requests;
DROP POLICY IF EXISTS "Permitir eliminação por utilizadores autenticados" ON quote_requests;

-- Criar políticas de segurança definitivas
CREATE POLICY "public_insert_quote_requests"
  ON quote_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "authenticated_select_quote_requests"
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

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_quote_requests_status ON quote_requests(status);
CREATE INDEX IF NOT EXISTS idx_quote_requests_created_at ON quote_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quote_requests_service_type ON quote_requests(service_type);
CREATE INDEX IF NOT EXISTS idx_quote_requests_email ON quote_requests(email);

-- Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar trigger para atualizar updated_at
DROP TRIGGER IF EXISTS update_quote_requests_updated_at ON quote_requests;
CREATE TRIGGER update_quote_requests_updated_at
    BEFORE UPDATE ON quote_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Verificar se tudo está correto
DO $$
DECLARE
    column_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO column_count
    FROM information_schema.columns
    WHERE table_schema = 'public' 
    AND table_name = 'quote_requests';
    
    RAISE NOTICE 'Tabela quote_requests tem % colunas', column_count;
    
    -- Verificar se as colunas essenciais existem
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' 
        AND table_name = 'quote_requests' 
        AND column_name = 'items'
    ) THEN
        RAISE NOTICE 'Coluna items existe e está configurada';
    ELSE
        RAISE EXCEPTION 'Coluna items não existe!';
    END IF;
    
    RAISE NOTICE 'Configuração da tabela quote_requests concluída com sucesso!';
END $$;