# Sistema de Sincronização StayFocus

Este documento descreve como funciona o sistema de sincronização de dados entre o cliente e o servidor no aplicativo StayFocus.

## Visão Geral

O StayFocus implementa uma estratégia de sincronização bidirecional que permite:

1. **Operação Offline**: Os usuários podem continuar usando o aplicativo mesmo sem conexão com a internet.
2. **Sincronização Automática**: Os dados são sincronizados automaticamente quando a conexão é restabelecida.
3. **Resolução de Conflitos**: Sincronização bidirecional que resolve conflitos entre dados locais e do servidor.

## Componentes do Sistema

### 1. Stores Zustand com Persistência Local

Todos os dados são armazenados localmente usando Zustand com middleware de persistência via localStorage:

```typescript
export const useExampleStore = create<ExampleState>()(
  persist(
    (set, get) => ({
      // State e ações
    }),
    {
      name: 'example-storage',
      getStorage: () => localStorage
    }
  )
)
```

### 2. Serviços de Sincronização

Cada tipo de dado tem seu próprio serviço de sincronização que implementa:

- Conversão entre formatos local e do servidor
- Operações CRUD para o servidor
- Lógica de sincronização bidirecional

Exemplo:

```typescript
export async function sincronizarDados(dadosLocais, userId) {
  // Obter dados do servidor
  const dadosServidor = await fetchDados(userId);
  
  // Identificar dados para adicionar, atualizar e remover
  const idsServidor = new Set(dadosServidor.map(d => d.id));
  const idsLocais = new Set(dadosLocais.map(d => d.id));
  
  // Processar diferenças
  await processarAdicoes(dadosLocais.filter(d => !idsServidor.has(d.id)), userId);
  await processarAtualizacoes(dadosLocais.filter(d => idsServidor.has(d.id)), userId);
  await processarRemocoes(dadosServidor.filter(d => !idsLocais.has(d.id)));
  
  // Retornar dados atualizados
  return await fetchDados(userId);
}
```

### 3. Gerenciador Central de Sincronização

O gerenciador central coordena a sincronização de todos os tipos de dados:

- Sincroniza todos os dados quando o usuário faz login
- Sincroniza periodicamente
- Sincroniza quando o status de conexão muda

## Tabelas no Supabase

O sistema utiliza as seguintes tabelas no Supabase:

1. **priorities**: Prioridades diárias
2. **self_knowledge_notes**: Notas de autoconhecimento
3. **study_sessions**: Sessões de estudo
4. **medications**: Medicamentos
5. **medication_logs**: Registros de medicamentos e humor
6. **sleep_records**: Registros de sono

## Fluxo de Sincronização

### Carregamento Inicial

1. Ao fazer login, o sistema carrega todos os dados do servidor
2. Se não houver dados no servidor mas existirem localmente, os dados locais são enviados ao servidor

### Durante Uso Normal

1. Todas as alterações de dados são aplicadas imediatamente no estado local
2. Se o usuário estiver online, as alterações são enviadas ao servidor
3. Se estiver offline, as alterações ficam pendentes

### Recuperação Após Offline

1. Quando a conexão é restaurada, o sistema detecta automaticamente
2. Todas as mudanças pendentes são sincronizadas com o servidor

## Indicadores de Status de Sincronização

A interface mostra o status da sincronização:

- Ícone de Wi-Fi indica status da conexão
- Badge de sincronização mostra o estado atual (sincronizado, pendente, em andamento)
- Página de diagnóstico mostra detalhes específicos de sincronização para cada tipo de dado

## Testando a Sincronização

Para testar a sincronização:

1. Acesse a página "/teste-sincronizacao"
2. Desligue o Wi-Fi ou ative o modo offline no navegador
3. Faça alterações nos dados
4. Reative a conexão e observe a sincronização automática

## Solução de Problemas

Se ocorrerem problemas de sincronização:

1. Verifique o console do navegador para erros
2. Confirme que o usuário está autenticado corretamente
3. Verifique se as tabelas do Supabase estão criadas corretamente
4. Use o botão "Sincronizar Tudo" na página de teste de sincronização

## Segurança

- Toda sincronização requer autenticação
- As políticas RLS (Row Level Security) no Supabase garantem que os usuários só podem acessar seus próprios dados
- Os dados sensíveis nunca são armazenados em localStorage sem o ID do usuário associado 