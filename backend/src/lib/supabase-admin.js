const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dkxuuztfgjtljjmdfdxn.supabase.co';
const supabaseServiceRoleKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceRoleKey) {
  console.warn('WARNING: SUPABASE_SERVICE_ROLE_KEY is not set. Supabase Admin API will not work.');
} else {
  console.log('Supabase Admin configuration available');
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey || 'dummy_key', {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

module.exports = supabaseAdmin;
