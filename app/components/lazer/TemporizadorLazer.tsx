'use client'

import { useState, useEffect, useRef } from 'react'
import { Play, Pause, RotateCcw, Bell, Volume2, VolumeX } from 'lucide-react'
import { Button } from '@/app/components/ui/Button'
import { Slider } from '@/app/components/ui/Slider'
import { Select } from '@/app/components/ui/Select'
import { Badge } from '@/app/components/ui/Badge'

export function TemporizadorLazer() {
  // Estados
  const [duracaoTotal, setDuracaoTotal] = useState(30) // em minutos
  const [tempoRestante, setTempoRestante] = useState(duracaoTotal * 60) // em segundos
  const [ativo, setAtivo] = useState(false)
  const [presetSelecionado, setPresetSelecionado] = useState('personalizado')
  const [somAtivado, setSomAtivado] = useState(true)
  
  // Refs
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  
  // Presets de tempo
  const presets = [
    { value: 'curto', label: 'Curto (15 min)', duracao: 15 },
    { value: 'medio', label: 'Médio (30 min)', duracao: 30 },
    { value: 'longo', label: 'Longo (45 min)', duracao: 45 },
    { value: 'extenso', label: 'Extenso (60 min)', duracao: 60 },
    { value: 'personalizado', label: 'Personalizado', duracao: duracaoTotal }
  ]

  // Inicializar áudio
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio('/sounds/bell.mp3') // Certifique-se de ter este arquivo
    }
    
    return () => {
      // Limpar timer ao desmontar
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  // Atualizar tempo restante quando duracaoTotal mudar
  useEffect(() => {
    setTempoRestante(duracaoTotal * 60)
  }, [duracaoTotal])

  // Iniciar/parar timer
  useEffect(() => {
    if (ativo) {
      timerRef.current = setInterval(() => {
        setTempoRestante(prev => {
          if (prev <= 1) {
            // Timer acabou
            if (somAtivado && audioRef.current) {
              audioRef.current.play().catch(e => console.error('Erro ao tocar som:', e))
            }
            clearInterval(timerRef.current!)
            setAtivo(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [ativo, somAtivado])

  // Formatar tempo para exibição (MM:SS)
  const formatarTempo = (segundos: number) => {
    const minutos = Math.floor(segundos / 60)
    const segundosRestantes = segundos % 60
    return `${minutos.toString().padStart(2, '0')}:${segundosRestantes.toString().padStart(2, '0')}`
  }

  // Calcular porcentagem de progresso
  const calcularProgresso = () => {
    const total = duracaoTotal * 60
    const progresso = ((total - tempoRestante) / total) * 100
    return progresso
  }

  // Lidar com mudança de preset
  const handleChangePreset = (valor: string) => {
    setPresetSelecionado(valor)
    
    if (valor !== 'personalizado') {
      const preset = presets.find(p => p.value === valor)
      if (preset) {
        setDuracaoTotal(preset.duracao)
      }
    }
  }

  // Resetar temporizador
  const resetarTemporizador = () => {
    setAtivo(false)
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    setTempoRestante(duracaoTotal * 60)
  }

  // Alternar entre iniciar e pausar
  const toggleTimer = () => {
    setAtivo(!ativo)
  }

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSomAtivado(!somAtivado)}
          aria-label={somAtivado ? 'Desativar som' : 'Ativar som'}
        >
          {somAtivado ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        </Button>
      </div>

      {/* Display do temporizador */}
      <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg mb-6 text-center relative">
        <div className="absolute top-3 left-3 flex gap-2">
          {ativo && (
            <Badge variant="primary" className="animate-pulse">
              Em andamento
            </Badge>
          )}
        </div>
        
        {/* Tempo em formato grande */}
        <div className="text-6xl font-bold text-gray-900 dark:text-white py-8">
          {formatarTempo(tempoRestante)}
        </div>
        
        {/* Barra de progresso */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-6">
          <div 
            className="bg-lazer-primary h-2.5 rounded-full transition-all duration-1000"
            style={{ width: `${calcularProgresso()}%` }}
          />
        </div>
        
        {/* Controles */}
        <div className="flex justify-center space-x-4">
          <Button
            onClick={toggleTimer}
            size="lg"
            aria-label={ativo ? 'Pausar temporizador' : 'Iniciar temporizador'}
            className="w-32"
          >
            {ativo ? (
              <>
                <Pause className="h-5 w-5 mr-2" />
                Pausar
              </>
            ) : (
              <>
                <Play className="h-5 w-5 mr-2" />
                Iniciar
              </>
            )}
          </Button>
          
          <Button
            onClick={resetarTemporizador}
            variant="outline"
            size="lg"
            aria-label="Resetar temporizador"
            className="w-32"
          >
            <RotateCcw className="h-5 w-5 mr-2" />
            Resetar
          </Button>
        </div>
      </div>

      {/* Configurações do temporizador */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Configurações
        </h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Presets de Tempo
          </label>
          <Select
            value={presetSelecionado}
            onChange={e => handleChangePreset(e.target.value)}
            options={presets}
            disabled={ativo}
          />
        </div>
        
        {presetSelecionado === 'personalizado' && (
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Duração (minutos): {duracaoTotal}
              </label>
            </div>
            <Slider
              min={5}
              max={120}
              step={5}
              value={duracaoTotal}
              onChange={setDuracaoTotal}
              disabled={ativo}
            />
          </div>
        )}
        
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg mt-4">
          <div className="flex items-start">
            <Bell className="h-5 w-5 text-yellow-500 dark:text-yellow-400 mr-3 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                Dica
              </h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                Use este temporizador para evitar o hiperfoco em atividades de lazer.
                Intervalos regulares ajudam a manter o equilíbrio em suas atividades diárias.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
