import { useAuth } from '@/app/providers/AuthProvider';
import { useAppStore } from '@/app/store';
import { Plus } from 'lucide-react';

export function GerenciadorMedicamentos() {
  const { user, loading } = useAuth();
  const { medicamentos, adicionarMedicamento } = useAppStore();

  // Mostra loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redireciona se não estiver autenticado e carregamento terminou
  if (!loading && !user) {
    return <div>Você precisa estar autenticado para gerenciar medicamentos.</div>
  }

  const handleNovoMedicamento = () => {
    if (!adicionarMedicamento) return;
    
    adicionarMedicamento({
      nome: '',
      dosagem: '',
      frequencia: 'diária',
      horarios: [],
      observacoes: '',
      dataInicio: new Date().toISOString().split('T')[0],
      ultimaTomada: null
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Meus Medicamentos
        </h2>
        <button
          onClick={handleNovoMedicamento}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo Medicamento
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {medicamentos?.map((medicamento) => (
          <div
            key={medicamento.id}
            className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md"
          >
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
              {medicamento.nome || 'Novo Medicamento'}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {medicamento.dosagem}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Frequência: {medicamento.frequencia}
            </p>
            {medicamento.ultimaTomada && (
              <p className="text-xs text-gray-400 dark:text-gray-600 mt-2">
                Última tomada: {new Date(medicamento.ultimaTomada).toLocaleString()}
              </p>
            )}
          </div>
        ))}

        {(!medicamentos || medicamentos.length === 0) && (
          <div className="col-span-full flex justify-center items-center p-8 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400">
              Você ainda não tem medicamentos cadastrados
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 