'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'dark' | 'light' | 'system'

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
  attribute?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
  systemTheme: 'dark' | 'light' | undefined
}

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null,
  systemTheme: undefined,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  enableSystem = true,
  disableTransitionOnChange = false,
  attribute = 'class',
  ...props
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme)
  const [systemTheme, setSystemTheme] = useState<'dark' | 'light' | undefined>(undefined)

  useEffect(() => {
    const root = window.document.documentElement
    
    // Remove transition classes
    if (disableTransitionOnChange) {
      root.classList.add('transition-none')
      window.setTimeout(() => {
        root.classList.remove('transition-none')
      }, 0)
    }

    // Check for system preference
    if (theme === 'system' && enableSystem) {
      const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      setSystemTheme(systemPreference)
      
      root.classList.remove('light', 'dark')
      root.classList.add(systemPreference)
      return
    }

    // Apply theme
    root.classList.remove('light', 'dark')
    root.classList.add(theme)
  }, [theme, disableTransitionOnChange, enableSystem])

  // Listen for system preference changes
  useEffect(() => {
    if (!enableSystem) return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleChange = () => {
      const newSystemTheme = mediaQuery.matches ? 'dark' : 'light'
      setSystemTheme(newSystemTheme)
      
      if (theme === 'system') {
        document.documentElement.classList.remove('light', 'dark')
        document.documentElement.classList.add(newSystemTheme)
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [enableSystem, theme])

  const setTheme = (theme: Theme) => {
    setThemeState(theme)
    // Save to localStorage
    localStorage.setItem('theme', theme)
  }

  // Initialize from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null
    if (savedTheme) {
      setThemeState(savedTheme)
    }
  }, [])

  const value = {
    theme,
    setTheme,
    systemTheme,
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }

  return context
}
