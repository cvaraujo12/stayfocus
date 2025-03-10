# Testes de Sincronização Zustand-Supabase

Este documento descreve como executar os testes de sincronização entre o estado local (Zustand) e o backend (Supabase) no projeto StayFocus.

## Pré-requisitos

- Node.js instalado
- Conta no Supabase com acesso administrativo
- Arquivo `.env.local` configurado com as credenciais do Supabase

## Configuração do Ambiente

1. Certifique-se de que o arquivo `.env.local` contém as seguintes variáveis:

```
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima
SUPABASE_SERVICE_ROLE_KEY=sua-chave-de-servico
```

2. Instale as dependências necessárias:

```bash
npm install
```

## Estrutura dos Testes

Os testes estão organizados em diferentes scripts, cada um com uma função específica:

1. **create-test-user.js**: Cria um usuário de teste para os testes de sincronização
2. **install-functions.js**: Instala as funções SQL necessárias no banco de dados Supabase
3. **test-sync-complete.js**: Executa o teste completo de sincronização

## Funções SQL Necessárias

Para que os testes funcionem corretamente, as seguintes funções SQL precisam ser instaladas no Supabase:

1. **exec_sql**: Permite executar comandos SQL arbitrários
2. **check_policy_exists**: Verifica se uma política de segurança existe em uma tabela

Estas funções podem ser instaladas via script ou manualmente através do SQL Editor do Supabase.

## Executando os Testes

### 1. Instalação das Funções SQL

```bash
node supabase/install-functions.js
```

Este script tentará instalar as funções SQL necessárias. Se houver erros, você precisará instalá-las manualmente usando o SQL Editor do Supabase, com o conteúdo dos arquivos:

- `supabase/create_exec_sql_function.sql`
- `supabase/create_check_policy_function.sql`

### 2. Criação de Usuário de Teste

```bash
node supabase/create-test-user.js
```

Este script criará um usuário de teste e salvará as credenciais em `.test-user-credentials.json`.

### 3. Teste Completo de Sincronização

```bash
node test-sync-complete.js
```

Este script executa um teste completo de sincronização, incluindo:

1. Instalação das funções SQL
2. Criação de um usuário de teste
3. Teste do mecanismo de sincronização

## Teste Manual

Você também pode testar manualmente a sincronização seguindo estes passos:

1. Acesse a página de teste em `/teste-sincronizacao`
2. Adicione algumas tarefas quando online
3. Desconecte da internet (modo avião ou desative o Wi-Fi)
4. Adicione mais tarefas - elas serão salvas localmente
5. Reconecte à internet
6. Clique em "Verificar Conexão" - as tarefas pendentes serão sincronizadas
7. Recarregue a página para verificar se todas as tarefas foram persistidas

## Solução de Problemas

### Erro na Criação das Funções SQL

Se você receber erros ao tentar instalar as funções SQL, será necessário instalá-las manualmente:

1. Acesse o Painel Admin do Supabase
2. Vá para SQL Editor
3. Cole o conteúdo de `create_exec_sql_function.sql`
4. Execute o SQL
5. Repita para `create_check_policy_function.sql`

### Erro na Criação do Usuário de Teste

Se houver erros na criação do usuário de teste, verifique:

1. Se as permissões de autenticação estão configuradas corretamente
2. Se o esquema do banco de dados está correto
3. Se as políticas de segurança (RLS) estão configuradas

### Erros de Sincronização

Se houver erros durante a sincronização, verifique:

1. Se as tabelas têm a estrutura correta (campos `id` e `user_id`)
2. Se as políticas de segurança permitem as operações necessárias
3. Se há restrições de chave estrangeira bloqueando inserções

## Tabelas Necessárias

Os testes assumem que as seguintes tabelas existem no Supabase:

1. `tarefas`: Para armazenar as tarefas de teste
2. `perfis`: Para armazenar informações do perfil do usuário

## Operações Testadas

Os testes verificam as seguintes operações:

1. Inserção de dados quando online
2. Armazenamento de operações em fila quando offline
3. Sincronização da fila quando volta a ficar online
4. Verificação de dados inseridos no Supabase 