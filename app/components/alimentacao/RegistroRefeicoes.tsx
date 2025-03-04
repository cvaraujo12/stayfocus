'use client'

import { useState } from 'react'
import { Camera, Plus, X } from 'lucide-react'
import { useAlimentacaoStore } from '@/app/stores/alimentacaoStore'

// Ícones simples para tipos de refeição
const tiposRefeicao = [
  { id: 'cafe', emoji: '☕', nome: 'Café' },
  { id: 'fruta', emoji: '🍎', nome: 'Fruta' },
  { id: 'salada', emoji: '🥗', nome: 'Salada' },
  { id: 'proteina', emoji: '🍗', nome: 'Proteína' },
  { id: 'carboidrato', emoji: '🍚', nome: 'Carboidrato' },
  { id: 'sobremesa', emoji: '🍰', nome: 'Sobremesa' },
  { id: 'agua', emoji: '💧', nome: 'Água' },
]

export function RegistroRefeicoes() {
  const { registros, adicionarRegistro, removerRegistro } = useAlimentacaoStore()
  const [novoRegistro, setNovoRegistro] = useState({
    horario: '',
    descricao: '',
    tipoIcone: null as string | null,
    foto: null as string | null,
  })
  const [mostrarForm, setMostrarForm] = useState(false)

  const handleAdicionarRegistro = () => {
    if (!novoRegistro.horario || !novoRegistro.descricao) return
    
    adicionarRegistro(
      novoRegistro.horario,
      novoRegistro.descricao,
      novoRegistro.tipoIcone,
      novoRegistro.foto
    )
    
    setNovoRegistro({
      horario: '',
      descricao: '',
      tipoIcone: null,
      foto: null,
    })
    
    setMostrarForm(false)
  }

  const selecionarTipoIcone = (tipo: string) => {
    setNovoRegistro({
      ...novoRegistro,
      tipoIcone: novoRegistro.tipoIcone === tipo ? null : tipo,
    })
  }

  // Função simplificada para simular upload de foto
  const simularUploadFoto = () => {
    // Em um app real, aqui seria integrado com a câmera ou upload
    const fotoSimulada = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmaWxsPSIjOTQ5NDk0Ij5Gb3RvIGRhIHJlZmVpw6fDo288L3RleHQ+PC9zdmc+'
    setNovoRegistro({
      ...novoRegistro,
      foto: fotoSimulada,
    })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {registros.map((registro) => (
          <div
            key={registro.id}
            className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center mb-2">
                  <span className="font-medium text-gray-700 dark:text-gray-300 mr-2">
                    {registro.horario}
                  </span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {registro.descricao}
                  </span>
                </div>
                
                {registro.tipoIcone && (
                  <div className="mb-2">
                    <span className="text-2xl" aria-label={`Tipo: ${tiposRefeicao.find(t => t.id === registro.tipoIcone)?.nome || ''}`}>
                      {tiposRefeicao.find(t => t.id === registro.tipoIcone)?.emoji}
                    </span>
                  </div>
                )}
              </div>
              
              <button
                onClick={() => removerRegistro(registro.id)}
                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                aria-label="Remover registro"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {registro.foto && (
              <div className="mt-2">
                <img
                  src={registro.foto}
                  alt="Foto da refeição"
                  className="w-full h-32 object-cover rounded-md"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {mostrarForm ? (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Novo Registro
            </h3>
            <button
              onClick={() => setMostrarForm(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              aria-label="Fechar formulário"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
              <input
                type="time"
                value={novoRegistro.horario}
                onChange={(e) => setNovoRegistro({ ...novoRegistro, horario: e.target.value })}
                className="w-full sm:w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                aria-label="Horário da refeição"
              />
              <input
                type="text"
                value={novoRegistro.descricao}
                onChange={(e) => setNovoRegistro({ ...novoRegistro, descricao: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                placeholder="Descrição da refeição"
                aria-label="Descrição da refeição"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tipo de Refeição
              </label>
              <div className="flex flex-wrap gap-2">
                {tiposRefeicao.map((tipo) => (
                  <button
                    key={tipo.id}
                    onClick={() => selecionarTipoIcone(tipo.id)}
                    className={`w-10 h-10 flex items-center justify-center text-xl rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                      novoRegistro.tipoIcone === tipo.id
                        ? 'bg-alimentacao-light border-2 border-alimentacao-primary'
                        : 'bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600'
                    }`}
                    aria-label={tipo.nome}
                    aria-pressed={novoRegistro.tipoIcone === tipo.id}
                  >
                    {tipo.emoji}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <button
                onClick={simularUploadFoto}
                className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Adicionar foto da refeição"
              >
                <Camera className="h-5 w-5 mr-2" />
                <span>Adicionar Foto</span>
              </button>
              
              {novoRegistro.foto && (
                <div className="mt-2 relative">
                  <img
                    src={novoRegistro.foto}
                    alt="Prévia da foto"
                    className="w-full h-32 object-cover rounded-md"
                  />
                  <button
                    onClick={() => setNovoRegistro({ ...novoRegistro, foto: null })}
                    className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                    aria-label="Remover foto"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={handleAdicionarRegistro}
                disabled={!novoRegistro.horario || !novoRegistro.descricao}
                className="px-4 py-2 bg-alimentacao-primary text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Salvar registro"
              >
                Salvar Registro
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setMostrarForm(true)}
          className="w-full py-2 flex items-center justify-center bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
          aria-label="Adicionar novo registro de refeição"
        >
          <Plus className="h-5 w-5 mr-1" />
          <span>Adicionar Registro</span>
        </button>
      )}
    </div>
  )
}
