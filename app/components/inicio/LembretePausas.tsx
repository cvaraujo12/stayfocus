'use client'

import { useState, useEffect } from 'react'
import { Play, Pause, RefreshCw } from 'lucide-react'

export function LembretePausas() {
  const [isActive, setIsActive] = useState(false)
  const [isPaused, setIsPaused] = useState(true)
  const [time, setTime] = useState(25 * 60) // 25 minutos em segundos
  const [ciclo, setCiclo] = useState('foco')

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isActive && !isPaused) {
      interval = setInterval(() => {
        setTime((time) => {
          if (time <= 1) {
            // Alternar entre ciclos de foco e pausa
            if (ciclo === 'foco') {
              setCiclo('pausa')
              return 5 * 60 // 5 minutos de pausa
            } else {
              setCiclo('foco')
              return 25 * 60 // 25 minutos de foco
            }
          }
          return time - 1
        })
      }, 1000)
    } else {
      interval && clearInterval(interval)
    }

    return () => {
      interval && clearInterval(interval)
    }
  }, [isActive, isPaused, ciclo])

  const formatTime = () => {
    const minutes = Math.floor(time / 60)
    const seconds = time % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  const handleStart = () => {
    setIsActive(true)
    setIsPaused(false)
  }

  const handlePause = () => {
    setIsPaused(true)
  }

  const handleReset = () => {
    setIsActive(false)
    setIsPaused(true)
    setCiclo('foco')
    setTime(25 * 60)
  }

  // Determinar a cor com base no ciclo atual
  const cicloColor = ciclo === 'foco' 
    ? 'text-estudos-primary' 
    : 'text-lazer-primary'

  // Determinar a mensagem com base no ciclo atual
  const cicloMensagem = ciclo === 'foco'
    ? 'Tempo de foco'
    : 'Tempo de pausa'

  return (
    <div className="flex flex-col items-center">
      <div className="text-center mb-4">
        <h3 className={`text-xl font-bold ${cicloColor}`}>{cicloMensagem}</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Alterne entre períodos de foco e pausas curtas
        </p>
      </div>

      <div className="text-4xl font-mono font-bold mb-6 bg-gray-100 dark:bg-gray-700 px-6 py-3 rounded-xl">
        {formatTime()}
      </div>

      <div className="flex space-x-4">
        {isPaused ? (
          <button
            onClick={handleStart}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            aria-label="Iniciar temporizador"
          >
            <Play className="h-5 w-5 mr-1" />
            <span>Iniciar</span>
          </button>
        ) : (
          <button
            onClick={handlePause}
            className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            aria-label="Pausar temporizador"
          >
            <Pause className="h-5 w-5 mr-1" />
            <span>Pausar</span>
          </button>
        )}

        <button
          onClick={handleReset}
          className="flex items-center px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
          aria-label="Reiniciar temporizador"
        >
          <RefreshCw className="h-5 w-5 mr-1" />
          <span>Reiniciar</span>
        </button>
      </div>

      <div className="mt-6 text-sm text-gray-600 dark:text-gray-400">
        <p>Dicas:</p>
        <ul className="list-disc pl-5 mt-1">
          <li>Durante o foco, concentre-se em uma única tarefa</li>
          <li>Use as pausas para alongar-se ou beber água</li>
          <li>Ajuste os tempos conforme sua necessidade</li>
        </ul>
      </div>
    </div>
  )
}
