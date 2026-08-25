import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/features/auth/authContext'
import { anonSupabase } from '@/lib/anonSupabaseClient'
import { SupabaseAdapter } from '@/lib/dataAdapter/supabaseAdapter'
import { isOpenSession, type OpenSession } from '@/lib/dataAdapter/types'

/** Guest-only. Never calls signInAnonymously — read-only existence check. */
export function useGuestTableSession() {
  const auth = useAuth()
  const [session, setSession] = useState<OpenSession | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (auth.status !== 'guest') {
      setSession(null)
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const { data } = await anonSupabase.auth.getSession()
      if (!data.session) {
        setSession(null)
        return
      }
      const adapter = new SupabaseAdapter(anonSupabase, data.session.user.id)
      const sessions = await adapter.listSessions()
      setSession(sessions.find(isOpenSession) ?? null)
    } finally {
      setLoading(false)
    }
  }, [auth.status])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { session, loading, refresh }
}
