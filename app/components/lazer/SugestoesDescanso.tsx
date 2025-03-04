'use client'

import { useState, useEffect } from 'react'
import { RefreshCw, Heart, ThumbsUp, ThumbsDown } from 'lucide-react'
import { Button } from '@/app/components/ui/Button'
import { Badge } from '@/app/components/ui/Badge'
import { useSugestoesStore } from '@/app/stores/sugestoesStore'

// Lista de atividades de descanso por categoria
const atividadesDescanso = {
  rapidas: [
    "Faça uma pausa para respirar profundamente por 2 minutos",
    "Tome um copo de água e observe o ambiente ao redor",
    "Realize alongamentos simples para o pescoço e ombros",
    "Olhe pela janela e observe 5 coisas diferentes",
    "Faça uma pequena caminhada dentro de casa",
    "Pratique a técnica 5-4-3-2-1 (observe 5 coisas que você vê, 4 que você sente, etc)",
    "Faça um pequeno desenho abstrato em um papel",
    "Escute uma música que você goste",
  ],
  criativas: [
    "Colorir um pequeno desenho ou mandala",
    "Fazer um origami simples",
    "Escrever um haiku (poema de 3 linhas)",
    "Fazer um esboço rápido do que você vê",
    "Criar uma pequena colagem com materiais disponíveis",
    "Inventar uma história curta sobre um objeto aleatório",
    "Escrever três coisas pelas quais você é grato hoje",
    "Tocar um instrumento musical por alguns minutos (se disponível)",
  ],
  físicas: [
    "Dançar ao som de uma música animada",
    "Fazer 10 agachamentos",
    "Caminhar ao ar livre por 10 minutos",
    "Praticar yoga por 5-10 minutos",
    "Fazer um jogo rápido de arremesso com uma bolinha",
    "Pular corda por 2 minutos",
    "Subir e descer escadas algumas vezes",
    "Fazer alongamentos para todas as partes do corpo",
  ],
  relaxantes: [
    "Praticar meditação guiada de 5 minutos",
    "Fazer uma massagem nas próprias mãos",
    "Preparar e desfrutar de uma xícara de chá",
    "Observar a natureza pela janela ou ao ar livre",
    "Ouvir sons da natureza (chuva, pássaros, ondas)",
    "Fazer exercícios de respiração profunda",
    "Aplicar aromaterapia com óleos essenciais",
    "Deitar-se e relaxar todos os músculos por 5 minutos",
  ]
}

export function SugestoesDescanso() {
  const { sugestoesFavoritas, adicionarFavorita, removerFavorita } = useSugestoesStore()
  const [sugestaoAtual, setSugestaoAtual] = useState('')
  const [categoriaAtual, setCategoriaAtual] = useState<keyof typeof atividadesDescanso>('rapidas')
  
  // Função para gerar uma sugestão aleatória
  const gerarSugestaoAleatoria = () => {
    const categorias = Object.keys(atividadesDescanso) as Array<keyof typeof atividadesDescanso>
    const categoriaAleatoria = categorias[Math.floor(Math.random() * categorias.length)]
    
    const atividadesCategoria = atividadesDescanso[categoriaAleatoria]
    const sugestaoAleatoria = atividadesCategoria[Math.floor(Math.random() * atividadesCategoria.length)]
    
    setSugestaoAtual(sugestaoAleatoria)
    setCategoriaAtual(categoriaAleatoria)
  }

  // Gerar sugestão inicial ao montar o componente
  useEffect(() => {
    gerarSugestaoAleatoria()
  }, [])

  // Verificar se a sugestão atual está nos favoritos
  const estaNasFavoritas = sugestoesFavoritas.includes(sugestaoAtual)

  // Função para alternar favorito
  const toggleFavorita = () => {
    if (estaNasFavoritas) {
      removerFavorita(sugestaoAtual)
    } else {
      adicionarFavorita(sugestaoAtual)
    }
  }

  // Função para obter o nome exibido da categoria
  const getNomeCategoria = (categoria: keyof typeof atividadesDescanso) => {
    const nomes = {
      rapidas: 'Rápidas',
      criativas: 'Criativas',
      físicas: 'Físicas',
      relaxantes: 'Relaxantes'
    }
    return nomes[categoria]
  }

  // Função para obter a cor da categoria
  const getCorCategoria = (categoria: keyof typeof atividadesDescanso) => {
    const cores = {
      rapidas: 'bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-100',
      criativas: 'bg-purple-100 text-purple-800 dark:bg-purple-700 dark:text-purple-100',
      físicas: 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100',
      relaxantes: 'bg-amber-100 text-amber-800 dark:bg-amber-700 dark:text-amber-100'
    }
    return cores[categoria]
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <Button 
          onClick={gerarSugestaoAleatoria}
          size="sm"
          aria-label="Gerar nova sugestão"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Nova Sugestão
        </Button>
      </div>

      {/* Sugestão atual */}
      <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg mb-6 text-center relative">
        {sugestaoAtual && (
          <>
            <Badge 
              className={`absolute top-3 left-3 ${getCorCategoria(categoriaAtual)}`}
            >
              {getNomeCategoria(categoriaAtual)}
            </Badge>
            
            <p className="text-xl text-gray-900 dark:text-white font-medium mt-4">
              {sugestaoAtual}
            </p>
            
            <div className="flex justify-center mt-6 space-x-3">
              <Button
                variant={estaNasFavoritas ? "default" : "outline"}
                size="sm"
                onClick={toggleFavorita}
                aria-label={estaNasFavoritas ? "Remover dos favoritos" : "Adicionar aos favoritos"}
              >
                <Heart className={`h-4 w-4 mr-2 ${estaNasFavoritas ? 'fill-white' : ''}`} />
                {estaNasFavoritas ? 'Favorita' : 'Favoritar'}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={gerarSugestaoAleatoria}
                aria-label="Próxima sugestão"
              >
                <ThumbsDown className="h-4 w-4 mr-2" />
                Próxima
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Sugestões Favoritas */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
          Sugestões Favoritas
        </h3>
        
        {sugestoesFavoritas.length === 0 ? (
          <div className="text-center py-4 text-gray-500 dark:text-gray-400">
            <Heart className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Você ainda não tem sugestões favoritas.</p>
            <p className="mt-1">Adicione suas favoritas para acessá-las facilmente.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sugestoesFavoritas.map((sugestao, index) => (
              <div 
                key={index}
                className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg flex justify-between items-center"
              >
                <p className="text-gray-700 dark:text-gray-300">{sugestao}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removerFavorita(sugestao)}
                  aria-label="Remover dos favoritos"
                >
                  <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
