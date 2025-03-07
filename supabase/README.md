# Configuração do Supabase para o StayFocus

Este diretório contém todos os arquivos necessários para configurar e interagir com o Supabase, o backend do aplicativo StayFocus.

## Estrutura do Diretório

- `client.ts`: Configuração do cliente Supabase
- `auth.ts`: Funções de autenticação
- `utils.ts`: Funções CRUD genéricas
- `index.ts`: Exportações centralizadas
- `test-connection.ts`: Script para testar a conexão com o Supabase
- `test-crud.ts`: Script para testar as operações CRUD
- `verify-tables.js`: Script para verificar se as tabelas necessárias existem
- `migrations/`: Scripts SQL para criar tabelas e funções

## Configuração Inicial

1. Crie um projeto no [Supabase](https://app.supabase.io/)
2. Obtenha as credenciais do projeto (URL e chaves)
3. Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
SUPABASE_SERVICE_ROLE_KEY=sua_chave_de_servico_do_supabase
```

## Criação das Tabelas

Para criar as tabelas necessárias no Supabase, siga as instruções no arquivo `migrations/README.md`. Em resumo:

1. Acesse o painel de administração do Supabase
2. Vá para o SQL Editor
3. Copie e cole o conteúdo do arquivo `migrations/create_tables_direct.sql`
4. Execute o script SQL

## Verificação da Configuração

Para verificar se tudo está configurado corretamente:

1. Teste a conexão com o Supabase:

```bash
npx ts-node supabase/test-connection.ts
```

2. Verifique se as tabelas foram criadas corretamente:

```bash
node supabase/verify-tables.js
```

3. Teste as operações CRUD:

```bash
npx ts-node supabase/test-crud.ts
```

## Autenticação

O StayFocus suporta os seguintes métodos de autenticação:

- Email/senha
- GitHub
- Google

Para configurar a autenticação com provedores OAuth:

1. No painel do Supabase, vá para Authentication > Providers
2. Ative os provedores desejados (GitHub, Google)
3. Configure as credenciais de cada provedor

## Operações CRUD

O arquivo `utils.ts` contém funções genéricas para operações CRUD com tratamento de erros e respostas padronizadas:

### Tipo de Resposta

```typescript
type CrudResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  status?: number;
  message?: string;
};
```

### Funções Disponíveis

- `fetchData<T>(table: string): Promise<CrudResponse<T[]>>`
  - Busca todos os registros de uma tabela específica
  - Parâmetros:
    - `table`: Nome da tabela no Supabase
  - Retorno: Objeto com status da operação, dados e mensagens

- `insertData<T>(table: string, payload: any): Promise<CrudResponse<T>>`
  - Insere um novo registro em uma tabela específica
  - Parâmetros:
    - `table`: Nome da tabela no Supabase
    - `payload`: Dados a serem inseridos
  - Retorno: Objeto com status da operação, dados inseridos e mensagens

- `updateData<T>(table: string, id: string, payload: any): Promise<CrudResponse<T>>`
  - Atualiza um registro existente em uma tabela específica
  - Parâmetros:
    - `table`: Nome da tabela no Supabase
    - `id`: ID do registro a ser atualizado
    - `payload`: Dados a serem atualizados
  - Retorno: Objeto com status da operação, dados atualizados e mensagens

- `deleteData<T>(table: string, id: string): Promise<CrudResponse<T>>`
  - Remove um registro de uma tabela específica
  - Parâmetros:
    - `table`: Nome da tabela no Supabase
    - `id`: ID do registro a ser removido
  - Retorno: Objeto com status da operação, dados removidos e mensagens

- `fetchFilteredData<T>(table: string, column: string, value: any): Promise<CrudResponse<T[]>>`
  - Busca dados com filtros personalizados
  - Parâmetros:
    - `table`: Nome da tabela no Supabase
    - `column`: Coluna para filtrar
    - `value`: Valor para filtrar
  - Retorno: Objeto com status da operação, dados filtrados e mensagens

### Exemplo de Uso

```typescript
import { fetchData, insertData, updateData, deleteData } from '@/supabase';

// Buscar todos os registros
const { success, data, error, message } = await fetchData('priorities');
if (success) {
  console.log('Dados recuperados:', data);
} else {
  console.error('Erro:', message);
}

// Inserir um novo registro
const newPriority = {
  title: 'Nova prioridade',
  description: 'Descrição da prioridade',
  status: 'pendente',
  user_id: 'id-do-usuario'
};
const insertResult = await insertData('priorities', newPriority);
if (insertResult.success) {
  console.log('Registro inserido:', insertResult.data);
} else {
  console.error('Erro ao inserir:', insertResult.message);
}

// Atualizar um registro
const updateResult = await updateData('priorities', 'id-do-registro', {
  title: 'Título atualizado',
  status: 'concluído'
});
if (updateResult.success) {
  console.log('Registro atualizado:', updateResult.data);
} else {
  console.error('Erro ao atualizar:', updateResult.message);
}

// Remover um registro
const deleteResult = await deleteData('priorities', 'id-do-registro');
if (deleteResult.success) {
  console.log('Registro removido com sucesso');
} else {
  console.error('Erro ao remover:', deleteResult.message);
}
```

## Sincronização Offline

O StayFocus implementa sincronização offline usando o middleware `persist` do Zustand. Quando o usuário está offline, os dados são armazenados localmente e sincronizados com o Supabase quando a conexão é restabelecida.

## Segurança

Todas as tabelas implementam Row Level Security (RLS) para garantir que os usuários só possam acessar seus próprios dados. As políticas de segurança são configuradas automaticamente pelo script de criação de tabelas. 