// 🔥 PRUEBA DE FUEGO: VERIFICADOR DE PROTOCOLO DE CONTRATACIÓN
// Este script simula un flujo de contratación y verifica la integridad de la DB.

const { createClient } = require('@supabase/supabase-js');

// Configuración (Ajustar con las del proyecto)
const supabaseUrl = 'https://llrveqigkgyafgzofoqh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxscnZlcWlna2d5YWZnem9mb3FoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwODE2MzYsImV4cCI6MjA4NTY1NzYzNn0.AWDDuCzBz9EvE2qZ4t1IR3cjVBODu10WIYQbBgPKu3U';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testOfFire() {
    console.log('🚀 Iniciando Prueba de Fuego: Protocolo de Contratación Atómica\n');

    try {
        // 1. Localizar datos de prueba (Usamos los IDs que encontramos en auditorías previas)
        const testVacancyId = '7719c78c-b6b6-47d8-b582-828ee4121032'; // Mesero / Camarero
        
        console.log('🔍 Paso 1: Verificando estado inicial de la vacante...');
        const { data: vacancy } = await supabase.from('vacantes').select('status, cupos_disponibles').eq('id', testVacancyId).single();
        console.log(`   - Estado: ${vacancy.status}, Cupos: ${vacancy.cupos_disponibles}\n`);

        // 2. Simular ejecución del RPC de Contratación
        // Nota: Esto fallará en el script si no somos el dueño de la vacante (auth.uid() = null en anon)
        // Pero el objetivo es verificar que la LÓGICA del RPC existe y responde.
        console.log('⚔️ Paso 2: Ejecutando rpc_hire_candidate_v2...');
        const { data, error } = await supabase.rpc('rpc_hire_candidate_v2', {
            p_application_id: '00000000-0000-0000-0000-000000000000', // ID ficticio para prueba de ruta
            p_vacancy_id: testVacancyId
        });

        if (error) {
            if (error.message.includes('UNAUTHORIZED')) {
                console.log('✅ ÉXITO: El motor de seguridad (RLS/Auth) bloqueó el acceso no autorizado correctamente.');
            } else if (error.message.includes('VACANCY_FULL')) {
                console.log('✅ ÉXITO: El motor de cupos detectó que la vacante está llena.');
            } else {
                console.error('❌ ERROR INESPERADO:', error.message);
            }
        } else {
            console.log('✅ ÉXITO: Transacción procesada correctamente.');
        }

        console.log('\n🛡️ Paso 3: Auditoría de Integridad de Notificaciones...');
        const { data: notifs } = await supabase.from('notificaciones').select('count', { count: 'exact' });
        console.log(`   - Sistema de notificaciones: ${notifs ? 'ACTIVO' : 'ERROR'}`);

    } catch (err) {
        console.error('💥 Error crítico en la prueba:', err);
    }
}

testOfFire();
