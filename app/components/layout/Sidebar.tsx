'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Utensils, BookOpen, Heart, Smile, X } from 'lucide-react'

type NavItem = {
  name: string
  href: string
  icon: React.ElementType
  color: string
  activeColor: string
}

const navItems: NavItem[] = [
  {
    name: 'Início',
    href: '/',
    icon: Home,
    color: 'text-inicio-primary',
    activeColor: 'bg-inicio-light',
  },
  {
    name: 'Alimentação',
    href: '/alimentacao',
    icon: Utensils,
    color: 'text-alimentacao-primary',
    activeColor: 'bg-alimentacao-light',
  },
  {
    name: 'Estudos',
    href: '/estudos',
    icon: BookOpen,
    color: 'text-estudos-primary',
    activeColor: 'bg-estudos-light',
  },
  {
    name: 'Saúde',
    href: '/saude',
    icon: Heart,
    color: 'text-saude-primary',
    activeColor: 'bg-saude-light',
  },
  {
    name: 'Lazer',
    href: '/lazer',
    icon: Smile,
    color: 'text-lazer-primary',
    activeColor: 'bg-lazer-light',
  },
]

type SidebarProps = {
  onClose: () => void
}

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay escuro */}
      <div 
        className="fixed inset-0 bg-gray-900/60" 
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Sidebar */}
      <div className="relative flex-1 flex flex-col w-64 max-w-xs bg-white dark:bg-gray-800 shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Menu</h2>
          <button
            className="p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            onClick={onClose}
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center px-4 py-3 rounded-lg text-base font-medium transition-colors
                    ${isActive 
                      ? `${item.activeColor} ${item.color}` 
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700'}
                  `}
                  onClick={onClose}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <item.icon className="mr-3 h-5 w-5" aria-hidden="true" />
                  {item.name}
                </Link>
              )
            })}
          </div>
        </nav>
      </div>
    </div>
  )
}
