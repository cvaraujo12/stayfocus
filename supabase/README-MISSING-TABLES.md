# Criação de Tabelas Faltantes no Supabase

Este documento contém instruções para criar as tabelas faltantes no banco de dados do Supabase que são necessárias para o funcionamento do aplicativo.

## Problema

Várias tabelas necessárias para o funcionamento do aplicativo não existem no banco de dados do Supabase, o que está causando erros de relação inexistente (`relation does not exist`) quando o aplicativo tenta acessá-las:

- `public.self_knowledge_notes` (notas de autoconhecimento)
- `public.study_sessions` (sessões de estudo)
- `public.sleep_records` (registros de sono)
- `public.medication_logs` (registros de medicamentos)

## Solução

Existem duas maneiras de criar as tabelas faltantes:

### Método 1: Usando o script Node.js

1. Certifique-se de que as variáveis de ambiente estão configuradas no arquivo `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
   SUPABASE_SERVICE_ROLE_KEY=sua_chave_de_servico_do_supabase
   ```

2. Execute o script `execute-missing-tables.js` para criar as tabelas:
   ```bash
   node supabase/execute-missing-tables.js
   ```

### Método 2: Usando o Painel de Administração do Supabase

1. Acesse o painel de administração do Supabase
2. Vá para o menu SQL Editor
3. Crie uma nova consulta SQL
4. Copie e cole o conteúdo do arquivo `supabase/create_missing_tables.sql` 
5. Execute o SQL

## Verificação

Após criar as tabelas, você pode verificar se elas foram criadas corretamente executando o seguinte comando SQL no Editor SQL do Supabase:

```sql
SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'self_knowledge_notes');
SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'study_sessions');
SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'sleep_records');
SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'medication_logs');
```

Cada consulta deve retornar `true` se a tabela correspondente existir.