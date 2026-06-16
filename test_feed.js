import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const envContent = fs.readFileSync(path.resolve('C:/Users/R059/turnes_frontend/turnes-vite/.env.local'), 'utf8');
let supabaseUrl = '';
let supabaseKey = '';

envContent.split('\n').forEach(line => {
    if (line.startsWith('VITE_SUPABASE_URL=')) supabaseUrl = line.split('=')[1].trim();
    if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) supabaseKey = line.split('=')[1].trim();
});

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    const { data, error } = await supabase
        .from('vacantes')
        .select(`
            id,
            titulo,
            empresa_id,
            empresas (
                id,
                nombre_comercial,
                logo_url,
                verificado
            )
        `)
        .eq('status', 'activa')
        .limit(2);

    console.log(JSON.stringify({ data, error }, null, 2));
}

test();
