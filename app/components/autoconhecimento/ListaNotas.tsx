'use client'

import { useState, useMemo } from 'react'
import { useAutoconhecimentoStore } from '@/app/stores/autoconhecimentoStore'
import { Card } from '@/app/components/ui/Card'
import { Badge } from '@/app/components/ui/Badge'
import { Input } from '@/app/components/ui/Input'
import { Search, Edit, Trash2, Image as ImageIcon } from 'lucide-react'

// Função utilitária para garantir datas válidas
const getDataValida = (data: string | undefined): Date => {
  if (!data) return new Date(0)
  const dataObj = new Date(data)
  return isNaN(dataObj.getTime()) ? new Date(0) : dataObj
}

type ListaNotasProps = {
  secaoAtual: 'quem-sou' | 'meus-porques' | 'meus-padroes'
  onSelectNota: (id: string) => void
}

export function ListaNotas({ secaoAtual, onSelectNota }: ListaNotasProps) {
  const { notas, removerNota, buscarNotas, modoRefugio } = useAutoconhecimentoStore()
  const [termoBusca, setTermoBusca] = useState('')
  
  // Filtrar notas da seção atual
  const notasSecao = useMemo(() => {
    const notasFiltradas = termoBusca 
      ? buscarNotas(termoBusca) 
      : notas
    
    return notasFiltradas
      .filter(nota => nota.secao === secaoAtual)
      .sort((a, b) => getDataValida(b.dataAtualizacao).getTime() - getDataValida(a.dataAtualizacao).getTime())
  }, [notas, secaoAtual, termoBusca, buscarNotas])
  
  // Função para lidar com a exclusão
  const handleRemoverNota = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (window.confirm('Tem certeza que deseja excluir esta nota?')) {
      removerNota(id)
    }
  }
  
  // Formatação de data
  const formatarData = (dataString: string | undefined) => {
    if (!dataString) return 'Data não disponível'
    const data = new Date(dataString)
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }
  
  // Verifica se estamos no modo refúgio para simplificar a interface
  const interfaceSimplificada = modoRefugio
  
  return (
    <div className="space-y-4">
      {/* Barra de busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
        <Input
          type="text"
          placeholder="Buscar notas..."
          value={termoBusca}
          onChange={(e) => setTermoBusca(e.target.value)}
          className="pl-10"
          aria-label="Buscar notas"
        />
      </div>
      
      {/* Lista de notas */}
      <div className="space-y-3">
        {notasSecao.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-4">
            {termoBusca 
              ? 'Nenhuma nota encontrada para esta busca' 
              : 'Nenhuma nota registrada nesta seção ainda'}
          </p>
        ) : (
          notasSecao.map((nota) => (
            <Card
              key={nota.id}
              className={`${
                interfaceSimplificada ? 'opacity-90' : ''
              }`}
            >
              <div 
                className="p-4 cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-autoconhecimento-primary"
                onClick={() => onSelectNota(nota.id)}
              >
                <div className="flex justify-between items-start">
                  <h4 className="text-lg font-medium text-gray-800 dark:text-white line-clamp-1">
                    {nota.titulo}
                  </h4>
                  
                  <div className="flex space-x-1">
                    {!interfaceSimplificada && (
                      <>
                        <button
                          className="p-1 text-gray-500 hover:text-autoconhecimento-primary transition-colors"
                          onClick={(e) => {
                            e.stopPropagation()
                            onSelectNota(nota.id)
                          }}
                          aria-label="Editar nota"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          className="p-1 text-gray-500 hover:text-red-500 transition-colors"
                          onClick={(e) => handleRemoverNota(nota.id, e)}
                          aria-label="Excluir nota"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
                
                <p className="text-gray-600 dark:text-gray-300 text-sm mt-2 line-clamp-2">
                  {nota.conteudo}
                </p>
                
                {!interfaceSimplificada && nota.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {nota.tags.map((tag) => (
                      <Badge 
                        key={tag}
                        className="bg-autoconhecimento-light text-autoconhecimento-primary px-2 py-0.5 text-xs"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
                
                <div className="mt-2 flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                  <span>Atualizado em {formatarData(nota.dataAtualizacao)}</span>
                  {nota.imagemUrl && (
                    <span className="flex items-center">
                      <ImageIcon size={12} className="mr-1" />
                      <span>Âncora visual</span>
                    </span>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
