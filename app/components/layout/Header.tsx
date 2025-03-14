'use client'

import { useState, useEffect } from 'react'
import { Menu, X, Sun, Moon, HelpCircle, Anchor } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Sidebar } from './Sidebar'
import Link from 'next/link'
import { SyncStatus } from './SyncStatus'

// Componente para renderização segura de ícones no cliente
function ClientOnlyIcon({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return null
  }

  return <>{children}</>
}

export function Header() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  // Função para abrir o sidebar
  const openSidebar = () => {
    setSidebarOpen(true)
  }

  // Função para fechar o sidebar
  const closeSidebar = () => {
    setSidebarOpen(false)
  }

  return (
    <>
      {/* Sidebar controlável */}
      {sidebarOpen && (
        <Sidebar onClose={closeSidebar} />
      )}
      
      {/* Header fixo no topo */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center justify-between h-16 px-4">
          {/* Logo e menu button */}
          <div className="flex items-center">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={openSidebar}
              aria-label="Abrir menu"
            >
              <ClientOnlyIcon>
                <Menu className="h-6 w-6" aria-hidden="true" />
              </ClientOnlyIcon>
            </button>
            <div className="ml-3 flex items-center">
              <span className="sr-only">StayFocus</span>
            </div>
          </div>

          {/* Status de sincronização */}
          <div className="hidden md:flex">
            <SyncStatus />
          </div>

          {/* Controles */}
          <div className="flex items-center space-x-3">
            {/* Ícone Zzz para Sono */}
            <Link href="/sono">
              <button
                className="p-2 rounded-full text-sono-primary hover:bg-sono-light focus:outline-none focus:ring-2 focus:ring-sono-primary"
                aria-label="Gestão do Sono"
              >
                <ClientOnlyIcon>
                  <Moon className="h-5 w-5 rotate-180" aria-hidden="true" />
                </ClientOnlyIcon>
              </button>
            </Link>
            
            {/* Ícone de Âncora para Autoconhecimento */}
            <Link href="/autoconhecimento">
              <button
                className="p-2 rounded-full text-autoconhecimento-primary hover:bg-autoconhecimento-light focus:outline-none focus:ring-2 focus:ring-autoconhecimento-primary"
                aria-label="Notas de Autoconhecimento"
              >
                <ClientOnlyIcon>
                  <Anchor className="h-5 w-5" aria-hidden="true" />
                </ClientOnlyIcon>
              </button>
            </Link>
            
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label={theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
            >
              <ClientOnlyIcon>
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <Moon className="h-5 w-5" aria-hidden="true" />
                )}
              </ClientOnlyIcon>
            </button>

            {/* Help button */}
            <Link href="/roadmap">
              <button
                className="p-2 rounded-full text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Roadmap e Ajuda"
              >
                <ClientOnlyIcon>
                  <HelpCircle className="h-5 w-5" aria-hidden="true" />
                </ClientOnlyIcon>
              </button>
            </Link>

            {/* User profile */}
            <Link href="/perfil">
              <button 
                className="h-8 w-8 rounded-full bg-perfil-primary hover:bg-perfil-secondary text-white flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-perfil-primary"
                aria-label="Informações Pessoais"
              >
                <span className="text-sm font-medium">U</span>
              </button>
            </Link>
          </div>
        </div>
        
        {/* Status de sincronização para mobile */}
        <div className="md:hidden px-4 pb-2">
          <SyncStatus />
        </div>
      </header>
    </>
  )
}
