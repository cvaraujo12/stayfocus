import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function deleteServiceUser() {
  try {
    // Primeiro, encontrar o usuário de serviço existente
    const { data: users, error: searchError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('username', 'service_user')
      .single()

    if (searchError) throw searchError

    if (users) {
      // Deletar o perfil
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .delete()
        .eq('id', users.id)

      if (profileError) throw profileError

      // Deletar o usuário
      const { error: userError } = await supabaseAdmin.auth.admin.deleteUser(users.id)
      if (userError) throw userError
    }

    return { success: true, error: null }
  } catch (error) {
    console.error('Erro ao deletar usuário de serviço:', error)
    return { success: false, error }
  }
}

export async function createServiceUser() {
  try {
    console.log('Iniciando criação do usuário de serviço...')
    
    // Primeiro, tentar encontrar e deletar um usuário de serviço existente
    const { data: existingUser, error: searchError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('username', 'service_user')
      .maybeSingle()

    if (searchError) {
      console.error('Erro ao buscar usuário existente:', searchError)
      throw searchError
    }

    if (existingUser) {
      console.log('Usuário de serviço existente encontrado, deletando...')
      // Deletar o perfil existente
      const { error: deleteProfileError } = await supabaseAdmin
        .from('profiles')
        .delete()
        .eq('id', existingUser.id)

      if (deleteProfileError) {
        console.error('Erro ao deletar perfil existente:', deleteProfileError)
        throw deleteProfileError
      }

      // Deletar o usuário existente
      const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(existingUser.id)
      if (deleteUserError) {
        console.error('Erro ao deletar usuário existente:', deleteUserError)
        throw deleteUserError
      }
    }

    console.log('Criando novo usuário de serviço...')
    const userId = uuidv4()
    
    const { data: user, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      id: userId,
      email: 'service@stayfocus.app',
      password: 'StayFocus@2024!',
      email_confirm: true,
      user_metadata: {
        role: 'service_user'
      }
    })

    if (createUserError) {
      console.error('Erro ao criar usuário:', createUserError)
      throw createUserError
    }

    console.log('Usuário criado, criando perfil...')
    // Criar perfil para o usuário de serviço
    if (user.user) {
      const { error: createProfileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: user.user.id,
          username: 'service_user',
          full_name: 'Service User'
        })

      if (createProfileError) {
        console.error('Erro ao criar perfil:', createProfileError)
        throw createProfileError
      }
    }

    console.log('Usuário de serviço criado com sucesso!')
    return { user, error: null }
  } catch (error) {
    console.error('Erro ao criar usuário de serviço:', error)
    return { user: null, error }
  }
}

export { supabaseAdmin } 