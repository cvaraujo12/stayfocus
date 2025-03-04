'use client'

import { cn } from '@/app/lib/utils'

interface CardProps {
  children: React.ReactNode
  title?: string
  className?: string
}

export function Card({ children, title, className }: CardProps) {
  return (
    <div className={cn(
      "bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden",
      className
    )}>
      {title && (
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h2>
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  )
}
