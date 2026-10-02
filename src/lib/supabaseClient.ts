import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://rgklrmenylzuknijzxfm.supabase.co";

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.dummy_anon_key_for_client_realtime";

let clientInstance: SupabaseClient | null = null;

/**
 * Singleton Supabase Client used strictly for subscribing to Realtime broadcasts
 * (live price updates, out-of-stock events, parked cart syncing across checkout lanes).
 * All write transactions and checkout submissions route exclusively through the Laravel REST API.
 */
export function getSupabaseClient(): SupabaseClient {
  if (!clientInstance) {
    clientInstance = createClient(supabaseUrl, supabaseAnonKey, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
  }
  return clientInstance;
}
