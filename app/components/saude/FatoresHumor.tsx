'use client'

import { useMemo } from 'react'
import { RegistroHumor } from '@/app/store'
import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'

interface FatoresHumorProps {
  registros: RegistroHumor[]
  limite?: number
}

export function FatoresHumor({ registros, limite = 5 }: FatoresHumorProps) {
  // Calcula os fatores mais comuns
  const fatoresMaisComuns = useMemo(() => {
    const contagem: Record<string, number> = {}
    
    // Conta a ocorrência de cada fator
    registros.forEach(registro => {
      registro.fatores.forEach(fator => {
        contagem[fator] = (contagem[fator] || 0) + 1
      })
    })
    
    // Converte para array e ordena
    return Object.entries(contagem)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limite)
      .map(([fator, count]) => ({
        fator,
        count,
        percentual: Math.round((count / registros.length) * 100)
      }))
  }, [registros, limite])
  
  if (registros.length === 0) {
    return (
      <Card className="p-4 text-center text-gray-500 dark:text-gray-400">
        Nenhum registro de humor encontrado
      </Card>
    )
  }
  
  return (
    <Card>
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        Fatores Mais Comuns
      </h3>
      
      {fatoresMaisComuns.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Nenhum fator registrado ainda
        </p>
      ) : (
        <div className="space-y-2">
          {fatoresMaisComuns.map(({ fator, count, percentual }) => (
            <div key={fator} className="flex items-center justify-between">
              <div className="flex items-center">
                <Badge variant="secondary" className="mr-2">
                  {percentual}%
                </Badge>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {fator}
                </span>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {count} {count === 1 ? 'ocorrência' : 'ocorrências'}
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
