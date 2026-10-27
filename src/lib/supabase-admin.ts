import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://gvzumeiybqwmdiuibkfj.supabase.co";

/**
 * Server-only elevated Supabase client.
 * Uses SUPABASE_SERVICE_ROLE_KEY when available to bypass RLS for trusted backend operations
 * (e.g. background scrapers, alert subscriptions, audit logs).
 * Falls back to ANON_KEY in development if service role key is not yet configured.
 */
const serviceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";

export const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
