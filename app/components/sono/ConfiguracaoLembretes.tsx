'use client'

import { useState } from 'react'
import { useSonoStore } from '../../stores/sonoStore'
import { Bell, Trash2, Moon, Sun, Clock, Eye, EyeOff, Edit2 } from 'lucide-react'

// Dias da semana para seleção
const diasSemana = [
  { valor: 0, nome: 'Dom', abrev: 'D' },
  { valor: 1, nome: 'Seg', abrev: 'S' },
  { valor: 2, nome: 'Ter', abrev: 'T' },
  { valor: 3, nome: 'Qua', abrev: 'Q' },
  { valor: 4, nome: 'Qui', abrev: 'Q' },
  { valor: 5, nome: 'Sex', abrev: 'S' },
  { valor: 6, nome: 'Sáb', abrev: 'S' },
]

export function ConfiguracaoLembretes() {
  const { 
    lembretes, 
    adicionarLembrete, 
    atualizarLembrete, 
    removerLembrete, 
    alternarAtivoLembrete 
  } = useSonoStore()
  
  // Estado do formulário
  const [tipo, setTipo] = useState<'dormir' | 'acordar'>('dormir')
  const [horario, setHorario] = useState('22:00')
  const [diasSelecionados, setDiasSelecionados] = useState<number[]>([0, 1, 2, 3, 4, 5, 6])
  const [modoEdicao, setModoEdicao] = useState(false)
  const [idEdicao, setIdEdicao] = useState<string | null>(null)

  // Alternar seleção de dia
  const toggleDia = (dia: number) => {
    if (diasSelecionados.includes(dia)) {
      setDiasSelecionados(diasSelecionados.filter(d => d !== dia))
    } else {
      setDiasSelecionados([...diasSelecionados, dia])
    }
  }
  
  // Selecionar todos os dias
  const selecionarTodosDias = () => {
    setDiasSelecionados([0, 1, 2, 3, 4, 5, 6])
  }
  
  // Selecionar apenas dias de semana
  const selecionarDiasSemana = () => {
    setDiasSelecionados([1, 2, 3, 4, 5])
  }
  
  // Selecionar apenas fim de semana
  const selecionarFimDeSemana = () => {
    setDiasSelecionados([0, 6])
  }
  
  // Limpar seleção de dias
  const limparDias = () => {
    setDiasSelecionados([])
  }
  
  // Iniciar edição de um lembrete
  const iniciarEdicao = (lembrete: any) => {
    setTipo(lembrete.tipo)
    setHorario(lembrete.horario)
    setDiasSelecionados(lembrete.diasSemana)
    setModoEdicao(true)
    setIdEdicao(lembrete.id)
  }
  
  // Cancelar edição
  const cancelarEdicao = () => {
    resetForm()
    setModoEdicao(false)
    setIdEdicao(null)
  }
  
  // Resetar formulário
  const resetForm = () => {
    setTipo('dormir')
    setHorario('22:00')
    setDiasSelecionados([0, 1, 2, 3, 4, 5, 6])
  }
  
  // Lidar com envio do formulário
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (diasSelecionados.length === 0) {
      alert('Selecione pelo menos um dia da semana')
      return
    }
    
    if (modoEdicao && idEdicao) {
      atualizarLembrete(idEdicao, {
        tipo,
        horario,
        diasSemana: diasSelecionados
      })
      
      // Limpar modo de edição
      setModoEdicao(false)
      setIdEdicao(null)
    } else {
      adicionarLembrete(tipo, horario, diasSelecionados)
    }
    
    // Resetar formulário
    resetForm()
  }
  
  // Formatar exibição dos dias da semana
  const formatarDiasSemana = (dias: number[]) => {
    if (dias.length === 7) return 'Todos os dias'
    if (dias.length === 0) return 'Nenhum dia selecionado'
    if (arrayEquals(dias, [1, 2, 3, 4, 5])) return 'Segunda a Sexta'
    if (arrayEquals(dias, [0, 6])) return 'Fim de semana'
    
    return dias
      .sort((a, b) => a - b)
      .map(dia => diasSemana.find(d => d.valor === dia)?.nome)
      .join(', ')
  }
  
  // Verificar se dois arrays são iguais
  const arrayEquals = (a: any[], b: any[]) => {
    return a.length === b.length && 
      a.sort().every((val, index) => val === b.sort()[index])
  }
  
  // Agrupar lembretes por tipo
  const lembretesDormir = lembretes.filter(l => l.tipo === 'dormir')
  const lembretesAcordar = lembretes.filter(l => l.tipo === 'acordar')
  
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
        Configuração de Lembretes
      </h2>
      
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Tipo de lembrete */}
          <div>
            <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-3">
              Tipo de Lembrete
            </h3>
            
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="tipo"
                  checked={tipo === 'dormir'}
                  onChange={() => setTipo('dormir')}
                  className="h-4 w-4 text-sono-primary focus:ring-sono-primary border-gray-300"
                />
                <span className="ml-2 flex items-center text-gray-700 dark:text-gray-300">
                  <Moon className="h-4 w-4 mr-1 rotate-180" />
                  Hora de dormir
                </span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="radio"
                  name="tipo"
                  checked={tipo === 'acordar'}
                  onChange={() => setTipo('acordar')}
                  className="h-4 w-4 text-sono-primary focus:ring-sono-primary border-gray-300"
                />
                <span className="ml-2 flex items-center text-gray-700 dark:text-gray-300">
                  <Sun className="h-4 w-4 mr-1" />
                  Hora de acordar
                </span>
              </label>
            </div>
          </div>
          
          {/* Horário */}
          <div>
            <label htmlFor="horario" className="block font-medium text-gray-700 dark:text-gray-300 mb-3">
              Horário
            </label>
            <input
              type="time"
              id="horario"
              value={horario}
              onChange={(e) => setHorario(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sono-primary focus:border-sono-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>
        </div>
        
        {/* Dias da semana */}
        <div className="mt-6">
          <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-3">
            Dias da Semana
          </h3>
          
          <div className="flex mb-3 space-x-2">
            <button
              type="button"
              onClick={selecionarTodosDias}
              className="px-2 py-1 text-xs text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Todos
            </button>
            <button
              type="button"
              onClick={selecionarDiasSemana}
              className="px-2 py-1 text-xs text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Seg-Sex
            </button>
            <button
              type="button"
              onClick={selecionarFimDeSemana}
              className="px-2 py-1 text-xs text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Fim de semana
            </button>
            <button
              type="button"
              onClick={limparDias}
              className="px-2 py-1 text-xs text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Limpar
            </button>
          </div>
          
          <div className="flex space-x-2 flex-wrap">
            {diasSemana.map((dia) => (
              <button
                key={dia.valor}
                type="button"
                onClick={() => toggleDia(dia.valor)}
                className={`
                  w-9 h-9 rounded-full flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-sono-primary
                  ${diasSelecionados.includes(dia.valor)
                    ? 'bg-sono-primary text-white'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}
                `}
                aria-label={`${diasSelecionados.includes(dia.valor) ? 'Remover' : 'Adicionar'} ${dia.nome}`}
                aria-pressed={diasSelecionados.includes(dia.valor)}
              >
                {dia.abrev}
              </button>
            ))}
          </div>
          
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {formatarDiasSemana(diasSelecionados)}
          </p>
        </div>
        
        {/* Botões */}
        <div className="mt-6 flex space-x-3">
          <button
            type="submit"
            className="px-4 py-2 bg-sono-primary text-white rounded-md hover:bg-sono-secondary focus:outline-none focus:ring-2 focus:ring-sono-primary focus:ring-offset-2"
          >
            {modoEdicao ? 'Atualizar Lembrete' : 'Adicionar Lembrete'}
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
      
      {/* Lista de lembretes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Lembretes para dormir */}
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <h3 className="font-medium text-gray-800 dark:text-white mb-3 flex items-center">
            <Moon className="h-4 w-4 mr-2 rotate-180" />
            Lembretes para Dormir
          </h3>
          
          {lembretesDormir.length === 0 ? (
            <div className="text-gray-500 dark:text-gray-400 text-center py-2">
              Nenhum lembrete configurado
            </div>
          ) : (
            <div className="space-y-3">
              {lembretesDormir.map((lembrete) => (
                <div 
                  key={lembrete.id}
                  className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-md shadow-sm"
                >
                  <div>
                    <div className="font-medium text-gray-800 dark:text-white">
                      {lembrete.horario}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {formatarDiasSemana(lembrete.diasSemana)}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => alternarAtivoLembrete(lembrete.id)}
                      className={`p-1 rounded-md ${lembrete.ativo ? 'text-sono-primary' : 'text-gray-400'}`}
                      aria-label={lembrete.ativo ? 'Desativar lembrete' : 'Ativar lembrete'}
                    >
                      {lembrete.ativo ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                    
                    <button
                      onClick={() => iniciarEdicao(lembrete)}
                      className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                      aria-label="Editar lembrete"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    
                    <button
                      onClick={() => removerLembrete(lembrete.id)}
                      className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      aria-label="Remover lembrete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Lembretes para acordar */}
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <h3 className="font-medium text-gray-800 dark:text-white mb-3 flex items-center">
            <Sun className="h-4 w-4 mr-2" />
            Lembretes para Acordar
          </h3>
          
          {lembretesAcordar.length === 0 ? (
            <div className="text-gray-500 dark:text-gray-400 text-center py-2">
              Nenhum lembrete configurado
            </div>
          ) : (
            <div className="space-y-3">
              {lembretesAcordar.map((lembrete) => (
                <div 
                  key={lembrete.id}
                  className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-md shadow-sm"
                >
                  <div>
                    <div className="font-medium text-gray-800 dark:text-white">
                      {lembrete.horario}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {formatarDiasSemana(lembrete.diasSemana)}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => alternarAtivoLembrete(lembrete.id)}
                      className={`p-1 rounded-md ${lembrete.ativo ? 'text-sono-primary' : 'text-gray-400'}`}
                      aria-label={lembrete.ativo ? 'Desativar lembrete' : 'Ativar lembrete'}
                    >
                      {lembrete.ativo ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                    
                    <button
                      onClick={() => iniciarEdicao(lembrete)}
                      className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                      aria-label="Editar lembrete"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    
                    <button
                      onClick={() => removerLembrete(lembrete.id)}
                      className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      aria-label="Remover lembrete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Nota sobre os lembretes */}
      <div className="mt-6 p-4 bg-blue-50 text-blue-800 dark:bg-blue-900 dark:text-blue-100 rounded-md">
        <h3 className="font-medium mb-2 flex items-center">
          <Bell className="h-5 w-5 mr-2" />
          Sobre os lembretes
        </h3>
        <p className="text-sm">
          Os lembretes são apenas visuais e exibidos quando você estiver usando o aplicativo. 
          Para receber notificações em seu dispositivo, configure os alarmes no aplicativo de relógio do seu sistema.
        </p>
      </div>
    </div>
  )
}
