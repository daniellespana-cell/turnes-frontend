import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Cargar variables de entorno desde .env.local
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '.env.local') });

// ⚠️ IMPORTANTE: Necesitas el SERVICE_ROLE_KEY para saltarte la seguridad RLS
// Si usas el ANON_KEY, Supabase devolverá 0 resultados por seguridad.
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!process.env.VITE_SUPABASE_SERVICE_ROLE_KEY) {
    console.warn("\n⚠️ ADVERTENCIA: No se encontró VITE_SUPABASE_SERVICE_ROLE_KEY en .env.local.");
    console.warn("⚠️ Con la clave pública (ANON_KEY), es probable que obtengas 0 resultados debido a las políticas de seguridad (RLS).\n");
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function buscarPostulantesGiron() {
    console.log("🔍 Consultando la base de datos de Turnes de forma segura...");
    
    // Obtenemos todos los perfiles que sean postulantes
    const { data, error } = await supabase
        .from('perfiles')
        .select('*')
        .eq('rol', 'postulante');
        
    if (error) {
        console.error("❌ Error de Supabase:", error.message);
        return;
    }
    
    console.log(`📊 Total de postulantes en la plataforma: ${data.length}`);
    
    if (data.length === 0) return;

    // Filtramos los que tengan "Girón" o "Giron" en su dirección, ubicación o bio
    const postulantesGiron = data.filter(p => {
        const datosTexto = JSON.stringify(p).toLowerCase();
        return datosTexto.includes('giron') || datosTexto.includes('girón');
    });

    console.log(`📍 Postulantes encontrados en Girón: ${postulantesGiron.length}\n`);
    
    postulantesGiron.forEach((p, i) => {
        console.log(`--- 👤 Postulante ${i + 1} ---`);
        console.log(`Nombre:       ${p.nombre_display || 'Sin nombre'}`);
        // Verificamos dónde quedó guardada la ubicación (direccion, location, etc.)
        console.log(`Ubicación:    ${p.direccion || p.location || 'No especificada en columna estándar'}`);
        console.log(`Sector:       ${p.sector || 'N/A'}`);
        console.log(`Habilidades:  ${p.skills ? p.skills.join(', ') : 'Ninguna'}`);
        console.log(`Bio:          ${p.bio ? p.bio.substring(0, 50) + '...' : 'N/A'}`);
        console.log(`Status:       ${p.verificado ? '✅ Verificado' : '⏳ Pendiente'}`);
        console.log('');
    });
}

buscarPostulantesGiron();
