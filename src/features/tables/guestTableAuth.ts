import { anonSupabase } from '@/lib/anonSupabaseClient'

/** Creates (once) or reuses the guest's throwaway anonymous table identity. */
export async function ensureGuestTableIdentity(): Promise<string> {
  const { data: existing } = await anonSupabase.auth.getSession()
  if (existing.session) return existing.session.user.id
  const { data, error } = await anonSupabase.auth.signInAnonymously()
  if (error) throw error
  if (!data.session) throw new Error('Could not start a guest table identity.')
  return data.session.user.id
}
