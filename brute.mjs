import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import crypto from 'crypto';

const envContent = fs.readFileSync('.env.local', 'utf8');
const anonKeyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY=(.*)/);

const SUPABASE_URL = 'https://llrveqigkgyafgzofoqh.supabase.co';
const supabase = createClient(SUPABASE_URL, anonKeyMatch[1].trim());

const reference = 'test-R-123-1781601051437';
const amountInCents = 2500000;

async function test() {
  const { data } = await supabase.rpc('get_wompi_signature', {
    p_reference: reference,
    p_amount_in_cents: amountInCents,
    p_user_email: 'test@turnes.co'
  });
  const actualHash = data.signature;
  console.log('Actual Hash:', actualHash);
  
  const secretsToTest = [
    'prod_integrity_qskQuTOh8v13d4Gs2kmAyi41jkAgLdqP',
    'prod_integrity_qskQuTOh8v13d4Gs2kmAyi41jkAgLdqP ',
    'prod_integrity_qskQuTOh8v13d4Gs2kmAyi41jkAgLdq',
    "'prod_integrity_qskQuTOh8v13d4Gs2kmAyi41jkAgLdqP'",
    'AQUI_TU_NUEVO_SECRETO',
    'prod_integrity_mKhbHw5Nck1PvqNHr0XZfHOPExlBzUkw'
  ];
  
  for (const s of secretsToTest) {
    const cadena = reference + amountInCents.toString() + 'COP' + s;
    const h = crypto.createHash('sha256').update(cadena).digest('hex');
    if (h === actualHash) {
      console.log('BINGO! The SQL function is using this exact string:', s);
      return;
    }
  }
  console.log('None of the tested strings matched.');
}
test();
