import type { SupabaseClient } from '@supabase/supabase-js'
import { LocalStorageAdapter } from './localStorageAdapter'
import { SupabaseAdapter } from './supabaseAdapter'

/**
 * Moves guest-mode localStorage data into the newly-created account.
 * All-or-nothing: guest data is only cleared after every write confirms,
 * so a failed migration leaves the guest data intact for a retry.
 */
export async function migrateGuestDataToAccount(
  client: SupabaseClient,
  userId: string,
): Promise<{ migratedCount: number }> {
  const guestAdapter = new LocalStorageAdapter()
  const accountAdapter = new SupabaseAdapter(client, userId)

  const guestSessions = await guestAdapter.listSessions()
  if (guestSessions.length === 0) return { migratedCount: 0 }

  for (const session of guestSessions) {
    await accountAdapter.createSession({
      date: session.date,
      buyInCents: session.buyInCents,
      cashOutCents: session.cashOutCents,
      durationMinutes: session.durationMinutes,
      locationLabel: session.locationLabel,
    })
  }

  for (const session of guestSessions) {
    await guestAdapter.deleteSession(session.id)
  }

  return { migratedCount: guestSessions.length }
}
