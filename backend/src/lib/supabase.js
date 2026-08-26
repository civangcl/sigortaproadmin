const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dkxuuztfgjtljjmdfdxn.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRreHV1enRmZ2p0bGpqbWRmZHhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYxMzE4OTYsImV4cCI6MjEwMTcwNzg5Nn0.ii6iqiS7o2cAOh_FnNQpb8rqJa8X8SIxEGSawu7AuWg';

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
