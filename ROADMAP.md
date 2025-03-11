# Roadmap de Desenvolvimento - StayFocus

## Visão Geral

O StayFocus é uma aplicação para auxiliar pessoas neurodivergentes no gerenciamento de tarefas, tempo e bem-estar. Este documento estabelece o plano de desenvolvimento com foco em simplicidade, acessibilidade e experiência do usuário.

## Situação Atual

A aplicação possui funcionalidades básicas implementadas:
- Sistema de autenticação com Supabase
- Estrutura inicial das páginas
- Componentes básicos de UI

## Próximas Etapas

### Fase 1: Estabilização (Atual)

- [x] Correção do fluxo de autenticação
- [ ] Refatoração da estrutura do projeto
- [ ] Centralização da comunicação com o Supabase
- [ ] Melhoria da segurança (proteção de chaves API, etc.)

### Fase 2: Funcionalidades Principais (Próxima)

- [ ] **Gerenciamento de Estado**
  - [ ] Implementação do Zustand para gerenciamento de estado
  - [ ] Persistência local de dados

- [ ] **Experiência do Usuário**
  - [ ] Melhorias de acessibilidade
  - [ ] Feedback visual aprimorado
  - [ ] Navegação simplificada

- [ ] **Funcionalidades Neurodivergentes**
  - [ ] Sistema de notificações personalizáveis
  - [ ] Modo de foco com bloqueio de distrações
  - [ ] Timers visuais para Pomodoro adaptado

### Fase 3: Expansão e Polimento

- [ ] **Integração com Outros Serviços**
  - [ ] Calendário
  - [ ] Notas
  - [ ] Lembretes

- [ ] **Personalização**
  - [ ] Temas personalizáveis
  - [ ] Configurações de UI adaptáveis às necessidades do usuário

- [ ] **Feedback e Análise**
  - [ ] Coleta de feedback dos usuários
  - [ ] Sistema de análise de uso
  - [ ] Melhorias baseadas nos dados coletados

## Diretrizes de Desenvolvimento

### Princípios

1. **Simplicidade Acima de Tudo**
   - Interfaces limpas, previsíveis e diretas
   - Redução da carga cognitiva para o usuário

2. **Acessibilidade como Padrão**
   - Suporte completo a tecnologias assistivas
   - Navegação por teclado intuitiva
   - Contraste adequado, tamanhos de fonte ajustáveis

3. **Feedback Constante**
   - Mensagens claras de sucesso, erro ou carregamento
   - Indicadores visuais de progresso

4. **Design Focado em Neurodivergência**
   - Estímulos sensoriais adequados
   - Opções para reduzir sobrecarga sensorial
   - Estrutura previsível e consistente

### Stack Tecnológica

- **Frontend**: Next.js, React, Typescript
- **Estilização**: Tailwind CSS
- **Estado**: Zustand
- **Backend/BaaS**: Supabase
- **Ícones**: Lucide ou Phosphor Icons

## Critérios de Conclusão

Cada fase será considerada concluída quando:

1. Todas as funcionalidades planejadas estiverem implementadas
2. Os testes de usabilidade com usuários neurodivergentes forem aprovados
3. A documentação for atualizada
4. O código estiver revisado e otimizado

## Medição de Sucesso

O sucesso do StayFocus será medido principalmente pela:

1. Adoção e retenção de usuários
2. Feedback positivo de usuários neurodivergentes
3. Melhoria real na gestão de tempo e foco dos usuários
4. Acessibilidade medida por auditorias automáticas e testes com usuários 