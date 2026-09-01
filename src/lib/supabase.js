import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Set these in a .env file (see .env.example) — never hardcode real keys.
// EXPO_PUBLIC_ vars are the only ones Expo exposes to client code, and the
// anon key is safe to ship in the client: it only grants what your Row
// Level Security policies (see supabase/migrations/0001_init.sql) allow.
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn(
    "Missing EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY. " +
    "Copy .env.example to .env and fill in your Supabase project's values."
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // we handle the reset-password deep link manually
  },
});
