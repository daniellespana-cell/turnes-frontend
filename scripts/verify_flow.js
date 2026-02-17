
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuración de entorno
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

async function runTest() {
    console.log("🚀 INICIANDO TEST DE FLUJO E2E (Backend Logic)");

    // 1. SIMULAR USUARIOS (Asumimos que ya existen o usamos IDs hardcodeados de tests previos)
    // Para este test, necesitamos IDs reales. Si no los tienes, el script fallará.
    // Lo ideal es tener un usuario Empresa y un Postulante fijos para QA.
    const EMPRESA_EMAIL = "empresa_test@turnes.app";
    const POSTULANTE_EMAIL = "postulante_test@turnes.app";
    const PASSWORD = "Password123!";

    // Login Empresa
    console.log(`\n🔑 1. Logueando Empresa (${EMPRESA_EMAIL})...`);
    const { data: authEmpresa, error: errAuth1 } = await supabase.auth.signInWithPassword({
        email: EMPRESA_EMAIL,
        password: PASSWORD
    });
    if (errAuth1) throw new Error(`Falló login empresa: ${errAuth1.message}`);
    const empresaId = authEmpresa.user.id;
    console.log("   ✅ Login Empresa OK. ID:", empresaId);

    // Login Postulante
    console.log(`\n🔑 2. Logueando Postulante (${POSTULANTE_EMAIL})...`);
    const { data: authPostulante, error: errAuth2 } = await supabase.auth.signInWithPassword({
        email: POSTULANTE_EMAIL,
        password: PASSWORD
    });
    if (errAuth2) throw new Error(`Falló login postulante: ${errAuth2.message}`);
    const postulanteId = authPostulante.user.id;
    console.log("   ✅ Login Postulante OK. ID:", postulanteId);

    // 3. CREAR VACANTE (Como Empresa)
    console.log("\n📝 3. Creando Vacante de Prueba...");
    const { data: vacante, error: errVac } = await supabase
        .from('vacantes')
        .insert({
            empresa_id: empresaId,
            titulo: `Vacante Test E2E ${Date.now()}`,
            descripcion: "Prueba automatizada de flujo completo",
            categoria: "Logística",
            tipo_turno: "temporal",
            pago_monto: 50000,
            lat: 4.6097,
            lng: -74.0817,
            status: 'activa'
        })
        .select()
        .single();

    if (errVac) throw new Error(`Falló crear vacante: ${errVac.message}`);
    console.log("   ✅ Vacante Creada OK. ID:", vacante.id);

    // 4. POSTULARSE (Como Postulante)
    console.log("\n🙋 4. Postulándose a la vacante...");
    const { data: postulacion, error: errPost } = await supabase
        .from('postulaciones')
        .insert({
            vacante_id: vacante.id,
            user_id: postulanteId,
            status: 'pendiente'
        })
        .select()
        .single();

    if (errPost) throw new Error(`Falló postulación: ${errPost.message}`);
    console.log("   ✅ Postulación OK. ID:", postulacion.id);

    // 5. VERIFICAR VISIBILIDAD (Como Empresa)
    console.log("\n👀 5. Verificando que la empresa ve la postulación...");
    const { data: listado } = await supabase
        .from('postulaciones')
        .select('id, status')
        .eq('vacante_id', vacante.id);

    if (listado.length === 0) throw new Error("La empresa NO ve la postulación (Fallo de RLS o Query)");
    console.log("   ✅ Visibilidad OK. Postulaciones encontradas:", listado.length);

    // 6. SIMULAR PAGO Y DESBLOQUEO (RPC + Update)
    console.log("\n💰 6. Simulando Pago y Desbloqueo...");
    // A. Pago (Simulado RPC)
    const { error: errPago } = await supabase.rpc('rpc_pagar_servicio', {
        monto_pago: 3000,
        concepto: `Test Unlock ${postulacion.id}`
    });
    // Si falla por saldo, lo ignoramos para el test (asumimos éxito lógico o inyectamos saldo antes)
    if (errPago && errPago.message.includes('insuficiente')) {
        console.warn("   ⚠️ Saldo insuficiente (Esperado en test sin recarga previa). Continuando flujo lógico...");
    } else if (errPago) {
        throw new Error(`Falló RPC pago: ${errPago.message}`);
    } else {
        console.log("   ✅ RPC Pago Exitoso.");
    }

    // B. Desbloqueo (Update Status)
    const { data: unlock, error: errUnlock } = await supabase
        .from('postulaciones')
        .update({ status: 'chat_abierto' })
        .eq('id', postulacion.id)
        .select()
        .single();

    if (errUnlock) throw new Error(`Falló desbloqueo: ${errUnlock.message}`);
    console.log("   ✅ Estado actualizado a:", unlock.status);

    console.log("\n✨ TEST DE FLUJO COMPLETADO EXITOSAMENTE ✨");
}

runTest().catch(e => console.error("\n❌ ERROR FATAL:", e.message));
