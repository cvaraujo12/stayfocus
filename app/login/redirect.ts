/**
 * Utilitário para gerenciar redirecionamentos após autenticação
 * 
 * Este arquivo fornece funções para lidar com redirecionamentos de forma consistente
 * após processos de login.
 */

/**
 * Realiza um redirecionamento forte para a página principal após login.
 * 
 * Usa window.location.href para garantir uma atualização completa da página
 * e forçar o recarregamento da autenticação pelo middleware.
 */
export function redirectToDashboard() {
  console.log("[REDIRECT] Iniciando redirecionamento para a página principal...");
  
  try {
    // Armazenar informação de redirecionamento na sessionStorage
    sessionStorage.setItem('auth_redirect', 'true');
    sessionStorage.setItem('auth_redirect_time', Date.now().toString());
    
    // Usar setTimeout para garantir que os logs apareçam no console
    setTimeout(() => {
      console.log("[REDIRECT] Executando redirecionamento agora...");
      window.location.href = '/';
    }, 100);
  } catch (error) {
    console.error('[REDIRECT] Erro ao redirecionar:', error);
    // Redirecionamento de fallback
    window.location.href = '/';
  }
}

/**
 * Verifica se o usuário acabou de ser redirecionado do login.
 * Útil para identificar loops de redirecionamento.
 */
export function wasRecentlyRedirected(): boolean {
  try {
    const wasRedirected = sessionStorage.getItem('auth_redirect') === 'true';
    const redirectTime = parseInt(sessionStorage.getItem('auth_redirect_time') || '0', 10);
    const now = Date.now();
    
    // Verifica se o redirecionamento ocorreu nos últimos 5 segundos
    const isRecent = (now - redirectTime) < 5000;
    
    if (wasRedirected && isRecent) {
      console.log("[REDIRECT] Detectado redirecionamento recente:", { 
        timeElapsed: now - redirectTime 
      });
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('[REDIRECT] Erro ao verificar redirecionamento:', error);
    return false;
  }
} 