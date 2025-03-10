import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

// Carrega as variáveis de ambiente do arquivo .env
dotenv.config()

// Verifica se as variáveis de ambiente necessárias existem
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Erro: Variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias')
  process.exit(1)
}

// Cria o cliente Supabase usando a chave de serviço (possui privilégios elevados)
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function executeSetupScript() {
  try {
    // Lê o arquivo SQL com o script de criação de tabelas
    const scriptPath = path.join(__dirname, 'create_tables.sql')
    const sqlScript = fs.readFileSync(scriptPath, 'utf-8')
    
    console.log('Executando script de configuração do banco de dados...')
    
    // Divide o script em comandos separados para executar um por um
    const commands = sqlScript
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0)
    
    let successCount = 0
    let errorCount = 0
    
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i]
      console.log(`Executando comando ${i + 1}/${commands.length}...`)
      
      try {
        // Executa o comando SQL
        const { error } = await supabase.rpc('exec_sql', { sql_query: command })
        
        if (error) {
          console.error(`Erro ao executar comando ${i + 1}:`, error.message)
          errorCount++
        } else {
          successCount++
        }
      } catch (err) {
        console.error(`Erro ao executar comando ${i + 1}:`, err)
        errorCount++
      }
    }
    
    console.log('\n--- Resumo da Execução ---')
    console.log(`Total de comandos: ${commands.length}`)
    console.log(`Comandos bem-sucedidos: ${successCount}`)
    console.log(`Comandos com erro: ${errorCount}`)
    
    if (errorCount === 0) {
      console.log('\n✅ Configuração do banco de dados concluída com sucesso!')
    } else {
      console.log('\n⚠️ Configuração do banco de dados concluída com avisos/erros.')
    }
    
  } catch (error) {
    console.error('Erro ao ler ou executar o script SQL:', error)
    process.exit(1)
  }
}

// Executa a função principal
executeSetupScript().catch(error => {
  console.error('Erro não tratado:', error)
  process.exit(1)
}) 