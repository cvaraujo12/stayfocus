import { Card } from '@/app/components/ui/Card'
import { PlanejadorRefeicoes } from '@/app/components/alimentacao/PlanejadorRefeicoes'
import { RegistroRefeicoes } from '@/app/components/alimentacao/RegistroRefeicoes'
import { LembreteHidratacao } from '@/app/components/alimentacao/LembreteHidratacao'

export default function AlimentacaoPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Alimentação</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Planejador de Refeições */}
        <Card title="Planejador de Refeições">
          <PlanejadorRefeicoes />
        </Card>
        
        {/* Registro Visual de Refeições */}
        <Card title="Registro de Refeições">
          <RegistroRefeicoes />
        </Card>
      </div>
      
      {/* Lembretes de Hidratação */}
      <Card title="Hidratação">
        <LembreteHidratacao />
      </Card>
    </div>
  )
}
