const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Carrega as variáveis de ambiente
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Erro: Variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são necessárias');
  process.exit(1);
}

// Cria o cliente Supabase com a chave de serviço para ter permissões administrativas
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Função para criar a tabela de usuários
async function createUsersTable() {
  console.log('Criando tabela de usuários...');
  const { error } = await supabase.from('users').select('*').limit(1);
  
  if (error && error.code === '42P01') { // Tabela não existe
    const { error: createError } = await supabase
      .rpc('execute_sql', {
        sql_query: `
          CREATE TABLE IF NOT EXISTS users (
            id UUID PRIMARY KEY DEFAULT auth.uid(),
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          ALTER TABLE users ENABLE ROW LEVEL SECURITY;
          
          CREATE POLICY "Usuários podem ver apenas seus próprios dados" ON users
            FOR SELECT USING (auth.uid() = id);
          
          CREATE POLICY "Usuários podem atualizar apenas seus próprios dados" ON users
            FOR UPDATE USING (auth.uid() = id);
        `
      });
    
    if (createError) {
      console.error('Erro ao criar tabela de usuários:', createError);
      return false;
    }
    console.log('Tabela de usuários criada com sucesso!');
  } else {
    console.log('Tabela de usuários já existe.');
  }
  
  return true;
}

// Função para criar a tabela de prioridades
async function createPrioritiesTable() {
  console.log('Criando tabela de prioridades...');
  const { error } = await supabase.from('priorities').select('*').limit(1);
  
  if (error && error.code === '42P01') { // Tabela não existe
    const { error: createError } = await supabase
      .rpc('execute_sql', {
        sql_query: `
          CREATE TABLE IF NOT EXISTS priorities (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            title TEXT NOT NULL,
            description TEXT,
            status TEXT NOT NULL DEFAULT 'pendente',
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          ALTER TABLE priorities ENABLE ROW LEVEL SECURITY;
          
          CREATE POLICY "Usuários podem ver apenas suas próprias prioridades" ON priorities
            FOR SELECT USING (auth.uid() = user_id);
          
          CREATE POLICY "Usuários podem inserir suas próprias prioridades" ON priorities
            FOR INSERT WITH CHECK (auth.uid() = user_id);
          
          CREATE POLICY "Usuários podem atualizar apenas suas próprias prioridades" ON priorities
            FOR UPDATE USING (auth.uid() = user_id);
          
          CREATE POLICY "Usuários podem excluir apenas suas próprias prioridades" ON priorities
            FOR DELETE USING (auth.uid() = user_id);
            
          CREATE INDEX idx_priorities_user_id ON priorities(user_id);
        `
      });
    
    if (createError) {
      console.error('Erro ao criar tabela de prioridades:', createError);
      return false;
    }
    console.log('Tabela de prioridades criada com sucesso!');
  } else {
    console.log('Tabela de prioridades já existe.');
  }
  
  return true;
}

// Função para criar a tabela de notas
async function createNotesTable() {
  console.log('Criando tabela de notas...');
  const { error } = await supabase.from('notes').select('*').limit(1);
  
  if (error && error.code === '42P01') { // Tabela não existe
    const { error: createError } = await supabase
      .rpc('execute_sql', {
        sql_query: `
          CREATE TABLE IF NOT EXISTS notes (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            content TEXT NOT NULL,
            category TEXT,
            tags TEXT[],
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
          
          CREATE POLICY "Usuários podem ver apenas suas próprias notas" ON notes
            FOR SELECT USING (auth.uid() = user_id);
          
          CREATE POLICY "Usuários podem inserir suas próprias notas" ON notes
            FOR INSERT WITH CHECK (auth.uid() = user_id);
          
          CREATE POLICY "Usuários podem atualizar apenas suas próprias notas" ON notes
            FOR UPDATE USING (auth.uid() = user_id);
          
          CREATE POLICY "Usuários podem excluir apenas suas próprias notas" ON notes
            FOR DELETE USING (auth.uid() = user_id);
            
          CREATE INDEX idx_notes_user_id ON notes(user_id);
        `
      });
    
    if (createError) {
      console.error('Erro ao criar tabela de notas:', createError);
      return false;
    }
    console.log('Tabela de notas criada com sucesso!');
  } else {
    console.log('Tabela de notas já existe.');
  }
  
  return true;
}

// Função para criar a tabela de sessões
async function createSessionsTable() {
  console.log('Criando tabela de sessões...');
  const { error } = await supabase.from('sessions').select('*').limit(1);
  
  if (error && error.code === '42P01') { // Tabela não existe
    const { error: createError } = await supabase
      .rpc('execute_sql', {
        sql_query: `
          CREATE TABLE IF NOT EXISTS sessions (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            duration INTEGER NOT NULL,
            notes TEXT,
            date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
          
          CREATE POLICY "Usuários podem ver apenas suas próprias sessões" ON sessions
            FOR SELECT USING (auth.uid() = user_id);
          
          CREATE POLICY "Usuários podem inserir suas próprias sessões" ON sessions
            FOR INSERT WITH CHECK (auth.uid() = user_id);
          
          CREATE POLICY "Usuários podem atualizar apenas suas próprias sessões" ON sessions
            FOR UPDATE USING (auth.uid() = user_id);
          
          CREATE POLICY "Usuários podem excluir apenas suas próprias sessões" ON sessions
            FOR DELETE USING (auth.uid() = user_id);
            
          CREATE INDEX idx_sessions_user_id ON sessions(user_id);
        `
      });
    
    if (createError) {
      console.error('Erro ao criar tabela de sessões:', createError);
      return false;
    }
    console.log('Tabela de sessões criada com sucesso!');
  } else {
    console.log('Tabela de sessões já existe.');
  }
  
  return true;
}

