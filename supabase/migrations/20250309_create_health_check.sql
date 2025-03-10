-- Função para criar a tabela health_check se não existir
CREATE OR REPLACE FUNCTION create_health_check_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verifica se a tabela já existe
  IF NOT EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'health_check'
  ) THEN
    -- Cria a tabela health_check
    CREATE TABLE public.health_check (
      id INTEGER PRIMARY KEY,
      timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('online', 'offline')),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- Configura as políticas de segurança RLS
    ALTER TABLE public.health_check ENABLE ROW LEVEL SECURITY;

    -- Permite leitura para todos os usuários autenticados
    CREATE POLICY "Allow read access for all authenticated users" 
    ON public.health_check FOR SELECT 
    USING (auth.role() = 'authenticated');

    -- Permite atualização apenas para o registro com id = 1
    CREATE POLICY "Allow update only for health check record" 
    ON public.health_check FOR UPDATE 
    USING (id = 1);

    -- Permite inserção apenas para o registro com id = 1
    CREATE POLICY "Allow insert only for health check record" 
    ON public.health_check FOR INSERT 
    WITH CHECK (id = 1);
  END IF;
END;
$$;
