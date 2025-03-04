import { Card } from '@/app/components/ui/Card'
import { AtividadesLazer } from '@/app/components/lazer/AtividadesLazer'
import { SugestoesDescanso } from '@/app/components/lazer/SugestoesDescanso'
import { TemporizadorLazer } from '@/app/components/lazer/TemporizadorLazer'

export default function LazerPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Lazer</h1>
      
      <div className="grid grid-cols-1 gap-6">
        {/* Temporizador de Lazer */}
        <Card title="Temporizador de Lazer">
          <TemporizadorLazer />
        </Card>
        
        {/* Atividades de Lazer */}
        <Card title="Atividades de Lazer">
          <AtividadesLazer />
        </Card>
        
        {/* Sugestões de Descanso */}
        <Card title="Sugestões de Descanso">
          <SugestoesDescanso />
        </Card>
      </div>
    </div>
  )
}
