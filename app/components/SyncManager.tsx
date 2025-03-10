'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  configurarSincronizacao, 
  limparSincronizacao 
} from '@/app/services/syncManager'

interface SyncManagerProps {
  userId: string | null
}

/**
 * Componente responsável por gerenciar a sincronização de dados
 * Deve ser carregado próximo à raiz da aplicação após a autenticação
 */
export function SyncManager({ userId }: SyncManagerProps) {
  const router = useRouter()

  // Configurar sincronização quando o usuário estiver autenticado
  useEffect(() => {
    if (userId) {
      console.log('SyncManager: Iniciando sincronização para usuário', userId)
      configurarSincronizacao(userId)
    } else {
      limparSincronizacao()
    }

    // Cleanup ao desmontar componente
    return () => {
      limparSincronizacao()
    }
  }, [userId])

  // Este componente não renderiza nada visível
  return null
} 