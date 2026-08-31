import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

/**
 * WOMPI WEBHOOK (Single Source of Truth)
 * Recibe confirmaciones de pago desde Wompi en segundo plano.
 * Valida la firma criptográfica para evitar falsificaciones.
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, baggage, sentry-trace',
};

// Secreto de Eventos de Wompi (Debe estar configurado en Supabase Dashboard Secrets)
// Es diferente a la Llave Pública/Privada o la de Integridad.
const WOMPI_EVENTS_SECRET = Deno.env.get('WOMPI_EVENTS_SECRET'); 
const WOMPI_TEST_EVENTS_SECRET = Deno.env.get('WOMPI_TEST_EVENTS_SECRET'); 
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

/**
 * Valida la firma del evento usando Web Crypto API.
 */
async function validateWompiSignature(payload: any, signature: string, timestamp: string): Promise<boolean> {
  if (!WOMPI_EVENTS_SECRET || !signature || !timestamp) return false;
  
  // Wompi docs: concat(id, status, amount_in_cents, timestamp, secret)
  const id = payload.data.transaction.id;
  const status = payload.data.transaction.status;
  const amount = payload.data.transaction.amount_in_cents;
  
  const encoder = new TextEncoder();

  // Función interna para chequear un secreto específico
  const checkSecret = async (secret: string) => {
    if (!secret) return false;
    const concatenatedString = `${id}${status}${amount}${timestamp}${secret}`;
    const data = encoder.encode(concatenatedString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const expectedSignature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    // Comparación segura contra ataques de tiempo (Timing-safe comparison)
    if (signature.length !== expectedSignature.length) return false;
    let result = 0;
    for (let i = 0; i < signature.length; i++) {
        result |= signature.charCodeAt(i) ^ expectedSignature.charCodeAt(i);
    }
    return result === 0;
  };

  // Verificamos primero con el secreto de Producción, si falla intentamos con el de Pruebas (Sandbox)
  const isProdValid = await checkSecret(WOMPI_EVENTS_SECRET);
  if (isProdValid) return true;

  const isTestValid = await checkSecret(WOMPI_TEST_EVENTS_SECRET);
  return isTestValid;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Obtener y parsear el body
    const bodyText = await req.text();
    const payload = JSON.parse(bodyText);
    
    // 2. Extraer firma de los Headers o del Body (depende de versión de Wompi)
    // Wompi Event Docs (V1)
    const signature = payload.signature?.checksum || req.headers.get('x-event-checksum') || '';
    const timestamp = payload.timestamp?.toString() || '';

    // 3. Validar Firma Criptográfica
    const isValid = await validateWompiSignature(payload, signature, timestamp);
    if (!isValid) {
      console.error('Firma de Webhook de Wompi Inválida', { signature });
      return new Response(JSON.stringify({ error: 'Invalid Signature' }), { status: 401 });
    }

    // 4. Asegurarnos que es un evento de actualización de transacción
    if (payload.event !== 'transaction.updated') {
      return new Response(JSON.stringify({ message: 'Ignored Event' }), { status: 200 });
    }

    const transaction = payload.data.transaction;
    
    // Solo nos interesan las transacciones aprobadas
    if (transaction.status !== 'APPROVED') {
      return new Response(JSON.stringify({ message: 'Not Approved' }), { status: 200 });
    }

    const transactionId = transaction.id;
    const amountInCents = transaction.amount_in_cents;
    const amountInCop = amountInCents / 100;
    const reference = transaction.reference; // userId-type-itemId-timestamp

    // Extraer userId desde la referencia
    // Referencia típica: "userId-type-timestamp" ej: "123e4567-e89b-12d3-a456-426614174000-R-1690000000"
    const parts = reference.split('-');
    if (parts.length < 5) {
      throw new Error(`Referencia mal formada: ${reference}`);
    }
    // uuid = 5 parts
    const userId = parts.slice(0, 5).join('-');

    // 5. Idempotencia: Verificar si ya procesamos esta transacción
    const { data: existingMov, error: checkError } = await supabase
      .from('movimientos')
      .select('id')
      .eq('referencia->>wompi_id', transactionId)
      .maybeSingle();

    if (checkError) throw checkError;
    if (existingMov) {
      console.log(`Transacción ${transactionId} ya fue procesada anteriormente.`);
      return new Response(JSON.stringify({ message: 'Already processed' }), { status: 200 });
    }

    // 6. Actualizar Saldo (Single Source of Truth)
    // Usamos RPC para incremento atómico y evitar Race Conditions
    const { data: walletData, error: walletError } = await supabase.rpc('rpc_acreditar_saldo_webhook', {
      p_billetera_id: userId,
      p_monto: amountInCop,
      p_wompi_id: transactionId,
      p_referencia: reference
    });

    if (walletError) {
      console.error('Error acreditando saldo', walletError);
      throw walletError;
    }

    console.log(`Saldo acreditado exitosamente. Tx: ${transactionId}, Monto: ${amountInCop}`);
    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (error) {
    console.error('Error procesando Webhook de Wompi:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});
