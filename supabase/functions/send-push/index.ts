import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import webpush from 'npm:web-push'

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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Configurar web-push
    webpush.setVapidDetails(
      'mailto:soporte@turnes.co',
      Deno.env.get('VITE_VAPID_PUBLIC_KEY') ?? '', // Debe existir en Supabase envs
      Deno.env.get('VAPID_PRIVATE_KEY') ?? '' // Debe existir en Supabase envs
    )

    const { user_id, title, body, url } = await req.json()

    if (!user_id || !title || !body) {
      throw new Error('Faltan parámetros: user_id, title, o body')
    }

    // 1. Buscar todas las suscripciones del usuario
    const { data: subscriptions, error } = await supabaseClient
      .from('push_subscriptions')
      .select('endpoint, p256dh, auth')
      .eq('user_id', user_id)

    if (error) throw error

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(JSON.stringify({ message: 'El usuario no tiene suscripciones activas.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // 2. Enviar la notificación a cada dispositivo
    const pushPayload = JSON.stringify({
      title,
      body,
      url: url || '/'
    })

    const sendPromises = subscriptions.map((sub) => {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth,
        },
      }

      return webpush.sendNotification(pushSubscription, pushPayload)
        .catch(err => {
          // Si el endpoint expiró o fue revocado, podríamos borrarlo de la base de datos aquí
          console.error('Error enviando a una suscripción:', err)
          if (err.statusCode === 410 || err.statusCode === 404) {
             return supabaseClient.from('push_subscriptions').delete().eq('endpoint', sub.endpoint)
          }
        })
    })

    await Promise.all(sendPromises)

    return new Response(JSON.stringify({ success: true, message: `Enviadas ${subscriptions.length} notificaciones.` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Error en Edge Function:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
