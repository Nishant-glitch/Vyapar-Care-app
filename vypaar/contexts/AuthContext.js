import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

const AuthContext = createContext({
  session: null,
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      // demo mode — koi session nahi, splash seedha Login pe bhejega
      setLoading(false);
      return undefined;
    }

    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session ?? null);
      setLoading(false);
    });

    // login / logout / token refresh — sab yahin se aate hain
    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession ?? null);
      setLoading(false);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // session milte hi public.users se profile (naam, customer_id) le aao
  useEffect(() => {
    if (!isSupabaseConfigured || !session?.user?.id) {
      setProfile(null);
      return;
    }

    let active = true;
    supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!active) return;
        if (error) console.log('Profile fetch error:', error.message);
        setProfile(data ?? null);
      });

    return () => {
      active = false;
    };
  }, [session?.user?.id]);

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      loading,
      signOut: async () => {
        if (isSupabaseConfigured) await supabase.auth.signOut();
        setSession(null);
        setProfile(null);
      },
    }),
    [session, profile, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
