import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://jwwxegkyvrvdgazjxhsy.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable__efDknAQqRg8RhBuqdpUtw_kgVWBm1C';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,       // Session sauvegardée dans localStorage
    autoRefreshToken: true,     // Refresh automatique du token
    detectSessionInUrl: true,   // Pour les liens magic link / reset password
  }
});