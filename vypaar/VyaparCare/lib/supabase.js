// Ye import sabse upar rehna chahiye — @supabase/supabase-js se PEHLE.
// RN ka built-in URL adhoora hai (protocol sirf getter hai), isliye Supabase
// "Cannot assign to property 'protocol' which has only a getter" throw karta hai.
import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';
import { SUPABASE_ANON_KEY as ENV_KEY, SUPABASE_URL as ENV_URL } from '@env';

/**
 * Credentials .env se aate hain — `react-native-dotenv` unhe build time pe
 * `@env` module me inline kar deta hai. Placeholder tab tak rehte hain
 * jab tak aap apne project ke values nahi daalte.
 *
 *   SUPABASE_URL=https://xxxxxxxxxxx.supabase.co
 *   SUPABASE_ANON_KEY=eyJhbGciOi...
 *
 * .env badalne ke baad Metro cache clear karna padta hai:
 *   npm start -- --reset-cache
 */
const PLACEHOLDER_URL = 'https://YOUR-PROJECT-REF.supabase.co';
const PLACEHOLDER_KEY = 'YOUR-ANON-KEY';

export const SUPABASE_URL = ENV_URL || PLACEHOLDER_URL;
export const SUPABASE_ANON_KEY = ENV_KEY || PLACEHOLDER_KEY;

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
