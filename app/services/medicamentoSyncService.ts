import { supabase } from '@/supabase/client';
import { fetchData, insertData, updateData, deleteData, checkConnection } from '@/supabase/utils';

// Tipos para medicamentos
export type Medicamento = {
  id: string;
  nome: string;
  dosagem?: string;
  horarios: string[]; // Array de horários formato "HH:MM"
  diasSemana: string[]; // Array de dias da semana: "dom", "seg", etc.
  observacoes?: string;
};

export type RegistroMedicamento = {
  id: string;
  medicamentoId: string;
  dataRegistro: string; // Formato ISO YYYY-MM-DD
  horaRegistro: string; // Formato HH:MM
  tomado: boolean;
  humorAntes?: number; // Escala 1-5
  humorDepois?: number; // Escala 1-5
  observacoes?: string;
};

// Tipos para o Supabase
export type MedicamentoSupabase = {
  id: string;
  user_id: string;
  nome: string;
  dosagem: string | null;
  horarios: string[];
  dias_semana: string[];
  observacoes: string | null;
  created_at?: string;
  updated_at?: string;
};

export type RegistroMedicamentoSupabase = {
  id: string;
  medication_id: string;
  user_id: string;
  data_registro: string;
  hora_registro: string;
  tomado: boolean;
  humor_antes: number | null;
  humor_depois: number | null;
  observacoes: string | null;
  created_at?: string;
  updated_at?: string;
};

// Nomes das tabelas
const MEDICAMENTOS_TABLE = 'medications';
const REGISTROS_TABLE = 'medication_logs';

// Funções de conversão para Medicamentos
export function toMedicamentoSupabase(medicamento: Medicamento, userId: string): Omit<MedicamentoSupabase, 'created_at' | 'updated_at'> {
  return {
    id: medicamento.id,
    user_id: userId,
    nome: medicamento.nome,
    dosagem: medicamento.dosagem || null,
    horarios: medicamento.horarios,
    dias_semana: medicamento.diasSemana,
    observacoes: medicamento.observacoes || null,
  };
}

export function toMedicamento(medicamentoSupabase: MedicamentoSupabase): Medicamento {
  return {
    id: medicamentoSupabase.id,
    nome: medicamentoSupabase.nome,
    dosagem: medicamentoSupabase.dosagem || undefined,
    horarios: medicamentoSupabase.horarios,
    diasSemana: medicamentoSupabase.dias_semana,
    observacoes: medicamentoSupabase.observacoes || undefined,
  };
}

// Funções de conversão para Registros de Medicamentos
export function toRegistroMedicamentoSupabase(registro: RegistroMedicamento, userId: string): Omit<RegistroMedicamentoSupabase, 'created_at' | 'updated_at'> {
  return {
    id: registro.id,
    medication_id: registro.medicamentoId,
    user_id: userId,
    data_registro: registro.dataRegistro,
    hora_registro: registro.horaRegistro,
    tomado: registro.tomado,
    humor_antes: registro.humorAntes || null,
    humor_depois: registro.humorDepois || null,
    observacoes: registro.observacoes || null,
  };
}

export function toRegistroMedicamento(registroSupabase: RegistroMedicamentoSupabase): RegistroMedicamento {
  return {
    id: registroSupabase.id,
    medicamentoId: registroSupabase.medication_id,
    dataRegistro: registroSupabase.data_registro,
    horaRegistro: registroSupabase.hora_registro,
    tomado: registroSupabase.tomado,
    humorAntes: registroSupabase.humor_antes || undefined,
    humorDepois: registroSupabase.humor_depois || undefined,
    observacoes: registroSupabase.observacoes || undefined,
  };
}

