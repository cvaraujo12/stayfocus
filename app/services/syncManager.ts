import { usePrioridadesStore } from '@/app/stores/prioridadesStore'
import { useAutoconhecimentoStore } from '@/app/stores/autoconhecimentoStore'
import { useRegistroEstudosStore } from '@/app/stores/registroEstudosStore'
import { useSonoStore } from '@/app/stores/sonoStore'
import { useMedicamentosStore } from '@/app/stores/medicamentosStore'
import { processOfflineQueue, reconcileData } from '@/app/services/syncService'
import { checkConnection } from '@/supabase/utils'

/**
 * Configura o intervalo de sincronização automática em ms
 * Default: 5 minutos
 */
const SYNC_INTERVAL = 5 * 60 * 1000 // 5 minutos em ms

let syncInterval: NodeJS.Timeout | null = null
let isProcessingSync = false

/**
 * Carregar todos os dados necessários do backend
 * Esta função deve ser chamada quando o usuário faz login
 */
export async function carregarDadosIniciais(userId: string): Promise<void> {
  try {
    console.log('Carregando dados iniciais para usuário:', userId)
    
    // Carregar prioridades
    const prioridadesStore = usePrioridadesStore.getState()
    await prioridadesStore.carregarPrioridades(userId)
    
    // Carregar notas de autoconhecimento
    const autoconhecimentoStore = useAutoconhecimentoStore.getState()
    await autoconhecimentoStore.carregarNotas(userId)
    
    // Carregar sessões de estudo
    const registroEstudosStore = useRegistroEstudosStore.getState()
    await registroEstudosStore.carregarSessoes(userId)
    
    // Carregar registros de sono
    const sonoStore = useSonoStore.getState()
    await sonoStore.carregarRegistros(userId)
    
    // Carregar medicamentos e registros
    const medicamentosStore = useMedicamentosStore.getState()
    await medicamentosStore.carregarMedicamentos(userId)
    await medicamentosStore.carregarRegistros(userId)
    
    console.log('Dados iniciais carregados com sucesso')
  } catch (error) {
    console.error('Erro ao carregar dados iniciais:', error)
  }
}

/**
 * Sincronizar todos os dados com o backend
 * Esta função pode ser chamada quando o usuário está online após um período offline
 */
export async function sincronizarTudo(userId: string): Promise<void> {
  // Evitar sincronizações simultâneas
  if (isProcessingSync) {
    console.log('Sincronização já em andamento, ignorando solicitação')
    return
  }
  
  isProcessingSync = true
  
  try {
    console.log('Sincronizando todos os dados para usuário:', userId)
    
    // Verificar conexão
    const { online } = await checkConnection()
    if (!online) {
      console.log('Dispositivo offline, sincronização adiada')
      isProcessingSync = false
      return
    }
    
    // Processar fila de operações offline
    const queueResult = await processOfflineQueue()
    console.log('Resultado do processamento da fila offline:', queueResult)
    
    // Sincronizar prioridades com reconciliação
    const prioridadesStore = usePrioridadesStore.getState()
    const prioridadesLocais = prioridadesStore.prioridades
    const prioridadesResult = await reconcileData('prioridades', prioridadesLocais, {
      filter: { user_id: userId },
      conflictStrategy: 'timestamp'
    })
    console.log('Reconciliação de prioridades:', prioridadesResult)
    await prioridadesStore.sincronizar(userId)
    
    // Sincronizar notas de autoconhecimento com reconciliação
    const autoconhecimentoStore = useAutoconhecimentoStore.getState()
    const notasLocais = autoconhecimentoStore.notas
    const notasResult = await reconcileData('self_knowledge_notes', notasLocais, {
      filter: { user_id: userId },
      conflictStrategy: 'timestamp'
    })
    console.log('Reconciliação de notas:', notasResult)
    await autoconhecimentoStore.sincronizar(userId)
    
    // Sincronizar sessões de estudo com reconciliação
    const registroEstudosStore = useRegistroEstudosStore.getState()
    const sessoesLocais = registroEstudosStore.sessoes
    const sessoesResult = await reconcileData('study_sessions', sessoesLocais, {
      filter: { user_id: userId },
      conflictStrategy: 'timestamp'
    })
    console.log('Reconciliação de sessões de estudo:', sessoesResult)
    await registroEstudosStore.sincronizar(userId)
    
    // Sincronizar registros de sono com reconciliação
    const sonoStore = useSonoStore.getState()
    const registrosSonoLocais = sonoStore.registros
    const sonoResult = await reconcileData('sleep_records', registrosSonoLocais, {
      filter: { user_id: userId },
      conflictStrategy: 'timestamp'
    })
    console.log('Reconciliação de registros de sono:', sonoResult)
    await sonoStore.sincronizar(userId)
    
    // Sincronizar medicamentos e registros com reconciliação
    const medicamentosStore = useMedicamentosStore.getState()
    const medicamentosLocais = medicamentosStore.medicamentos
    const medicamentosResult = await reconcileData('medicamentos', medicamentosLocais, {
      filter: { user_id: userId },
      conflictStrategy: 'timestamp'
    })
    console.log('Reconciliação de medicamentos:', medicamentosResult)
    
    const registrosMedicamentosLocais = medicamentosStore.registros
    const registrosMedicamentosResult = await reconcileData('registros_medicamentos', registrosMedicamentosLocais, {
      filter: { user_id: userId },
      conflictStrategy: 'timestamp'
    })
    console.log('Reconciliação de registros de medicamentos:', registrosMedicamentosResult)
    
    await medicamentosStore.sincronizarTudo(userId)
    
    console.log('Todos os dados sincronizados com sucesso')
  } catch (error) {
    console.error('Erro ao sincronizar todos os dados:', error)
  } finally {
    isProcessingSync = false
  }
}

