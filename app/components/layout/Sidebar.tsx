'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Utensils, BookOpen, Heart, Smile, DollarSign, Rocket, X, Calendar, Clock, Pills, Brain, Settings, Menu } from 'lucide-react'
import { useAuth } from '@/app/providers/AuthProvider'
import { useState } from 'react'

type NavItem = {
  name: string
  href: string
  icon: React.ElementType
  color: string
  activeColor: string
  iconClasses?: string
  public: boolean
  requiresAuth: boolean
}

const navItems: NavItem[] = [
  {
    name: 'Início',
    href: '/',
    icon: Home,
    color: 'text-inicio-primary',
    activeColor: 'bg-inicio-light',
    public: true,
    requiresAuth: false
  },
  {
    name: 'Agenda',
    href: '/agenda',
    icon: Calendar,
    color: 'text-alimentacao-primary',
    activeColor: 'bg-alimentacao-light',
    public: false,
    requiresAuth: true
  },
  {
    name: 'Blocos de Tempo',
    href: '/blocos-tempo',
    icon: Clock,
    color: 'text-estudos-primary',
    activeColor: 'bg-estudos-light',
    public: false,
    requiresAuth: true
  },
  {
    name: 'Refeições',
    href: '/refeicoes',
    icon: Utensils,
    color: 'text-saude-primary',
    activeColor: 'bg-saude-light',
    public: false,
    requiresAuth: true
  },
  {
    name: 'Medicamentos',
    href: '/medicamentos',
    icon: Pills,
    color: 'text-lazer-primary',
    activeColor: 'bg-lazer-light',
    public: false,
    requiresAuth: true
  },
  {
    name: 'Humor',
    href: '/humor',
    icon: Brain,
    color: 'text-financas-primary',
    activeColor: 'bg-financas-light',
    public: false,
    requiresAuth: true
  },
  {
    name: 'Configurações',
    href: '/configuracoes',
    icon: Settings,
    color: 'text-hiperfocos-primary',
    activeColor: 'bg-hiperfocos-light',
    public: false,
    requiresAuth: true
  },
]

export function Sidebar() {
  const { session } = useAuth()
  const [isOpen, setIsOpen] = useState(true)

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  const filteredMenuItems = navItems.filter(item => 
    item.public || (item.requiresAuth && session)
  )

  return (
    <>
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-md bg-white dark:bg-gray-800 shadow-md"
      >
        <Menu className="w-6 h-6" />
      </button>

      <aside className={`
        fixed md:static inset-y-0 left-0 z-40
        transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        transition-transform duration-300 ease-in-out
        w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
        flex flex-col
        md:transform-none
      `}>
        <div className="p-4">
          <h1 className="text-2xl font-bold text-primary">StayFocus</h1>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-2">
            {filteredMenuItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {session && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 px-4 py-2">
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
                {session.user.email?.[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {session.user.email}
                </p>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  )
}