// Função para criar a tabela de medicamentos
async function createMedicationsTable() {
  console.log('Criando tabela de medicamentos...');
  const { error } = await supabase.from('medications').select('*').limit(1);
  
  if (error && error.code === '42P01') { // Tabela não existe
    const { error: createError } = await supabase
      .rpc('execute_sql', {
        sql_query: `
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
          
          ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
          
          CREATE POLICY "Usuários podem ver apenas seus próprios medicamentos" ON medications
            FOR SELECT USING (auth.uid() = user_id);
          
          CREATE POLICY "Usuários podem inserir seus próprios medicamentos" ON medications
            FOR INSERT WITH CHECK (auth.uid() = user_id);
          
          CREATE POLICY "Usuários podem atualizar apenas seus próprios medicamentos" ON medications
            FOR UPDATE USING (auth.uid() = user_id);
          
          CREATE POLICY "Usuários podem excluir apenas seus próprios medicamentos" ON medications
            FOR DELETE USING (auth.uid() = user_id);
            
          CREATE INDEX idx_medications_user_id ON medications(user_id);
        `
      });
    
    if (createError) {
      console.error('Erro ao criar tabela de medicamentos:', createError);
      return false;
    }
    console.log('Tabela de medicamentos criada com sucesso!');
  } else {
    console.log('Tabela de medicamentos já existe.');
  }
  
  return true;
}

// Função para criar a tabela de humor
async function createMoodsTable() {
  console.log('Criando tabela de humor...');
  const { error } = await supabase.from('moods').select('*').limit(1);
  
  if (error && error.code === '42P01') { // Tabela não existe
    const { error: createError } = await supabase
      .rpc('execute_sql', {
        sql_query: `
          CREATE TABLE IF NOT EXISTS moods (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            mood_state INTEGER NOT NULL,
            notes TEXT,
            date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          ALTER TABLE moods ENABLE ROW LEVEL SECURITY;
          
          CREATE POLICY "Usuários podem ver apenas seus próprios registros de humor" ON moods
            FOR SELECT USING (auth.uid() = user_id);
          
          CREATE POLICY "Usuários podem inserir seus próprios registros de humor" ON moods
            FOR INSERT WITH CHECK (auth.uid() = user_id);
          
          CREATE POLICY "Usuários podem atualizar apenas seus próprios registros de humor" ON moods
            FOR UPDATE USING (auth.uid() = user_id);
          
          CREATE POLICY "Usuários podem excluir apenas seus próprios registros de humor" ON moods
            FOR DELETE USING (auth.uid() = user_id);
            
          CREATE INDEX idx_moods_user_id ON moods(user_id);
        `
      });
    
    if (createError) {
      console.error('Erro ao criar tabela de humor:', createError);
      return false;
    }
    console.log('Tabela de humor criada com sucesso!');
  } else {
    console.log('Tabela de humor já existe.');
  }
  
  return true;
}

// Função para criar a tabela de despesas
async function createExpensesTable() {
  console.log('Criando tabela de despesas...');
  const { error } = await supabase.from('expenses').select('*').limit(1);
  
  if (error && error.code === '42P01') { // Tabela não existe
    const { error: createError } = await supabase
      .rpc('execute_sql', {
        sql_query: `
          CREATE TABLE IF NOT EXISTS expenses (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            category TEXT NOT NULL,
            amount DECIMAL(10, 2) NOT NULL,
            date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            description TEXT,
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
          
          CREATE POLICY "Usuários podem ver apenas suas próprias despesas" ON expenses
            FOR SELECT USING (auth.uid() = user_id);
          
          CREATE POLICY "Usuários podem inserir suas próprias despesas" ON expenses
            FOR INSERT WITH CHECK (auth.uid() = user_id);
          
          CREATE POLICY "Usuários podem atualizar apenas suas próprias despesas" ON expenses
            FOR UPDATE USING (auth.uid() = user_id);
          
          CREATE POLICY "Usuários podem excluir apenas suas próprias despesas" ON expenses
            FOR DELETE USING (auth.uid() = user_id);
            
          CREATE INDEX idx_expenses_user_id ON expenses(user_id);
        `
      });
    
    if (createError) {
      console.error('Erro ao criar tabela de despesas:', createError);
      return false;
    }
    console.log('Tabela de despesas criada com sucesso!');
  } else {
    console.log('Tabela de despesas já existe.');
  }
  
  return true;
}

