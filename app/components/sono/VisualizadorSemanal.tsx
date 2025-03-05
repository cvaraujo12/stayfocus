'use client'

import { useState, useMemo } from 'react'
import { useSonoStore } from '../../stores/sonoStore'
import { 
  startOfWeek, endOfWeek, eachDayOfInterval, 
  format, parseISO, isSameDay, isWithinInterval,
  differenceInMinutes, addDays, subWeeks
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ArrowLeft, ArrowRight, Moon, Sun, Clock } from 'lucide-react'

export function VisualizadorSemanal() {
  const { registros } = useSonoStore()
  const [semanaAtual, setSemanaAtual] = useState(new Date())
  
  // Navegar entre semanas
  const irParaSemanaAnterior = () => {
    setSemanaAtual(prevData => subWeeks(prevData, 1))
  }
  
  const irParaProximaSemana = () => {
    setSemanaAtual(prevData => addDays(prevData, 7))
  }
  
  // Calcular o intervalo da semana atual
  const intervaloSemana = useMemo(() => {
    const inicioDaSemana = startOfWeek(semanaAtual, { weekStartsOn: 0 }) // Domingo como início da semana
    const fimDaSemana = endOfWeek(semanaAtual, { weekStartsOn: 0 })
    return {
      inicio: inicioDaSemana,
      fim: fimDaSemana,
      diasDaSemana: eachDayOfInterval({ start: inicioDaSemana, end: fimDaSemana })
    }
  }, [semanaAtual])
  
  // Formatar os dias da semana para exibição
  const diasFormatados = useMemo(() => {
    return intervaloSemana.diasDaSemana.map(dia => {
      const diaSemanaAbreviado = format(dia, 'EEE', { locale: ptBR })
      const diaMes = format(dia, 'dd/MM')
      return {
        data: dia,
        diaSemana: diaSemanaAbreviado.charAt(0).toUpperCase() + diaSemanaAbreviado.slice(1),
        diaMes
      }
    })
  }, [intervaloSemana])
  
  // Filtrar e processar os registros da semana
  const dadosSemanal = useMemo(() => {
    return diasFormatados.map(dia => {
      // Encontrar registros que começam ou terminam neste dia
      const registrosDoDia = registros.filter(registro => {
        const dataInicio = parseISO(registro.inicio)
        const dataFim = registro.fim ? parseISO(registro.fim) : new Date()
        
        // Verificar se o início ou fim do sono está neste dia
        // Ou se o sono abrange completamente este dia
        return (
          isSameDay(dataInicio, dia.data) || 
          isSameDay(dataFim, dia.data) ||
          isWithinInterval(dia.data, { start: dataInicio, end: dataFim })
        )
      })
      
      // Calcular tempo total de sono para este dia (em minutos)
      let minutosTotais = 0
      
      registrosDoDia.forEach(registro => {
        const dataInicio = parseISO(registro.inicio)
        const dataFim = registro.fim ? parseISO(registro.fim) : new Date()
        
        // Início e fim do dia
        const inicioDia = new Date(dia.data)
        inicioDia.setHours(0, 0, 0, 0)
        
        const fimDia = new Date(dia.data)
        fimDia.setHours(23, 59, 59, 999)
        
        // Determinar o intervalo de sono dentro deste dia específico
        const inicioIntervalo = dataInicio < inicioDia ? inicioDia : dataInicio
        const fimIntervalo = dataFim > fimDia ? fimDia : dataFim
        
        // Calcular minutos de sono neste dia
        if (fimIntervalo > inicioIntervalo) {
          minutosTotais += differenceInMinutes(fimIntervalo, inicioIntervalo)
        }
      })
      
      // Converter para horas (arredondar para 1 casa decimal)
      const horasDeSono = Math.round(minutosTotais / 6) / 10
      
      // Qualidade média do sono
      const registrosComQualidade = registrosDoDia.filter(r => r.qualidade !== null)
      const qualidadeMedia = registrosComQualidade.length > 0
        ? registrosComQualidade.reduce((sum, r) => sum + (r.qualidade || 0), 0) / registrosComQualidade.length
        : null
      
      return {
        ...dia,
        horasDeSono,
        qualidadeMedia,
        registros: registrosDoDia
      }
    })
  }, [diasFormatados, registros])
  
  // Calcular estatísticas da semana
  const estatisticasSemana = useMemo(() => {
    const diasComSono = dadosSemanal.filter(d => d.horasDeSono > 0)
    
    if (diasComSono.length === 0) {
      return {
        mediaHoras: 0,
        mediaQualidade: 0,
        melhorDia: null,
        piorDia: null
      }
    }
    
    const totalHoras = diasComSono.reduce((sum, dia) => sum + dia.horasDeSono, 0)
    const mediaHoras = Math.round((totalHoras / diasComSono.length) * 10) / 10
    
    const diasComQualidade = diasComSono.filter(d => d.qualidadeMedia !== null)
    const mediaQualidade = diasComQualidade.length > 0
      ? Math.round((diasComQualidade.reduce((sum, dia) => sum + (dia.qualidadeMedia || 0), 0) / diasComQualidade.length) * 10) / 10
      : 0
    
    // Melhor e pior dia baseado em horas de sono (mais próximo de 8h é melhor)
    const melhorDia = [...diasComSono].sort((a, b) => {
      const distA = Math.abs(a.horasDeSono - 8)
      const distB = Math.abs(b.horasDeSono - 8)
      return distA - distB
    })[0]
    
    const piorDia = [...diasComSono].sort((a, b) => {
      const distA = Math.abs(a.horasDeSono - 8)
      const distB = Math.abs(b.horasDeSono - 8)
      return distB - distA
    })[0]
    
    return {
      mediaHoras,
      mediaQualidade,
      melhorDia,
      piorDia
    }
  }, [dadosSemanal])
  
  // Calcular altura máxima da barra (12 horas)
  const calcularAlturaBarra = (horas: number) => {
    const maxHoras = 12
    const alturaPorcentagem = Math.min((horas / maxHoras) * 100, 100)
    return `${alturaPorcentagem}%`
  }
  
  // Calcular cor da barra com base nas horas (verde = ideal, amarelo = médio, vermelho = pouco)
  const calcularCorBarra = (horas: number) => {
    if (horas >= 7 && horas <= 9) return 'bg-green-500'
    if (horas >= 5 && horas < 7) return 'bg-yellow-500'
    if (horas > 9 && horas <= 11) return 'bg-yellow-500'
    return 'bg-red-500'
  }
  
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
        Visualizador Semanal de Sono
      </h2>
      
      {/* Navegação de semanas */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={irParaSemanaAnterior}
          className="p-2 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-sono-primary"
          aria-label="Semana anterior"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        
        <div className="text-center">
          <h3 className="font-medium text-gray-800 dark:text-white">
            {format(intervaloSemana.inicio, "dd 'de' MMMM", { locale: ptBR })} - {format(intervaloSemana.fim, "dd 'de' MMMM", { locale: ptBR })}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {format(intervaloSemana.inicio, "yyyy")}
          </p>
        </div>
        
        <button
          onClick={irParaProximaSemana}
          className="p-2 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-sono-primary"
          aria-label="Próxima semana"
          disabled={isWithinInterval(new Date(), { start: intervaloSemana.inicio, end: intervaloSemana.fim })}
        >
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
      
      {/* Visualização de gráfico */}
      <div className="mb-8">
        <div className="flex items-end justify-between h-64 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          {dadosSemanal.map((dia, index) => (
            <div key={index} className="flex flex-col items-center w-1/7">
              <div className="relative h-48 w-full flex items-end justify-center mb-2">
                {dia.horasDeSono > 0 ? (
                  <div 
                    className={`w-8 rounded-t-lg ${calcularCorBarra(dia.horasDeSono)}`} 
                    style={{ height: calcularAlturaBarra(dia.horasDeSono) }}
                    title={`${dia.horasDeSono} horas de sono`}
                  />
                ) : (
                  <div className="text-gray-400 dark:text-gray-500">
                    —
                  </div>
                )}
              </div>
              <div className="text-center">
                <div className="font-medium text-sono-primary dark:text-sono-secondary text-sm">
                  {dia.diaSemana}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {dia.diaMes}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
            <span>7-9h (ideal)</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-yellow-500 mr-1"></div>
            <span>5-7h / 9-11h</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
            <span>&lt;5h / &gt;11h</span>
          </div>
        </div>
      </div>
      
      {/* Estatísticas da semana */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <h3 className="font-medium text-gray-800 dark:text-white mb-2 flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            Média da Semana
          </h3>
          
          <div className="flex justify-between">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Horas de sono</div>
              <div className="text-2xl font-bold text-sono-primary">{estatisticasSemana.mediaHoras}h</div>
            </div>
            
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Qualidade média</div>
              <div className="text-2xl font-bold text-sono-primary">
                {estatisticasSemana.mediaQualidade ? estatisticasSemana.mediaQualidade.toFixed(1) : '—'}/5
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <h3 className="font-medium text-gray-800 dark:text-white mb-2 flex items-center">
            <Sun className="h-4 w-4 mr-2" />
            Melhor e Pior Dia
          </h3>
          
          {estatisticasSemana.melhorDia ? (
            <div className="flex justify-between">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Melhor dia</div>
                <div className="font-medium text-green-600 dark:text-green-400">
                  {estatisticasSemana.melhorDia.diaSemana} • {estatisticasSemana.melhorDia.horasDeSono}h
                </div>
              </div>
              
              {estatisticasSemana.piorDia && (
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Pior dia</div>
                  <div className="font-medium text-red-600 dark:text-red-400">
                    {estatisticasSemana.piorDia.diaSemana} • {estatisticasSemana.piorDia.horasDeSono}h
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-gray-500 dark:text-gray-400">
              Sem dados suficientes para esta semana
            </div>
          )}
        </div>
      </div>
      
      {/* Lista de registros da semana */}
      <div>
        <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-3">
          Detalhes da Semana
        </h3>
        
        {dadosSemanal.some(d => d.registros.length > 0) ? (
          <div className="space-y-2">
            {dadosSemanal.map((dia, index) => (
              dia.registros.length > 0 && (
                <div key={index} className="border-l-2 border-sono-primary pl-3 py-1">
                  <div className="font-medium text-gray-800 dark:text-white">
                    {dia.diaSemana}, {dia.diaMes}
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{dia.horasDeSono} horas de sono</span>
                  </div>
                </div>
              )
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500 dark:text-gray-400">
            Nenhum registro encontrado para esta semana
          </div>
        )}
      </div>
    </div>
  )
}
