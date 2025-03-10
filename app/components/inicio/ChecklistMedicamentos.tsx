'use client'

import React, { useState, useMemo } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useStore } from '@/app/store'
import { Check, X, Clock } from 'lucide-react'
import { Pill, CheckCircle2, Circle } from 'lucide-react'
import { Medicamento } from '@/app/store'

export function ChecklistMedicamentos() {
  const { medicamentos, registrarTomadaMedicamento } = useStore(
    (state) => ({
      medicamentos: state.medicamentos || [],
      registrarTomadaMedicamento: state.registrarTomadaMedicamento
    })
  )
  
  // Filtrar apenas medicamentos diários
  const medicamentosDiarios = useMemo(() => {
    return medicamentos
      .filter((med: Medicamento) => med.frequencia === 'Diária')
      .sort((a: Medicamento, b: Medicamento) => a.nome.localeCompare(b.nome))
  }, [medicamentos])
  
  // Verificar se o medicamento foi tomado hoje
  const foiTomadoHoje = (medicamento: Medicamento): boolean => {
    if (!medicamento.ultimaTomada) return false
    
    const hoje = new Date().toISOString().split('T')[0]
    return medicamento.ultimaTomada.includes(hoje)
  }
  
  // Agrupar medicamentos por tipo
  const medicamentosPorTipo = useMemo(() => {
    const grupos: Record<string, Medicamento[]> = {
      'Anfetaminas': [],
      'Antidepressivos': [],
      'Suplementos': [],
      'Outros': []
    }
    
    medicamentosDiarios.forEach((med: Medicamento) => {
      // Lógica simplificada para categorização baseada no nome ou observações
      const nome = med.nome.toLowerCase()
      const obs = (med.observacoes || '').toLowerCase()
      
      if (nome.includes('venvanse') || nome.includes('ritalina') || 
          nome.includes('concerta') || nome.includes('adderall') || 
          obs.includes('anfetamina')) {
        grupos['Anfetaminas'].push(med)
      } 
      else if (nome.includes('prozac') || nome.includes('fluoxetina') || 
               nome.includes('sertralina') || nome.includes('escitalopram') ||
               nome.includes('paroxetina') || obs.includes('antidepressivo')) {
        grupos['Antidepressivos'].push(med)
      }
      else if (nome.includes('vitamina') || nome.includes('mineral') || 
               nome.includes('omega') || nome.includes('ômega') || 
               nome.includes('suplemento') || obs.includes('suplemento')) {
        grupos['Suplementos'].push(med)
      }
      else {
        grupos['Outros'].push(med)
      }
    })
    
    // Remover categorias vazias
    return Object.fromEntries(
      Object.entries(grupos).filter(([_, meds]) => meds.length > 0)
    )
  }, [medicamentosDiarios])
  
  // Registrar tomada de medicamento
  const handleToggleTomado = (id: string) => {
    const dataHora = new Date().toISOString()
    if (registrarTomadaMedicamento) {
      registrarTomadaMedicamento(id, dataHora)
    }
  }
  
  // Se não houver medicamentos diários
  if (medicamentosDiarios.length === 0) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400 py-2">
        Nenhum medicamento diário cadastrado
      </div>
    )
  }
  
  return (
    <div className="space-y-3">
      <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-1">
        <Pill className="h-4 w-4 mr-1" />
        <h3 className="font-medium">Checklist de Medicamentos</h3>
      </div>
      
      <div className="space-y-4">
        {Object.entries(medicamentosPorTipo).map(([tipo, meds]) => (
          <div key={tipo} className="space-y-1">
            {Object.keys(medicamentosPorTipo).length > 1 && (
              <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                {tipo}
              </h4>
            )}
            
            <div className="space-y-1">
              {meds.map((medicamento: Medicamento) => {
                const tomadoHoje = foiTomadoHoje(medicamento)
                
                return (
                  <div 
                    key={medicamento.id}
                    className={`flex items-center p-2 rounded-md transition-colors ${
                      tomadoHoje 
                        ? 'bg-green-50 dark:bg-green-900/20' 
                        : 'bg-white dark:bg-gray-800'
                    }`}
                  >
                    <button
                      onClick={() => handleToggleTomado(medicamento.id)}
                      className="mr-2 text-green-600 dark:text-green-400 focus:outline-none"
                      aria-label={tomadoHoje ? 'Marcar como não tomado' : 'Marcar como tomado'}
                    >
                      {tomadoHoje ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <Circle className="h-5 w-5" />
                      )}
                    </button>
                    
                    <div className="flex-1">
                      <span className={`text-sm ${
                        tomadoHoje 
                          ? 'text-gray-500 dark:text-gray-400 line-through' 
                          : 'text-gray-800 dark:text-white'
                      }`}>
                        {medicamento.nome}
                      </span>
                      
                      {medicamento.dosagem && (
                        <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
                          ({medicamento.dosagem})
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
