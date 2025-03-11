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
    // Limpar qualquer estado anterior de redirecionamento
    sessionStorage.removeItem('auth_redirect');
    sessionStorage.removeItem('auth_redirect_time');
    
    // Definir novo estado de redirecionamento
    sessionStorage.setItem('auth_redirect', 'true');
    sessionStorage.setItem('auth_redirect_time', Date.now().toString());
    sessionStorage.setItem('auth_redirect_source', 'login');
    
    // Usar setTimeout para garantir que os logs apareçam no console
    setTimeout(() => {
      console.log("[REDIRECT] Executando redirecionamento agora...");
      // Forçar recarregamento completo da página
      window.location.replace('/');
    }, 100);
  } catch (error) {
    console.error('[REDIRECT] Erro ao redirecionar:', error);
    // Redirecionamento de fallback
    window.location.replace('/');
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
    const redirectSource = sessionStorage.getItem('auth_redirect_source');
    const now = Date.now();
    
    // Verifica se o redirecionamento ocorreu nos últimos 3 segundos
    const isRecent = (now - redirectTime) < 3000;
    
    if (wasRedirected && isRecent) {
      console.log("[REDIRECT] Detectado redirecionamento recente:", { 
        timeElapsed: now - redirectTime,
        source: redirectSource
      });
      
      // Limpar estado de redirecionamento após verificação
      if ((now - redirectTime) > 2000) {
        sessionStorage.removeItem('auth_redirect');
        sessionStorage.removeItem('auth_redirect_time');
        sessionStorage.removeItem('auth_redirect_source');
      }
      
      return true;
    }
    
    // Limpar estado antigo se existir
    if (wasRedirected) {
      sessionStorage.removeItem('auth_redirect');
      sessionStorage.removeItem('auth_redirect_time');
      sessionStorage.removeItem('auth_redirect_source');
    }
    
    return false;
  } catch (error) {
    console.error('[REDIRECT] Erro ao verificar redirecionamento:', error);
    return false;
  }
} 