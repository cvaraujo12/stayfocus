'use client'

import { useState } from 'react'
import { Menu, X, Sun, Moon, HelpCircle } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Sidebar } from './Sidebar'
import Image from 'next/image'

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
              <Menu className="h-6 w-6" aria-hidden="true" />
            </button>
            <div className="ml-3 flex items-center">
              <Image
                src="/images/logo.svg"
                alt="Painel ND Logo"
                width={32}
                height={32}
                priority
                className="h-8 w-auto"
                aria-label="Logo do Painel ND"
              />
              <span className="sr-only">Painel ND</span>
            </div>
          </div>

          {/* Controles */}
          <div className="flex items-center space-x-3">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label={theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Moon className="h-5 w-5" aria-hidden="true" />
              )}
            </button>

            {/* Help button */}
            <button
              className="p-2 rounded-full text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Ajuda"
            >
              <HelpCircle className="h-5 w-5" aria-hidden="true" />
            </button>

            {/* User profile */}
            <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">U</span>
            </div>
          </div>
        </div>
      </header>
    </>
  )
}
