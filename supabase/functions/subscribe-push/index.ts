import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, baggage, sentry-trace',
}

serve(async (req) => {
  // Manejar el preflight request de CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization')
    if (!authHeader) {
      throw new Error('No autorizado. Falta cabecera Authorization.')
    }

    const token = authHeader.replace(/^Bearer\s+/i, '')

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    )

    // Validar el JWT del usuario
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token)
    
    if (userError || !user) {
      throw new Error(`No autorizado: ${userError?.message || 'Token inválido o expirado'}`)
    }

    const { endpoint, p256dh, auth } = await req.json()

    if (!endpoint || !p256dh || !auth) {
      throw new Error('Faltan parámetros: endpoint, p256dh o auth')
    }

    // Como SSOT, la UI nunca escribe directamente, esta Edge Function lo hace
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Insertar o actualizar la suscripción
    const { error: insertError } = await supabaseAdmin
      .from('push_subscriptions')
      .upsert({
        user_id: user.id,
        endpoint,
        p256dh,
        auth,
        updated_at: new Date().toISOString()
      }, { onConflict: 'endpoint' })

    if (insertError) throw insertError

    return new Response(JSON.stringify({ success: true, message: 'Suscripción guardada correctamente.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Error en Edge Function subscribe-push:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
