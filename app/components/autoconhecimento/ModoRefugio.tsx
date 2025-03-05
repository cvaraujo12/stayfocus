'use client'

import { useAutoconhecimentoStore } from '@/app/stores/autoconhecimentoStore'
import { Button } from '@/app/components/ui/Button'
import { ShieldAlert, ShieldCheck } from 'lucide-react'

export function ModoRefugio() {
  const { modoRefugio, alternarModoRefugio } = useAutoconhecimentoStore()
  
  return (
    <div className={`fixed bottom-6 right-6 z-50 ${modoRefugio ? 'scale-110' : ''} transition-all duration-300`}>
      <Button
        onClick={alternarModoRefugio}
        className={`flex items-center p-3 rounded-full shadow-lg ${
          modoRefugio 
            ? 'bg-autoconhecimento-primary text-white' 
            : 'bg-white dark:bg-gray-800 text-autoconhecimento-primary dark:text-autoconhecimento-light'
        }`}
        aria-label={modoRefugio ? 'Desativar modo refúgio' : 'Ativar modo refúgio'}
      >
        {modoRefugio ? (
          <ShieldCheck className="h-6 w-6" />
        ) : (
          <ShieldAlert className="h-6 w-6" />
        )}
      </Button>
      
      {modoRefugio && (
        <div className="absolute -top-12 right-0 bg-autoconhecimento-primary text-white px-3 py-1 rounded text-sm whitespace-nowrap">
          Modo refúgio ativado
        </div>
      )}
    </div>
  )
}