// Funções para medicamentos
export async function fetchMedicamentos(userId: string): Promise<Medicamento[]> {
  try {
    // Verifica se está online
    const { online } = await checkConnection();
    if (!online) {
      console.log('Offline: usando dados locais para medicamentos');
      return []; // Retorna vazio para que o sistema use os dados do localStorage
    }

    // Busca medicamentos filtrados por usuário
    const { data, success, error } = await fetchData<MedicamentoSupabase>(MEDICAMENTOS_TABLE);
    
    if (!success || !data) {
      console.error('Erro ao buscar medicamentos:', error);
      return [];
    }

    // Filtra por usuário e converte para o formato local
    const medicamentosDoUsuario = data
      .filter(m => m.user_id === userId)
      .map(toMedicamento);
    
    return medicamentosDoUsuario;
  } catch (error) {
    console.error('Erro ao buscar medicamentos:', error);
    return [];
  }
}

export async function addMedicamento(medicamento: Medicamento, userId: string): Promise<boolean> {
  try {
    // Verifica se está online
    const { online } = await checkConnection();
    if (!online) {
      console.log('Offline: medicamento será sincronizado quando online');
      return false;
    }

    const medicamentoSupabase = toMedicamentoSupabase(medicamento, userId);
    const { success } = await insertData(MEDICAMENTOS_TABLE, medicamentoSupabase);
    
    return success;
  } catch (error) {
    console.error('Erro ao adicionar medicamento:', error);
    return false;
  }
}

export async function updateMedicamento(medicamento: Medicamento, userId: string): Promise<boolean> {
  try {
    // Verifica se está online
    const { online } = await checkConnection();
    if (!online) {
      console.log('Offline: atualização será sincronizada quando online');
      return false;
    }

    const medicamentoSupabase = toMedicamentoSupabase(medicamento, userId);
    const { success } = await updateData(MEDICAMENTOS_TABLE, medicamento.id, medicamentoSupabase);
    
    return success;
  } catch (error) {
    console.error('Erro ao atualizar medicamento:', error);
    return false;
  }
}

export async function deleteMedicamento(id: string): Promise<boolean> {
  try {
    // Verifica se está online
    const { online } = await checkConnection();
    if (!online) {
      console.log('Offline: remoção será sincronizada quando online');
      return false;
    }

    const { success } = await deleteData(MEDICAMENTOS_TABLE, id);
    return success;
  } catch (error) {
    console.error('Erro ao remover medicamento:', error);
    return false;
  }
}

// Funções para registros de medicamentos
export async function fetchRegistrosMedicamento(userId: string): Promise<RegistroMedicamento[]> {
  try {
    // Verifica se está online
    const { online } = await checkConnection();
    if (!online) {
      console.log('Offline: usando dados locais para registros de medicamentos');
      return []; // Retorna vazio para que o sistema use os dados do localStorage
    }

    // Busca registros filtrados por usuário
    const { data, success, error } = await fetchData<RegistroMedicamentoSupabase>(REGISTROS_TABLE);
    
    if (!success || !data) {
      console.error('Erro ao buscar registros de medicamentos:', error);
      return [];
    }

    // Filtra por usuário e converte para o formato local
    const registrosDoUsuario = data
      .filter(r => r.user_id === userId)
      .map(toRegistroMedicamento);
    
    return registrosDoUsuario;
  } catch (error) {
    console.error('Erro ao buscar registros de medicamentos:', error);
    return [];
  }
}

export async function addRegistroMedicamento(registro: RegistroMedicamento, userId: string): Promise<boolean> {
  try {
    // Verifica se está online
    const { online } = await checkConnection();
    if (!online) {
      console.log('Offline: registro será sincronizado quando online');
      return false;
    }

    const registroSupabase = toRegistroMedicamentoSupabase(registro, userId);
    const { success } = await insertData(REGISTROS_TABLE, registroSupabase);
    
    return success;
  } catch (error) {
    console.error('Erro ao adicionar registro de medicamento:', error);
    return false;
  }
}

export async function updateRegistroMedicamento(registro: RegistroMedicamento, userId: string): Promise<boolean> {
  try {
    // Verifica se está online
    const { online } = await checkConnection();
    if (!online) {
      console.log('Offline: atualização será sincronizada quando online');
      return false;
    }

    const registroSupabase = toRegistroMedicamentoSupabase(registro, userId);
    const { success } = await updateData(REGISTROS_TABLE, registro.id, registroSupabase);
    
    return success;
  } catch (error) {
    console.error('Erro ao atualizar registro de medicamento:', error);
    return false;
  }
}

