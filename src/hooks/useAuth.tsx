import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { authService } from '@/services/authService';
import type { User } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: Parameters<typeof authService.signUp>[0]) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Get current session synchronously first so ProtectedRoute
    //    doesn't flash redirect to /login on page reload
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        setLoading(false);
        return;
      }
      // Set a minimal user immediately so routing unblocks
      authService.getCurrentUser().then(profile => {
        setUser(profile);
        setLoading(false);
      });
    });

    // 2. Subscribe to future auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT' || !session?.user) {
          setUser(null);
          setLoading(false);
          return;
        }
        // For SIGNED_IN / TOKEN_REFRESHED — fetch full profile
        const profile = await authService.getCurrentUser();
        setUser(profile);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    // Eagerly set user from session so navigate('/dashboard') works immediately
    if (data.user) {
      const profile = await authService.getCurrentUser();
      setUser(profile);
    }
  };

  const signUp = async (data: Parameters<typeof authService.signUp>[0]) => {
    const result = await authService.signUp(data);
    // After sign-up the session may already be active (email confirm disabled)
    if (result.user) {
      const profile = await authService.getCurrentUser();
      setUser(profile);
    }
  };

  const signOut = async () => {
    await authService.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
