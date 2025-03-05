'use client'

import { useState } from 'react'
import { useSonoStore } from '../../stores/sonoStore'
import { formatDistanceToNow, format, isToday, isYesterday, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Clock, Moon, Trash2, Star, Edit2 } from 'lucide-react'

export function RegistroSono() {
  const { registros, adicionarRegistroSono, atualizarRegistroSono, removerRegistroSono } = useSonoStore()
  
  const [dataInicio, setDataInicio] = useState('')
  const [horaInicio, setHoraInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [horaFim, setHoraFim] = useState('')
  const [notas, setNotas] = useState('')
  const [qualidade, setQualidade] = useState<number | null>(null)
  const [modoEdicao, setModoEdicao] = useState(false)
  const [idEdicao, setIdEdicao] = useState<string | null>(null)
  
  // Formatar data para exibição
  const formatarData = (dataISO: string) => {
    const data = parseISO(dataISO)
    if (isToday(data)) {
      return `Hoje às ${format(data, 'HH:mm')}`
    } else if (isYesterday(data)) {
      return `Ontem às ${format(data, 'HH:mm')}`
    }
    return format(data, "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })
  }
  
  // Calcular duração do sono
  const calcularDuracao = (inicio: string, fim: string | null) => {
    if (!fim) return null
    
    const dataInicio = parseISO(inicio)
    const dataFim = parseISO(fim)
    
    // Diferença em milissegundos
    const diff = dataFim.getTime() - dataInicio.getTime()
    
    // Converter para horas e minutos
    const horas = Math.floor(diff / (1000 * 60 * 60))
    const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    return `${horas}h ${minutos}min`
  }
  
  // Formatação da qualidade do sono em estrelas
  const renderEstrelas = (qualidade: number | null) => {
    if (qualidade === null) return null
    
    return Array.from({ length: 5 }).map((_, i) => (
      <Star 
        key={i} 
        className={`h-4 w-4 ${i < qualidade ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
      />
    ))
  }
  
  // Lidar com o envio do formulário
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!dataInicio || !horaInicio) return
    
    const inicioISO = new Date(`${dataInicio}T${horaInicio}:00`).toISOString()
    const fimISO = dataFim && horaFim 
      ? new Date(`${dataFim}T${horaFim}:00`).toISOString() 
      : null
    
    if (modoEdicao && idEdicao) {
      atualizarRegistroSono(idEdicao, {
        inicio: inicioISO,
        fim: fimISO,
        qualidade,
        notas
      })
      
      // Limpar modo de edição
      setModoEdicao(false)
      setIdEdicao(null)
    } else {
      adicionarRegistroSono(inicioISO, fimISO, qualidade, notas)
    }
    
    // Limpar o formulário
    resetForm()
  }
  
  // Resetar formulário
  const resetForm = () => {
    setDataInicio('')
    setHoraInicio('')
    setDataFim('')
    setHoraFim('')
    setNotas('')
    setQualidade(null)
  }
  
  // Iniciar edição de um registro
  const iniciarEdicao = (registro: any) => {
    const dataInicioObj = parseISO(registro.inicio)
    const dataInicio = format(dataInicioObj, 'yyyy-MM-dd')
    const horaInicio = format(dataInicioObj, 'HH:mm')
    
    let dataFim = ''
    let horaFim = ''
    
    if (registro.fim) {
      const dataFimObj = parseISO(registro.fim)
      dataFim = format(dataFimObj, 'yyyy-MM-dd')
      horaFim = format(dataFimObj, 'HH:mm')
    }
    
    setDataInicio(dataInicio)
    setHoraInicio(horaInicio)
    setDataFim(dataFim)
    setHoraFim(horaFim)
    setNotas(registro.notas || '')
    setQualidade(registro.qualidade)
    
    setModoEdicao(true)
    setIdEdicao(registro.id)
  }
  
  // Cancelar edição
  const cancelarEdicao = () => {
    resetForm()
    setModoEdicao(false)
    setIdEdicao(null)
  }
  
  // Registrar sono atual
  const registrarSonoAtual = () => {
    const agora = new Date()
    setDataInicio(format(agora, 'yyyy-MM-dd'))
    setHoraInicio(format(agora, 'HH:mm'))
  }
  
  // Registrar acordar agora
  const registrarAcordarAgora = (id: string) => {
    const agora = new Date().toISOString()
    atualizarRegistroSono(id, { fim: agora })
  }
  
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
        Registro de Sono
      </h2>
      
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          {/* Início do sono */}
          <div>
            <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
              <Moon className="h-4 w-4 mr-2 rotate-180" />
              Horário de dormir
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="data-inicio" className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Data
                </label>
                <input
                  type="date"
                  id="data-inicio"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sono-primary focus:border-sono-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="hora-inicio" className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Hora
                </label>
                <input
                  type="time"
                  id="hora-inicio"
                  value={horaInicio}
                  onChange={(e) => setHoraInicio(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sono-primary focus:border-sono-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
            </div>
            
            <button
              type="button"
              onClick={registrarSonoAtual}
              className="mt-2 text-sm text-sono-primary hover:text-sono-secondary dark:text-sono-secondary dark:hover:text-sono-primary"
            >
              Registrar agora
            </button>
          </div>
          
          {/* Fim do sono */}
          <div>
            <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Horário de acordar
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="data-fim" className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Data
                </label>
                <input
                  type="date"
                  id="data-fim"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sono-primary focus:border-sono-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              
              <div>
                <label htmlFor="hora-fim" className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Hora
                </label>
                <input
                  type="time"
                  id="hora-fim"
                  value={horaFim}
                  onChange={(e) => setHoraFim(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sono-primary focus:border-sono-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
            
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Deixe em branco se ainda não acordou
            </div>
          </div>
        </div>
        
        {/* Qualidade do sono */}
        <div className="mb-6">
          <label className="block font-medium text-gray-700 dark:text-gray-300 mb-2">
            Qualidade do sono
          </label>
          
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map((valor) => (
              <button
                key={valor}
                type="button"
                onClick={() => setQualidade(valor)}
                className="p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-sono-primary"
                aria-label={`Qualidade ${valor} de 5`}
              >
                <Star 
                  className={`h-6 w-6 ${qualidade !== null && valor <= qualidade ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                />
              </button>
            ))}
          </div>
          
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {qualidade === null ? 'Selecione a qualidade do sono' : `Qualidade: ${qualidade}/5`}
          </div>
        </div>
        
        {/* Notas */}
        <div className="mb-6">
          <label htmlFor="notas" className="block font-medium text-gray-700 dark:text-gray-300 mb-2">
            Notas (opcional)
          </label>
          <textarea
            id="notas"
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sono-primary focus:border-sono-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Exemplo: Acordei várias vezes, tive sonhos vívidos, etc."
          />
        </div>
        
        {/* Botões */}
        <div className="flex space-x-3">
          <button
            type="submit"
            className="px-4 py-2 bg-sono-primary text-white rounded-md hover:bg-sono-secondary focus:outline-none focus:ring-2 focus:ring-sono-primary focus:ring-offset-2"
          >
            {modoEdicao ? 'Atualizar Registro' : 'Registrar Sono'}
          </button>
          
          {modoEdicao && (
            <button
              type="button"
              onClick={cancelarEdicao}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>
      
      {/* Lista de registros recentes */}
      <div>
        <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-3">
          Registros Recentes
        </h3>
        
        <div className="space-y-4">
          {registros.length === 0 ? (
            <div className="text-gray-500 dark:text-gray-400 text-center py-4">
              Nenhum registro de sono encontrado
            </div>
          ) : (
            registros
              .sort((a, b) => new Date(b.inicio).getTime() - new Date(a.inicio).getTime())
              .slice(0, 5)
              .map((registro) => (
                <div 
                  key={registro.id}
                  className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-gray-800 dark:text-white">
                        {formatarData(registro.inicio)}
                      </div>
                      
                      {registro.fim ? (
                        <div className="text-gray-600 dark:text-gray-300 text-sm">
                          Até {formatarData(registro.fim)}
                        </div>
                      ) : (
                        <div className="text-sono-primary dark:text-sono-secondary text-sm font-medium">
                          Ainda dormindo
                        </div>
                      )}
                      
                      {registro.fim && (
                        <div className="flex items-center mt-1">
                          <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-1" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {calcularDuracao(registro.inicio, registro.fim)}
                          </span>
                        </div>
                      )}
                      
                      {registro.qualidade !== null && (
                        <div className="flex mt-1">
                          {renderEstrelas(registro.qualidade)}
                        </div>
                      )}
                      
                      {registro.notas && (
                        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                          "{registro.notas}"
                        </div>
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => iniciarEdicao(registro)}
                        className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                        aria-label="Editar registro"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => removerRegistroSono(registro.id)}
                        className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        aria-label="Remover registro"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  {!registro.fim && (
                    <button
                      onClick={() => registrarAcordarAgora(registro.id)}
                      className="mt-2 px-3 py-1 text-sm bg-sono-light text-sono-primary rounded-md hover:bg-opacity-70"
                    >
                      Registrar acordar agora
                    </button>
                  )}
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  )
}
