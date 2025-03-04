'use client'

import { cn } from '@/app/lib/utils'

interface SectionProps {
  children: React.ReactNode
  title: string
  description?: string
  className?: string
}

export function Section({ children, title, description, className }: SectionProps) {
  return (
    <section className={cn("py-6", className)}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{title}</h1>
        {description && (
          <p className="text-gray-600 dark:text-gray-400">{description}</p>
        )}
      </div>
      <div className="space-y-6">
        {children}
      </div>
    </section>
  )
}
