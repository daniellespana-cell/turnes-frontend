const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error("No Authorization header provided")
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''

    // 1. Verify user using Auth API directly (Zero Dependencies)
    const authRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        'Authorization': authHeader,
        'apikey': supabaseAnonKey
      }
    })
    
    if (!authRes.ok) {
      throw new Error("No autorizado o sesión inválida")
    }
    const userResult = await authRes.json()
    const userId = userResult.id

    if (!userId) {
      throw new Error("Token no contiene user ID")
    }

    // 2. Fetch perfil using DB REST API directly
    const dbRes = await fetch(`${supabaseUrl}/rest/v1/perfiles?id=eq.${userId}&select=rol,nombre_display,sector,experiencia_anios`, {
      headers: {
        'Authorization': authHeader,
        'apikey': supabaseAnonKey,
        'Accept': 'application/json'
      }
    })

    if (!dbRes.ok) {
      throw new Error("No se pudo obtener el perfil")
    }
    const perfiles = await dbRes.json()
    const perfil = perfiles[0]

    const role = perfil?.rol || 'trabajador'
    let prompt = ''
    if (role === 'empresa') {
      prompt = `Actúa como experto en RRHH. Escribe una breve y atractiva presentación de la empresa (máx 3 oraciones). Tono corporativo moderno. Datos: Nombre: ${perfil?.nombre_display || 'La Empresa'}, Sector: ${perfil?.sector || 'Varios'}. Ve directo al grano sin saludos.`
    } else {
      prompt = `Actúa como experto en RRHH. Escribe una breve y atractiva biografía para un trabajador (máx 3 oraciones). Tono profesional y motivado. Datos: Nombre: ${perfil?.nombre_display || 'El Profesional'}, Sector: ${perfil?.sector || 'Varios'}, Experiencia: ${perfil?.experiencia_anios || 0} años. Ve directo al grano sin saludos.`
    }

    const openAiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openAiKey) throw new Error('OPENAI_API_KEY no configurada en Supabase')

    // 3. Call OpenAI directly
    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${openAiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Eres un asistente experto en redacción corporativa y perfiles.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 150,
      }),
    })

    const aiData = await aiResponse.json()
    if (!aiResponse.ok) throw new Error('Error OpenAI: ' + (aiData.error?.message || 'Error'))

    const generatedBio = aiData.choices[0].message.content.trim()

    return new Response(JSON.stringify({ bio: generatedBio }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message || 'Error desconocido' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 })
  }
})
