import { supabase, TABLES } from '@/lib/supabase';
import type { User } from '@/types';

export interface SignUpData {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  region: string;
}

export interface SignInData {
  email: string;
  password: string;
}

/** Build a minimal User object from Supabase auth user as fallback */
function authUserToProfile(authUser: { id: string; email?: string }): User {
  return {
    id: authUser.id,
    email: authUser.email ?? '',
    full_name: authUser.email?.split('@')[0] ?? 'Farmer',
    region: 'Greater Accra',
    role: 'farmer',
    created_at: new Date().toISOString(),
  };
}

/** Fetch profile row, return fallback if missing so auth still works */
async function fetchProfile(authUser: { id: string; email?: string }): Promise<User> {
  const { data, error } = await supabase
    .from(TABLES.USERS)
    .select('*')
    .eq('id', authUser.id)
    .maybeSingle(); // maybeSingle() returns null instead of error when row missing

  if (error || !data) return authUserToProfile(authUser);
  return data as User;
}

export const authService = {
  async signUp({ email, password, full_name, phone, region }: SignUpData) {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('User creation failed');

    // Insert profile — use upsert so it never fails on duplicate
    const { error: profileError } = await supabase.from(TABLES.USERS).upsert(
      {
        id: authData.user.id,
        email,
        full_name,
        phone: phone || null,
        region,
        role: 'farmer',
      },
      { onConflict: 'id' }
    );

    // Log but don't throw — auth succeeded even if profile insert fails
    if (profileError) console.warn('Profile insert failed (non-fatal):', profileError.message);

    return authData;
  },

  async signIn({ email, password }: SignInData) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    return fetchProfile(user);
  },

  onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user);
        callback(profile);
      } else {
        callback(null);
      }
    });
  },
};
