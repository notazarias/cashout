import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY.')
}

/**
 * Fully independent GoTrueClient — not an alias for `supabase`. Used only for
 * guests joining a table via signInAnonymously(). Distinct storageKey isolates
 * its persisted session/BroadcastChannel/lock from the main client's; listener
 * isolation from AuthProvider's onAuthStateChange subscription is automatic
 * (each GoTrueClient owns its own emitter map).
 */
export const anonSupabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { storageKey: 'cashout-guest-table-auth' },
})
