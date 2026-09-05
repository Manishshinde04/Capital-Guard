import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase, hasCredentials } from '../lib/supabase';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  organization: string | null;
  job_role: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  isDemoMode: boolean;
  signUp: (email: string, password: string, fullName: string, org?: string, role?: string) => Promise<{ error: string | null; needsVerification: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: string | null }>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: string | null }>;
  resendVerification: (email: string) => Promise<{ error: string | null }>;
}

// ─── Demo Mode User (fallback when no Supabase credentials) ──────────────────

const DEMO_USER: User = {
  id: 'demo-user-001',
  email: 'demo@capitalguard.app',
  email_confirmed_at: new Date().toISOString(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  app_metadata: {},
  user_metadata: { full_name: 'Demo User' },
  aud: 'authenticated',
  role: 'authenticated',
};

const DEMO_SESSION: Session = {
  access_token: 'demo-token',
  refresh_token: 'demo-refresh',
  expires_in: 3600,
  expires_at: Date.now() / 1000 + 3600,
  token_type: 'bearer',
  user: DEMO_USER,
};

const DEMO_PROFILE: UserProfile = {
  id: 'demo-user-001',
  email: 'demo@capitalguard.app',
  full_name: 'Demo User',
  avatar_url: null,
  organization: 'CapitalGuard Demo',
  job_role: 'Portfolio Manager',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // If no credentials, operate in demo mode after a brief delay
  const isDemoMode = !hasCredentials;

  // ─── Load Profile ───────────────────────────────────────────────────────────

  const loadProfile = useCallback(async (userId: string, userEmail: string) => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !data) {
        // Create profile if it doesn't exist
        const newProfile: Partial<UserProfile> = {
          id: userId,
          email: userEmail,
          full_name: '',
          avatar_url: null,
          organization: null,
          job_role: null,
        };
        await supabase.from('profiles').upsert(newProfile);
        setProfile({ ...newProfile, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as UserProfile);
      } else {
        setProfile(data as UserProfile);
      }
    } catch {
      // Silently fail — profile load is non-critical
    }
  }, []);

  // ─── Init: Check session on mount ───────────────────────────────────────────

  useEffect(() => {
    if (isDemoMode) {
      // Demo mode: auto-sign in with demo credentials
      const savedDemoAuth = localStorage.getItem('cg_demo_auth');
      if (savedDemoAuth === 'true') {
        setUser(DEMO_USER);
        setSession(DEMO_SESSION);
        setProfile(DEMO_PROFILE);
      }
      setLoading(false);
      return;
    }

    // Real Supabase mode
    supabase!.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id, session.user.email ?? '');
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase!.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (event === 'SIGNED_IN' && session?.user) {
        await loadProfile(session.user.id, session.user.email ?? '');
      }
      if (event === 'SIGNED_OUT') {
        setProfile(null);
      }
      if (event === 'PASSWORD_RECOVERY') {
        // handled by reset password page
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [isDemoMode, loadProfile]);

  // ─── Auth Methods ────────────────────────────────────────────────────────────

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    org?: string,
    role?: string
  ): Promise<{ error: string | null; needsVerification: boolean }> => {
    if (isDemoMode) {
      // Demo mode sign up
      localStorage.setItem('cg_demo_auth', 'true');
      setUser(DEMO_USER);
      setSession(DEMO_SESSION);
      setProfile(DEMO_PROFILE);
      return { error: null, needsVerification: false };
    }

    const { data, error } = await supabase!.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, organization: org, job_role: role },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      if (error.message.includes('already registered')) return { error: 'An account with this email already exists.', needsVerification: false };
      if (error.message.includes('Password')) return { error: 'Password must be at least 6 characters.', needsVerification: false };
      return { error: error.message, needsVerification: false };
    }

    const needsVerification = !data.user?.email_confirmed_at;
    return { error: null, needsVerification };
  };

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    if (isDemoMode) {
      localStorage.setItem('cg_demo_auth', 'true');
      setUser(DEMO_USER);
      setSession(DEMO_SESSION);
      setProfile(DEMO_PROFILE);
      return { error: null };
    }

    const { error } = await supabase!.auth.signInWithPassword({ email, password });
    if (error) {
      if (error.message.includes('Invalid login')) return { error: 'Email or password is incorrect.' };
      if (error.message.includes('Email not confirmed')) return { error: 'Please verify your email address before continuing.' };
      if (error.message.includes('fetch')) return { error: 'Unable to connect to the authentication service. Please try again.' };
      return { error: error.message };
    }
    return { error: null };
  };

  const signOut = async () => {
    if (isDemoMode) {
      localStorage.removeItem('cg_demo_auth');
      setUser(null);
      setSession(null);
      setProfile(null);
      return;
    }
    await supabase!.auth.signOut();
  };

  const resetPassword = async (email: string): Promise<{ error: string | null }> => {
    if (isDemoMode) return { error: null };
    const { error } = await supabase!.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) return { error: error.message };
    return { error: null };
  };

  const updatePassword = async (newPassword: string): Promise<{ error: string | null }> => {
    if (isDemoMode) return { error: null };
    const { error } = await supabase!.auth.updateUser({ password: newPassword });
    if (error) return { error: error.message };
    return { error: null };
  };

  const updateProfile = async (updates: Partial<UserProfile>): Promise<{ error: string | null }> => {
    if (!user) return { error: 'Not authenticated.' };
    if (isDemoMode) {
      setProfile(prev => prev ? { ...prev, ...updates } : null);
      return { error: null };
    }
    const { error } = await supabase!
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', user.id);
    if (error) return { error: error.message };
    setProfile(prev => prev ? { ...prev, ...updates } : null);
    return { error: null };
  };

  const resendVerification = async (email: string): Promise<{ error: string | null }> => {
    if (isDemoMode) return { error: null };
    const { error } = await supabase!.auth.resend({ type: 'signup', email });
    if (error) return { error: error.message };
    return { error: null };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        isDemoMode,
        signUp,
        signIn,
        signOut,
        resetPassword,
        updatePassword,
        updateProfile,
        resendVerification,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
