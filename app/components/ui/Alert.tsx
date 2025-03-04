'use client'

import { ReactNode } from 'react'
import { cn } from '@/app/lib/utils'
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react'

type AlertVariant = 'info' | 'success' | 'warning' | 'error'

interface AlertProps {
  variant?: AlertVariant
  title?: string
  children: ReactNode
  className?: string
}

const variantStyles = {
  info: {
    container: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    icon: <Info className="h-5 w-5 text-blue-500 dark:text-blue-400" />,
    title: 'text-blue-800 dark:text-blue-300',
    content: 'text-blue-700 dark:text-blue-200',
  },
  success: {
    container: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    icon: <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400" />,
    title: 'text-green-800 dark:text-green-300',
    content: 'text-green-700 dark:text-green-200',
  },
  warning: {
    container: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
    icon: <AlertCircle className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />,
    title: 'text-yellow-800 dark:text-yellow-300',
    content: 'text-yellow-700 dark:text-yellow-200',
  },
  error: {
    container: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    icon: <XCircle className="h-5 w-5 text-red-500 dark:text-red-400" />,
    title: 'text-red-800 dark:text-red-300',
    content: 'text-red-700 dark:text-red-200',
  },
}

export function Alert({ 
  variant = 'info', 
  title, 
  children, 
  className 
}: AlertProps) {
  const styles = variantStyles[variant]
  
  return (
    <div
      className={cn(
        'border rounded-md p-4 flex gap-3',
        styles.container,
        className
      )}
      role="alert"
    >
      <div className="flex-shrink-0">{styles.icon}</div>
      <div>
        {title && (
          <h3 className={cn('text-sm font-medium mb-1', styles.title)}>
            {title}
          </h3>
        )}
        <div className={cn('text-sm', styles.content)}>{children}</div>
      </div>
    </div>
  )
}
