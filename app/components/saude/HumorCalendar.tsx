'use client'

import { useMemo } from 'react'
import { RegistroHumor } from '@/app/store'
import { cn } from '@/app/lib/utils'

interface HumorCalendarProps {
  registros: RegistroHumor[]
  mes: number
  ano: number
  onSelectDay: (data: string) => void
}

export function HumorCalendar({ registros, mes, ano, onSelectDay }: HumorCalendarProps) {
  // Gera os dias do mês selecionado
  const diasDoMes = useMemo(() => {
    const resultado = []
    const primeiroDia = new Date(ano, mes, 1)
    const ultimoDia = new Date(ano, mes + 1, 0)
    const diasNoMes = ultimoDia.getDate()
    
    // Preenche com dias vazios até o primeiro dia do mês
    const diaDaSemanaInicial = primeiroDia.getDay()
    for (let i = 0; i < diaDaSemanaInicial; i++) {
      resultado.push({ dia: 0, data: '' })
    }
    
    // Adiciona os dias do mês
    for (let dia = 1; dia <= diasNoMes; dia++) {
      const data = `${ano}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
      resultado.push({ dia, data })
    }
    
    return resultado
  }, [mes, ano])
  
  // Mapeia os registros por data para fácil acesso
  const registrosPorData = useMemo(() => {
    const mapa: Record<string, RegistroHumor> = {}
    registros.forEach(registro => {
      mapa[registro.data] = registro
    })
    return mapa
  }, [registros])
  
  // Cores para os diferentes níveis de humor
  const coresHumor = {
    1: 'bg-red-500',
    2: 'bg-orange-400',
    3: 'bg-yellow-300',
    4: 'bg-green-300',
    5: 'bg-green-500',
  }
  
  // Nomes dos dias da semana
  const diasDaSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  
  return (
    <div className="w-full">
      <div className="grid grid-cols-7 gap-1 mb-1">
        {diasDaSemana.map((dia) => (
          <div 
            key={dia} 
            className="text-xs text-center font-medium text-gray-500 dark:text-gray-400"
          >
            {dia}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {diasDoMes.map((item, index) => {
          if (item.dia === 0) {
            return <div key={`empty-${index}`} className="h-8 rounded-md" />
          }
          
          const registro = registrosPorData[item.data]
          const nivelHumor = registro?.nivel
          
          return (
            <button
              key={item.data}
              onClick={() => onSelectDay(item.data)}
              className={cn(
                "h-8 rounded-md flex items-center justify-center text-xs relative",
                nivelHumor 
                  ? coresHumor[nivelHumor as keyof typeof coresHumor] 
                  : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700",
                nivelHumor && "hover:opacity-80"
              )}
              aria-label={`Dia ${item.dia}, nível de humor ${nivelHumor || 'não registrado'}`}
            >
              {item.dia}
            </button>
          )
        })}
      </div>
    </div>
  )
}
