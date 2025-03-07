-- Criação das tabelas para o painel StayFocus

-- Habilita a extensão uuid-ossp para gerar UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de prioridades
CREATE TABLE IF NOT EXISTS priorities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pendente',
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de notas
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT NOT NULL,
  category TEXT,
  tags TEXT[],
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de sessões de estudo
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  duration INTEGER NOT NULL, -- duração em minutos
  notes TEXT,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de medicamentos
CREATE TABLE IF NOT EXISTS medications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  schedule TIME NOT NULL,
  status BOOLEAN DEFAULT FALSE,
  dosage TEXT,
  frequency TEXT,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de registros de humor
CREATE TABLE IF NOT EXISTS moods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mood_state INTEGER NOT NULL, -- 1-5 para representar diferentes estados emocionais
  notes TEXT,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de despesas
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  description TEXT,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de projetos
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  progress INTEGER DEFAULT 0, -- 0-100 para representar porcentagem
  deadline TIMESTAMP WITH TIME ZONE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de registros de sono
CREATE TABLE IF NOT EXISTS sleep_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  sleep_quality INTEGER, -- 1-5 para representar qualidade do sono
  notes TEXT,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criação de políticas de segurança RLS (Row Level Security)

-- Habilitar RLS em todas as tabelas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE priorities ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE moods ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE sleep_logs ENABLE ROW LEVEL SECURITY;

-- Políticas para usuários (apenas o próprio usuário pode ver/editar seus dados)
CREATE POLICY "Usuários podem ver apenas seus próprios dados" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar apenas seus próprios dados" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Políticas para prioridades
CREATE POLICY "Usuários podem ver apenas suas próprias prioridades" ON priorities
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir suas próprias prioridades" ON priorities
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar apenas suas próprias prioridades" ON priorities
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem excluir apenas suas próprias prioridades" ON priorities
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas para notas
CREATE POLICY "Usuários podem ver apenas suas próprias notas" ON notes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir suas próprias notas" ON notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar apenas suas próprias notas" ON notes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem excluir apenas suas próprias notas" ON notes
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas para sessões
CREATE POLICY "Usuários podem ver apenas suas próprias sessões" ON sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir suas próprias sessões" ON sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar apenas suas próprias sessões" ON sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem excluir apenas suas próprias sessões" ON sessions
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas para medicamentos
CREATE POLICY "Usuários podem ver apenas seus próprios medicamentos" ON medications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios medicamentos" ON medications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar apenas seus próprios medicamentos" ON medications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem excluir apenas seus próprios medicamentos" ON medications
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas para humor
CREATE POLICY "Usuários podem ver apenas seus próprios registros de humor" ON moods
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios registros de humor" ON moods
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar apenas seus próprios registros de humor" ON moods
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem excluir apenas seus próprios registros de humor" ON moods
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas para despesas
CREATE POLICY "Usuários podem ver apenas suas próprias despesas" ON expenses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir suas próprias despesas" ON expenses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar apenas suas próprias despesas" ON expenses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem excluir apenas suas próprias despesas" ON expenses
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas para projetos
CREATE POLICY "Usuários podem ver apenas seus próprios projetos" ON projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios projetos" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar apenas seus próprios projetos" ON projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem excluir apenas seus próprios projetos" ON projects
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas para registros de sono
CREATE POLICY "Usuários podem ver apenas seus próprios registros de sono" ON sleep_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios registros de sono" ON sleep_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar apenas seus próprios registros de sono" ON sleep_logs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem excluir apenas seus próprios registros de sono" ON sleep_logs
  FOR DELETE USING (auth.uid() = user_id);

-- Criação de índices para melhorar a performance
CREATE INDEX idx_priorities_user_id ON priorities(user_id);
CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_medications_user_id ON medications(user_id);
CREATE INDEX idx_moods_user_id ON moods(user_id);
CREATE INDEX idx_expenses_user_id ON expenses(user_id);
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_sleep_logs_user_id ON sleep_logs(user_id); 