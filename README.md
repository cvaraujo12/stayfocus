# StayFocus

Aplicação para ajudar pessoas neurodivergentes a gerenciar tarefas, tempo e bem-estar.

## Visão Geral

O StayFocus é uma aplicação web desenvolvida com Next.js e Supabase, projetada para atender às necessidades específicas de pessoas neurodivergentes. A aplicação oferece ferramentas para gestão de tempo, foco, estudos, alimentação, sono e gerenciamento financeiro de forma simplificada e acessível.

## Estrutura do Projeto

```
stayfocus/
├── app/                # Diretório principal da aplicação Next.js
│   ├── components/     # Componentes reutilizáveis
│   ├── contexts/       # Contextos React (legado - em migração)
│   ├── hooks/          # Hooks personalizados
│   ├── providers/      # Provedores de contexto (atual)
│   ├── services/       # Serviços e lógica de negócios
│   ├── store/          # Gerenciamento de estado global (legado - em migração)
│   └── stores/         # Stores individuais (legado - em migração)
├── src/
│   └── stores/         # Novo local centralizado para stores
├── supabase/           # Configuração e funções de acesso ao Supabase
├── __tests__/          # Testes da aplicação
└── public/             # Arquivos estáticos
```

## Alterações Recentes

Consulte o arquivo [CHANGELOG.md](./CHANGELOG.md) para ver o histórico completo de alterações.

### Melhorias na Autenticação

- Corrigido o fluxo de redirecionamento após login
- Unificado o método de login na página de login
- Implementado armazenamento adequado de sessão

### Melhorias de Estrutura

- Unificado o provedor de autenticação
- Criado serviço centralizado para comunicação com Supabase
- Iniciada a unificação das stores com padrão de migração gradual
- Movidos arquivos de teste para diretório dedicado

## Desenvolvimento

### Pré-requisitos

- Node.js 18.x ou superior
- npm ou yarn
- Conta no Supabase

### Configuração do Ambiente

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/stayfocus.git
   cd stayfocus
   ```

2. Instale as dependências:
   ```bash
   npm install
   # ou
   yarn
   ```

3. Configure as variáveis de ambiente:
   Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:
   ```
   NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_do_supabase
   SUPABASE_SERVICE_ROLE_KEY=sua_chave_de_servico_do_supabase
   ```

4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   # ou
   yarn dev
   ```

## Roadmap

Consulte o arquivo [ROADMAP.md](./ROADMAP.md) para ver o plano detalhado de desenvolvimento.

## Licença

Este projeto está licenciado sob a licença MIT.
