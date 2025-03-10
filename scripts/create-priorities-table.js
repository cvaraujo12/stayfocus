// Script simplificado para criar a tabela de prioridades no Supabase
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Configuração das credenciais do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Credenciais do Supabase não encontradas em variáveis de ambiente');
  console.log('Por favor, defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no arquivo .env.local');
  process.exit(1);
}

// Inicializar cliente Supabase com chave de serviço para acesso administrativo
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Criar ou atualizar a tabela priorities
async function createPrioritiesTable() {
  try {
    console.log('🔧 Criando a tabela priorities...');
    
    // Criar tabela
    // Nota: Supabase não tem uma API direta para criar tabelas, então instruímos o usuário a fazê-lo manualmente
    console.log('🔹 Para criar a tabela priorities, execute o seguinte SQL no painel do Supabase:');
    console.log(`
    -- Criar a tabela priorities
    CREATE TABLE IF NOT EXISTS priorities (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      texto TEXT NOT NULL,
      concluida BOOLEAN NOT NULL DEFAULT FALSE,
      data_prioridade DATE NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      CONSTRAINT prioridade_unique UNIQUE (user_id, data_prioridade, texto)
    );

    -- Adicionar índices para melhorar performance
    CREATE INDEX IF NOT EXISTS priorities_user_id_idx ON priorities(user_id);
    CREATE INDEX IF NOT EXISTS priorities_data_prioridade_idx ON priorities(data_prioridade);
    
    -- Configurar RLS (Row Level Security)
    ALTER TABLE priorities ENABLE ROW LEVEL SECURITY;
    
    -- Criar políticas de acesso
    CREATE POLICY "Usuários podem ver apenas suas próprias prioridades" 
      ON priorities FOR SELECT 
      USING (auth.uid() = user_id);
      
    CREATE POLICY "Usuários podem inserir apenas suas próprias prioridades" 
      ON priorities FOR INSERT 
      WITH CHECK (auth.uid() = user_id);
      
    CREATE POLICY "Usuários podem atualizar apenas suas próprias prioridades" 
      ON priorities FOR UPDATE 
      USING (auth.uid() = user_id);
      
    CREATE POLICY "Usuários podem excluir apenas suas próprias prioridades" 
      ON priorities FOR DELETE 
      USING (auth.uid() = user_id);
    
    -- Trigger para atualizar o campo updated_at
    CREATE OR REPLACE FUNCTION update_priorities_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
    
    -- Criar trigger
    CREATE TRIGGER update_priorities_updated_at_trigger
    BEFORE UPDATE ON priorities
    FOR EACH ROW
    EXECUTE FUNCTION update_priorities_updated_at();
    `);
    
    // Como temos o supabase-js, vamos criar um registro de teste para verificar se a tabela existe
    // Isso não criará a tabela, mas nos mostrará se ela já existe
    console.log('\n🔍 Verificando se a tabela priorities já existe...');
    const { error } = await supabase
      .from('priorities')
      .select('*')
      .limit(1);
    
    if (error && error.code === 'PGRST104') {
      console.log('❌ A tabela priorities não existe. Por favor, crie a tabela usando o SQL fornecido acima.');
    } else if (error) {
      console.log('⚠️ Ocorreu um erro ao verificar a tabela:', error.message);
    } else {
      console.log('✅ A tabela priorities já existe!');
      console.log('🔧 Você pode atualizar a estrutura executando o SQL acima se necessário.');
    }
    
    console.log('\n🌐 Para executar o SQL, acesse o painel do Supabase em:');
    console.log(`${supabaseUrl}/project/sql`);
  } catch (error) {
    console.error('❌ Erro não tratado:', error);
  }
}

// Executar
createPrioritiesTable(); 