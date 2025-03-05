'use client'

import { useState, useRef, useEffect } from 'react'
import { useAutoconhecimentoStore } from '@/app/stores/autoconhecimentoStore'
import { Button } from '@/app/components/ui/Button'
import { Textarea } from '@/app/components/ui/Textarea'
import { Input } from '@/app/components/ui/Input'
import { Badge } from '@/app/components/ui/Badge'
import { X, Image as ImageIcon, Save } from 'lucide-react'

type EditorNotasProps = {
  id?: string
  secaoAtual: 'quem-sou' | 'meus-porques' | 'meus-padroes'
  onSave?: () => void
}

export function EditorNotas({ id, secaoAtual, onSave }: EditorNotasProps) {
  const { 
    notas, 
    adicionarNota, 
    atualizarNota, 
    adicionarTag, 
    removerTag,
    adicionarImagem,
    removerImagem,
    modoRefugio
  } = useAutoconhecimentoStore()
  
  const nota = id ? notas.find(n => n.id === id) : undefined
  
  const [titulo, setTitulo] = useState(nota?.titulo || '')
  const [conteudo, setConteudo] = useState(nota?.conteudo || '')
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>(nota?.tags || [])
  const [imagemUrl, setImagemUrl] = useState<string | undefined>(nota?.imagemUrl)
  const [mostrarOpcaoImagem, setMostrarOpcaoImagem] = useState(false)
  
  const tagInputRef = useRef<HTMLInputElement>(null)
  
  // Mapeia os títulos das seções para exibição
  const titulosSecoes = {
    'quem-sou': 'Quem sou',
    'meus-porques': 'Meus porquês',
    'meus-padroes': 'Meus padrões'
  }
  
  // Atualiza os estados quando a nota selecionada mudar
  useEffect(() => {
    if (nota) {
      setTitulo(nota.titulo)
      setConteudo(nota.conteudo)
      setTags(nota.tags)
      setImagemUrl(nota.imagemUrl)
    } else {
      setTitulo('')
      setConteudo('')
      setTags([])
      setImagemUrl(undefined)
    }
  }, [nota])
  
  // Função para adicionar uma tag
  const handleAdicionarTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      const novaTag = tagInput.trim()
      setTags([...tags, novaTag])
      
      if (id) {
        adicionarTag(id, novaTag)
      }
      
      setTagInput('')
      tagInputRef.current?.focus()
    }
  }
  
  // Função para remover uma tag
  const handleRemoverTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag))
    
    if (id) {
      removerTag(id, tag)
    }
  }
  
  // Função para adicionar/atualizar uma imagem
  const handleAdicionarImagem = () => {
    if (imagemUrl && id) {
      adicionarImagem(id, imagemUrl)
    }
    setMostrarOpcaoImagem(false)
  }
  
  // Função para remover uma imagem
  const handleRemoverImagem = () => {
    setImagemUrl(undefined)
    
    if (id) {
      removerImagem(id)
    }
    
    setMostrarOpcaoImagem(false)
  }
  
  // Função para salvar a nota
  const handleSalvar = () => {
    if (titulo.trim() && conteudo.trim()) {
      if (id) {
        // Atualizar nota existente
        atualizarNota(id, {
          titulo,
          conteudo,
          tags,
          imagemUrl
        })
      } else {
        // Criar nova nota
        adicionarNota(
          titulo,
          conteudo,
          secaoAtual,
          tags,
          imagemUrl
        )
      }
      
      if (onSave) {
        onSave()
      }
    }
  }
  
  // Verifica se estamos no modo refúgio para simplificar a interface
  const interfaceSimplificada = modoRefugio
  
  return (
    <div className={`space-y-4 transition-all duration-300 ${interfaceSimplificada ? 'opacity-90' : ''}`}>
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-1">
          {id ? `Editando nota em ${titulosSecoes[secaoAtual]}` : `Nova nota em ${titulosSecoes[secaoAtual]}`}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {interfaceSimplificada 
            ? 'Modo refúgio ativado - interface simplificada' 
            : 'Registre seus pensamentos, organize com tags e adicione âncoras visuais'}
        </p>
      </div>
      
      <Input
        type="text"
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
        placeholder="Título da nota"
        className={`text-lg font-medium ${interfaceSimplificada ? 'border-autoconhecimento-primary' : ''}`}
        aria-label="Título da nota"
      />
      
      <Textarea
        value={conteudo}
        onChange={(e) => setConteudo(e.target.value)}
        placeholder="O que você quer registrar?"
        className={`min-h-[200px] ${interfaceSimplificada ? 'border-autoconhecimento-primary' : ''}`}
        aria-label="Conteúdo da nota"
      />
      
      {!interfaceSimplificada && (
        <>
          {/* Área de tags */}
          <div className="flex flex-wrap items-center gap-2">
            {tags.map((tag) => (
              <Badge 
                key={tag} 
                className="bg-autoconhecimento-light text-autoconhecimento-primary px-3 py-1 flex items-center space-x-1 hover:bg-autoconhecimento-primary hover:text-white transition-colors"
              >
                <span>{tag}</span>
                <button 
                  onClick={() => handleRemoverTag(tag)}
                  className="ml-1 rounded-full p-0.5"
                  aria-label={`Remover tag ${tag}`}
                >
                  <X size={14} />
                </button>
              </Badge>
            ))}
            
            <div className="flex">
              <Input
                ref={tagInputRef}
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAdicionarTag()
                  }
                }}
                placeholder="Adicionar tag"
                className="text-sm w-32"
                aria-label="Adicionar nova tag"
              />
              <Button 
                onClick={handleAdicionarTag}
                className="ml-2 px-3 py-1 bg-autoconhecimento-light text-autoconhecimento-primary hover:bg-autoconhecimento-primary hover:text-white transition-colors"
                aria-label="Adicionar tag"
              >
                Adicionar
              </Button>
            </div>
          </div>
          
          {/* Área de imagem âncora */}
          <div className="mt-4">
            {imagemUrl ? (
              <div className="relative">
                <img 
                  src={imagemUrl} 
                  alt="Imagem âncora" 
                  className="max-h-60 object-contain rounded-md border border-autoconhecimento-light"
                />
                <button
                  onClick={handleRemoverImagem}
                  className="absolute top-2 right-2 bg-white dark:bg-gray-800 rounded-full p-1 shadow-md"
                  aria-label="Remover imagem"
                >
                  <X size={18} className="text-red-500" />
                </button>
              </div>
            ) : (
              <>
                {mostrarOpcaoImagem ? (
                  <div className="flex items-center space-x-2">
                    <Input
                      type="text"
                      value={imagemUrl || ''}
                      onChange={(e) => setImagemUrl(e.target.value)}
                      placeholder="URL da imagem âncora"
                      className="text-sm flex-1"
                      aria-label="URL da imagem âncora"
                    />
                    <Button 
                      onClick={handleAdicionarImagem}
                      className="px-3 py-1 bg-autoconhecimento-primary text-white"
                      aria-label="Adicionar imagem"
                    >
                      Adicionar
                    </Button>
                    <Button 
                      onClick={() => setMostrarOpcaoImagem(false)}
                      className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                      aria-label="Cancelar"
                    >
                      Cancelar
                    </Button>
                  </div>
                ) : (
                  <Button 
                    onClick={() => setMostrarOpcaoImagem(true)}
                    className="flex items-center px-3 py-1 bg-autoconhecimento-light text-autoconhecimento-primary hover:bg-autoconhecimento-primary hover:text-white transition-colors"
                    aria-label="Adicionar imagem âncora"
                  >
                    <ImageIcon size={16} className="mr-1" />
                    <span>Adicionar Âncora Visual</span>
                  </Button>
                )}
              </>
            )}
          </div>
        </>
      )}
      
      <div className="flex justify-end">
        <Button 
          onClick={handleSalvar}
          className={`flex items-center px-4 py-2 ${
            interfaceSimplificada 
              ? 'bg-autoconhecimento-primary text-white' 
              : 'bg-autoconhecimento-primary text-white hover:bg-autoconhecimento-hover'
          }`}
          disabled={!titulo.trim() || !conteudo.trim()}
          aria-label="Salvar nota"
        >
          <Save size={16} className="mr-1" />
          <span>Salvar</span>
        </Button>
      </div>
    </div>
  )
}
