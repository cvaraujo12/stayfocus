'use client'

import { useState, useEffect } from 'react'
import { Play, Pause, RefreshCw, Settings, X } from 'lucide-react'
import { usePomodoroStore } from '@/app/stores/pomodoroStore'

export function TemporizadorPomodoro() {
  const { configuracao, atualizarConfiguracao, ciclosCompletos, incrementarCiclosCompletos, resetarCiclosCompletos } = usePomodoroStore()
  
  const [isActive, setIsActive] = useState(false)
  const [isPaused, setIsPaused] = useState(true)
  const [time, setTime] = useState(configuracao.tempoFoco * 60) // tempo em segundos
  const [ciclo, setCiclo] = useState<'foco' | 'pausa' | 'longapausa'>('foco')
  const [showSettings, setShowSettings] = useState(false)
  const [configTemp, setConfigTemp] = useState(configuracao)

  useEffect(() => {
    // Reset timer quando a configuração mudar e o timer estiver parado
    if (!isActive || isPaused) {
      if (ciclo === 'foco') {
        setTime(configuracao.tempoFoco * 60);
      } else if (ciclo === 'pausa') {
        setTime(configuracao.tempoPausa * 60);
      } else {
        setTime(configuracao.tempoLongapausa * 60);
      }
    }
  }, [configuracao, isActive, isPaused, ciclo]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isActive && !isPaused) {
      interval = setInterval(() => {
        setTime((time) => {
          if (time <= 1) {
            // Tocar som de notificação
            if (typeof window !== 'undefined') {
              const audio = new Audio('/notification.mp3')
              audio.play().catch(() => {
                // Falha silenciosa se o navegador bloquear o áudio
                console.log('Notificação de áudio bloqueada pelo navegador')
              })
            }

            // Alternar entre ciclos
            if (ciclo === 'foco') {
              incrementarCiclosCompletos()
              
              // Verificar se deve ser uma pausa longa
              if ((ciclosCompletos + 1) % configuracao.ciclosAntesLongapausa === 0) {
                setCiclo('longapausa')
                return configuracao.tempoLongapausa * 60
              } else {
                setCiclo('pausa')
                return configuracao.tempoPausa * 60
              }
            } else {
              setCiclo('foco')
              return configuracao.tempoFoco * 60
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
  }, [isActive, isPaused, ciclo, ciclosCompletos, configuracao, incrementarCiclosCompletos])

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
    setTime(configuracao.tempoFoco * 60)
    resetarCiclosCompletos()
  }

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setConfigTemp({
      ...configTemp,
      [name]: parseInt(value),
    })
  }

  const saveSettings = () => {
    atualizarConfiguracao(configTemp)
    setShowSettings(false)
  }

  // Determinar a cor com base no ciclo atual
  const cicloColor = 
    ciclo === 'foco' 
      ? 'text-estudos-primary dark:text-estudos-secondary' 
      : ciclo === 'pausa'
        ? 'text-green-600 dark:text-green-400'
        : 'text-blue-600 dark:text-blue-400'

  // Determinar a mensagem com base no ciclo atual
  const cicloMensagem = 
    ciclo === 'foco'
      ? 'Tempo de foco'
      : ciclo === 'pausa'
        ? 'Pausa curta'
        : 'Pausa longa'

  // Determinar a cor de fundo com base no ciclo atual
  const cicloBgColor = 
    ciclo === 'foco' 
      ? 'bg-estudos-light dark:bg-estudos-dark/30' 
      : ciclo === 'pausa'
        ? 'bg-green-100 dark:bg-green-900/30'
        : 'bg-blue-100 dark:bg-blue-900/30'

  return (
    <div className="flex flex-col items-center">
      <div className="text-center mb-4">
        <h3 className={`text-xl font-bold ${cicloColor}`}>{cicloMensagem}</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Ciclos completos: {ciclosCompletos}
        </p>
      </div>

      <div className={`text-4xl font-mono font-bold mb-6 ${cicloBgColor} text-gray-800 dark:text-white px-6 py-3 rounded-xl`}>
        {formatTime()}
      </div>

      <div className="flex space-x-4 mb-6">
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
            className="flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
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

        <button
          onClick={() => {
            setConfigTemp(configuracao);
            setShowSettings(true);
          }}
          className="flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Configurações do temporizador"
        >
          <Settings className="h-5 w-5 mr-1" />
          <span>Ajustar</span>
        </button>
      </div>

      {/* Explicação do ciclo atual */}
      <div className={`p-3 ${cicloBgColor} rounded-lg text-sm text-gray-800 dark:text-gray-100 max-w-md`}>
        {ciclo === 'foco' ? (
          <p>Concentre-se em uma única tarefa. Evite distrações.</p>
        ) : ciclo === 'pausa' ? (
          <p>Faça uma pausa curta. Alongue-se ou beba água.</p>
        ) : (
          <p>Pausa longa! Levante-se e caminhe um pouco.</p>
        )}
      </div>

      {/* Modal de configurações */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Configurações do Temporizador
              </h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                aria-label="Fechar configurações"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="tempoFoco"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Tempo de Foco (minutos)
                </label>
                <input
                  type="number"
                  id="tempoFoco"
                  name="tempoFoco"
                  min="1"
                  max="60"
                  value={configTemp.tempoFoco}
                  onChange={handleSettingsChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label
                  htmlFor="tempoPausa"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Tempo de Pausa Curta (minutos)
                </label>
                <input
                  type="number"
                  id="tempoPausa"
                  name="tempoPausa"
                  min="1"
                  max="30"
                  value={configTemp.tempoPausa}
                  onChange={handleSettingsChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label
                  htmlFor="tempoLongapausa"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Tempo de Pausa Longa (minutos)
                </label>
                <input
                  type="number"
                  id="tempoLongapausa"
                  name="tempoLongapausa"
                  min="5"
                  max="60"
                  value={configTemp.tempoLongapausa}
                  onChange={handleSettingsChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label
                  htmlFor="ciclosAntesLongapausa"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Ciclos antes da Pausa Longa
                </label>
                <input
                  type="number"
                  id="ciclosAntesLongapausa"
                  name="ciclosAntesLongapausa"
                  min="1"
                  max="10"
                  value={configTemp.ciclosAntesLongapausa}
                  onChange={handleSettingsChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={saveSettings}
                  className="px-4 py-2 bg-estudos-primary text-white rounded-lg hover:bg-estudos-primary/90 focus:outline-none focus:ring-2 focus:ring-estudos-primary focus:ring-offset-2"
                >
                  Salvar Configurações
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
