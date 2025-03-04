import type { Metadata } from 'next'
import './globals.css'
import { Header } from '@/app/components/layout/Header'
import { Providers } from '@/app/providers'

export const metadata: Metadata = {
  title: 'Painel de Produtividade para Neurodivergentes',
  description: 'Aplicativo para ajudar pessoas neurodivergentes com organização e produtividade',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="bg-gray-50 dark:bg-gray-900">
        <Providers>
          <div className="flex h-screen overflow-hidden">
            <div className="flex flex-col flex-1 overflow-hidden">
              <Header />
              <main className="flex-1 overflow-y-auto p-4">
                {children}
              </main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  )
}
