/**
 * Configuração de armazenamento padrão para os stores do Zustand
 * Implementa a nova sintaxe de storage recomendada
 */
export const createLocalStorage = () => ({
  getItem: (name: string) => {
    const str = localStorage.getItem(name);
    if (!str) return null;
    try {
      return JSON.parse(str);
    } catch {
      return str;
    }
  },
  setItem: (name: string, value: unknown) => {
    localStorage.setItem(name, JSON.stringify(value));
  },
  removeItem: (name: string) => localStorage.removeItem(name)
});
