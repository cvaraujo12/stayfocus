'use client'

import { useState, useCallback, useMemo } from 'react'
import { Pill, Plus, X, Edit, Trash, Check, Clock, Calendar } from 'lucide-react'
import { useAppStore } from '@/app/store'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Textarea } from '../ui/Textarea'
import { Select } from '../ui/Select'
import { Badge } from '../ui/Badge'
import { Modal } from '../ui/Modal'
import { Alert } from '../ui/Alert'
import { MedicamentosList } from './MedicamentosList'
import { StatCard } from './StatCard'

export function RegistroMedicamentos() {
  // Usar o Zustand para gerenciamento de estado
  const { medicamentos, adicionarMedicamento, atualizarMedicamento, removerMedicamento, registrarTomadaMedicamento } = useAppStore(
    (state) => ({
      medicamentos: state.medicamentos || [],
      adicionarMedicamento: state.adicionarMedicamento,
      atualizarMedicamento: state.atualizarMedicamento,
      removerMedicamento: state.removerMedicamento,
      registrarTomadaMedicamento: state.registrarTomadaMedicamento,
    })
  )
  
  const [novoMedicamento, setNovoMedicamento] = useState({
    nome: '',
    dosagem: '',
    frequencia: 'Diária',
    horarios: ['08:00'],
    observacoes: '',
    dataInicio: new Date().toISOString().split('T')[0],
    intervalo: 240, // 4 horas por padrão (em minutos)
  })
  
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [novoHorario, setNovoHorario] = useState('08:00')
  const [erro, setErro] = useState('')

  // Usar useCallback para funções que são passadas como props ou dependências
  const handleAdicionarMedicamento = useCallback(() => {
    if (!novoMedicamento.nome) {
      setErro('O nome do medicamento é obrigatório')
      return
    }

    if (novoMedicamento.horarios.length === 0) {
      setErro('Adicione pelo menos um horário')
      return
    }
    
    if (adicionarMedicamento) {
      adicionarMedicamento({
        nome: novoMedicamento.nome,
        dosagem: novoMedicamento.dosagem,
        frequencia: novoMedicamento.frequencia,
        horarios: [...novoMedicamento.horarios],
        observacoes: novoMedicamento.observacoes,
        dataInicio: novoMedicamento.dataInicio,
        ultimaTomada: null,
        intervalo: novoMedicamento.intervalo,
      })
    }
    
    resetForm()
  }, [adicionarMedicamento, novoMedicamento])

  const iniciarEdicao = useCallback((id: string) => {
    const medicamento = medicamentos.find(med => med.id === id);
    if (!medicamento) return;
    
    setEditandoId(medicamento.id)
    setNovoMedicamento({
      nome: medicamento.nome,
      dosagem: medicamento.dosagem,
      frequencia: medicamento.frequencia,
      horarios: [...medicamento.horarios],
      observacoes: medicamento.observacoes,
      dataInicio: medicamento.dataInicio,
      intervalo: medicamento.intervalo || 240, // Se não tiver intervalo definido, usar 4 horas como padrão
    })
    setMostrarForm(true)
  }, [medicamentos])

  const salvarEdicao = useCallback(() => {
    if (!editandoId || !novoMedicamento.nome) {
      setErro('O nome do medicamento é obrigatório')
      return
    }

    if (novoMedicamento.horarios.length === 0) {
      setErro('Adicione pelo menos um horário')
      return
    }
    
    if (atualizarMedicamento) {
      atualizarMedicamento(editandoId, {
        nome: novoMedicamento.nome,
        dosagem: novoMedicamento.dosagem,
        frequencia: novoMedicamento.frequencia,
        horarios: [...novoMedicamento.horarios],
        observacoes: novoMedicamento.observacoes,
        dataInicio: novoMedicamento.dataInicio,
        intervalo: novoMedicamento.intervalo,
      })
    }
    
    resetForm()
  }, [atualizarMedicamento, editandoId, novoMedicamento])

  const adicionarHorario = useCallback(() => {
    if (!novoHorario) return
    
    if (novoMedicamento.horarios.includes(novoHorario)) {
      setErro('Este horário já foi adicionado')
      return
    }
    
    setNovoMedicamento({
      ...novoMedicamento,
      horarios: [...novoMedicamento.horarios, novoHorario].sort(),
    })
    
    setNovoHorario('08:00')
    setErro('')
  }, [novoHorario, novoMedicamento])

  const removerHorario = useCallback((horario: string) => {
    setNovoMedicamento({
      ...novoMedicamento,
      horarios: novoMedicamento.horarios.filter((h) => h !== horario),
    })
  }, [novoMedicamento])

  const handleRegistrarTomada = useCallback((id: string) => {
    const agora = new Date().toISOString()
    if (registrarTomadaMedicamento) {
      registrarTomadaMedicamento(id, agora)
    }
  }, [registrarTomadaMedicamento])

  const resetForm = useCallback(() => {
    setNovoMedicamento({
      nome: '',
      dosagem: '',
      frequencia: 'Diária',
      horarios: ['08:00'],
      observacoes: '',
      dataInicio: new Date().toISOString().split('T')[0],
      intervalo: 240, // 4 horas por padrão
    })
    setEditandoId(null)
    setMostrarForm(false)
    setNovoHorario('08:00')
    setErro('')
  }, [])

  // Estatísticas sobre medicamentos
  const estatisticas = useMemo(() => {
    const total = medicamentos.length
    const tomadosHoje = medicamentos.filter(med => {
      if (!med.ultimaTomada) return false
      const dataUltimaTomada = med.ultimaTomada.split('T')[0]
      const hoje = new Date().toISOString().split('T')[0]
      return dataUltimaTomada === hoje
    }).length
    
    const percentualTomados = total > 0 ? Math.round((tomadosHoje / total) * 100) : 0
    
    return {
      total,
      tomadosHoje,
      percentualTomados
    }
  }, [medicamentos])

  // Próxima dose calculada
  const proximaDose = useMemo(() => {
    if (medicamentos.length === 0) return { texto: "N/A", descricao: "Sem medicamentos" };
    
    const agora = new Date();
    const medicamentosOrdenados = [...medicamentos].sort((a, b) => {
      // Encontrar o próximo horário para cada medicamento
      const horariosA = a.horarios.map(h => {
        const [hora, minuto] = h.split(':').map(Number);
        const dataHora = new Date(agora);
        dataHora.setHours(hora, minuto, 0, 0);
        // Se o horário já passou hoje, considerar para amanhã
        if (dataHora < agora) {
          dataHora.setDate(dataHora.getDate() + 1);
        }
        return dataHora;
      });
      
      const horariosB = b.horarios.map(h => {
        const [hora, minuto] = h.split(':').map(Number);
        const dataHora = new Date(agora);
        dataHora.setHours(hora, minuto, 0, 0);
        if (dataHora < agora) {
          dataHora.setDate(dataHora.getDate() + 1);
        }
        return dataHora;
      });
      
      // Pegar o próximo horário mais próximo para cada medicamento
      const proximoA = horariosA.sort((x, y) => x.getTime() - y.getTime())[0];
      const proximoB = horariosB.sort((x, y) => x.getTime() - y.getTime())[0];
      
      return proximoA.getTime() - proximoB.getTime();
    });
    
    // Pegar o primeiro medicamento (o com próxima dose mais próxima)
    const proximoMedicamento = medicamentosOrdenados[0];
    
    // Calcular quanto tempo falta
    const proximoHorario = proximoMedicamento.horarios
      .map(h => {
        const [hora, minuto] = h.split(':').map(Number);
        const dataHora = new Date(agora);
        dataHora.setHours(hora, minuto, 0, 0);
        if (dataHora < agora) {
          dataHora.setDate(dataHora.getDate() + 1);
        }
        return dataHora;
      })
      .sort((a, b) => a.getTime() - b.getTime())[0];
    
    const diffMs = proximoHorario.getTime() - agora.getTime();
    const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutos = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    let textoTempo;
    if (diffHoras > 0) {
      textoTempo = `${diffHoras}h${diffMinutos > 0 ? ` ${diffMinutos}m` : ''}`;
    } else {
      textoTempo = `${diffMinutos}m`;
    }
    
    return {
      texto: textoTempo,
      descricao: proximoMedicamento.nome
    };
  }, [medicamentos])

  // Opções para frequência de medicamentos
  const opcoesFrequencia = [
    { value: 'Diária', label: 'Diária' },
    { value: 'Semanal', label: 'Semanal' },
    { value: 'Mensal', label: 'Mensal' },
    { value: 'Conforme necessário', label: 'Conforme necessário' },
  ]

  // Opções para intervalo entre doses
  const opcoesIntervalo = [
    { value: '60', label: '1 hora' },
    { value: '120', label: '2 horas' },
    { value: '180', label: '3 horas' },
    { value: '240', label: '4 horas' },
    { value: '360', label: '6 horas' },
    { value: '480', label: '8 horas' },
    { value: '720', label: '12 horas' },
    { value: '1440', label: '24 horas' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <Card className="flex-1">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Registro de Medicamentos
            </h2>
            <Button
              onClick={() => {
                resetForm()
                setMostrarForm(true)
              }}
              icon={<Plus className="h-4 w-4" />}
              aria-label="Adicionar novo medicamento"
            >
              Novo Medicamento
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <StatCard
              title="Total de Medicamentos"
              value={estatisticas.total}
              icon={<Pill className="h-5 w-5" />}
            />
            
            <StatCard
              title="Tomados Hoje"
              value={estatisticas.tomadosHoje}
              icon={<Check className="h-5 w-5" />}
              description={`${estatisticas.percentualTomados}% dos medicamentos`}
            />
            
            <StatCard
              title="Próxima Dose"
              value={proximaDose.texto}
              icon={<Clock className="h-5 w-5" />}
              description={proximaDose.descricao}
            />
          </div>
          
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
            Seus Medicamentos
          </h3>
          
          <MedicamentosList
            medicamentos={medicamentos}
            onEdit={iniciarEdicao}
            onDelete={(id) => removerMedicamento && removerMedicamento(id)}
            onRegistrarTomada={handleRegistrarTomada}
          />
        </Card>
      </div>

      {/* Modal para adicionar/editar medicamento */}
      <Modal
        isOpen={mostrarForm}
        onClose={resetForm}
        title={editandoId ? "Editar Medicamento" : "Novo Medicamento"}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={resetForm}>
              Cancelar
            </Button>
            <Button 
              onClick={editandoId ? salvarEdicao : handleAdicionarMedicamento}
            >
              {editandoId ? "Salvar Alterações" : "Adicionar Medicamento"}
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
            value={novoMedicamento.nome}
            onChange={(e) => setNovoMedicamento({ ...novoMedicamento, nome: e.target.value })}
            label="Nome do Medicamento"
            placeholder="Ex: Ritalina, Fluoxetina"
            required
          />
          
          <Input
            value={novoMedicamento.dosagem}
            onChange={(e) => setNovoMedicamento({ ...novoMedicamento, dosagem: e.target.value })}
            label="Dosagem"
            placeholder="Ex: 10mg, 1 comprimido"
          />
          
          <Select
            value={novoMedicamento.frequencia}
            onChange={(e) => setNovoMedicamento({ ...novoMedicamento, frequencia: e.target.value })}
            label="Frequência"
            options={opcoesFrequencia}
          />
          
          <Select
            value={novoMedicamento.intervalo?.toString() || '240'}
            onChange={(e) => setNovoMedicamento({ ...novoMedicamento, intervalo: parseInt(e.target.value) })}
            label="Intervalo entre doses"
            options={opcoesIntervalo}
            helpText="Tempo mínimo recomendado entre uma dose e outra"
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Horários
            </label>
            <div className="flex gap-2 mb-2">
              <Input
                type="time"
                value={novoHorario}
                onChange={(e) => setNovoHorario(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={adicionarHorario}
                aria-label="Adicionar horário"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {novoMedicamento.horarios.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {novoMedicamento.horarios.map((horario) => (
                  <Badge key={horario} variant="primary" className="flex items-center gap-1">
                    <Clock className="h-3 w-3 mr-1" />
                    {horario}
                    <button
                      onClick={() => removerHorario(horario)}
                      className="ml-1 text-blue-700 hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-100"
                      aria-label={`Remover horário ${horario}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
          
          <Input
            type="date"
            value={novoMedicamento.dataInicio}
            onChange={(e) => setNovoMedicamento({ ...novoMedicamento, dataInicio: e.target.value })}
            label="Data de Início"
          />
          
          <Textarea
            value={novoMedicamento.observacoes}
            onChange={(e) => setNovoMedicamento({ ...novoMedicamento, observacoes: e.target.value })}
            label="Observações (opcional)"
            placeholder="Adicione informações importantes sobre o medicamento..."
          />
        </div>
      </Modal>
    </div>
  )
}
