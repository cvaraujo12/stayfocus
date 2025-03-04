// Tipos compartilhados para todo o aplicativo

// Categorias principais do aplicativo
export type Categoria = 'inicio' | 'alimentacao' | 'estudos' | 'saude' | 'lazer' | 'nenhuma'

// Opções de humor para o monitor de humor
export type OpcaoHumor = 'otimo' | 'bom' | 'neutro' | 'baixo' | 'ruim'

// Interface para atividades de lazer
export type AtividadeLazer = {
  id: string
  nome: string
  descricao: string
  duracao: number // em minutos
  categoria: 'ativo' | 'passivo' | 'criativo' | 'social'
}

// Interface para materiais de estudo
export type MaterialEstudo = {
  id: string
  titulo: string
  tipo: 'livro' | 'video' | 'artigo' | 'exercicio' | 'outro'
  url?: string
  progresso: number // 0-100
  notas?: string
}

// Interface para registro de humor
export type RegistroHumor = {
  id: string
  data: string // formato YYYY-MM-DD
  humor: OpcaoHumor
  notas?: string
}

// Interface para lembretes
export type Lembrete = {
  id: string
  titulo: string
  descricao?: string
  data: string // formato YYYY-MM-DD
  hora: string // formato HH:MM
  recorrente: boolean
  diasRecorrencia?: ('seg' | 'ter' | 'qua' | 'qui' | 'sex' | 'sab' | 'dom')[]
  categoria: Categoria
  completado: boolean
}

// Interface para registro de hidratação
export type RegistroHidratacao = {
  id: string
  data: string // formato YYYY-MM-DD
  quantidade: number // em ml
  hora: string // formato HH:MM
}

// Interface para sessão de estudo
export type SessaoEstudo = {
  id: string
  data: string // formato YYYY-MM-DD
  inicio: string // formato HH:MM
  fim: string // formato HH:MM
  materia: string
  tecnica: 'pomodoro' | 'blocos' | 'livre'
  produtividade: 1 | 2 | 3 | 4 | 5 // escala de 1 a 5
  notas?: string
}
