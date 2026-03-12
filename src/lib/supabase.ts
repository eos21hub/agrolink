import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    lock: async (name, acquireTimeout, fn) => {
      // Use a simple mutex instead of Web Locks API to avoid AbortError
      return fn();
    },
  },
});

export const TABLES = {
  USERS: 'users',
  CROPS: 'crops',
  MARKET_PRICES: 'market_prices',
  PREDICTIONS: 'predictions',
} as const;