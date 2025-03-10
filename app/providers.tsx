'use client'

// Este arquivo é apenas um re-export do providers/index.tsx para manter a compatibilidade
import { Providers as ProvidersImpl } from './providers/index'

export function Providers({ children, ...props }: { children: React.ReactNode }) {
  return (
    <ProvidersImpl {...props}>
      {children}
    </ProvidersImpl>
  )
} 