import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/app/lib/supabase/admin'

export async function POST() {
  try {
    // Limpar todas as tabelas e criar função de consulta
    await supabaseAdmin.rpc('setup_test_database', {
      sql: `
        -- Desabilitar restrições de chave estrangeira temporariamente
        SET session_replication_role = 'replica';

        -- Limpar todas as tabelas
        TRUNCATE TABLE medications CASCADE;
        TRUNCATE TABLE daily_routines CASCADE;
        TRUNCATE TABLE profiles CASCADE;
        
        -- Reabilitar restrições de chave estrangeira
        SET session_replication_role = 'origin';

        -- Criar usuário de teste
        INSERT INTO auth.users (
          instance_id,
          id,
          aud,
          role,
          email,
          encrypted_password,
          email_confirmed_at,
          created_at,
          updated_at
        ) VALUES (
          '00000000-0000-0000-0000-000000000000',
          '11111111-1111-1111-1111-111111111111',
          'authenticated',
          'authenticated',
          'teste@stayfocus.app',
          '$2a$10$Q7XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
          NOW(),
          NOW(),
          NOW()
        );

        -- Criar perfil de teste
        INSERT INTO profiles (
          id,
          username,
          full_name,
          created_at,
          updated_at
        ) VALUES (
          '11111111-1111-1111-1111-111111111111',
          'teste',
          'Usuário de Teste',
          NOW(),
          NOW()
        );

        -- Criar rotina de teste
        INSERT INTO daily_routines (
          id,
          user_id,
          title,
          description,
          start_time,
          duration_minutes,
          created_at,
          updated_at
        ) VALUES (
          '22222222-2222-2222-2222-222222222222',
          '11111111-1111-1111-1111-111111111111',
          'Rotina de Teste',
          'Uma rotina para testar a inserção de dados',
          '08:00:00',
          30,
          NOW(),
          NOW()
        );

        -- Criar medicamento de teste
        INSERT INTO medications (
          id,
          user_id,
          name,
          dosage,
          frequency,
          time_of_day,
          created_at,
          updated_at
        ) VALUES (
          '33333333-3333-3333-3333-333333333333',
          '11111111-1111-1111-1111-111111111111',
          'Medicamento de Teste',
          '10mg',
          'Diário',
          ARRAY['08:00:00'::time, '20:00:00'::time],
          NOW(),
          NOW()
        );

        -- Criar função de consulta
        CREATE OR REPLACE FUNCTION query_test_data()
        RETURNS TABLE (result json) AS $$
        BEGIN
          RETURN QUERY
          WITH test_profile AS (
            SELECT *
            FROM profiles
            WHERE username = 'teste'
            LIMIT 1
          ),
          test_routines AS (
            SELECT *
            FROM daily_routines
            WHERE user_id = (SELECT id FROM test_profile)
          ),
          test_medications AS (
            SELECT *
            FROM medications
            WHERE user_id = (SELECT id FROM test_profile)
          )
          SELECT 
            json_build_object(
              'profile', (SELECT row_to_json(test_profile.*) FROM test_profile),
              'routines', COALESCE((SELECT json_agg(row_to_json(test_routines.*)) FROM test_routines), '[]'::json),
              'medications', COALESCE((SELECT json_agg(row_to_json(test_medications.*)) FROM test_medications), '[]'::json)
            );
        END;
        $$ LANGUAGE plpgsql;
      `
    })

    return NextResponse.json({
      message: 'Banco de dados resetado com sucesso'
    })
  } catch (error) {
    console.error('Erro ao resetar banco de dados:', error)
    return NextResponse.json(
      {
        message: 'Erro ao resetar banco de dados',
        error
      },
      { status: 500 }
    )
  }
} 