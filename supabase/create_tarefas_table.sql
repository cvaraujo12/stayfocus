-- Habilita a extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Verifica e cria a tabela perfis se não existir
CREATE TABLE IF NOT EXISTS perfis (
  id UUID PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  configuracoes JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilita RLS para perfis
ALTER TABLE perfis ENABLE ROW LEVEL SECURITY;

-- Adiciona políticas para perfis
DO $$
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'perfis' AND policyname = 'Usuários podem ver apenas seus próprios perfis'
  ) THEN
    CREATE POLICY "Usuários podem ver apenas seus próprios perfis" ON perfis
      FOR SELECT USING (auth.uid() = id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'perfis' AND policyname = 'Usuários podem atualizar apenas seus próprios perfis'
  ) THEN
    CREATE POLICY "Usuários podem atualizar apenas seus próprios perfis" ON perfis
      FOR UPDATE USING (auth.uid() = id);
  END IF;
END $$;

-- Cria a tabela tarefas
CREATE TABLE IF NOT EXISTS tarefas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo TEXT NOT NULL,
  descricao TEXT,
  status TEXT DEFAULT 'pendente',
  concluida BOOLEAN DEFAULT FALSE,
  data_limite TIMESTAMP WITH TIME ZONE,
  prioridade INTEGER DEFAULT 1,
  user_id UUID NOT NULL REFERENCES perfis(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilita RLS para tarefas
ALTER TABLE tarefas ENABLE ROW LEVEL SECURITY;

-- Adiciona políticas para tarefas
DO $$
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'tarefas' AND policyname = 'Usuários podem ver apenas suas próprias tarefas'
  ) THEN
    CREATE POLICY "Usuários podem ver apenas suas próprias tarefas" ON tarefas
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'tarefas' AND policyname = 'Usuários podem inserir suas próprias tarefas'
  ) THEN
    CREATE POLICY "Usuários podem inserir suas próprias tarefas" ON tarefas
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'tarefas' AND policyname = 'Usuários podem atualizar apenas suas próprias tarefas'
  ) THEN
    CREATE POLICY "Usuários podem atualizar apenas suas próprias tarefas" ON tarefas
      FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'tarefas' AND policyname = 'Usuários podem excluir apenas suas próprias tarefas'
  ) THEN
    CREATE POLICY "Usuários podem excluir apenas suas próprias tarefas" ON tarefas
      FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Cria índice para melhorar performance
CREATE INDEX IF NOT EXISTS idx_tarefas_user_id ON tarefas(user_id);

-- Cria tabela blocos_tempo para o mapeamento de sincronização
CREATE TABLE IF NOT EXISTS blocos_tempo (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo TEXT NOT NULL,
  duracao INTEGER NOT NULL,
  descricao TEXT,
  concluido BOOLEAN DEFAULT FALSE,
  user_id UUID NOT NULL REFERENCES perfis(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilita RLS para blocos_tempo
ALTER TABLE blocos_tempo ENABLE ROW LEVEL SECURITY;

-- Adiciona políticas para blocos_tempo
DO $$
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'blocos_tempo' AND policyname = 'Usuários podem ver apenas seus próprios blocos de tempo'
  ) THEN
    CREATE POLICY "Usuários podem ver apenas seus próprios blocos de tempo" ON blocos_tempo
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'blocos_tempo' AND policyname = 'Usuários podem inserir seus próprios blocos de tempo'
  ) THEN
    CREATE POLICY "Usuários podem inserir seus próprios blocos de tempo" ON blocos_tempo
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'blocos_tempo' AND policyname = 'Usuários podem atualizar apenas seus próprios blocos de tempo'
  ) THEN
    CREATE POLICY "Usuários podem atualizar apenas seus próprios blocos de tempo" ON blocos_tempo
      FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'blocos_tempo' AND policyname = 'Usuários podem excluir apenas seus próprios blocos de tempo'
  ) THEN
    CREATE POLICY "Usuários podem excluir apenas seus próprios blocos de tempo" ON blocos_tempo
      FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Cria índice para melhorar performance
CREATE INDEX IF NOT EXISTS idx_blocos_tempo_user_id ON blocos_tempo(user_id);

-- Cria tabela refeicoes para o mapeamento de sincronização
CREATE TABLE IF NOT EXISTS refeicoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo TEXT NOT NULL,
  descricao TEXT,
  horario TIME NOT NULL,
  calorias INTEGER,
  carboidratos DECIMAL,
  proteinas DECIMAL,
  gorduras DECIMAL,
  consumida BOOLEAN DEFAULT FALSE,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  user_id UUID NOT NULL REFERENCES perfis(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilita RLS para refeicoes
ALTER TABLE refeicoes ENABLE ROW LEVEL SECURITY;

-- Adiciona políticas para refeicoes
DO $$
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'refeicoes' AND policyname = 'Usuários podem ver apenas suas próprias refeições'
  ) THEN
    CREATE POLICY "Usuários podem ver apenas suas próprias refeições" ON refeicoes
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'refeicoes' AND policyname = 'Usuários podem inserir suas próprias refeições'
  ) THEN
    CREATE POLICY "Usuários podem inserir suas próprias refeições" ON refeicoes
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'refeicoes' AND policyname = 'Usuários podem atualizar apenas suas próprias refeições'
  ) THEN
    CREATE POLICY "Usuários podem atualizar apenas suas próprias refeições" ON refeicoes
      FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'refeicoes' AND policyname = 'Usuários podem excluir apenas suas próprias refeições'
  ) THEN
    CREATE POLICY "Usuários podem excluir apenas suas próprias refeições" ON refeicoes
      FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Cria índice para melhorar performance
