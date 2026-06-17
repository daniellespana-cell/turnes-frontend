import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import crypto from 'crypto';

const envContent = fs.readFileSync('.env.local', 'utf8');
const anonKeyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY=(.*)/);

const SUPABASE_URL = 'https://llrveqigkgyafgzofoqh.supabase.co';
const supabase = createClient(SUPABASE_URL, anonKeyMatch[1].trim());

const reference = 'test-R-123-1781601051437';
const amountInCents = 2500000;
const email = 'test@turnes.co';

async function test() {
  const { data, error } = await supabase.rpc('get_wompi_signature', {
    p_reference: reference,
    p_amount_in_cents: amountInCents,
    p_user_email: email
  });
  console.log('RPC Error:', error);
  console.log('RPC Data:', data);
  
  const secret = 'prod_integrity_qskQuTOh8v13d4Gs2kmAyi41jkAgLdqP';
  const cadena = reference + amountInCents.toString() + 'COP' + secret;
  const expectedHash = crypto.createHash('sha256').update(cadena).digest('hex');
  console.log('Expected Hash:', expectedHash);
  if (data && data.signature === expectedHash) {
    console.log('MATCH! The SQL function is correctly using the secret.');
  } else {
    console.log('MISMATCH! The SQL function is using a DIFFERENT secret.');
  }
}
test();
