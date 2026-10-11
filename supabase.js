// Shared Supabase client — imported by all pages.
// This prevents "Multiple GoTrueClient instances" warnings and keeps
// the auth session consistent across every page.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export const SUPABASE_URL = "https://mvltzznwdglwaedfzxze.supabase.co";
export const SUPABASE_KEY = "sb_publishable_6Z18S8P-DzDiBcl_EwRuZQ_nrq_8hid";

export const db = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: "fundededge-auth"
  }
});
