import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get the authorization header
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create a regular client to verify the user
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Set the auth header
    supabase.rest.headers = { authorization: authHeader }
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid user' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if user is admin
    const { data: userRole, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (roleError || userRole?.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'User not authorized' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { nome, email, password, role } = await req.json()

    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers()
    const userExists = existingUser.users.find(user => user.email === email)
    
    if (userExists) {
      return new Response(
        JSON.stringify({ 
          error: 'Email já está em uso',
          details: 'Um usuário com este email já foi cadastrado no sistema'
        }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create user with admin client
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        full_name: nome
      }
    })

    if (authError) {
      console.error('Auth error:', authError)
      let errorMessage = 'Erro ao criar usuário'
      
      if (authError.message.includes('already been registered')) {
        errorMessage = 'Email já está em uso'
      } else if (authError.message.includes('duplicate key')) {
        errorMessage = 'Usuário já existe no sistema'
      } else {
        errorMessage = authError.message
      }

      return new Response(
        JSON.stringify({ 
          error: errorMessage,
          details: authError.message
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (authData.user) {
      // Create profile
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          user_id: authData.user.id,
          nome,
          email
        })

      if (profileError) {
        console.error('Profile error:', profileError)
        let errorMessage = 'Erro ao criar perfil do usuário'
        
        if (profileError.message.includes('duplicate key')) {
          errorMessage = 'Perfil já existe para este usuário'
        }

        return new Response(
          JSON.stringify({ 
            error: errorMessage,
            details: profileError.message
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Update or insert user role if admin selected
      if (role === 'admin') {
        const { error: roleError } = await supabaseAdmin
          .from('user_roles')
          .upsert({ user_id: authData.user.id, role: 'admin' }, { onConflict: 'user_id' });

        if (roleError) {
          console.error('Role error:', roleError)
          return new Response(
            JSON.stringify({ 
              error: 'Erro ao definir role do usuário',
              details: roleError.message
            }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
      }

      return new Response(
        JSON.stringify({ user: authData.user }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Failed to create user' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})