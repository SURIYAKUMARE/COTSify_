import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  // Never run on server
  if (typeof window === "undefined") return null;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (
    !url || !key ||
    url.includes("YOUR_PROJECT_REF") ||
    url.includes("placeholder") ||
    key.includes("your_supabase") ||
    key.includes("placeholder")
  ) return null;

  try {
    if (!_client) _client = createClient(url, key);
    return _client;
  } catch {
    return null;
  }
}

export const isSupabaseConfigured = () => {
  if (typeof window === "undefined") return false;
  return getSupabaseClient() !== null;
};
