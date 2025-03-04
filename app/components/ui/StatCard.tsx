import React, { ReactNode } from 'react'

interface StatCardProps {
  title: string
  value: string
  icon?: ReactNode
  description?: string
  className?: string
}

export function StatCard({ title, value, icon, description, className = '' }: StatCardProps) {
  return (
    <div className={`bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="flex items-start">
        {icon && (
          <div className="mr-3 p-2 bg-gray-100 dark:bg-gray-700 rounded-full">
            {icon}
          </div>
        )}
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
          {description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</p>
          )}
        </div>
      </div>
    </div>
  )
}
