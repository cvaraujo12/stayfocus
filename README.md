# Painel de Produtividade para Neurodivergentes

Este projeto implementa um painel de produtividade focado em pessoas neurodivergentes, especialmente com TDAH, seguindo princípios de simplicidade, foco e redução de sobrecarga cognitiva.

## Estrutura do Projeto

O projeto segue uma estrutura clara e previsível usando Next.js com App Router:

```
/app
  /[seção]
    /page.tsx      # Página principal de cada seção
    /components    # Componentes específicos da seção
  /components      # Componentes compartilhados
  /hooks           # Hooks personalizados
  /lib             # Utilitários e configurações
  /store           # Gerenciamento de estado com Zustand
  /styles          # Estilos globais
  /types           # Definições de tipos TypeScript
/supabase          # Configuração e utilitários do Supabase
  /client.ts       # Cliente Supabase
  /auth.ts         # Funções de autenticação
  /utils.ts        # Funções CRUD genéricas
  /index.ts        # Exportações centralizadas
  /migrations      # Scripts SQL para criação de tabelas
/scripts           # Scripts utilitários
```

## Princípios de Desenvolvimento

- **Simplicidade Acima de Tudo**: Menos é mais
- **Foco no Essencial**: Apenas funcionalidades que agregam valor imediato
- **Redução de Sobrecarga Cognitiva**: Interfaces claras e previsíveis
- **Estímulos Visuais Adequados**: Uso estratégico de cores e ícones
- **Lembretes e Estrutura**: Apoio para funções executivas

## Tecnologias

- **Framework**: Next.js (App Router)
- **Estilização**: Tailwind CSS
- **Componentes**: Headless UI
- **Ícones**: Lucide ou Phosphor Icons
- **Gerenciamento de Estado**: Zustand com persistência local
- **Backend**: Supabase (Autenticação, Banco de Dados, Armazenamento)

## Instalação

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
# Crie um arquivo .env.local na raiz do projeto com as seguintes variáveis:
# NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
# NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
# SUPABASE_SERVICE_ROLE_KEY=sua_chave_de_servico_do_supabase

# Iniciar servidor de desenvolvimento
npm run dev
```

## Configuração do Supabase

O projeto utiliza o Supabase como backend. Para testar a conexão com o Supabase:

```bash
# Testar conexão com o Supabase
node supabase/test-connection.js
```

### Criação das Tabelas no Supabase

Para criar as tabelas necessárias no Supabase, siga as instruções no arquivo `supabase/migrations/README.md`. Em resumo:

1. Acesse o painel de administração do Supabase
2. Vá para o SQL Editor
3. Copie e cole o conteúdo do arquivo `supabase/migrations/create_tables_direct.sql`
4. Execute o script SQL

### Estrutura do Banco de Dados

O projeto utiliza as seguintes tabelas no Supabase:

1. `users`: Informações básicas do usuário
2. `priorities`: Tarefas e prioridades diárias
3. `notes`: Notas de autoconhecimento
4. `sessions`: Sessões de estudo registradas
5. `medications`: Rastreamento de medicação
6. `moods`: Registros de humor
7. `expenses`: Gastos financeiros categorizados
8. `projects`: Projetos e hiperfocos
9. `sleep_logs`: Registros de sono

Todas as tabelas implementam Row Level Security (RLS) para garantir que os usuários só possam acessar seus próprios dados.

### Funcionalidades do Supabase Implementadas

- **Autenticação**: Login/registro com email/senha, GitHub e Google
- **Banco de Dados**: Operações CRUD para todas as seções do aplicativo
- **Sincronização Offline**: Fallback para localStorage quando offline
- **Segurança**: Row Level Security (RLS) em todas as tabelas

## Seções do Aplicativo

1. **Início**: Dashboard com visão geral e lembretes
2. **Alimentação**: Controle e planejamento de refeições
3. **Estudos**: Organização e técnicas de aprendizado
4. **Saúde**: Monitoramento de bem-estar e medicações
5. **Lazer**: Atividades recreativas e descanso
6. **Finanças**: Controle de gastos e orçamento
7. **Sono**: Monitoramento de padrões de sono
8. **Projetos**: Gerenciamento de projetos e hiperfocos
