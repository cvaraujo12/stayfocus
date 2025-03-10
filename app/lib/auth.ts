/**
 * Verifica se uma rota é uma rota de autenticação
 * @param path Caminho da rota
 * @returns Verdadeiro se for rota de autenticação
 */
export function isAuthRoute(path: string): boolean {
  const authRoutes = ['/login', '/signup', '/auth'];
  return authRoutes.some(route => path.startsWith(route));
} 