'use client'

import { useMemo } from 'react'
import { Medicamento } from '@/app/store'
import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { Pill, Clock, Edit, Trash2 } from 'lucide-react'
import { Button } from '../ui/Button'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Check, X, AlertCircle } from 'lucide-react'
import { Tooltip } from '../ui/Tooltip'

interface MedicamentosListProps {
  medicamentos: Medicamento[]
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onRegistrarTomada: (id: string) => void
}

export function MedicamentosList({
  medicamentos,
  onEdit,
  onDelete,
  onRegistrarTomada,
}: MedicamentosListProps) {
  // Ordena medicamentos por nome
  const medicamentosOrdenados = useMemo(() => {
    return [...medicamentos].sort((a, b) => a.nome.localeCompare(b.nome))
  }, [medicamentos])
  
  // Verifica se um medicamento foi tomado hoje
  const foiTomadoHoje = (medicamento: Medicamento) => {
    if (!medicamento.ultimaTomada) return false
    
    const hoje = new Date().toISOString().split('T')[0]
    return medicamento.ultimaTomada.includes(hoje)
  }
  
  // Função auxiliar para calcular se já pode tomar outra dose
  const podeTomar = (medicamento: Medicamento) => {
    if (!medicamento.ultimaTomada || !medicamento.intervalo) return true;
    
    const ultimaTomada = new Date(medicamento.ultimaTomada);
    const agora = new Date();
    const intervaloEmMinutos = medicamento.intervalo;
    
    // Calcula a diferença em minutos
    const diffEmMinutos = Math.floor((agora.getTime() - ultimaTomada.getTime()) / (1000 * 60));
    
    return diffEmMinutos >= intervaloEmMinutos;
  };
  
  // Formatar o tempo restante para próxima dose
  const formatarTempoRestante = (medicamento: Medicamento) => {
    if (!medicamento.ultimaTomada || !medicamento.intervalo) return "";
    
    const ultimaTomada = new Date(medicamento.ultimaTomada);
    const agora = new Date();
    const intervaloEmMinutos = medicamento.intervalo;
    
    // Calcula a diferença em minutos
    const diffEmMinutos = Math.floor((agora.getTime() - ultimaTomada.getTime()) / (1000 * 60));
    const minutosRestantes = intervaloEmMinutos - diffEmMinutos;
    
    if (minutosRestantes <= 0) return "";
    
    const horasRestantes = Math.floor(minutosRestantes / 60);
    const minRestantes = minutosRestantes % 60;
    
    if (horasRestantes > 0) {
      return `${horasRestantes}h${minRestantes > 0 ? ` ${minRestantes}min` : ''}`;
    }
    return `${minRestantes}min`;
  };

  if (medicamentosOrdenados.length === 0) {
    return (
      <div className="text-center py-8 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
        <Pill className="mx-auto h-10 w-10 text-gray-400 mb-2" />
        <p className="text-gray-500 dark:text-gray-400">
          Você ainda não tem medicamentos cadastrados.
        </p>
        <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
          Adicione seu primeiro medicamento clicando no botão acima.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {medicamentosOrdenados.map((medicamento) => {
        const tomadoHoje = medicamento.ultimaTomada
          ? new Date(medicamento.ultimaTomada).toISOString().split('T')[0] === new Date().toISOString().split('T')[0]
          : false;
          
        const tempoRestante = formatarTempoRestante(medicamento);
        const liberadoParaTomar = podeTomar(medicamento);

        return (
          <div
            key={medicamento.id}
            className={`p-4 bg-white dark:bg-gray-800 border rounded-lg ${
              tomadoHoje
                ? 'border-green-200 dark:border-green-900'
                : 'border-gray-200 dark:border-gray-700'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-1">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {medicamento.nome}
                  </h3>
                  {medicamento.dosagem && (
                    <Badge className="ml-2" variant="outline">
                      {medicamento.dosagem}
                    </Badge>
                  )}
                </div>

                <div className="flex flex-wrap gap-1 mt-2">
                  {medicamento.horarios.map((horario) => (
                    <Badge key={horario} variant="secondary" className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {horario}
                    </Badge>
                  ))}
                </div>
                
                {medicamento.frequencia && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    Frequência: {medicamento.frequencia}
                  </p>
                )}
                
                {medicamento.intervalo && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Intervalo: {medicamento.intervalo >= 60 
                      ? `${Math.floor(medicamento.intervalo / 60)} hora${medicamento.intervalo >= 120 ? 's' : ''}` 
                      : `${medicamento.intervalo} minutos`}
                  </p>
                )}
                
                {medicamento.ultimaTomada && (
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Última dose: {format(new Date(medicamento.ultimaTomada), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    {tempoRestante && (
                      <span className="ml-2 text-yellow-600 dark:text-yellow-400">
                        <AlertCircle className="inline h-3 w-3 mr-1" />
                        Próxima dose em {tempoRestante}
                      </span>
                    )}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2 ml-4">
                <Tooltip content={liberadoParaTomar ? "Registrar dose tomada" : "Aguarde o intervalo entre doses"}>
                  <Button
                    size="icon"
                    variant={tomadoHoje ? "success" : "primary"}
                    onClick={() => onRegistrarTomada(medicamento.id)}
                    disabled={!liberadoParaTomar}
                    aria-label="Registrar dose tomada"
                  >
                    {tomadoHoje ? <Check className="h-4 w-4" /> : <Pill className="h-4 w-4" />}
                  </Button>
                </Tooltip>
                
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => onEdit(medicamento.id)}
                  aria-label="Editar medicamento"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                
                <Button
                  size="icon"
                  variant="outline"
                  color="danger"
                  onClick={() => onDelete(medicamento.id)}
                  aria-label="Excluir medicamento"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Importando o utilitário cn
import { cn } from '@/app/lib/utils'