// Função para criar a tabela de projetos
async function createProjectsTable() {
  console.log('Criando tabela de projetos...');
  const { error } = await supabase.from('projects').select('*').limit(1);
  
  if (error && error.code === '42P01') { // Tabela não existe
    const { error: createError } = await supabase
      .rpc('execute_sql', {
        sql_query: `
          CREATE TABLE IF NOT EXISTS projects (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            title TEXT NOT NULL,
            description TEXT,
            progress INTEGER DEFAULT 0,
            deadline TIMESTAMP WITH TIME ZONE,
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
          
          CREATE POLICY "Usuários podem ver apenas seus próprios projetos" ON projects
            FOR SELECT USING (auth.uid() = user_id);
          
          CREATE POLICY "Usuários podem inserir seus próprios projetos" ON projects
            FOR INSERT WITH CHECK (auth.uid() = user_id);
          
          CREATE POLICY "Usuários podem atualizar apenas seus próprios projetos" ON projects
            FOR UPDATE USING (auth.uid() = user_id);
          
          CREATE POLICY "Usuários podem excluir apenas seus próprios projetos" ON projects
            FOR DELETE USING (auth.uid() = user_id);
            
          CREATE INDEX idx_projects_user_id ON projects(user_id);
        `
      });
    
    if (createError) {
      console.error('Erro ao criar tabela de projetos:', createError);
      return false;
    }
    console.log('Tabela de projetos criada com sucesso!');
  } else {
    console.log('Tabela de projetos já existe.');
  }
  
  return true;
}

// Função para criar a tabela de registros de sono
async function createSleepLogsTable() {
  console.log('Criando tabela de registros de sono...');
  const { error } = await supabase.from('sleep_logs').select('*').limit(1);
  
  if (error && error.code === '42P01') { // Tabela não existe
    const { error: createError } = await supabase
      .rpc('execute_sql', {
        sql_query: `
          CREATE TABLE IF NOT EXISTS sleep_logs (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            start_time TIMESTAMP WITH TIME ZONE NOT NULL,
            end_time TIMESTAMP WITH TIME ZONE NOT NULL,
            sleep_quality INTEGER,
            notes TEXT,
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          ALTER TABLE sleep_logs ENABLE ROW LEVEL SECURITY;
          
          CREATE POLICY "Usuários podem ver apenas seus próprios registros de sono" ON sleep_logs
            FOR SELECT USING (auth.uid() = user_id);
          
          CREATE POLICY "Usuários podem inserir seus próprios registros de sono" ON sleep_logs
            FOR INSERT WITH CHECK (auth.uid() = user_id);
          
          CREATE POLICY "Usuários podem atualizar apenas seus próprios registros de sono" ON sleep_logs
            FOR UPDATE USING (auth.uid() = user_id);
          
          CREATE POLICY "Usuários podem excluir apenas seus próprios registros de sono" ON sleep_logs
            FOR DELETE USING (auth.uid() = user_id);
            
          CREATE INDEX idx_sleep_logs_user_id ON sleep_logs(user_id);
        `
      });
    
    if (createError) {
      console.error('Erro ao criar tabela de registros de sono:', createError);
      return false;
    }
    console.log('Tabela de registros de sono criada com sucesso!');
  } else {
    console.log('Tabela de registros de sono já existe.');
  }
  
  return true;
}

// Função principal para criar todas as tabelas
async function createAllTables() {
  try {
    // Verifica se a função execute_sql existe
    const { data, error } = await supabase.rpc('execute_sql', {
      sql_query: 'SELECT 1;'
    });
    
    if (error) {
      console.error('Erro: A função execute_sql não existe no Supabase. Criando a função...');
      
      // Cria a função execute_sql
      const { error: createFunctionError } = await supabase.rpc('create_sql_function', {
        function_name: 'execute_sql',
        function_definition: `
          CREATE OR REPLACE FUNCTION execute_sql(sql_query TEXT)
          RETURNS VOID
          LANGUAGE plpgsql
          SECURITY DEFINER
          AS $$
          BEGIN
            EXECUTE sql_query;
          END;
          $$;
        `
      });
      
      if (createFunctionError) {
        console.error('Erro ao criar função execute_sql:', createFunctionError);
        return false;
      }
      
      console.log('Função execute_sql criada com sucesso!');
    }
    
    // Cria as tabelas em ordem
    await createUsersTable();
    await createPrioritiesTable();
    await createNotesTable();
    await createSessionsTable();
    await createMedicationsTable();
    await createMoodsTable();
    await createExpensesTable();
    await createProjectsTable();
    await createSleepLogsTable();
    
    console.log('Todas as tabelas foram criadas com sucesso!');
    return true;
  } catch (error) {
    console.error('Erro ao criar tabelas:', error);
    return false;
  }
}

// Executa a função principal
createAllTables()
  .then(success => {
    if (success) {
      console.log('Processo concluído com sucesso!');
      process.exit(0);
    } else {
      console.error('Processo concluído com erros.');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Erro fatal:', error);
    process.exit(1);
  }); 