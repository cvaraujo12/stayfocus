-- Script de criação das tabelas no Supabase

-- Tabela de prioridades diárias
CREATE TABLE IF NOT EXISTS priorities (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  texto TEXT NOT NULL,
  concluida BOOLEAN DEFAULT false,
  data_prioridade DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionando índices para melhorar performance
CREATE INDEX IF NOT EXISTS priorities_user_id_idx ON priorities(user_id);
CREATE INDEX IF NOT EXISTS priorities_data_idx ON priorities(data_prioridade);

-- Tabela de notas de autoconhecimento
CREATE TABLE IF NOT EXISTS self_knowledge_notes (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  titulo TEXT NOT NULL,
  conteudo TEXT NOT NULL,
  data_criacao DATE NOT NULL,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS self_knowledge_notes_user_id_idx ON self_knowledge_notes(user_id);
CREATE INDEX IF NOT EXISTS self_knowledge_notes_data_idx ON self_knowledge_notes(data_criacao);

-- Tabela de sessões de estudo
CREATE TABLE IF NOT EXISTS study_sessions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  titulo TEXT NOT NULL,
  categoria TEXT,
  duracao_minutos INTEGER NOT NULL,
  data_sessao DATE NOT NULL,
  hora_inicio TIME,
  observacoes TEXT,
  concluida BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS study_sessions_user_id_idx ON study_sessions(user_id);
CREATE INDEX IF NOT EXISTS study_sessions_data_idx ON study_sessions(data_sessao);

-- Tabela de medicamentos
CREATE TABLE IF NOT EXISTS medications (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  nome TEXT NOT NULL,
  dosagem TEXT,
  horarios TEXT[],
  dias_semana TEXT[],
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS medications_user_id_idx ON medications(user_id);

-- Tabela de registro de medicamentos
CREATE TABLE IF NOT EXISTS medication_logs (
  id UUID PRIMARY KEY,
  medication_id UUID NOT NULL REFERENCES medications(id),
  user_id UUID NOT NULL,
  data_registro DATE NOT NULL,
  hora_registro TIME NOT NULL,
  tomado BOOLEAN DEFAULT true,
  humor_antes INTEGER, -- Escala 1-5
  humor_depois INTEGER, -- Escala 1-5
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS medication_logs_user_id_idx ON medication_logs(user_id);
CREATE INDEX IF NOT EXISTS medication_logs_medication_id_idx ON medication_logs(medication_id);
CREATE INDEX IF NOT EXISTS medication_logs_data_idx ON medication_logs(data_registro);

-- Tabela de registros de sono
CREATE TABLE IF NOT EXISTS sleep_records (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  data_inicio DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  data_fim DATE NOT NULL,
  hora_fim TIME NOT NULL,
  duracao_minutos INTEGER,
  qualidade INTEGER, -- Escala 1-5
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS sleep_records_user_id_idx ON sleep_records(user_id);
CREATE INDEX IF NOT EXISTS sleep_records_data_idx ON sleep_records(data_inicio);

-- Adicionar triggers para atualizar o campo updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar triggers para cada tabela
DO $$
DECLARE
   tables TEXT[] := ARRAY['priorities', 'self_knowledge_notes', 'study_sessions', 
                         'medications', 'medication_logs', 'sleep_records'];
   t TEXT;
BEGIN
   FOREACH t IN ARRAY tables
   LOOP
      EXECUTE format('
         DROP TRIGGER IF EXISTS update_%s_updated_at ON %s;
         CREATE TRIGGER update_%s_updated_at
         BEFORE UPDATE ON %s
         FOR EACH ROW
         EXECUTE FUNCTION update_updated_at_column();
      ', t, t, t, t);
   END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Políticas RLS (Row Level Security)
-- Habilitar RLS para todas as tabelas
DO $$
DECLARE
   tables TEXT[] := ARRAY['priorities', 'self_knowledge_notes', 'study_sessions', 
                         'medications', 'medication_logs', 'sleep_records'];
   t TEXT;
BEGIN
   FOREACH t IN ARRAY tables
   LOOP
      EXECUTE format('ALTER TABLE %s ENABLE ROW LEVEL SECURITY;', t);
      
      -- Política para SELECT (ler apenas próprios registros)
      EXECUTE format('
         DROP POLICY IF EXISTS select_own ON %s;
         CREATE POLICY select_own ON %s 
         FOR SELECT USING (auth.uid() = user_id);
      ', t, t);
      
      -- Política para INSERT (inserir apenas próprios registros)
      EXECUTE format('
         DROP POLICY IF EXISTS insert_own ON %s;
         CREATE POLICY insert_own ON %s 
         FOR INSERT WITH CHECK (auth.uid() = user_id);
      ', t, t);
      
      -- Política para UPDATE (atualizar apenas próprios registros)
      EXECUTE format('
         DROP POLICY IF EXISTS update_own ON %s;
         CREATE POLICY update_own ON %s 
         FOR UPDATE USING (auth.uid() = user_id);
      ', t, t);
      
      -- Política para DELETE (deletar apenas próprios registros)
      EXECUTE format('
         DROP POLICY IF EXISTS delete_own ON %s;
         CREATE POLICY delete_own ON %s 
         FOR DELETE USING (auth.uid() = user_id);
      ', t, t);
   END LOOP;
END;
$$ LANGUAGE plpgsql; 