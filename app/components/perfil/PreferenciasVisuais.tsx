'use client'

import { usePerfilStore } from '../../stores/perfilStore'
import { Eye, BarChart2, Type, Bell, Coffee, Moon } from 'lucide-react'

export function PreferenciasVisuais() {
  const { 
    preferenciasVisuais, 
    atualizarPreferenciasVisuais, 
    notificacoesAtivas, 
    pausasAtivas,
    alternarNotificacoes,
    alternarPausas
  } = usePerfilStore()
  
  const toggleAltoContraste = () => {
    atualizarPreferenciasVisuais({ altoContraste: !preferenciasVisuais.altoContraste })
    
    // Aplicar classes ao documento para alto contraste
    if (!preferenciasVisuais.altoContraste) {
      document.documentElement.classList.add('alto-contraste')
    } else {
      document.documentElement.classList.remove('alto-contraste')
    }
  }
  
  const toggleReducaoEstimulos = () => {
    atualizarPreferenciasVisuais({ reducaoEstimulos: !preferenciasVisuais.reducaoEstimulos })
    
    // Aplicar classes ao documento para redução de estímulos
    if (!preferenciasVisuais.reducaoEstimulos) {
      document.documentElement.classList.add('reducao-estimulos')
    } else {
      document.documentElement.classList.remove('reducao-estimulos')
    }
  }
  
  const toggleTextoGrande = () => {
    atualizarPreferenciasVisuais({ textoGrande: !preferenciasVisuais.textoGrande })
    
    // Aplicar classes ao documento para texto grande
    if (!preferenciasVisuais.textoGrande) {
      document.documentElement.classList.add('texto-grande')
    } else {
      document.documentElement.classList.remove('texto-grande')
    }
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
        <Eye className="h-5 w-5 mr-2 text-perfil-primary" />
        Preferências de Acessibilidade
      </h2>
      
      <div className="space-y-5">
        {/* Modos visuais */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Modos Visuais
          </h3>
          
          <div className="space-y-3">
            {/* Alto contraste */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center mr-3">
                  <BarChart2 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="font-medium text-gray-800 dark:text-white">
                    Alto Contraste
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Aumenta o contraste para melhor legibilidade
                  </p>
                </div>
              </div>
              
              <button
                role="switch"
                aria-checked={preferenciasVisuais.altoContraste}
                onClick={toggleAltoContraste}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-perfil-primary ${
                  preferenciasVisuais.altoContraste ? 'bg-perfil-primary' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span className="sr-only">Ativar alto contraste</span>
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferenciasVisuais.altoContraste ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            {/* Redução de estímulos */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center mr-3">
                  <Moon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="font-medium text-gray-800 dark:text-white">
                    Redução de Estímulos
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Remove animações e reduz cores intensas
                  </p>
                </div>
              </div>
              
              <button
                role="switch"
                aria-checked={preferenciasVisuais.reducaoEstimulos}
                onClick={toggleReducaoEstimulos}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-perfil-primary ${
                  preferenciasVisuais.reducaoEstimulos ? 'bg-perfil-primary' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span className="sr-only">Ativar redução de estímulos</span>
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferenciasVisuais.reducaoEstimulos ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            {/* Texto grande */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center mr-3">
                  <Type className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="font-medium text-gray-800 dark:text-white">
                    Texto Grande
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Aumenta o tamanho do texto em toda a aplicação
                  </p>
                </div>
              </div>
              
              <button
                role="switch"
                aria-checked={preferenciasVisuais.textoGrande}
                onClick={toggleTextoGrande}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-perfil-primary ${
                  preferenciasVisuais.textoGrande ? 'bg-perfil-primary' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span className="sr-only">Ativar texto grande</span>
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferenciasVisuais.textoGrande ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
        
        {/* Preferências gerais */}
        <div className="pt-5 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Preferências Gerais
          </h3>
          
          <div className="space-y-3">
            {/* Notificações */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center mr-3">
                  <Bell className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="font-medium text-gray-800 dark:text-white">
                    Lembretes
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Exibir lembretes visuais no painel
                  </p>
                </div>
              </div>
              
              <button
                role="switch"
                aria-checked={notificacoesAtivas}
                onClick={alternarNotificacoes}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-perfil-primary ${
                  notificacoesAtivas ? 'bg-perfil-primary' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span className="sr-only">Ativar notificações</span>
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notificacoesAtivas ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            {/* Pausas */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center mr-3">
                  <Coffee className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="font-medium text-gray-800 dark:text-white">
                    Pausas Programadas
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Exibir lembretes para fazer pausas
                  </p>
                </div>
              </div>
              
              <button
                role="switch"
                aria-checked={pausasAtivas}
                onClick={alternarPausas}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-perfil-primary ${
                  pausasAtivas ? 'bg-perfil-primary' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span className="sr-only">Ativar pausas programadas</span>
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    pausasAtivas ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-5 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          As preferências visuais são aplicadas imediatamente e salvas automaticamente para uso futuro.
        </p>
      </div>
    </div>
  )
}
