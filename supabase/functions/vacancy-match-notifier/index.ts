import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

// Configuración de Búsqueda
const RADIO_KM = 5;
const HORAS_SPAM = 6;

serve(async (req) => {
    try {
        if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

        const payload = await req.json();
        const vacante = payload.record;

        if (payload.type !== 'INSERT' || vacante.status !== 'activa') {
            return new Response(JSON.stringify({ message: 'No action required.' }), { headers: { 'Content-Type': 'application/json' }});
        }

        console.log(`[Webhook] Vacante detectada: ${vacante.titulo}`);

        const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

        // 1. SOLUCIÓN N+1: El RPC nuevo cruza auth.users internamente y nos devuelve el email
        // Además, filtra automáticamente a quienes ya recibieron un correo en las últimas 6 horas.
        const { data: candidatos, error: rpcError } = await supabaseAdmin.rpc('rpc_get_webhook_candidates', {
            user_lat: vacante.lat,
            user_lng: vacante.lng,
            radio_km: RADIO_KM,
            search_query: vacante.categoria,
            horas_spam: HORAS_SPAM
        });

        if (rpcError) throw new Error(`RPC Error: ${rpcError.message}`);

        if (!candidatos || candidatos.length === 0) {
            console.log('[Webhook] Cero matches (o todos fueron filtrados por Anti-Spam).');
            return new Response(JSON.stringify({ message: 'No candidates matched or all filtered by spam protection.' }), { headers: { 'Content-Type': 'application/json' }});
        }

        console.log(`[Webhook] ${candidatos.length} candidatos listos para Batch Email.`);

        let correosEnviados = 0;
        const candidatoIds = candidatos.map(c => c.id);

        // 2. SOLUCIÓN TIMEOUT: Usar Resend BATCH API (1 Sola llamada HTTP para todos)
        if (RESEND_API_KEY) {
            const batchPayload = candidatos.map(candidato => ({
                from: 'Turnes Alertas <alertas@turnes.co>',
                to: [candidato.email],
                subject: `🎯 ¡Nueva vacante cerca de ti: ${vacante.titulo}!`,
                html: `
                    <div style="font-family: 'Inter', Helvetica, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0a0a0a; color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #27272a;">
                        <div style="padding: 40px; text-align: center; background: linear-gradient(180deg, rgba(20,20,20,1) 0%, rgba(10,10,10,1) 100%); border-bottom: 1px solid #27272a;">
                            <h1 style="margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -1px; color: #ffffff;">Turnes</h1>
                        </div>
                        <div style="padding: 40px;">
                            <h2 style="font-size: 20px; font-weight: 600; margin-top: 0; margin-bottom: 24px;">¡Hola ${candidato.nombre_display.split(' ')[0]}!</h2>
                            <p style="color: #a1a1aa; font-size: 16px; line-height: 1.6; margin-bottom: 32px;">
                                Hemos encontrado una oportunidad laboral que hace <strong style="color: #ffffff;">match perfecto</strong> con tus habilidades, y está a solo <strong style="color: #ffffff;">${(candidato.distancia_mts / 1000).toFixed(1)} km</strong> de ti.
                            </p>
                            
                            <div style="background-color: #18181b; padding: 24px; border-radius: 12px; border: 1px solid #27272a; margin-bottom: 32px;">
                                <h3 style="margin: 0 0 16px 0; font-size: 18px; color: #ffffff;">${vacante.titulo}</h3>
                                <div style="display: flex; flex-direction: column; gap: 12px;">
                                    <p style="margin: 0; color: #a1a1aa; font-size: 15px;">
                                        <strong style="color: #ffffff;">💰 Pago:</strong> $${vacante.pago_monto ? vacante.pago_monto.toLocaleString() : 'A convenir'}
                                    </p>
                                    <p style="margin: 0; color: #a1a1aa; font-size: 15px;">
                                        <strong style="color: #ffffff;">📍 Ubicación:</strong> ${vacante.direccion_formateada || 'Ver en la app'}
                                    </p>
                                </div>
                            </div>
                            
                            <a href="https://turnes.co/dashboard/explorar" 
                               style="display: block; width: 100%; text-align: center; background-color: #ffffff; color: #000000; padding: 16px 0; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-sizing: border-box;">
                               Ver Vacante y Postularme
                            </a>
                        </div>
                        <div style="padding: 24px 40px; text-align: center; border-top: 1px solid #27272a; background-color: #0a0a0a;">
                            <p style="margin: 0; color: #52525b; font-size: 13px;">© 2026 Turnes. Todos los derechos reservados.</p>
                        </div>
                    </div>
                `
            }));

            const res = await fetch('https://api.resend.com/emails/batch', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${RESEND_API_KEY}`
                },
                body: JSON.stringify(batchPayload)
            });

            if (res.ok) {
                correosEnviados = batchPayload.length;
                console.log(`[Webhook] Resend Batch Exitoso: ${correosEnviados} correos enviados.`);
                
                // 3. REGISTRAR HISTORIAL (Anti-Spam)
                // Usamos el RPC para insertar los logs de forma segura
                const { error: logError } = await supabaseAdmin.rpc('rpc_log_batch_notifications', {
                    p_vacante_id: vacante.id,
                    p_candidato_ids: candidatoIds
                });
                
                if (logError) console.error('[Webhook] Error guardando historial Anti-Spam:', logError);
            } else {
                const errText = await res.text();
                console.error('[Webhook] Fallo en Resend Batch:', errText);
            }
        } else {
            console.log(`[Simulación Email] Se habrían enviado ${candidatos.length} correos en batch.`);
            correosEnviados = candidatos.length;
        }

        return new Response(JSON.stringify({ success: true, emails_sent: correosEnviados }), {
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('[Webhook] Error crítico:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
});
