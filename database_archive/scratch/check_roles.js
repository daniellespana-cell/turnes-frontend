import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkRoles() {
  const { data, error } = await supabase.from('taxonomy_roles').select('id, label').eq('is_active', true);
  if (error) {
    console.error(error);
  } else {
    console.log(`Found ${data.length} roles.`);
    const djs = data.filter(r => r.id === 'DJ' || r.label.toLowerCase().includes('dj'));
    console.log('DJs found:', djs);
    console.log('All IDs:', data.map(r => r.id).join(', '));
  }
}

checkRoles();
