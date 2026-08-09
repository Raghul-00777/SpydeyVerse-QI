import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, checkSupabaseAvailable } from '@/lib/supabase';
import {
  localGetSession,
  localOnAuthStateChange,
  localSignIn,
  localSignUp,
  localSignOut,
  localGetProfile,
  localUpsertProfile,
  localUpdateProfile,
} from '@/lib/localAuth';

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  avatar_url: string | null;
  organization: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  supabaseAvailable: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null; hasSession: boolean }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [supabaseAvailable, setSupabaseAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const available = await checkSupabaseAvailable();
      if (cancelled) return;
      setSupabaseAvailable(available);
    }

    init();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (supabaseAvailable === null) return;

    let subscription: { unsubscribe: () => void } | null = null;

    async function setupAuth() {
      if (supabaseAvailable) {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        if (currentSession?.user) {
          await fetchOrCreateProfile(currentSession.user);
        } else {
          setLoading(false);
        }

        const { data: { subscription: sub } } = supabase.auth.onAuthStateChange((_event, sess) => {
          (async () => {
            setSession(sess);
            setUser(sess?.user ?? null);
            if (sess?.user) {
              await fetchOrCreateProfile(sess.user);
            } else {
              setProfile(null);
              setLoading(false);
            }
          })();
        });
        subscription = sub;
      } else {
        const localSession = localGetSession();
        setSession(localSession);
        setUser(localSession?.user ?? null);
        if (localSession?.user) {
          await fetchOrCreateProfile(localSession.user);
        } else {
          setLoading(false);
        }

        const { data: { subscription: sub } } = localOnAuthStateChange((_event, sess) => {
          (async () => {
            setSession(sess);
            setUser(sess?.user ?? null);
            if (sess?.user) {
              await fetchOrCreateProfile(sess.user);
            } else {
              setProfile(null);
              setLoading(false);
            }
          })();
        });
        subscription = sub;
      }
    }

    setupAuth();

    return () => {
      subscription?.unsubscribe();
    };
  }, [supabaseAvailable]);

  async function fetchOrCreateProfile(authUser: User) {
    try {
      if (supabaseAvailable) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .maybeSingle();

        if (!error && data) {
          setProfile(data);
          return;
        }

        const fullName =
          authUser.user_metadata?.full_name ||
          authUser.email?.split('@')[0] ||
          'User';

        const { data: created } = await supabase
          .from('profiles')
          .upsert({
            id: authUser.id,
            email: authUser.email ?? '',
            full_name: fullName,
            role: 'student',
          }, { onConflict: 'id' })
          .select()
          .maybeSingle();

        if (created) setProfile(created);
      } else {
        const { data: existing } = await localGetProfile(authUser.id);
        if (existing) {
          setProfile(existing);
          return;
        }

        const fullName =
          authUser.user_metadata?.full_name ||
          authUser.email?.split('@')[0] ||
          'User';
        const now = new Date().toISOString();
        const newProfile = {
          id: authUser.id,
          email: authUser.email ?? '',
          full_name: fullName,
          role: 'student',
          avatar_url: null,
          organization: null,
          created_at: now,
          updated_at: now,
        };
        await localUpsertProfile(newProfile);
        setProfile(newProfile);
      }
    } catch {
      // Non-blocking — app still works without a profile row
    } finally {
      setLoading(false);
    }
  }

  async function signIn(email: string, password: string) {
    if (supabaseAvailable) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error };
    }
    const { error } = await localSignIn(email, password);
    return { error };
  }

  async function signUp(email: string, password: string, fullName: string) {
    if (supabaseAvailable) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });

      if (error && error.message.toLowerCase().includes('database error')) {
        const { error: signInErr, data: signInData } = await supabase.auth.signInWithPassword({ email, password });
        if (!signInErr) return { error: null, hasSession: !!signInData?.session };
      }

      return { error, hasSession: !!data?.session };
    }

    const { data, error } = await localSignUp(email, password, fullName);
    return { error, hasSession: !!data?.user };
  }

  async function signOut() {
    if (supabaseAvailable) {
      await supabase.auth.signOut();
    } else {
      await localSignOut();
    }
    setProfile(null);
  }

  async function updateProfile(updates: Partial<Profile>) {
    if (!user) return { error: new Error('Not authenticated') };
    if (supabaseAvailable) {
      const { error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', user.id);
      if (!error) {
        setProfile(prev => (prev ? { ...prev, ...updates } : null));
      }
      return { error };
    }
    const { error } = await localUpdateProfile(user.id, updates);
    if (!error) {
      setProfile(prev => (prev ? { ...prev, ...updates } : null));
    }
    return { error };
  }

  return (
    <AuthContext.Provider
      value={{ user, session, profile, loading, supabaseAvailable: supabaseAvailable ?? false, signIn, signUp, signOut, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
