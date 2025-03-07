# Instruções para Criar as Tabelas no Supabase

Este diretório contém os scripts SQL necessários para criar as tabelas do painel StayFocus no Supabase.

## Pré-requisitos

- Acesso ao painel de administração do Supabase
- Permissões para executar SQL no banco de dados

## Como Executar o Script SQL

1. Acesse o painel de administração do Supabase em [https://app.supabase.io/](https://app.supabase.io/)
2. Selecione o projeto StayFocus
3. No menu lateral, clique em "SQL Editor"
4. Clique em "New Query" (Nova Consulta)
5. Copie e cole o conteúdo do arquivo `create_tables_direct.sql` no editor
6. Clique em "Run" (Executar) para criar as tabelas

## Função de Verificação de Políticas

Para facilitar a verificação das políticas de segurança, você pode criar uma função auxiliar:

1. Crie uma nova consulta SQL no editor do Supabase
2. Copie e cole o conteúdo do arquivo `create_check_policy_function.sql`
3. Execute o script para criar a função `check_policy_exists`

Esta função permite verificar se uma política específica existe em uma tabela, o que é útil para diagnóstico e verificação da configuração de segurança.

## Estrutura das Tabelas

O script cria as seguintes tabelas:

1. `users`: Informações básicas do usuário
   - id (UUID, chave primária)
   - name (TEXT, não nulo)
   - email (TEXT, único, não nulo)
   - created_at (TIMESTAMP)
   - updated_at (TIMESTAMP)

2. `priorities`: Tarefas e prioridades diárias
   - id (UUID, chave primária)
   - title (TEXT, não nulo)
   - description (TEXT)
   - status (TEXT, padrão 'pendente')
   - user_id (UUID, referência a users.id)
   - created_at (TIMESTAMP)
   - updated_at (TIMESTAMP)

3. `notes`: Notas de autoconhecimento
   - id (UUID, chave primária)
   - content (TEXT, não nulo)
   - category (TEXT)
   - tags (TEXT[])
   - user_id (UUID, referência a users.id)
   - created_at (TIMESTAMP)
   - updated_at (TIMESTAMP)

4. `sessions`: Sessões de estudo registradas
   - id (UUID, chave primária)
   - duration (INTEGER, não nulo)
   - notes (TEXT)
   - date (TIMESTAMP)
   - user_id (UUID, referência a users.id)
   - created_at (TIMESTAMP)

5. `medications`: Rastreamento de medicação
   - id (UUID, chave primária)
   - name (TEXT, não nulo)
   - schedule (TIME, não nulo)
   - status (BOOLEAN, padrão FALSE)
   - dosage (TEXT)
   - frequency (TEXT)
   - user_id (UUID, referência a users.id)
   - created_at (TIMESTAMP)
   - updated_at (TIMESTAMP)

6. `moods`: Registros de humor
   - id (UUID, chave primária)
   - mood_state (INTEGER, não nulo)
   - notes (TEXT)
   - date (TIMESTAMP)
   - user_id (UUID, referência a users.id)
   - created_at (TIMESTAMP)

7. `expenses`: Gastos financeiros categorizados
   - id (UUID, chave primária)
   - category (TEXT, não nulo)
   - amount (DECIMAL, não nulo)
   - date (TIMESTAMP)
   - description (TEXT)
   - user_id (UUID, referência a users.id)
   - created_at (TIMESTAMP)

8. `projects`: Projetos e hiperfocos
   - id (UUID, chave primária)
   - title (TEXT, não nulo)
   - description (TEXT)
   - progress (INTEGER, padrão 0)
   - deadline (TIMESTAMP)
   - user_id (UUID, referência a users.id)
   - created_at (TIMESTAMP)
   - updated_at (TIMESTAMP)

9. `sleep_logs`: Registros de sono
   - id (UUID, chave primária)
   - start_time (TIMESTAMP, não nulo)
   - end_time (TIMESTAMP, não nulo)
   - sleep_quality (INTEGER)
   - notes (TEXT)
   - user_id (UUID, referência a users.id)
   - created_at (TIMESTAMP)

## Segurança

O script também configura:

- Row Level Security (RLS) para todas as tabelas
- Políticas de acesso para garantir que os usuários só possam ver e modificar seus próprios dados
- Índices para melhorar a performance das consultas

## Verificação

Após executar o script, você pode verificar se as tabelas foram criadas corretamente:

1. No menu lateral do Supabase, clique em "Table Editor"
2. Você deverá ver todas as tabelas listadas
3. Clique em cada tabela para verificar sua estrutura

Alternativamente, você pode executar o script de verificação:

```bash
node ../verify-tables.js
```

Este script verificará se todas as tabelas necessárias existem no Supabase e, se a função `check_policy_exists` estiver disponível, também verificará algumas políticas de segurança importantes.

## Solução de Problemas

Se encontrar erros ao executar o script:

1. Verifique se você tem permissões suficientes no Supabase
2. Tente executar o script em partes menores
3. Verifique os logs de erro no painel do Supabase 