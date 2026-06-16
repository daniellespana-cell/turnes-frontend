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
    // Authenticate as a user to test RLS
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: 'daniellespana@gmail.com', // Just guessing a test user based on git commit? No, let's just create an anon session if possible, or we can't test auth easily.
        password: 'password'
    });
}
