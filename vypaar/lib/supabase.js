import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

/**
 * Credentials .env se aate hain (EXPO_PUBLIC_ prefix zaroori hai, warna
 * Expo unhe bundle me inject nahi karta). Placeholder tab tak rehte hain
 * jab tak aap apne project ke values nahi daalte.
 *
 *   EXPO_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxx.supabase.co
 *   EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
 */
const PLACEHOLDER_URL = 'https://YOUR-PROJECT-REF.supabase.co';
const PLACEHOLDER_KEY = 'YOUR-ANON-KEY';

export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || PLACEHOLDER_URL;
export const SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || PLACEHOLDER_KEY;

/**
 * Jab tak asli keys set nahi hain, app demo mode me chalta hai —
 * auth screens apne purane mock behaviour pe rehte hain aur koi
 * network call nahi jaata.
 */
export const isSupabaseConfigured =
  SUPABASE_URL !== PLACEHOLDER_URL && SUPABASE_ANON_KEY !== PLACEHOLDER_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    // React Native me URL se session detect karne ki zaroorat nahi
    detectSessionInUrl: false,
  },
});

/**
 * App background me ho to token refresh band, foreground pe wapas chalu.
 * Warna app sote waqt bhi refresh timers chalate rehta hai.
 */
if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
}

/** "9876543210" -> "+919876543210" (Supabase E.164 format maangta hai) */
export const toE164 = (digits, countryCode = '91') => {
  const clean = String(digits || '').replace(/[^0-9]/g, '');
  return `+${countryCode}${clean}`;
};
