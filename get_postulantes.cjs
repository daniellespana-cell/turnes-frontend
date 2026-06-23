const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://llrveqigkgyafgzofoqh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxscnZlcWlna2d5YWZnem9mb3FoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwODE2MzYsImV4cCI6MjA4NTY1NzYzNn0.AWDDuCzBz9EvE2qZ4t1IR3cjVBODu10WIYQbBgPKu3U';

const supabase = createClient(supabaseUrl, supabaseKey);

async function getPostulantesGiron() {
    console.log("🔍 Consultando la base de datos de Turnes...");
    
    // Obtenemos todos los postulantes para ver su estructura
    const { data, error } = await supabase
        .from('perfiles')
        .select('*')
        .eq('rol', 'postulante');
        
    if (error) {
        console.error("❌ Error:", error.message);
        return;
    }
    
    console.log(`📊 Total de postulantes registrados: ${data.length}`);
    
    // Filtrar los que están en Girón (buscando en campos de texto, bio, o si existe la columna direccion)
    const postulantesGiron = data.filter(p => {
        // Buscar "Giron" o "Girón" en cualquier campo que pueda tener la ubicación
        const searchString = JSON.stringify(p).toLowerCase();
        return searchString.includes('giron') || searchString.includes('girón');
    });

    console.log(`📍 Postulantes encontrados en Girón: ${postulantesGiron.length}`);
    
    postulantesGiron.forEach((p, i) => {
        console.log(`\n--- Postulante ${i + 1} ---`);
        console.log(`Nombre: ${p.nombre_display || 'Sin nombre'}`);
        console.log(`Email: ${p.email || 'No disponible'}`);
        console.log(`Habilidades: ${p.skills ? p.skills.join(', ') : 'Ninguna'}`);
        // Mostrar todos los campos para ver qué guardó realmente
        console.log(`Datos crudos:`, p);
    });
}

getPostulantesGiron();
