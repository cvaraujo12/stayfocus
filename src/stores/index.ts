/**
 * Arquivo centralizador para exportação de todas as stores
 * Facilita a migração e unificação das stores dispersas no projeto
 */

import { useStore as useAppStore } from '@/app/store';

// Re-exporta o store principal para manter compatibilidade
export { useStore as useAppStore } from '@/app/store';

// TODO: Migrar as stores individuais de app/stores para src/stores
// e re-exportá-las aqui gradualmente

// Exemplo de como migrar e re-exportar as stores:
// export { usePomodoroStore } from './pomodoroStore';
// export { useSonoStore } from './sonoStore';

/**
 * Hook unificado para acessar todas as stores
 * Facilita o uso em componentes que precisam de múltiplas stores
 */
export function useStores() {
  const appStore = useAppStore(state => state);
  
  // TODO: Adicionar outras stores aqui conforme forem migradas
  
  return {
    app: appStore,
    // sono: useSonoStore(),
    // pomodoro: usePomodoroStore(),
    // etc.
  };
}

// Exportação padrão para o hook unificado
export default useStores; 