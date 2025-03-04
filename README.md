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
