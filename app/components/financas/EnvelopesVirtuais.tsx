'use client'

import { useState } from 'react'
import { useFinancasStore } from '@/app/stores/financasStore'
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react'

export function EnvelopesVirtuais() {
  const { envelopes, adicionarEnvelope, atualizarEnvelope, removerEnvelope, registrarGastoEnvelope } = useFinancasStore()
  const [novoEnvelope, setNovoEnvelope] = useState({ nome: '', cor: '#2196F3', valorAlocado: 0 })
  const [valorGasto, setValorGasto] = useState<{id: string, valor: number} | null>(null)
  const [editando, setEditando] = useState<string | null>(null)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  
  // Formatador para valores monetários
  const formatadorMoeda = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
  
  // Lista de cores disponíveis para envelopes
  const coresPredefinidas = [
    '#FF5252', // Vermelho
    '#4CAF50', // Verde
    '#2196F3', // Azul
    '#FFC107', // Amarelo
    '#9C27B0', // Roxo
    '#FF9800', // Laranja
    '#00BCD4', // Ciano
  ]
  
  const handleAdicionarEnvelope = () => {
    if (!novoEnvelope.nome || novoEnvelope.valorAlocado <= 0) return
    
    adicionarEnvelope(
      novoEnvelope.nome,
      novoEnvelope.cor,
      novoEnvelope.valorAlocado
    )
    
    setNovoEnvelope({ nome: '', cor: '#2196F3', valorAlocado: 0 })
    setMostrarFormulario(false)
  }
  
  const iniciarEdicao = (id: string) => {
    const envelope = envelopes.find(e => e.id === id)
    if (envelope) {
      setNovoEnvelope({
        nome: envelope.nome,
        cor: envelope.cor,
        valorAlocado: envelope.valorAlocado
      })
      setEditando(id)
      setMostrarFormulario(true)
    }
  }
  
  const salvarEdicao = () => {
    if (!editando || !novoEnvelope.nome || novoEnvelope.valorAlocado <= 0) return
    
    atualizarEnvelope(
      editando,
      novoEnvelope.nome,
      novoEnvelope.cor,
      novoEnvelope.valorAlocado
    )
    
    setNovoEnvelope({ nome: '', cor: '#2196F3', valorAlocado: 0 })
    setEditando(null)
    setMostrarFormulario(false)
  }
  
  const cancelarForm = () => {
    setNovoEnvelope({ nome: '', cor: '#2196F3', valorAlocado: 0 })
    setEditando(null)
    setMostrarFormulario(false)
  }
  
  const handleRegistrarGasto = (id: string) => {
    if (!valorGasto || !valorGasto.valor || valorGasto.valor <= 0) return
    
    registrarGastoEnvelope(id, valorGasto.valor)
    setValorGasto(null)
  }
  
  return (
    <div className="space-y-4">
      {/* Visualização dos envelopes */}
      <div className="space-y-3">
        {envelopes.map(envelope => {
          const percentualUtilizado = envelope.valorAlocado > 0 
            ? (envelope.valorUtilizado / envelope.valorAlocado) * 100 
            : 0
          
          return (
            <div 
              key={envelope.id} 
              className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
            >
              <div className="flex items-center justify-between p-3" style={{ backgroundColor: `${envelope.cor}20` }}>
                <div className="flex items-center">
                  <div 
                    className="w-4 h-4 mr-2 rounded-full" 
                    style={{ backgroundColor: envelope.cor }} 
                  />
                  <span className="font-medium text-gray-900 dark:text-white">
                    {envelope.nome}
                  </span>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => iniciarEdicao(envelope.id)}
                    className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    aria-label={`Editar envelope ${envelope.nome}`}
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => removerEnvelope(envelope.id)}
                    className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    aria-label={`Remover envelope ${envelope.nome}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="p-3">
                <div className="flex justify-between mb-1 text-sm">
                  <span>Utilizado: {formatadorMoeda.format(envelope.valorUtilizado)}</span>
                  <span>Total: {formatadorMoeda.format(envelope.valorAlocado)}</span>
                </div>
                
                {/* Barra de progresso */}
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-3">
                  <div 
                    className="h-2.5 rounded-full" 
                    style={{ 
                      width: `${Math.min(percentualUtilizado, 100)}%`, 
                      backgroundColor: envelope.cor 
                    }} 
                  />
                </div>
                
                {/* Registrar gasto */}
                {valorGasto && valorGasto.id === envelope.id ? (
                  <div className="flex mt-2">
                    <input
                      type="number"
                      value={valorGasto.valor || ''}
                      onChange={e => setValorGasto({ id: envelope.id, valor: parseFloat(e.target.value) || 0 })}
                      placeholder="Valor"
                      className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-l dark:bg-gray-700 dark:text-white text-sm"
                      min="0.01"
                      step="0.01"
                      aria-label="Valor do gasto"
                    />
                    <button
                      onClick={() => handleRegistrarGasto(envelope.id)}
                      className="px-2 py-1 bg-blue-500 text-white rounded-r hover:bg-blue-600 text-sm"
                      aria-label="Confirmar gasto"
                    >
                      <Save className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setValorGasto(null)}
                      className="px-2 py-1 ml-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
                      aria-label="Cancelar"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setValorGasto({ id: envelope.id, valor: 0 })}
                    className="w-full mt-2 px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md text-gray-600 dark:text-gray-300"
                    aria-label={`Registrar gasto no envelope ${envelope.nome}`}
                  >
                    Registrar Gasto
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
      
      {/* Formulário para adicionar ou editar envelope */}
      {mostrarFormulario ? (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
          <div className="space-y-3">
            <div>
              <label htmlFor="envelopeNome" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nome do Envelope
              </label>
              <input
                id="envelopeNome"
                type="text"
                value={novoEnvelope.nome}
                onChange={e => setNovoEnvelope({ ...novoEnvelope, nome: e.target.value })}
                className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                placeholder="Ex: Emergências"
              />
            </div>
            
            <div>
              <label htmlFor="envelopeValor" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Valor Alocado
              </label>
              <input
                id="envelopeValor"
                type="number"
                value={novoEnvelope.valorAlocado || ''}
                onChange={e => setNovoEnvelope({ ...novoEnvelope, valorAlocado: parseFloat(e.target.value) || 0 })}
                className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                placeholder="Valor"
                min="0.01"
                step="0.01"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Cor do Envelope
              </label>
              <div className="flex flex-wrap gap-2">
                {coresPredefinidas.map(cor => (
                  <button
                    key={cor}
                    type="button"
                    onClick={() => setNovoEnvelope({ ...novoEnvelope, cor })}
                    className={`w-8 h-8 rounded-full ${
                      novoEnvelope.cor === cor ? 'ring-2 ring-offset-2 ring-gray-500' : ''
                    }`}
                    style={{ backgroundColor: cor }}
                    aria-label={`Selecionar cor ${cor}`}
                  />
                ))}
              </div>
            </div>
            
            <div className="flex space-x-2 pt-2">
              {editando ? (
                <>
                  <button
                    onClick={salvarEdicao}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    aria-label="Salvar alterações no envelope"
                  >
                    Salvar
                  </button>
                  <button
                    onClick={cancelarForm}
                    className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-500"
                    aria-label="Cancelar edição"
                  >
                    Cancelar
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleAdicionarEnvelope}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    aria-label="Adicionar envelope"
                  >
                    Adicionar
                  </button>
                  <button
                    onClick={cancelarForm}
                    className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-500"
                    aria-label="Cancelar"
                  >
                    Cancelar
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setMostrarFormulario(true)}
          className="w-full px-4 py-2 flex items-center justify-center bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md text-gray-700 dark:text-gray-300"
          aria-label="Adicionar novo envelope"
        >
          <Plus className="h-5 w-5 mr-1" />
          Novo Envelope
        </button>
      )}
    </div>
  )
}
