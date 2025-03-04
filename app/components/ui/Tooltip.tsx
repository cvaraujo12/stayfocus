'use client'

import { ReactNode, useState } from 'react'
import { cn } from '@/app/lib/utils'

interface TooltipProps {
  children: ReactNode
  content: string
  position?: 'top' | 'bottom' | 'left' | 'right'
  className?: string
}

export function Tooltip({
  children,
  content,
  position = 'top',
  className,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)

  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2',
  }

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {isVisible && (
        <div
          className={cn(
            'absolute z-10 px-2 py-1 text-xs font-medium text-white bg-gray-800 rounded shadow-sm dark:bg-gray-700 max-w-xs',
            positionClasses[position],
            className
          )}
          role="tooltip"
        >
          {content}
          <div
            className={cn(
              'absolute w-2 h-2 bg-gray-800 dark:bg-gray-700 transform rotate-45',
              position === 'top' && 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2',
              position === 'bottom' && 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2',
              position === 'left' && 'right-0 top-1/2 translate-x-1/2 -translate-y-1/2',
              position === 'right' && 'left-0 top-1/2 -translate-x-1/2 -translate-y-1/2'
            )}
          />
        </div>
      )}
      {children}
    </div>
  )
}
