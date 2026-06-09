import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://jwwxegkyvrvdgaqjxhsy.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable__efDknAQqRg8RhBuqdpUtw_kgVWBm1C';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