export async function deleteRegistroMedicamento(id: string): Promise<boolean> {
  try {
    // Verifica se está online
    const { online } = await checkConnection();
    if (!online) {
      console.log('Offline: remoção será sincronizada quando online');
      return false;
    }

    const { success } = await deleteData(REGISTROS_TABLE, id);
    return success;
  } catch (error) {
    console.error('Erro ao remover registro de medicamento:', error);
    return false;
  }
}

// Funções de sincronização bidirecional
export async function sincronizarMedicamentos(
  medicamentosLocais: Medicamento[], 
  userId: string
): Promise<Medicamento[]> {
  try {
    // Verifica se está online
    const { online } = await checkConnection();
    if (!online) {
      return medicamentosLocais; // Mantém dados locais se offline
    }

    // Busca medicamentos do servidor
    const medicamentosServidor = await fetchMedicamentos(userId);
    
    // Mapeia IDs para facilitar comparação
    const idsServidor = new Set(medicamentosServidor.map(m => m.id));
    const idsLocais = new Set(medicamentosLocais.map(m => m.id));
    
    // Medicamentos para adicionar (existem localmente mas não no servidor)
    const paraAdicionar = medicamentosLocais.filter(m => !idsServidor.has(m.id));
    
    // Medicamentos para atualizar (existem em ambos)
    const paraAtualizar = medicamentosLocais.filter(m => idsServidor.has(m.id));
    
    // Medicamentos para remover (existem no servidor mas não localmente)
    const paraRemover = medicamentosServidor.filter(m => !idsLocais.has(m.id));
    
    // Executa as operações
    for (const medicamento of paraAdicionar) {
      await addMedicamento(medicamento, userId);
    }
    
    for (const medicamento of paraAtualizar) {
      await updateMedicamento(medicamento, userId);
    }
    
    for (const medicamento of paraRemover) {
      await deleteMedicamento(medicamento.id);
    }
    
    // Retorna os medicamentos do servidor após sincronização
    return await fetchMedicamentos(userId);
  } catch (error) {
    console.error('Erro ao sincronizar medicamentos:', error);
    return medicamentosLocais; // Mantém dados locais em caso de erro
  }
}

export async function sincronizarRegistrosMedicamento(
  registrosLocais: RegistroMedicamento[], 
  userId: string
): Promise<RegistroMedicamento[]> {
  try {
    // Verifica se está online
    const { online } = await checkConnection();
    if (!online) {
      return registrosLocais; // Mantém dados locais se offline
    }

    // Busca registros do servidor
    const registrosServidor = await fetchRegistrosMedicamento(userId);
    
    // Mapeia IDs para facilitar comparação
    const idsServidor = new Set(registrosServidor.map(r => r.id));
    const idsLocais = new Set(registrosLocais.map(r => r.id));
    
    // Registros para adicionar (existem localmente mas não no servidor)
    const paraAdicionar = registrosLocais.filter(r => !idsServidor.has(r.id));
    
    // Registros para atualizar (existem em ambos)
    const paraAtualizar = registrosLocais.filter(r => idsServidor.has(r.id));
    
    // Registros para remover (existem no servidor mas não localmente)
    const paraRemover = registrosServidor.filter(r => !idsLocais.has(r.id));
    
    // Executa as operações
    for (const registro of paraAdicionar) {
      await addRegistroMedicamento(registro, userId);
    }
    
    for (const registro of paraAtualizar) {
      await updateRegistroMedicamento(registro, userId);
    }
    
    for (const registro of paraRemover) {
      await deleteRegistroMedicamento(registro.id);
    }
    
    // Retorna os registros do servidor após sincronização
    return await fetchRegistrosMedicamento(userId);
  } catch (error) {
    console.error('Erro ao sincronizar registros de medicamentos:', error);
    return registrosLocais; // Mantém dados locais em caso de erro
  }
} 