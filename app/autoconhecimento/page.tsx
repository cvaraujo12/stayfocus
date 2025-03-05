'use client'

import { useState } from 'react'
import { Anchor, PenSquare, X } from 'lucide-react'
import { EditorNotas } from '../components/autoconhecimento/EditorNotas'
import { ListaNotas } from '../components/autoconhecimento/ListaNotas'
import { ModoRefugio } from '../components/autoconhecimento/ModoRefugio'
import { Button } from '../components/ui/Button'
import { Container } from '../components/ui/Container'
import { Section } from '../components/ui/Section'
import { useAutoconhecimentoStore } from '../stores/autoconhecimentoStore'

export default function AutoconhecimentoPage() {
  const [abaSelecionada, setAbaSelecionada] = useState<'quem-sou' | 'meus-porques' | 'meus-padroes'>('quem-sou')
  const [notaSelecionada, setNotaSelecionada] = useState<string | null>(null)
  const [criandoNota, setCriandoNota] = useState(false)
  
  const { modoRefugio } = useAutoconhecimentoStore()
  
  // Mapeamento de títulos para exibição
  const tituloAbas = {
    'quem-sou': 'Quem sou',
    'meus-porques': 'Meus porquês',
    'meus-padroes': 'Meus padrões'
  }
  
  // Mapeamento de descrições para cada seção
  const descricaoAbas = {
    'quem-sou': 'Registre suas preferências, aversões e características pessoais estáveis',
    'meus-porques': 'Documente motivações e valores fundamentais que guiam suas decisões',
    'meus-padroes': 'Anote reações emocionais típicas e estratégias eficazes em momentos de crise'
  }
  
  // Função para selecionar uma nota
  const handleSelecionarNota = (id: string) => {
    setNotaSelecionada(id)
    setCriandoNota(false)
  }
  
  // Função para iniciar criação de nova nota
  const handleCriarNota = () => {
    setNotaSelecionada(null)
    setCriandoNota(true)
  }
  
  // Função para cancelar edição/criação
  const handleCancelar = () => {
    setNotaSelecionada(null)
    setCriandoNota(false)
  }
  
  // Função após salvar uma nota
  const handleSalvarNota = () => {
    setNotaSelecionada(null)
    setCriandoNota(false)
  }
  
  // Verifica se estamos no modo refúgio para simplificar a interface
  const interfaceSimplificada = modoRefugio
  
  return (
    <Container>
      {/* Cabeçalho com título */}
      <div className="flex items-center mb-6">
        <Anchor className="h-7 w-7 text-autoconhecimento-primary mr-3" aria-hidden="true" />
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Notas de Autoconhecimento</h1>
      </div>
      
      {/* Navegação entre abas */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6 overflow-x-auto">
        {(Object.keys(tituloAbas) as Array<keyof typeof tituloAbas>).map((aba) => (
          <button
            key={aba}
            className={`px-4 py-2 font-medium text-sm whitespace-nowrap rounded-t-lg transition-colors ${
              abaSelecionada === aba
                ? 'bg-autoconhecimento-light text-autoconhecimento-primary border-b-2 border-autoconhecimento-primary'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
            onClick={() => {
              setAbaSelecionada(aba)
              setNotaSelecionada(null)
              setCriandoNota(false)
            }}
            aria-current={abaSelecionada === aba ? 'page' : undefined}
          >
            {tituloAbas[aba]}
          </button>
        ))}
      </div>
      
      {/* Descrição da seção atual */}
      {!interfaceSimplificada && !notaSelecionada && !criandoNota && (
        <div className="mb-6 bg-autoconhecimento-light bg-opacity-60 dark:bg-gray-700 p-4 rounded-lg">
          <h2 className="text-lg font-medium text-autoconhecimento-primary mb-2">{tituloAbas[abaSelecionada]}</h2>
          <p className="text-gray-700 dark:text-gray-300">{descricaoAbas[abaSelecionada]}</p>
        </div>
      )}
      
      {/* Conteúdo principal */}
      <Section 
        title={tituloAbas[abaSelecionada]} 
        className={`${interfaceSimplificada ? 'bg-opacity-90' : ''} transition-opacity duration-300`}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Área de lista de notas */}
          <div className={notaSelecionada || criandoNota ? 'hidden lg:block' : 'block'}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-800 dark:text-white">
                Suas notas em {tituloAbas[abaSelecionada]}
              </h3>
              
              {!interfaceSimplificada && (
                <Button
                  onClick={handleCriarNota}
                  className="flex items-center text-sm bg-autoconhecimento-primary text-white hover:bg-autoconhecimento-hover transition-colors"
                  aria-label="Criar nova nota"
                >
                  <PenSquare size={16} className="mr-1" />
                  <span>Nova nota</span>
                </Button>
              )}
            </div>
            
            <ListaNotas 
              secaoAtual={abaSelecionada}
              onSelectNota={handleSelecionarNota}
            />
          </div>
          
          {/* Área de edição/visualização */}
          {(notaSelecionada || criandoNota) && (
            <div className="lg:col-span-1">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-800 dark:text-white">
                  {criandoNota ? 'Nova nota' : 'Editar nota'}
                </h3>
                
                <Button
                  onClick={handleCancelar}
                  className="flex items-center text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  aria-label="Cancelar edição"
                >
                  <X size={16} className="mr-1" />
                  <span>Cancelar</span>
                </Button>
              </div>
              
              <EditorNotas
                id={notaSelecionada || undefined}
                secaoAtual={abaSelecionada}
                onSave={handleSalvarNota}
              />
            </div>
          )}
        </div>
      </Section>
      
      {/* Botão flutuante para Modo Refúgio */}
      <ModoRefugio />
    </Container>
  )
}
