'use client'

import React from 'react'
import { Container } from '@/app/components/ui/Container'
import { Card } from '@/app/components/ui/Card'
import { Section } from '@/app/components/ui/Section'

export default function RoadmapPage() {
  return (
    <Container>
      <Section title="Roadmap do Painel ND">
        <Card className="mb-6">
          <h2 className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-4">💭 O conceito</h2>
          <p className="mb-4">
            O Painel ND surge da minha própria experiência com TDAH e da observação de que precisamos de ferramentas que funcionem com nossos cérebros, não contra eles. Cada recurso foi pensado para ser:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Simples e focado - Sem distrações ou complexidades desnecessárias</li>
            <li>Visualmente claro - Feedback visual imediato para todas as ações</li>
            <li>Adaptável às suas necessidades - Reconhecendo que cada cérebro neurodivergente é único</li>
            <li>Persistente - Porque sabemos como é fácil esquecer coisas importantes</li>
          </ul>
        </Card>

        <Card className="mb-6">
          <h2 className="text-xl font-bold text-green-600 dark:text-green-400 mb-4">🛠️ O que já temos (Sprint 1)</h2>
          
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-4 mb-2">📱 Página Inicial</h3>
          <ul className="list-disc pl-6 space-y-1 mb-3">
            <li>Painel do Dia - Visualize seu dia em um único lugar</li>
            <li>Lista de Prioridades - Foque no que realmente importa</li>
            <li>Lembretes de Pausas - Porque nossos cérebros precisam descansar!</li>
          </ul>
          
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-4 mb-2">🥗 Alimentação</h3>
          <ul className="list-disc pl-6 space-y-1 mb-3">
            <li>Planejador de Refeições - Facilite a decisão do que comer</li>
            <li>Registro de Refeições - Acompanhe seus padrões alimentares</li>
            <li>Lembrete de Hidratação - Para não esquecer de beber água (sim, acontece!)</li>
          </ul>
          
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-4 mb-2">📚 Estudos</h3>
          <ul className="list-disc pl-6 space-y-1 mb-3">
            <li>Temporizador Pomodoro - Técnica adaptada para cérebros neurodivergentes</li>
            <li>Registro de Estudos - Acompanhe seu progresso e celebre pequenas vitórias</li>
          </ul>
          
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-4 mb-2">❤️ Saúde</h3>
          <ul className="list-disc pl-6 space-y-1 mb-3">
            <li>Registro de Medicamentos - Com sistema de intervalo entre doses para evitar superdosagem acidental</li>
            <li>Monitoramento de Humor - Identifique padrões e gatilhos emocionais</li>
          </ul>
          
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-4 mb-2">🎮 Lazer</h3>
          <ul className="list-disc pl-6 space-y-1 mb-3">
            <li>Temporizador de Lazer - Para garantir que você também se divirta</li>
            <li>Atividades de Lazer - Registre e acompanhe suas atividades favoritas</li>
            <li>Sugestões de Descanso - Quando seu cérebro precisa de uma pausa, mas você não sabe o que fazer</li>
          </ul>
        </Card>

        <Card>
          <h2 className="text-xl font-bold text-purple-600 dark:text-purple-400 mb-4">🔮 O que vem por aí</h2>
          <p className="mb-4">Estamos planejando mais 3 sprints de desenvolvimento:</p>
          
          <div className="space-y-4">
            <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
              <h3 className="font-medium text-gray-800 dark:text-gray-200">Sprint 2: Finanças</h3>
              <p className="text-gray-600 dark:text-gray-400">Uma página para ajudar a gerenciar dinheiro de um jeito que faça sentido para cérebros TDAH (sim, incluindo alertas para contas e um sistema de orçamento visual!)</p>
            </div>
            
            <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
              <h3 className="font-medium text-gray-800 dark:text-gray-200">Sprint 3: Hiperfocos</h3>
              <p className="text-gray-600 dark:text-gray-400">Um espaço dedicado para transformar nossos hiperfocos em algo produtivo e gerenciável</p>
            </div>
            
            <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
              <h3 className="font-medium text-gray-800 dark:text-gray-200">Sprint 4: Backend e Apps Mobile</h3>
              <p className="text-gray-600 dark:text-gray-400">Levaremos o Painel ND para iOS e Android, mantendo seus dados sincronizados onde quer que você esteja</p>
            </div>
          </div>
        </Card>
      </Section>
    </Container>
  )
}
