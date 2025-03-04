import { RegistroMedicamentos } from '@/app/components/saude/RegistroMedicamentos'
import { MonitoramentoHumor } from '@/app/components/saude/MonitoramentoHumor'

export default function SaudePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Saúde</h1>
      
      <div className="grid grid-cols-1 gap-6">
        {/* Registro de Medicamentos */}
        <RegistroMedicamentos />
        
        {/* Monitoramento de Humor */}
        <MonitoramentoHumor />
      </div>
    </div>
  )
}
