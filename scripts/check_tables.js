const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

// Verifica se as variáveis de ambiente necessárias existem
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Erro: Variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY são obrigatórias')
  process.exit(1)
}

// Cria o cliente Supabase usando a chave anônima (menos privilégios, mas suficiente para verificar tabelas)
const supabase = createClient(supabaseUrl, supabaseKey)

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
    
    const existingTables = []
    const missingTables = []
    
    // Verificar cada tabela esperada
    for (const table of expectedTables) {
      try {
        // Tenta acessar a tabela para ver se ela existe
        const { error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true })
          .limit(0)
        
        if (error && error.code === '42P01') { // Código para "relation does not exist"
          missingTables.push(table)
          console.log(`  ❌ ${table} (ausente)`)
        } else {
          existingTables.push(table)
          console.log(`  ✅ ${table}`)
        }
      } catch (e) {
        missingTables.push(table)
        console.log(`  ❌ ${table} (erro ao verificar): ${e.message}`)
      }
    }
    
    console.log('\n--- Resumo ---')
    if (missingTables.length === 0) {
      console.log('✅ Todas as tabelas necessárias estão presentes!')
    } else {
      console.log('❌ Faltam tabelas necessárias no banco de dados:')
      missingTables.forEach(table => {
        console.log(`   - ${table}`)
      })
      console.log('\nExecute "npm run db:setup" para criar as tabelas ausentes.')
    }
    
    // Verificar contagem de registros para cada tabela existente
    if (existingTables.length > 0) {
      console.log('\n📝 Contagem de registros por tabela:')
      for (const table of existingTables) {
        try {
          const { count, error } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true })
          
          if (error) {
            console.log(`  - ${table}: Erro ao contar registros: ${error.message}`)
          } else {
            console.log(`  - ${table}: ${count} registro(s)`)
          }
        } catch (e) {
          console.log(`  - ${table}: Erro ao contar registros: ${e.message}`)
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