/**
 * Script mais simples para atualizar a verificação de conexão
 */
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Pegando credenciais do arquivo .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; 

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Erro: Variáveis NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são necessárias.');
  process.exit(1);
}

// Criar cliente Supabase com chave de serviço (admin)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Atualizar o arquivo utils.ts para usar uma abordagem diferente para verificar conexão
console.log('Modificando a função checkConnection no arquivo supabase/utils.ts');

const fs = require('fs');
const path = require('path');
const utilsPath = path.join(__dirname, '..', 'supabase', 'utils.ts');

try {
  // Ler o arquivo atual
  let utilsContent = fs.readFileSync(utilsPath, 'utf8');
  
  // Função checkConnection atualizada
  const updatedFunction = `/**
 * Verifica se há conexão com o Supabase
 * @returns Objeto indicando sucesso ou falha
 */
export async function checkConnection(): Promise<{ online: boolean; error?: string }> {
  try {
    // Primeiro verificamos se o navegador tem conexão
    if (typeof navigator !== 'undefined' && 'onLine' in navigator) {
      if (!navigator.onLine) {
        return { online: false, error: 'Dispositivo offline' };
      }
    }

    // Fazemos uma requisição simples ao Supabase
    // para verificar se a conexão está funcionando
    const { data, error } = await supabase.from('_verificacao_conexao_').select('*').limit(1).maybeSingle();
    
    // A tabela não precisa existir - queremos apenas verificar se conseguimos
    // fazer uma requisição para o Supabase sem erros de autenticação/conexão
    return { online: !error || error.code === 'PGRST116', error: error?.message };
  } catch (err) {
    console.error('Erro ao verificar conexão:', err);
    return { online: false, error: err instanceof Error ? err.message : 'Erro desconhecido' };
  }
}`;

  // Substituir a função atual pela nova versão
  const checkConnectionRegex = /export async function checkConnection\(\)[\s\S]*?^}/m;
  utilsContent = utilsContent.replace(checkConnectionRegex, updatedFunction);
  
  // Escrever o arquivo atualizado
  fs.writeFileSync(utilsPath, utilsContent);
  
  console.log('✅ Arquivo supabase/utils.ts atualizado com sucesso!');
  console.log('✅ A função checkConnection agora usa um método mais simples e confiável para verificação de conexão.');
} catch (error) {
  console.error('❌ Erro ao atualizar o arquivo:', error);
  process.exit(1);
} 