'use client'

import { useState, useCallback, useMemo } from 'react'
import { Calendar, Plus, X, Edit, Trash, Smile, Frown, Meh, AlertCircle } from 'lucide-react'
import { useAppStore } from '@/app/store'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Textarea } from '../ui/Textarea'
import { Badge } from '../ui/Badge'
import { Modal } from '../ui/Modal'
import { Alert } from '../ui/Alert'
import { StatCard } from './StatCard'
import { HumorCalendar } from './HumorCalendar'
import { FatoresHumor } from './FatoresHumor'

export function MonitoramentoHumor() {
  // Usar o Zustand para gerenciamento de estado
  const { registrosHumor, adicionarRegistroHumor, atualizarRegistroHumor, removerRegistroHumor } = useAppStore(
    (state) => ({
      registrosHumor: state.registrosHumor || [],
      adicionarRegistroHumor: state.adicionarRegistroHumor,
      atualizarRegistroHumor: state.atualizarRegistroHumor,
      removerRegistroHumor: state.removerRegistroHumor,
    })
  )
  
  const [novoRegistro, setNovoRegistro] = useState({
    data: new Date().toISOString().split('T')[0],
    nivel: 3,
    fatores: [] as string[],
    notas: '',
  })
  
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [novoFator, setNovoFator] = useState('')
  const [mesAtual, setMesAtual] = useState(() => new Date().getMonth())
  const [anoAtual, setAnoAtual] = useState(() => new Date().getFullYear())
  const [erro, setErro] = useState('')

  // Usar useCallback para funções que são passadas como props ou dependências
  const handleAdicionarRegistro = useCallback(() => {
    if (!novoRegistro.data) {
      setErro('A data é obrigatória')
      return
    }

    adicionarRegistroHumor({
      data: novoRegistro.data,
      nivel: novoRegistro.nivel,
      fatores: [...novoRegistro.fatores],
      notas: novoRegistro.notas,
    })
    
    resetForm()
  }, [adicionarRegistroHumor, novoRegistro])

  const iniciarEdicao = useCallback((registro: typeof registrosHumor[0]) => {
    setEditandoId(registro.id)
    setNovoRegistro({
      data: registro.data,
      nivel: registro.nivel,
      fatores: [...registro.fatores],
      notas: registro.notas,
    })
    setMostrarForm(true)
  }, [])

  const salvarEdicao = useCallback(() => {
    if (!editandoId || !novoRegistro.data) {
      setErro('A data é obrigatória')
      return
    }

    atualizarRegistroHumor(editandoId, {
      data: novoRegistro.data,
      nivel: novoRegistro.nivel,
      fatores: [...novoRegistro.fatores],
      notas: novoRegistro.notas,
    })
    
    resetForm()
  }, [atualizarRegistroHumor, editandoId, novoRegistro])

  const adicionarFator = useCallback(() => {
    if (!novoFator) return
    
    if (novoRegistro.fatores.includes(novoFator)) {
      setErro('Este fator já foi adicionado')
      return
    }
    
    setNovoRegistro({
      ...novoRegistro,
      fatores: [...novoRegistro.fatores, novoFator],
    })
    
    setNovoFator('')
    setErro('')
  }, [novoFator, novoRegistro])

  const removerFator = useCallback((fator: string) => {
    setNovoRegistro({
      ...novoRegistro,
      fatores: novoRegistro.fatores.filter((f) => f !== fator),
    })
  }, [novoRegistro])

  const resetForm = useCallback(() => {
    setNovoRegistro({
      data: new Date().toISOString().split('T')[0],
      nivel: 3,
      fatores: [],
      notas: '',
    })
    setEditandoId(null)
    setMostrarForm(false)
    setNovoFator('')
    setErro('')
  }, [])

  // Usar useMemo para cálculos ou transformações de dados
  const registrosOrdenados = useMemo(() => {
    return [...registrosHumor].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
  }, [registrosHumor])

  const registrosPorMes = useMemo(() => {
    const meses: Record<string, typeof registrosHumor> = {}
    
    registrosOrdenados.forEach((registro) => {
      const [ano, mes] = registro.data.split('-')
      const chave = `${ano}-${mes}`
      
      if (!meses[chave]) {
        meses[chave] = []
      }
      
      meses[chave].push(registro)
    })
    
    return meses
  }, [registrosOrdenados])

  const humorMedio = useMemo(() => {
    if (registrosHumor.length === 0) return 0
    
    const soma = registrosHumor.reduce((acc, registro) => acc + registro.nivel, 0)
    return (soma / registrosHumor.length).toFixed(1)
  }, [registrosHumor])

  const tendenciaHumor = useMemo(() => {
    if (registrosHumor.length < 5) return null
    
    const registrosRecentes = [...registrosHumor]
      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
      .slice(0, 5)
    
    const registrosAnteriores = [...registrosHumor]
      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
      .slice(5, 10)
    
    if (registrosAnteriores.length === 0) return null
    
    const mediaRecente = registrosRecentes.reduce((acc, reg) => acc + reg.nivel, 0) / registrosRecentes.length
    const mediaAnterior = registrosAnteriores.reduce((acc, reg) => acc + reg.nivel, 0) / registrosAnteriores.length
    
    const diferenca = ((mediaRecente - mediaAnterior) / mediaAnterior) * 100
    
    return {
      valor: Math.abs(Number(diferenca.toFixed(0))),
      positivo: diferenca > 0
    }
  }, [registrosHumor])

  const formatarData = useCallback((data: string) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }, [])

  const handleMesAnterior = useCallback(() => {
    setMesAtual(prev => {
      if (prev === 0) {
        setAnoAtual(ano => ano - 1)
        return 11
      }
      return prev - 1
    })
  }, [])

  const handleProximoMes = useCallback(() => {
    setMesAtual(prev => {
      if (prev === 11) {
        setAnoAtual(ano => ano + 1)
        return 0
      }
      return prev + 1
    })
  }, [])

  const handleSelecionarDia = useCallback((data: string) => {
    const registroExistente = registrosHumor.find(r => r.data === data)
    
    if (registroExistente) {
      iniciarEdicao(registroExistente)
    } else {
      setNovoRegistro(prev => ({ ...prev, data }))
      setMostrarForm(true)
      setEditandoId(null)
    }
  }, [registrosHumor, iniciarEdicao])

  const nomeDoMes = useMemo(() => {
    return new Date(anoAtual, mesAtual).toLocaleDateString('pt-BR', { month: 'long' })
  }, [mesAtual, anoAtual])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <Card className="flex-1">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Monitoramento de Humor
            </h2>
            <Button
              onClick={() => {
                resetForm()
                setMostrarForm(true)
              }}
              icon={<Plus className="h-4 w-4" />}
              aria-label="Adicionar novo registro de humor"
            >
              Novo Registro
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <StatCard
              title="Humor Médio"
              value={humorMedio}
              icon={<Smile className="h-5 w-5" />}
              description="Baseado em todos os registros"
              trend={tendenciaHumor ? {
                value: Number(tendenciaHumor.valor),
                label: "últimos registros",
                positive: tendenciaHumor.positivo
              } : undefined}
            />
            
            <div className="md:col-span-2">
              <FatoresHumor registros={registrosHumor} />
            </div>
          </div>
          
          <div className="mb-6">
            <div className="flex flex-wrap justify-between items-center mb-3 gap-2">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Calendário de Humor
              </h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMesAnterior}
                  aria-label="Mês anterior"
                >
                  &larr;
                </Button>
                <span className="text-sm font-medium whitespace-nowrap">
                  {nomeDoMes} {anoAtual}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleProximoMes}
                  aria-label="Próximo mês"
                >
                  &rarr;
                </Button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <HumorCalendar
                registros={registrosHumor}
                mes={mesAtual}
                ano={anoAtual}
                onSelectDay={handleSelecionarDia}
              />
            </div>
          </div>
          
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
            Registros Recentes
          </h3>
          
          {registrosOrdenados.length === 0 ? (
            <Alert
              variant="info"
              title="Nenhum registro encontrado"
            >
              Adicione seu primeiro registro de humor usando o botão "Novo Registro".
            </Alert>
          ) : (
            <div className="space-y-3">
              {registrosOrdenados.slice(0, 5).map((registro) => (
                <Card key={registro.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {formatarData(registro.data)}
                        </span>
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((nivel) => (
                            <span
                              key={nivel}
                              className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                                nivel <= registro.nivel
                                  ? 'bg-saude-primary text-white'
                                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                              }`}
                              aria-label={`Nível ${nivel} de 5`}
                            >
                              {nivel}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      {registro.fatores.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {registro.fatores.map((fator) => (
                            <Badge key={fator} variant="secondary">
                              {fator}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      {registro.notas && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 break-words">
                          {registro.notas}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex gap-1 ml-2 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => iniciarEdicao(registro)}
                        aria-label="Editar registro"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removerRegistroHumor(registro.id)}
                        aria-label="Remover registro"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Modal para adicionar/editar registro */}
      <Modal
        isOpen={mostrarForm}
        onClose={resetForm}
        title={editandoId ? "Editar Registro de Humor" : "Novo Registro de Humor"}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={resetForm}>
              Cancelar
            </Button>
            <Button 
              onClick={editandoId ? salvarEdicao : handleAdicionarRegistro}
            >
              {editandoId ? "Salvar Alterações" : "Adicionar Registro"}
            </Button>
          </div>
        }
      >
        {erro && (
          <Alert variant="error" className="mb-4">
            {erro}
          </Alert>
        )}
        
        <div className="space-y-4">
          <Input
            type="date"
            value={novoRegistro.data}
            onChange={(e) => setNovoRegistro({ ...novoRegistro, data: e.target.value })}
            label="Data"
            required
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nível de Humor (1-5)
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((nivel) => (
                <button
                  key={nivel}
                  type="button"
                  onClick={() => setNovoRegistro({ ...novoRegistro, nivel })}
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    nivel === novoRegistro.nivel
                      ? 'bg-saude-primary text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                  aria-label={`Nível de humor ${nivel}`}
                  aria-pressed={nivel === novoRegistro.nivel}
                >
                  {nivel}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Fatores que Influenciaram
            </label>
            <div className="flex gap-2 mb-2">
              <Input
                value={novoFator}
                onChange={(e) => setNovoFator(e.target.value)}
                placeholder="Adicionar fator..."
                className="flex-1"
              />
              <Button
                onClick={adicionarFator}
                disabled={!novoFator}
                aria-label="Adicionar fator"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {novoRegistro.fatores.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {novoRegistro.fatores.map((fator) => (
                  <Badge key={fator} variant="secondary" className="flex items-center gap-1">
                    {fator}
                    <button
                      onClick={() => removerFator(fator)}
                      className="ml-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      aria-label={`Remover fator ${fator}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
          
          <Textarea
            value={novoRegistro.notas}
            onChange={(e) => setNovoRegistro({ ...novoRegistro, notas: e.target.value })}
            label="Notas (opcional)"
            placeholder="Adicione detalhes sobre como você se sentiu..."
          />
        </div>
      </Modal>
    </div>
  )
}