/**
 * Iniciar sincronização periódica
 * Esta função deve ser chamada depois do login para manter os dados sincronizados
 */
export function iniciarSincronizacaoPeriodica(userId: string): void {
  // Limpar qualquer intervalo existente primeiro
  pararSincronizacaoPeriodica()
  
  console.log('Iniciando sincronização periódica a cada', SYNC_INTERVAL / 1000, 'segundos')
  
  // Configurar novo intervalo
  syncInterval = setInterval(() => {
    sincronizarTudo(userId).catch(error => {
      console.error('Erro na sincronização periódica:', error)
    })
  }, SYNC_INTERVAL)
}

/**
 * Parar sincronização periódica
 * Esta função deve ser chamada quando o usuário faz logout
 */
export function pararSincronizacaoPeriodica(): void {
  if (syncInterval) {
    clearInterval(syncInterval)
    syncInterval = null
    console.log('Sincronização periódica interrompida')
  }
}

/**
 * Sincronizar quando o usuário volta a ficar online
 * Esta função registra listeners para o evento de online/offline
 */
export function registrarListenersDeConexao(userId: string): void {
  // Remover listeners existentes primeiro
  window.removeEventListener('online', () => {})
  
  // Adicionar novo listener para quando voltar online
  window.addEventListener('online', () => {
    console.log('Conexão restaurada. Sincronizando dados...')
    sincronizarTudo(userId)
  })
  
  // Adicionar listener para quando ficar offline
  window.addEventListener('offline', () => {
    console.log('Conexão perdida. Operando em modo offline.')
  })
}

/**
 * Gerenciar toda a sincronização após login
 * Uma função conveniente que configura tudo de uma vez
 */
export function configurarSincronizacao(userId: string): void {
  // Carregar dados iniciais
  carregarDadosIniciais(userId)
  
  // Iniciar sincronização periódica
  iniciarSincronizacaoPeriodica(userId)
  
  // Registrar listeners de conexão
  registrarListenersDeConexao(userId)
}

/**
 * Limpar toda a sincronização após logout
 */
export function limparSincronizacao(): void {
  pararSincronizacaoPeriodica()
  
  // Remover listeners de conexão
  window.removeEventListener('online', () => {})
  window.removeEventListener('offline', () => {})
} 