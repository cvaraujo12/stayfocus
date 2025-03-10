'use client';

import { useEffect } from 'react';

export function DebugProviders() {
  useEffect(() => {
    // Verificando todos os providers importados
    console.log('Verificando providers...');
    
    try {
      // Importações dinâmicas para evitar erros de compilação
      import('@/app/providers').then(module => {
        console.log('app/providers importado:', module);
      }).catch(err => {
        console.error('Erro ao importar app/providers:', err);
      });
      
      import('@/app/providers/index').then(module => {
        console.log('app/providers/index importado:', module);
      }).catch(err => {
        console.error('Erro ao importar app/providers/index:', err);
      });
      
      import('@/app/contexts/AuthContext').then(module => {
        console.log('app/contexts/AuthContext importado:', module);
      }).catch(err => {
        console.error('Erro ao importar app/contexts/AuthContext:', err);
      });
      
      import('@/app/providers/AuthProvider').then(module => {
        console.log('app/providers/AuthProvider importado:', module);
      }).catch(err => {
        console.error('Erro ao importar app/providers/AuthProvider:', err);
      });
    } catch (error) {
      console.error('Erro ao verificar providers:', error);
    }
  }, []);
  
  return null;
}

export default DebugProviders; 