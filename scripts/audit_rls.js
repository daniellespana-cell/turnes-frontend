
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error("❌ Missing Supabase Creds in .env.local");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function runSecurityAudit() {
    console.log("🕵️‍♂️ Starting RLS Security Audit...");

    // 1. Check Public Access (Should be minimal)
    console.log("\n1. Testing Public Access to 'vacantes'...");
    const { data: publicData, error: publicError } = await supabase
        .from('vacantes')
        .select('id, titulo, empresa_id')
        .limit(5);

    if (publicError) {
        console.log("   ✅ Public Access Blocked/Restricted:", publicError.message);
    } else {
        console.log(`   ⚠️ Public Access Allowed. Found ${publicData.length} rows.`);
        if (publicData.length > 0) console.table(publicData);
    }

    // 2. Check 'billeteras' (Sensitive)
    console.log("\n2. Testing Public Access to 'billeteras' (CRITICAL)...");
    const { data: walletData, error: walletError } = await supabase
        .from('billeteras')
        .select('*')
        .limit(5);

    if (walletError || walletData?.length === 0) {
        console.log("   ✅ Wallet Access Secure (No public data).");
    } else {
        console.error("   🚨 CRITICAL: Wallets are publicly visible!", walletData);
    }

    // 3. User Isolation Test (Requires Login - Skipping for basic connectivity check)
    // To do full RLS test, we'd need to signUp two users here. 
    // For now, let's verify if 'profiles' are visible.

    console.log("\n3. Testing Public Access to 'perfiles'...");
    const { data: profileData, error: profileError } = await supabase
        .from('perfiles')
        .select('id, email, rol')
        .limit(5);

    if (profileData && profileData.length > 0) {
        console.log(`   ⚠️ Profiles are public (Often Intended). Found ${profileData.length}.`);
    } else {
        console.log("   ✅ Profiles are private.");
    }
}

runSecurityAudit();
