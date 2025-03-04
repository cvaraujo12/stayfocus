'use client'

import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/app/lib/utils'

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, ...props }, ref) => {
    const checkboxId = id || `checkbox-${Math.random().toString(36).substring(2, 9)}`
    
    return (
      <div className="flex items-center">
        <input
          id={checkboxId}
          type="checkbox"
          className={cn(
            "h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800",
            className
          )}
          ref={ref}
          {...props}
        />
        {label && (
          <label
            htmlFor={checkboxId}
            className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
          >
            {label}
          </label>
        )}
      </div>
    )
  }
)
