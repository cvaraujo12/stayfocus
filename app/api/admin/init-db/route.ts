import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    db: {
      schema: 'public'
    }
  }
)

export async function POST() {
  try {
    // Dividir as queries em partes menores para melhor gerenciamento
    const queries = [
      // Criar tabela de perfis
      `CREATE TABLE IF NOT EXISTS public.profiles (
        id UUID REFERENCES auth.users(id) PRIMARY KEY,
        username TEXT UNIQUE,
        full_name TEXT,
        avatar_url TEXT,
        preferences JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
      );`,
      
      // Habilitar RLS
      `ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;`,
      
      // Criar políticas
      `DROP POLICY IF EXISTS "Usuários podem ver apenas seu próprio perfil" ON public.profiles;
       CREATE POLICY "Usuários podem ver apenas seu próprio perfil"
        ON public.profiles FOR SELECT
        USING (auth.uid() = id);`,
      
      `DROP POLICY IF EXISTS "Usuários podem inserir seu próprio perfil" ON public.profiles;
       CREATE POLICY "Usuários podem inserir seu próprio perfil"
        ON public.profiles FOR INSERT
        WITH CHECK (auth.uid() = id);`,
      
      `DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON public.profiles;
       CREATE POLICY "Usuários podem atualizar seu próprio perfil"
        ON public.profiles FOR UPDATE
        USING (auth.uid() = id);`,
      
      `DROP POLICY IF EXISTS "Admin pode gerenciar todos os perfis" ON public.profiles;
       CREATE POLICY "Admin pode gerenciar todos os perfis"
        ON public.profiles FOR ALL
        USING (auth.role() = 'service_role');`,
      
      // Criar função e trigger para atualização automática
      `CREATE OR REPLACE FUNCTION public.update_updated_at_column()
       RETURNS TRIGGER AS $$
       BEGIN
         NEW.updated_at = TIMEZONE('utc'::text, NOW());
         RETURN NEW;
       END;
       $$ language 'plpgsql';`,
      
      `DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
       CREATE TRIGGER update_profiles_updated_at
        BEFORE UPDATE ON public.profiles
        FOR EACH ROW
        EXECUTE FUNCTION public.update_updated_at_column();`,
      
      // Criar função e trigger para criar perfil após signup
      `CREATE OR REPLACE FUNCTION public.handle_new_user()
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
       $$ language 'plpgsql' SECURITY DEFINER;`,
      
      `DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
       CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();`
    ]

    // Executar cada query separadamente
    for (const query of queries) {
      const { error } = await supabase.rpc('exec_sql', { sql: query })
      if (error) {
        console.error('Erro ao executar query:', error)
        throw error
      }
    }

    return NextResponse.json({
      message: 'Banco de dados inicializado com sucesso',
      success: true
    })
  } catch (error) {
    console.error('Erro ao inicializar banco de dados:', error)
    return NextResponse.json(
      { error: 'Erro ao inicializar banco de dados' },
      { status: 500 }
    )
  }
} 