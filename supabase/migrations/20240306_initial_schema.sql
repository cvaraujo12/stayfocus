-- Configuração inicial
CREATE SCHEMA IF NOT EXISTS private;

-- Perfis de usuário estendidos
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    username TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    preferences JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Rotinas diárias
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

-- Lista de medicamentos
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

-- Histórico de conclusão de rotinas
CREATE TABLE IF NOT EXISTS public.routine_completions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    routine_id UUID REFERENCES public.daily_routines(id) ON DELETE CASCADE,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    notes TEXT
);

-- Histórico de medicamentos
CREATE TABLE IF NOT EXISTS public.medication_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    medication_id UUID REFERENCES public.medications(id) ON DELETE CASCADE,
    taken_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    notes TEXT
);

-- Funções e Triggers para atualização automática de updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar triggers para atualização automática
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_daily_routines_updated_at
    BEFORE UPDATE ON public.daily_routines
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_medications_updated_at
    BEFORE UPDATE ON public.medications
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- RLS (Row Level Security) Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routine_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medication_logs ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso para profiles
DROP POLICY IF EXISTS "Usuários podem ver apenas seu próprio perfil" ON public.profiles;
CREATE POLICY "Usuários podem ver apenas seu próprio perfil"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Admin pode gerenciar todos os perfis"
    ON public.profiles FOR ALL
    USING (auth.role() = 'service_role');

-- Políticas de acesso para daily_routines
DROP POLICY IF EXISTS "Usuários podem gerenciar apenas suas próprias rotinas" ON public.daily_routines;
CREATE POLICY "Usuários podem gerenciar apenas suas próprias rotinas"
    ON public.daily_routines FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Admin pode gerenciar todas as rotinas"
    ON public.daily_routines FOR ALL
    USING (auth.role() = 'service_role');

-- Políticas de acesso para medications
DROP POLICY IF EXISTS "Usuários podem gerenciar apenas seus próprios medicamentos" ON public.medications;
CREATE POLICY "Usuários podem gerenciar apenas seus próprios medicamentos"
    ON public.medications FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Admin pode gerenciar todos os medicamentos"
    ON public.medications FOR ALL
    USING (auth.role() = 'service_role');

-- Políticas de acesso para routine_completions
CREATE POLICY "Usuários podem ver apenas conclusões de suas rotinas"
    ON public.routine_completions FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.daily_routines
            WHERE id = routine_completions.routine_id
            AND user_id = auth.uid()
        )
    );

-- Políticas de acesso para medication_logs
CREATE POLICY "Usuários podem ver apenas registros de seus medicamentos"
    ON public.medication_logs FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.medications
            WHERE id = medication_logs.medication_id
            AND user_id = auth.uid()
        )
    );

-- Função para criar perfil automaticamente após signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, avatar_url)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'preferred_username',
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Trigger para criar perfil após signup
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
