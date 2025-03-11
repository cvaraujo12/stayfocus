'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { 
  configurarSincronizacao, 
  limparSincronizacao 
} from '@/app/services/syncManager'
import { 
  subscribeToTable, 
  unsubscribeAll, 
  checkRealtimeAvailability,
  EventType 
} from '@/app/services/realtimeService'

// Import stores
import { usePrioridadesStore } from '@/app/stores/prioridadesStore'
import { useSonoStore } from '@/app/stores/sonoStore'
import { useMedicamentosStore } from '@/app/stores/medicamentosStore'
import { useAutoconhecimentoStore } from '@/app/stores/autoconhecimentoStore'
import { useRegistroEstudosStore } from '@/app/stores/registroEstudosStore'

interface SyncManagerProps {
  userId: string | null
}

/**
 * Componente responsável por gerenciar a sincronização de dados
 * Deve ser carregado próximo à raiz da aplicação após a autenticação
 */
export function SyncManager({ userId }: SyncManagerProps) {
  const router = useRouter()
  const realtimeEnabled = useRef<boolean>(false)
  const channelIds = useRef<string[]>([])

  // Setup realtime subscriptions
  const setupRealtimeSubscriptions = async () => {
    if (!userId) return
    
    // Verificar se realtime está disponível
    const available = await checkRealtimeAvailability()
    realtimeEnabled.current = available
    
    if (!available) {
      console.log('Realtime não disponível, usando sincronização tradicional')
      return
    }
    
    console.log('Configurando subscrições em tempo real')
    
    // Obter referências para as stores
    const prioridadesStore = usePrioridadesStore.getState()
    const sonoStore = useSonoStore.getState()
    const medicamentosStore = useMedicamentosStore.getState()
    const autoconhecimentoStore = useAutoconhecimentoStore.getState()
    const estudosStore = useRegistroEstudosStore.getState()
    
    // Configurar subscrições para cada tabela com tipagem correta
    const tables = [
      {
        name: 'prioridades',
        handler: (payload: any) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            // Encontrar a prioridade existente no array atual e substituí-la ou adicionar nova
            const prioridades = usePrioridadesStore.getState().prioridades;
            const index = prioridades.findIndex(p => p.id === payload.new.id);
            if (index >= 0) {
              // Atualizar existente
              prioridades[index] = payload.new;
              prioridadesStore.setPrioridades([...prioridades]);
            } else {
              // Adicionar nova
              prioridadesStore.setPrioridades([...prioridades, payload.new]);
            }
          } else if (payload.eventType === 'DELETE') {
            prioridadesStore.removerPrioridade(payload.old.id)
          }
        }
      },
      {
        name: 'sleep_records',
        handler: (payload: any) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const registros = useSonoStore.getState().registros;
            const index = registros.findIndex(r => r.id === payload.new.id);
            if (index >= 0) {
              sonoStore.setRegistros([
                ...registros.slice(0, index),
                payload.new,
                ...registros.slice(index + 1)
              ]);
            } else {
              sonoStore.setRegistros([...registros, payload.new]);
            }
          } else if (payload.eventType === 'DELETE') {
            sonoStore.removerRegistroSono(payload.old.id)
          }
        }
      },
      {
        name: 'medicamentos',
        handler: (payload: any) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const medicamentos = useMedicamentosStore.getState().medicamentos;
            const index = medicamentos.findIndex(m => m.id === payload.new.id);
            if (index >= 0) {
              medicamentosStore.setMedicamentos([
                ...medicamentos.slice(0, index),
                payload.new,
                ...medicamentos.slice(index + 1)
              ]);
            } else {
              medicamentosStore.setMedicamentos([...medicamentos, payload.new]);
            }
          } else if (payload.eventType === 'DELETE') {
            medicamentosStore.removerMedicamento(payload.old.id)
          }
        }
      },
      {
        name: 'registros_medicamentos',
        handler: (payload: any) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const registros = useMedicamentosStore.getState().registros;
            const index = registros.findIndex(r => r.id === payload.new.id);
            if (index >= 0) {
              medicamentosStore.setRegistros([
                ...registros.slice(0, index),
                payload.new,
                ...registros.slice(index + 1)
              ]);
            } else {
              medicamentosStore.setRegistros([...registros, payload.new]);
            }
          } else if (payload.eventType === 'DELETE') {
            medicamentosStore.removerRegistro(payload.old.id)
          }
        }
      },
      {
        name: 'self_knowledge_notes',
        handler: (payload: any) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const notas = useAutoconhecimentoStore.getState().notas;
            const index = notas.findIndex(n => n.id === payload.new.id);
            if (index >= 0) {
              autoconhecimentoStore.setNotas([
                ...notas.slice(0, index),
                payload.new,
                ...notas.slice(index + 1)
              ]);
            } else {
              autoconhecimentoStore.setNotas([...notas, payload.new]);
            }
          } else if (payload.eventType === 'DELETE') {
            autoconhecimentoStore.removerNota(payload.old.id)
          }
        }
      },
      {
        name: 'study_sessions',
        handler: (payload: any) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const sessoes = useRegistroEstudosStore.getState().sessoes;
            const index = sessoes.findIndex(s => s.id === payload.new.id);
            if (index >= 0) {
              estudosStore.setSessoes([
                ...sessoes.slice(0, index),
                payload.new,
                ...sessoes.slice(index + 1)
              ]);
            } else {
              estudosStore.setSessoes([...sessoes, payload.new]);
            }
          } else if (payload.eventType === 'DELETE') {
            estudosStore.removerSessao(payload.old.id)
          }
        }
      }
    ]
    
    // Criar subscrições com tipagem aprimorada
    const ids = tables.map(table => 
      subscribeToTable(table.name, '*' as EventType, table.handler)
    )
    
    // Armazenar IDs para limpeza posterior
    channelIds.current = ids
    console.log(`${ids.length} subscrições em tempo real configuradas`)
  }

  // Configurar sincronização quando o usuário estiver autenticado
  useEffect(() => {
    if (userId) {
      console.log('SyncManager: Iniciando sincronização para usuário', userId)
      
      // Iniciar sincronização tradicional (dados iniciais)
      configurarSincronizacao(userId)
      
      // Configurar subscrições em tempo real
      setupRealtimeSubscriptions()
    } else {
      // Limpar sincronização
      limparSincronizacao()
      unsubscribeAll()
      channelIds.current = []
    }

    // Cleanup ao desmontar componente
    return () => {
      limparSincronizacao()
      unsubscribeAll()
    }
  }, [userId])

  // Este componente não renderiza nada visível
  return null
} 