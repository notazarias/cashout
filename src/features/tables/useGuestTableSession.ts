import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/features/auth/authContext'
import { anonSupabase } from '@/lib/anonSupabaseClient'
import { SupabaseAdapter } from '@/lib/dataAdapter/supabaseAdapter'
import { isClosedSession, isOpenSession, type ClosedSession, type OpenSession } from '@/lib/dataAdapter/types'

/** Guest-only. Never calls signInAnonymously — read-only existence check. */
export function useGuestTableSession() {
  const auth = useAuth()
  const [session, setSession] = useState<OpenSession | null>(null)
  const [closedSession, setClosedSession] = useState<ClosedSession | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (auth.status !== 'guest') {
      setSession(null)
      setClosedSession(null)
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const { data } = await anonSupabase.auth.getSession()
      if (!data.session) {
        setSession(null)
        setClosedSession(null)
        return
      }
      const adapter = new SupabaseAdapter(anonSupabase, data.session.user.id)
      const sessions = await adapter.listSessions()
      setSession(sessions.find(isOpenSession) ?? null)
      const closedTableSessions = sessions
        .filter(isClosedSession)
        .filter((s) => s.tableId)
        .sort((a, b) => (b.closedAt ?? '').localeCompare(a.closedAt ?? ''))
      setClosedSession(closedTableSessions[0] ?? null)
    } finally {
      setLoading(false)
    }
  }, [auth.status])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { session, closedSession, loading, refresh }
}
