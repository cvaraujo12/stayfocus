# Sincronização entre Zustand e Supabase

Este documento descreve como a sincronização entre o estado local (Zustand) e o backend (Supabase) foi implementada no projeto StayFocus.

## Visão Geral

A sincronização implementada permite:

1. **Persistência Local**: Todos os dados são salvos localmente usando `localStorage` via middleware do Zustand.
2. **Sincronização Automática**: Quando online, os dados são automaticamente sincronizados com o Supabase.
3. **Modo Offline**: Quando offline, as alterações são armazenadas localmente e sincronizadas quando a conexão for restabelecida.
4. **Detecção de Conexão**: O sistema detecta automaticamente o status da conexão e adapta o comportamento.

## Arquitetura

A implementação consiste em três componentes principais:

1. **Middleware de Sincronização**: Implementado em `app/store/syncMiddleware.ts`
2. **Integração com Zustand**: Configurada em `app/store/index.ts`
3. **Componente de UI**: Implementado em `app/components/SyncStatus.tsx`

## Como Funciona

### Middleware de Sincronização

O middleware `syncWithSupabase` intercepta todas as atualizações de estado e:

- Quando online, envia as alterações para o Supabase
- Quando offline, armazena as alterações em um estado pendente
- Quando a conexão é restabelecida, sincroniza todas as alterações pendentes

### Mapeamento de Tabelas

O mapeamento entre as chaves do estado e as tabelas do Supabase é definido em `app/store/index.ts`:

```typescript
const tableMapping = {
  'tarefas': 'tarefas',
  'blocos_tempo': 'blocosTempo',
  'refeicoes': 'refeicoes',
  'medicacoes': 'medicacoes',
  'medicamentos': 'medicamentos',
  'registros_humor': 'registrosHumor',
};
```

### Detecção de Conexão

A detecção de conexão é feita de duas formas:

1. **API do Navegador**: Usando `navigator.onLine`
2. **Verificação Ativa**: Tentando fazer uma requisição para o Supabase

Além disso, o sistema:
- Escuta eventos `online` e `offline` do navegador
- Verifica periodicamente a conexão a cada 5 minutos

## Como Testar

### Página de Teste

Uma página de teste está disponível em `/teste-sincronizacao` que permite:

1. Adicionar e remover tarefas
2. Verificar o status da conexão
3. Forçar a verificação da conexão
4. Ver alterações pendentes

### Testes Manuais

Para testar manualmente:

1. Acesse a página de teste
2. Adicione algumas tarefas quando online
3. Desconecte da internet (modo avião ou desative o Wi-Fi)
4. Adicione mais tarefas - elas serão salvas localmente
5. Reconecte à internet
6. Clique em "Verificar Conexão" - as tarefas pendentes serão sincronizadas
7. Recarregue a página para verificar se todas as tarefas foram persistidas

### Script de Teste

Um script de teste está disponível para verificar a conexão com o Supabase:

```bash
npm run test:sync
```

Este script verifica:
- Se a conexão com o Supabase está funcionando
- Se todas as tabelas necessárias existem
- Se é possível inserir e recuperar dados

## Requisitos

Para que a sincronização funcione corretamente, todas as tabelas do Supabase devem:

1. Ter um campo `user_id` para associar os dados ao usuário
2. Ter políticas de segurança (RLS) configuradas corretamente
3. Ter um campo `id` como chave primária

## Solução de Problemas

### Dados não estão sincronizando

1. Verifique o status da conexão no componente `SyncStatus`
2. Verifique se há erros no console do navegador
3. Verifique se as tabelas do Supabase estão configuradas corretamente
4. Tente forçar a sincronização clicando no botão de atualização

### Erros de Autenticação

Se os dados não estiverem sincronizando devido a erros de autenticação:

1. Verifique se o usuário está autenticado
2. Verifique se as políticas de segurança (RLS) estão configuradas corretamente
3. Verifique se o token de autenticação é válido

## Limitações Conhecidas

1. A sincronização é feita apenas quando o estado é atualizado ou quando a conexão é verificada
2. Não há resolução de conflitos sofisticada - a última alteração prevalece
3. Grandes volumes de dados podem causar problemas de performance 