CREATE INDEX IF NOT EXISTS idx_refeicoes_user_id ON refeicoes(user_id);

-- Cria tabela medicamentos para o mapeamento de sincronização
CREATE TABLE IF NOT EXISTS medicamentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  descricao TEXT,
  dosagem TEXT,
  user_id UUID NOT NULL REFERENCES perfis(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilita RLS para medicamentos
ALTER TABLE medicamentos ENABLE ROW LEVEL SECURITY;

-- Adiciona políticas para medicamentos
DO $$
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'medicamentos' AND policyname = 'Usuários podem ver apenas seus próprios medicamentos'
  ) THEN
    CREATE POLICY "Usuários podem ver apenas seus próprios medicamentos" ON medicamentos
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'medicamentos' AND policyname = 'Usuários podem inserir seus próprios medicamentos'
  ) THEN
    CREATE POLICY "Usuários podem inserir seus próprios medicamentos" ON medicamentos
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'medicamentos' AND policyname = 'Usuários podem atualizar apenas seus próprios medicamentos'
  ) THEN
    CREATE POLICY "Usuários podem atualizar apenas seus próprios medicamentos" ON medicamentos
      FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'medicamentos' AND policyname = 'Usuários podem excluir apenas seus próprios medicamentos'
  ) THEN
    CREATE POLICY "Usuários podem excluir apenas seus próprios medicamentos" ON medicamentos
      FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Cria índice para melhorar performance
CREATE INDEX IF NOT EXISTS idx_medicamentos_user_id ON medicamentos(user_id);

-- Cria tabela medicacoes para registros de medicações tomadas
CREATE TABLE IF NOT EXISTS medicacoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  medicamento_id UUID NOT NULL REFERENCES medicamentos(id) ON DELETE CASCADE,
  horario TIME NOT NULL,
  tomada BOOLEAN DEFAULT FALSE,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  notas TEXT,
  user_id UUID NOT NULL REFERENCES perfis(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilita RLS para medicacoes
ALTER TABLE medicacoes ENABLE ROW LEVEL SECURITY;

-- Adiciona políticas para medicacoes
DO $$
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'medicacoes' AND policyname = 'Usuários podem ver apenas suas próprias medicações'
  ) THEN
    CREATE POLICY "Usuários podem ver apenas suas próprias medicações" ON medicacoes
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'medicacoes' AND policyname = 'Usuários podem inserir suas próprias medicações'
  ) THEN
    CREATE POLICY "Usuários podem inserir suas próprias medicações" ON medicacoes
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'medicacoes' AND policyname = 'Usuários podem atualizar apenas suas próprias medicações'
  ) THEN
    CREATE POLICY "Usuários podem atualizar apenas suas próprias medicações" ON medicacoes
      FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'medicacoes' AND policyname = 'Usuários podem excluir apenas suas próprias medicações'
  ) THEN
    CREATE POLICY "Usuários podem excluir apenas suas próprias medicações" ON medicacoes
      FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Cria índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_medicacoes_user_id ON medicacoes(user_id);
CREATE INDEX IF NOT EXISTS idx_medicacoes_medicamento_id ON medicacoes(medicamento_id);

-- Cria tabela de registros de humor
CREATE TABLE IF NOT EXISTS registros_humor (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nivel INTEGER NOT NULL CHECK (nivel BETWEEN 1 AND 5),
  descricao TEXT,
  fatores TEXT[],
  data_hora TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES perfis(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilita RLS para registros_humor
ALTER TABLE registros_humor ENABLE ROW LEVEL SECURITY;

-- Adiciona políticas para registros_humor
DO $$
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'registros_humor' AND policyname = 'Usuários podem ver apenas seus próprios registros de humor'
  ) THEN
    CREATE POLICY "Usuários podem ver apenas seus próprios registros de humor" ON registros_humor
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'registros_humor' AND policyname = 'Usuários podem inserir seus próprios registros de humor'
  ) THEN
    CREATE POLICY "Usuários podem inserir seus próprios registros de humor" ON registros_humor
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'registros_humor' AND policyname = 'Usuários podem atualizar apenas seus próprios registros de humor'
  ) THEN
    CREATE POLICY "Usuários podem atualizar apenas seus próprios registros de humor" ON registros_humor
      FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'registros_humor' AND policyname = 'Usuários podem excluir apenas seus próprios registros de humor'
  ) THEN
    CREATE POLICY "Usuários podem excluir apenas seus próprios registros de humor" ON registros_humor
      FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Cria índice para melhorar performance
CREATE INDEX IF NOT EXISTS idx_registros_humor_user_id ON registros_humor(user_id);

-- Função para verificar se as tabelas existem
CREATE OR REPLACE FUNCTION check_tables_exist() 
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'perfis', EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'perfis'),
    'tarefas', EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'tarefas'),
    'blocos_tempo', EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'blocos_tempo'),
    'refeicoes', EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'refeicoes'),
    'medicamentos', EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'medicamentos'),
    'medicacoes', EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'medicacoes'),
    'registros_humor', EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'registros_humor')
  ) INTO result;
  
  RETURN result;
END;
$$; 