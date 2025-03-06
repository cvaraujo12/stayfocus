import { supabaseAdmin } from './admin'

export async function initializeDatabase() {
  try {
    // Criar tabela de perfis
    await supabaseAdmin.rpc('create_profiles_table', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.profiles (
          id UUID REFERENCES auth.users(id) PRIMARY KEY,
          username TEXT UNIQUE,
          full_name TEXT,
          avatar_url TEXT,
          preferences JSONB DEFAULT '{}'::jsonb,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
        );
      `
    })

    // Criar tabela de rotinas diárias
    await supabaseAdmin.rpc('create_daily_routines_table', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.daily_routines (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
          title TEXT NOT NULL,
          description TEXT,
          start_time TIME NOT NULL,
          duration_minutes INTEGER NOT NULL,
          color TEXT DEFAULT '#4A5568',
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
        );
      `
    })

    // Criar tabela de medicamentos
    await supabaseAdmin.rpc('create_medications_table', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.medications (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          dosage TEXT,
          frequency TEXT,
          time_of_day TIME[],
          notes TEXT,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
        );
      `
    })

    // Criar tabela de conclusão de rotinas
    await supabaseAdmin.rpc('create_routine_completions_table', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.routine_completions (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          routine_id UUID REFERENCES public.daily_routines(id) ON DELETE CASCADE,
          completed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
          notes TEXT
        );
      `
    })

    // Criar políticas de acesso
    await supabaseAdmin.rpc('create_access_policies', {
      sql: `
        -- Políticas para profiles
        CREATE POLICY "Permitir leitura anônima de profiles"
          ON public.profiles
          FOR SELECT
          USING (true);

        CREATE POLICY "Usuários podem atualizar próprio perfil"
          ON public.profiles
          FOR UPDATE
          USING (auth.uid() = id);

        -- Políticas para daily_routines
        CREATE POLICY "Permitir leitura anônima de daily_routines"
          ON public.daily_routines
          FOR SELECT
          USING (true);

        CREATE POLICY "Usuários podem gerenciar próprias rotinas"
          ON public.daily_routines
          FOR ALL
          USING (auth.uid() = user_id);

        -- Políticas para medications
        CREATE POLICY "Permitir leitura anônima de medications"
          ON public.medications
          FOR SELECT
          USING (true);

        CREATE POLICY "Usuários podem gerenciar próprios medicamentos"
          ON public.medications
          FOR ALL
          USING (auth.uid() = user_id);

        -- Políticas para routine_completions
        CREATE POLICY "Permitir leitura anônima de routine_completions"
          ON public.routine_completions
          FOR SELECT
          USING (true);
      `
    })

    console.log('✅ Banco de dados inicializado com sucesso!')
    return { success: true }
  } catch (error) {
    console.error('❌ Erro ao inicializar banco de dados:', error)
    return { success: false, error }
  }
} 