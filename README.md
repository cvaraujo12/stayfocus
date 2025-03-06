# StayFocus - Painel para Neurodivergentes

## Deploy na Vercel

Para fazer o deploy deste projeto na Vercel, siga os seguintes passos:

1. Faça login na [Vercel](https://vercel.com)
2. Conecte seu repositório GitHub
3. Configure as seguintes variáveis de ambiente:
   - `NEXT_PUBLIC_SUPABASE_URL`: URL do seu projeto Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Chave anônima do Supabase
   - `SUPABASE_SERVICE_ROLE_KEY`: Chave de serviço do Supabase

4. No Supabase, configure as seguintes URLs de redirecionamento OAuth:
   - `https://seu-dominio-vercel.vercel.app/auth/callback`
   - `https://seu-dominio-vercel.vercel.app`

5. Atualize as configurações de autenticação no Supabase:
   - Site URL: `https://seu-dominio-vercel.vercel.app`
   - Additional Redirect URLs: `https://seu-dominio-vercel.vercel.app/auth/callback`

6. Configure CORS no Supabase:
   - Adicione `https://seu-dominio-vercel.vercel.app` aos domínios permitidos

7. Clique em "Deploy" na Vercel

### Configurações Adicionais de Segurança

- Certifique-se de que todas as políticas de RLS (Row Level Security) estão configuradas corretamente no Supabase
- Verifique se os cookies estão sendo configurados com a flag `Secure` em produção
- Mantenha as chaves de API e serviço seguras e nunca as exponha no código-fonte

## Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Construir para produção
npm run build

# Iniciar servidor de produção
npm run start
```

## Variáveis de Ambiente

Crie um arquivo `.env.local` com as seguintes variáveis:

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
SUPABASE_SERVICE_ROLE_KEY=sua_chave_servico
```

## Tecnologias Utilizadas

- Next.js 14
- Supabase
- TypeScript
- Tailwind CSS

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

## Instalação

```bash
npm install
npm run dev
```

## Seções do Aplicativo

1. **Início**: Dashboard com visão geral e lembretes
2. **Alimentação**: Controle e planejamento de refeições
3. **Estudos**: Organização e técnicas de aprendizado
4. **Saúde**: Monitoramento de bem-estar e medicações
5. **Lazer**: Atividades recreativas e descanso
