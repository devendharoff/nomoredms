import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('URL:', supabaseUrl);
// Don't log the full key for safety, just first/last chars
console.log('Key start:', supabaseAnonKey?.substring(0, 5));

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkAdmin() {
    console.log('Checking admin_accounts table...');
    const { data, error } = await supabase
        .from('admin_accounts')
        .select('*');

    if (error) {
        console.error('Error fetching admin accounts:', error);
    } else {
        console.log('Admin accounts found:', data);
    }
}

checkAdmin();
