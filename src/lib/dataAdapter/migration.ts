import type { SupabaseClient } from '@supabase/supabase-js'
import { derivedDurationMinutes } from '@/features/dashboard/stats'
import { LocalStorageAdapter } from './localStorageAdapter'
import { SupabaseAdapter } from './supabaseAdapter'
import { isClosedSession } from './types'

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
    if (isClosedSession(session)) {
      await accountAdapter.logCompletedSession({
        date: session.date,
        locationLabel: session.locationLabel,
        buyInCents: session.buyInCents,
        cashOutCents: session.cashOutCents,
        durationMinutes: derivedDurationMinutes(session),
      })
    } else {
      // Rare edge case: guest was mid-session when they created an account.
      // Recreate as a fresh open account-side session — startedAt resets to
      // "now" (small fidelity loss, acceptable vs. adding adapter surface
      // just for this path). Safe because only one open session can exist.
      await accountAdapter.startSession({
        date: session.date,
        locationLabel: session.locationLabel,
        buyInCents: session.buyInCents,
      })
    }
  }

  for (const session of guestSessions) {
    await guestAdapter.deleteSession(session.id)
  }

  return { migratedCount: guestSessions.length }
}
