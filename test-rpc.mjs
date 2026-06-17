import { createClient } from '@supabase/supabase-js'
import fs from 'fs';

const SUPABASE_URL = 'https://llrveqigkgyafgzofoqh.supabase.co';
const envContent = fs.readFileSync('.env.local', 'utf8');
const anonKeyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY=(.*)/);

if(anonKeyMatch) {
  const supabase = createClient(SUPABASE_URL, anonKeyMatch[1].trim());
  const reference = 'test-R-123-' + Date.now();
  
  const query = await supabase.rpc('get_wompi_signature', {
    p_reference: reference,
    p_amount_in_cents: 2500000,
    p_user_email: 'test@turnes.co'
  });
  
  console.log('RPC Response:', query);
} else {
  console.log("No anon key found");
}
