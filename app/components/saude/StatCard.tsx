'use client'

import { ReactNode } from 'react'
import { cn } from '@/app/lib/utils'
import { Card } from '../ui/Card'

interface StatCardProps {
  title: string
  value: string | number
  icon?: ReactNode
  description?: string
  className?: string
  trend?: {
    value: number
    label: string
    positive?: boolean
  }
}

export function StatCard({
  title,
  value,
  icon,
  description,
  className,
  trend,
}: StatCardProps) {
  return (
    <Card className={cn('flex flex-col', className)}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {title}
        </h3>
        {icon && <div className="text-saude-primary">{icon}</div>}
      </div>
      
      <div className="flex items-end">
        <div className="text-2xl font-semibold text-gray-900 dark:text-white">
          {value}
        </div>
        
        {trend && (
          <div className={cn(
            "ml-2 text-xs font-medium flex items-center",
            trend.positive 
              ? "text-green-600 dark:text-green-400" 
              : "text-red-600 dark:text-red-400"
          )}>
            <span className="mr-1">
              {trend.positive ? '↑' : '↓'}
            </span>
            {trend.value}% {trend.label}
          </div>
        )}
      </div>
      
      {description && (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {description}
        </p>
      )}
    </Card>
  )
}
