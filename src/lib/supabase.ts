import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Browser-safe Supabase client (uses the public anon key).
 * Safe to import in both Server Components and Client Components.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
