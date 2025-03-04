'use client'

import { useState } from 'react'
import { Edit2, Check, X, Trash2, Plus } from 'lucide-react'
import { Button } from '@/app/components/ui/Button'
import { Input } from '@/app/components/ui/Input'
import { usePainelDiaStore, BlocoTempo } from '@/app/stores/painelDiaStore'

export function PainelDia() {
  const { blocos, editarAtividade, editarCategoria, adicionarBloco, removerBloco } = usePainelDiaStore()
  const [blocoEditando, setBlocoEditando] = useState<string | null>(null)
  const [atividadeEditando, setAtividadeEditando] = useState('')
  const [novoBloco, setNovoBloco] = useState(false)
  const [novaHora, setNovaHora] = useState('')
  const [novaAtividade, setNovaAtividade] = useState('')
  
  // Função para obter a cor de fundo baseada na categoria
  const getBgColor = (categoria: BlocoTempo['categoria']) => {
    switch (categoria) {
      case 'inicio':
        return 'bg-opacity-40 bg-inicio-light border-inicio-primary'
      case 'alimentacao':
        return 'bg-opacity-40 bg-alimentacao-light border-alimentacao-primary'
      case 'estudos':
        return 'bg-opacity-40 bg-estudos-light border-estudos-primary'
      case 'saude':
        return 'bg-opacity-40 bg-saude-light border-saude-primary'
      case 'lazer':
        return 'bg-opacity-40 bg-lazer-light border-lazer-primary'
      default:
        return 'bg-gray-100 bg-opacity-40 border-gray-300 dark:bg-gray-700 dark:border-gray-600'
    }
  }

  // Iniciar edição de um bloco
  const iniciarEdicao = (bloco: BlocoTempo) => {
    setBlocoEditando(bloco.id)
    setAtividadeEditando(bloco.atividade)
  }

  // Salvar a edição de um bloco
  const salvarEdicao = () => {
    if (blocoEditando) {
      editarAtividade(blocoEditando, atividadeEditando)
      cancelarEdicao()
    }
  }

  // Cancelar a edição
  const cancelarEdicao = () => {
    setBlocoEditando(null)
    setAtividadeEditando('')
  }

  // Função para mostrar o formulário de novo bloco
  const mostrarNovoBloco = () => {
    setNovoBloco(true)
    setNovaHora('')
    setNovaAtividade('')
  }

  // Função para adicionar um novo bloco
  const adicionarNovoBloco = () => {
    if (novaHora && novaAtividade) {
      const id = `${Date.now()}`
      adicionarBloco({
        id,
        hora: novaHora,
        atividade: novaAtividade,
        categoria: 'nenhuma'
      })
      setNovoBloco(false)
      setNovaHora('')
      setNovaAtividade('')
    }
  }

  // Função para cancelar a adição de novo bloco
  const cancelarNovoBloco = () => {
    setNovoBloco(false)
    setNovaHora('')
    setNovaAtividade('')
  }

  // Ordenar blocos por hora
  const blocosOrdenados = [...blocos].sort((a, b) => {
    const horaA = a.hora.split(':').map(Number);
    const horaB = b.hora.split(':').map(Number);
    
    if (horaA[0] !== horaB[0]) {
      return horaA[0] - horaB[0];
    }
    return horaA[1] - horaB[1];
  });

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button 
          size="sm" 
          variant="outline" 
          onClick={mostrarNovoBloco}
          className="flex items-center gap-1"
          aria-label="Adicionar novo horário"
        >
          <Plus className="h-4 w-4" /> Adicionar Horário
        </Button>
      </div>

      {novoBloco && (
        <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 mb-3">
          <div className="flex flex-col gap-3">
            <div className="flex gap-2 items-center">
              <Input
                type="time"
                value={novaHora}
                onChange={(e) => setNovaHora(e.target.value)}
                className="w-24"
                placeholder="Hora"
                aria-label="Nova hora"
              />
              <Input
                value={novaAtividade}
                onChange={(e) => setNovaAtividade(e.target.value)}
                className="flex-1"
                placeholder="O que você planeja fazer neste horário?"
                aria-label="Nova atividade"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={cancelarNovoBloco}
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={adicionarNovoBloco}
                disabled={!novaHora || !novaAtividade}
              >
                Adicionar
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-2">
        {blocosOrdenados.map((bloco) => (
          <div
            key={bloco.id}
            className={`p-3 rounded-lg border-l-4 ${getBgColor(bloco.categoria)} transition-all duration-200 backdrop-blur-sm group`}
          >
            <div className="flex items-center">
              <span className="font-medium text-gray-700 dark:text-gray-300 w-16">
                {bloco.hora}
              </span>
              
              {blocoEditando === bloco.id ? (
                <div className="flex-1 flex items-center gap-2">
                  <Input
                    value={atividadeEditando}
                    onChange={(e) => setAtividadeEditando(e.target.value)}
                    className="flex-1"
                    placeholder="O que você planeja fazer neste horário?"
                    aria-label="Editar atividade"
                    autoFocus
                  />
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={salvarEdicao}
                      aria-label="Salvar edição"
                    >
                      <Check className="h-4 w-4 text-green-500" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={cancelarEdicao}
                      aria-label="Cancelar edição"
                    >
                      <X className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <span className="flex-1 text-gray-900 dark:text-white">
                    {bloco.atividade}
                  </span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => iniciarEdicao(bloco)}
                      aria-label="Editar este horário"
                    >
                      <Edit2 className="h-4 w-4 text-gray-500" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removerBloco(bloco.id)}
                      aria-label="Remover este horário"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </>
              )}
            </div>
            
            {blocoEditando === bloco.id && (
              <div className="mt-2 flex flex-wrap gap-1">
                <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">
                  Categoria:
                </span>
                <div className="flex flex-wrap gap-1">
                  <Button
                    size="sm"
                    variant={bloco.categoria === 'alimentacao' ? 'default' : 'outline'}
                    className="py-0 px-2 h-6 text-xs bg-alimentacao-light text-alimentacao-primary border-alimentacao-primary"
                    onClick={() => editarCategoria(bloco.id, 'alimentacao')}
                  >
                    Alimentação
                  </Button>
                  <Button
                    size="sm"
                    variant={bloco.categoria === 'estudos' ? 'default' : 'outline'}
                    className="py-0 px-2 h-6 text-xs bg-estudos-light text-estudos-primary border-estudos-primary"
                    onClick={() => editarCategoria(bloco.id, 'estudos')}
                  >
                    Estudos
                  </Button>
                  <Button
                    size="sm"
                    variant={bloco.categoria === 'saude' ? 'default' : 'outline'}
                    className="py-0 px-2 h-6 text-xs bg-saude-light text-saude-primary border-saude-primary"
                    onClick={() => editarCategoria(bloco.id, 'saude')}
                  >
                    Saúde
                  </Button>
                  <Button
                    size="sm"
                    variant={bloco.categoria === 'lazer' ? 'default' : 'outline'}
                    className="py-0 px-2 h-6 text-xs bg-lazer-light text-lazer-primary border-lazer-primary"
                    onClick={() => editarCategoria(bloco.id, 'lazer')}
                  >
                    Lazer
                  </Button>
                  <Button
                    size="sm"
                    variant={bloco.categoria === 'nenhuma' ? 'default' : 'outline'}
                    className="py-0 px-2 h-6 text-xs"
                    onClick={() => editarCategoria(bloco.id, 'nenhuma')}
                  >
                    Nenhuma
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
