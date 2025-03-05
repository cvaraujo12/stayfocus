'use client'

import { useState, useEffect, useRef } from 'react'
import { useHiperfocosStore } from '../../stores/hiperfocosStore'
import { Clock, Play, Pause, RotateCcw, Bell, Volume2, VolumeX } from 'lucide-react'

export function TemporizadorFoco() {
  const { hiperfocos } = useHiperfocosStore()
  
  const [hiperfocoSelecionadoId, setHiperfocoSelecionadoId] = useState<string>('')
  const [temporizadorAtivo, setTemporizadorAtivo] = useState(false)
  const [tempoRestante, setTempoRestante] = useState(0)
  const [tempoTotal, setTempoTotal] = useState(0)
  const [tempoPausa, setTempoPausa] = useState(0)
  const [tempoPersonalizado, setTempoPersonalizado] = useState('')
  const [somAtivado, setSomAtivado] = useState(true)
  
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  
  // Lidar com a seleção de hiperfoco
  useEffect(() => {
    if (!hiperfocoSelecionadoId) return
    
    const hiperfoco = hiperfocos.find(h => h.id === hiperfocoSelecionadoId)
    
    if (hiperfoco && hiperfoco.tempoLimite) {
      setTempoTotal(hiperfoco.tempoLimite * 60) // converter minutos para segundos
      setTempoRestante(hiperfoco.tempoLimite * 60)
      setTempoPausa(Math.floor(hiperfoco.tempoLimite * 60 * 0.1)) // 10% do tempo total para pausas
    } else {
      // Tempo padrão de 25 minutos (pomodoro)
      setTempoTotal(25 * 60)
      setTempoRestante(25 * 60)
      setTempoPausa(5 * 60) // 5 minutos de pausa
    }
    
    // Parar temporizador se estiver ativo
    if (temporizadorAtivo) {
      pararTemporizador()
    }
  }, [hiperfocoSelecionadoId, hiperfocos])
  
  // Limpar timer ao desmontar componente
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])
  
  // Iniciar temporizador
  const iniciarTemporizador = () => {
    if (!hiperfocoSelecionadoId) return
    
    setTemporizadorAtivo(true)
    
    timerRef.current = setInterval(() => {
      setTempoRestante(prev => {
        if (prev <= 1) {
          // Temporizador chegou a zero
          tocarAlarme()
          pararTemporizador()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }
  
  // Parar temporizador
  const pararTemporizador = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    setTemporizadorAtivo(false)
  }
  
  // Pausar/Resumir temporizador
  const toggleTemporizador = () => {
    if (temporizadorAtivo) {
      pararTemporizador()
    } else {
      iniciarTemporizador()
    }
  }
  
  // Reiniciar temporizador
  const reiniciarTemporizador = () => {
    pararTemporizador()
    setTempoRestante(tempoTotal)
  }
  
  // Tocar som de alarme
  const tocarAlarme = () => {
    if (!somAtivado) return
    
    if (audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(e => console.error('Erro ao tocar alarme:', e))
    }
  }
  
  // Formatar tempo para exibição (minutos:segundos)
  const formatarTempo = (segundos: number) => {
    const mins = Math.floor(segundos / 60)
    const segs = segundos % 60
    return `${mins.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`
  }
  
  // Calcular percentual de progresso
  const calcularProgresso = () => {
    if (tempoTotal === 0) return 0
    return ((tempoTotal - tempoRestante) / tempoTotal) * 100
  }
  
  // Configurar tempo personalizado
  const definirTempoPersonalizado = () => {
    const minutos = parseInt(tempoPersonalizado)
    if (isNaN(minutos) || minutos <= 0) return
    
    pararTemporizador()
    const segundos = minutos * 60
    setTempoTotal(segundos)
    setTempoRestante(segundos)
    setTempoPausa(Math.floor(segundos * 0.1)) // 10% do tempo para pausas
    setTempoPersonalizado('')
  }
  
  // Iniciar tempo de pausa
  const iniciarPausa = () => {
    pararTemporizador()
    setTempoRestante(tempoPausa)
    setTempoTotal(tempoPausa)
  }
  
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
        Temporizador de Foco
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-700 rounded-lg shadow-sm p-6">
          {/* Seletor de hiperfoco */}
          <div className="mb-6">
            <label htmlFor="hiperfoco-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Hiperfoco para temporizador
            </label>
            <select
              id="hiperfoco-select"
              value={hiperfocoSelecionadoId}
              onChange={(e) => setHiperfocoSelecionadoId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-hiperfocos-primary focus:border-hiperfocos-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">Selecione um hiperfoco</option>
              {hiperfocos.map((hiperfoco) => (
                <option key={hiperfoco.id} value={hiperfoco.id}>
                  {hiperfoco.titulo} {hiperfoco.tempoLimite ? `(${hiperfoco.tempoLimite} min)` : ''}
                </option>
              ))}
            </select>
          </div>
          
          {/* Tempo personalizado */}
          <div className="mb-6">
            <label htmlFor="tempo-personalizado" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tempo personalizado (minutos)
            </label>
            <div className="flex">
              <input
                type="number"
                id="tempo-personalizado"
                value={tempoPersonalizado}
                onChange={(e) => setTempoPersonalizado(e.target.value)}
                min="1"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-2 focus:ring-hiperfocos-primary focus:border-hiperfocos-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Ex: 30"
              />
              <button
                onClick={definirTempoPersonalizado}
                className="px-4 py-2 bg-hiperfocos-primary text-white rounded-r-md hover:bg-hiperfocos-secondary"
                aria-label="Definir tempo personalizado"
              >
                Definir
              </button>
            </div>
          </div>
          
          {/* Áudio para o alarme */}
          <audio ref={audioRef} preload="auto">
            <source src="/sounds/alarm.mp3" type="audio/mpeg" />
            <source src="/sounds/alarm.ogg" type="audio/ogg" />
            Seu navegador não suporta o elemento de áudio.
          </audio>
          
          {/* Controle de som */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Som de alarme
            </span>
            <button
              onClick={() => setSomAtivado(!somAtivado)}
              className={`p-2 rounded-md ${somAtivado ? 'text-hiperfocos-primary' : 'text-gray-400'}`}
              aria-label={somAtivado ? 'Desativar som' : 'Ativar som'}
              aria-pressed={somAtivado}
            >
              {somAtivado ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
            </button>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-700 rounded-lg shadow-sm p-6 flex flex-col items-center justify-center">
          {/* Display do temporizador */}
          <div className="relative w-48 h-48 mb-6">
            <div 
              className="absolute inset-0 rounded-full bg-gray-200 dark:bg-gray-600"
              style={{
                background: `conic-gradient(
                  ${hiperfocoSelecionadoId && hiperfocos.find(h => h.id === hiperfocoSelecionadoId)?.cor || '#0EA5E9'} ${calcularProgresso()}%, 
                  #9CA3AF ${calcularProgresso()}%
                )`
              }}
            />
            <div className="absolute inset-2 rounded-full bg-white dark:bg-gray-700 flex items-center justify-center">
              <div className="text-4xl font-bold text-gray-800 dark:text-white">
                {formatarTempo(tempoRestante)}
              </div>
            </div>
          </div>
          
          {/* Controles do temporizador */}
          <div className="flex space-x-4">
            <button
              onClick={toggleTemporizador}
              disabled={!hiperfocoSelecionadoId && tempoTotal === 0}
              className="p-3 bg-hiperfocos-primary text-white rounded-full hover:bg-hiperfocos-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={temporizadorAtivo ? 'Pausar temporizador' : 'Iniciar temporizador'}
            >
              {temporizadorAtivo ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
            </button>
            
            <button
              onClick={reiniciarTemporizador}
              disabled={tempoTotal === 0}
              className="p-3 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Reiniciar temporizador"
            >
              <RotateCcw className="h-6 w-6" />
            </button>
            
            <button
              onClick={iniciarPausa}
              disabled={!hiperfocoSelecionadoId && tempoTotal === 0}
              className="p-3 bg-hiperfocos-light text-hiperfocos-primary rounded-full hover:bg-opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Iniciar pausa"
            >
              <Bell className="h-6 w-6" />
            </button>
          </div>
          
          {/* Status do temporizador */}
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">
            {temporizadorAtivo ? 'Temporizador ativo' : 'Temporizador parado'}
          </div>
        </div>
      </div>
      
      {/* Nota explicativa */}
      <div className="mt-6 p-4 bg-blue-50 text-blue-800 dark:bg-blue-900 dark:text-blue-100 rounded-md">
        <h3 className="font-medium mb-2 flex items-center">
          <Clock className="h-5 w-5 mr-2" />
          Dica para gerenciar o tempo
        </h3>
        <p className="text-sm">
          Utilizar temporizadores ajuda a manter o foco e evitar o hiperfoco prolongado. 
          Defina intervalos de trabalho e pausa regulares para melhorar a produtividade.
        </p>
      </div>
    </div>
  )
}
