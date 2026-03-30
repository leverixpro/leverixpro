import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("LeverixPro DB Warning: Supabase environment variables are missing. Social Feeds and CopyTrading features will run in volatile local-mode until configured.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
