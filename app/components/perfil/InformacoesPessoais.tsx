'use client'

import { useState } from 'react'
import { usePerfilStore } from '../../stores/perfilStore'
import { Save, User, Edit } from 'lucide-react'

export function InformacoesPessoais() {
  const { nome, atualizarNome } = usePerfilStore()
  const [novoNome, setNovoNome] = useState(nome)
  const [editando, setEditando] = useState(false)
  
  const iniciarEdicao = () => {
    setNovoNome(nome)
    setEditando(true)
  }
  
  const salvarAlteracoes = () => {
    if (novoNome.trim()) {
      atualizarNome(novoNome.trim())
    }
    setEditando(false)
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
        <User className="h-5 w-5 mr-2 text-perfil-primary" />
        Informações Básicas
      </h2>
      
      <div className="space-y-4">
        {/* Nome do usuário */}
        <div>
          <label htmlFor="nome" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Nome
          </label>
          
          {editando ? (
            <div className="flex items-center">
              <input
                type="text"
                id="nome"
                value={novoNome}
                onChange={(e) => setNovoNome(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-perfil-primary focus:border-perfil-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Seu nome"
                maxLength={30}
                required
              />
              
              <button
                onClick={salvarAlteracoes}
                className="ml-2 p-2 text-white bg-perfil-primary rounded-md hover:bg-perfil-secondary focus:outline-none focus:ring-2 focus:ring-perfil-primary"
                aria-label="Salvar nome"
              >
                <Save className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-gray-800 dark:text-white text-lg">{nome}</p>
              
              <button
                onClick={iniciarEdicao}
                className="p-2 text-gray-500 hover:text-perfil-primary focus:outline-none focus:ring-2 focus:ring-perfil-primary rounded-md"
                aria-label="Editar nome"
              >
                <Edit className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
        
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Seu nome é usado para personalizar a experiência no Painel ND. 
            As informações pessoais são armazenadas apenas no seu navegador.
          </p>
        </div>
      </div>
    </div>
  )
}
