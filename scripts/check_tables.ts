import { createClient } from '@supabase/supabase-js'
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

// Lista de tabelas que deveriam existir
const expectedTables = [
  'priorities',
  'self_knowledge_notes',
  'study_sessions',
  'medications',
  'medication_logs',
  'sleep_records'
]

async function checkTablesExist() {
  try {
    console.log('🔍 Verificando tabelas no Supabase...\n')
    
    // Consulta para obter todas as tabelas no esquema 'public'
    const { data, error } = await supabase
      .from('pg_tables')
      .select('tablename')
      .eq('schemaname', 'public')
    
    if (error) {
      console.error('Erro ao consultar tabelas:', error.message)
      process.exit(1)
    }
    
    if (!data) {
      console.log('❌ Não foi possível obter informações sobre as tabelas.')
      process.exit(1)
    }
    
    // Extrai os nomes das tabelas
    const existingTables = data.map(row => row.tablename)
    
    console.log('📊 Tabelas no banco de dados:')
    existingTables.forEach(table => {
      console.log(`  - ${table}`)
    })
    
    console.log('\n🔄 Verificando tabelas necessárias:')
    
    let allTablesExist = true
    
    // Verifica se todas as tabelas esperadas existem
    for (const table of expectedTables) {
      if (existingTables.includes(table)) {
        console.log(`  ✅ ${table}`)
      } else {
        console.log(`  ❌ ${table} (ausente)`)
        allTablesExist = false
      }
    }
    
    // Verifica se há tabelas adicionais
    const unexpectedTables = existingTables.filter(table => 
      !expectedTables.includes(table) && 
      !table.startsWith('_') &&
      !['schema_migrations', 'pg_stat_statements'].includes(table)
    )
    
    if (unexpectedTables.length > 0) {
      console.log('\n⚠️ Tabelas adicionais encontradas:')
      unexpectedTables.forEach(table => {
        console.log(`  - ${table}`)
      })
    }
    
    console.log('\n--- Resumo ---')
    if (allTablesExist) {
      console.log('✅ Todas as tabelas necessárias estão presentes!')
    } else {
      console.log('❌ Faltam tabelas necessárias no banco de dados.')
      console.log('   Execute "npm run db:setup" para criar as tabelas ausentes.')
    }
    
    // Verificar contagem de registros para cada tabela
    console.log('\n📝 Contagem de registros por tabela:')
    for (const table of expectedTables) {
      if (existingTables.includes(table)) {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true })
        
        if (error) {
          console.log(`  - ${table}: Erro ao contar registros`)
        } else {
          console.log(`  - ${table}: ${count} registro(s)`)
        }
      }
    }
    
  } catch (error) {
    console.error('Erro não tratado:', error)
    process.exit(1)
  }
}

// Executa a função principal
checkTablesExist().catch(error => {
  console.error('Erro não tratado:', error)
  process.exit(1)
}) 