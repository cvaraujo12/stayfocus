const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const crypto = require('crypto');

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

// Função para criar um usuário de teste
async function createTestUser() {
  try {
    const email = `test_${crypto.randomUUID().replace(/-/g, '')}@stayfocus.test`;
    const password = 'Teste@123';
    
    console.log(`Criando usuário de teste: ${email}`);
    
    // Criar usuário no Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true // Confirma o email automaticamente
    });
    
    if (authError) {
      console.error('Erro ao criar usuário de teste na autenticação:', authError);
      return null;
    }
    
    const userId = authData.user.id;
    console.log(`Usuário criado com sucesso. ID: ${userId}`);
    
    // Criar perfil para o usuário
    const { error: profileError } = await supabase
      .from('perfis')
      .insert({
        id: userId,
        nome: 'Usuário de Teste',
        email,
        created_at: new Date().toISOString()
      });
    
    if (profileError) {
      console.error('Erro ao criar perfil do usuário:', profileError);
      // Não encerra, pois o usuário já foi criado
    } else {
      console.log('Perfil do usuário criado com sucesso');
    }
    
    return {
      userId,
      email,
      password
    };
  } catch (error) {
    console.error('Erro ao criar usuário de teste:', error);
    return null;
  }
}

// Executar o script
async function main() {
  try {
    console.log('Iniciando criação de usuário de teste...');
    const user = await createTestUser();
    
    if (user) {
      console.log('\nUsuário de teste criado com sucesso:');
      console.log('--------------------------------------');
      console.log(`ID: ${user.userId}`);
      console.log(`Email: ${user.email}`);
      console.log(`Senha: ${user.password}`);
      console.log('--------------------------------------');
      console.log('\nEste usuário pode ser usado para testes de sincronização.');
      
      // Salvar as credenciais em um arquivo para uso posterior
      const fs = require('fs');
      fs.writeFileSync('.test-user-credentials.json', JSON.stringify(user, null, 2));
      console.log('Credenciais salvas em .test-user-credentials.json');
    } else {
      console.error('Falha ao criar usuário de teste.');
      process.exit(1);
    }
  } catch (error) {
    console.error('Erro durante a execução:', error);
    process.exit(1);
  }
}

// Se este arquivo for executado diretamente
if (require.main === module) {
  main();
}

module.exports = {
  createTestUser
}; 