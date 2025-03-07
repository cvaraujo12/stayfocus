'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { type ThemeProviderProps } from 'next-themes/dist/types'
import { AuthProvider } from './contexts/AuthContext'
import { ReactNode } from 'react'

// Estendendo o tipo ThemeProviderProps para incluir children como ReactNode
type ProvidersProps = ThemeProviderProps & {
  children: ReactNode
}

export function Providers({ children, ...props }: ProvidersProps) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem {...props}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </NextThemesProvider>
  )
}
