import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

const AuthContext = createContext({
  session: null,
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
  updateProfile: async () => {},
});

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId) => {
    if (!isSupabaseConfigured || !userId) return;
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.log('Profile fetch error:', error.message);
      } else if (data) {
        setProfile(data);
      }
    } catch (e) {
      console.log('Error in fetchProfile:', e);
    }
  };

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

  // session milte hi public.users se profile (naam, customer_id, profile_photo) le aao
  useEffect(() => {
    if (!isSupabaseConfigured || !session?.user?.id) {
      setProfile(null);
      return;
    }

    fetchProfile(session.user.id);
  }, [session?.user?.id]);

  const refreshProfile = async () => {
    if (session?.user?.id) {
      await fetchProfile(session.user.id);
    }
  };

  const updateProfile = async (updates) => {
    setProfile((prev) => ({ ...prev, ...updates }));
    if (isSupabaseConfigured && session?.user?.id) {
      try {
        await supabase
          .from('users')
          .update(updates)
          .eq('id', session.user.id);
      } catch (err) {
        console.warn('Could not sync profile to Supabase:', err);
      }
    }
  };

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      loading,
      refreshProfile,
      updateProfile,
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
