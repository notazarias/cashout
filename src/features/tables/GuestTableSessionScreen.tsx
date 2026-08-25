import { useEffect, useMemo, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { ActiveSessionScreen } from '@/features/sessions/ActiveSessionScreen'
import { anonSupabase } from '@/lib/anonSupabaseClient'
import { SupabaseAdapter } from '@/lib/dataAdapter/supabaseAdapter'

export function GuestTableSessionScreen() {
  const { id } = useParams<{ id: string }>()
  const [checked, setChecked] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    void anonSupabase.auth.getSession().then(({ data }) => {
      if (cancelled) return
      setUserId(data.session?.user.id ?? null)
      setChecked(true)
    })
    return () => {
      cancelled = true
    }
  }, [])

  // Memoized so the adapter's identity is stable across incidental re-renders
  // — a fresh adapter object every render would give useSessions' refresh()
  // a new dependency each time and needlessly re-fetch.
  const adapter = useMemo(() => (userId ? new SupabaseAdapter(anonSupabase, userId) : null), [userId])

  if (!checked) return <p className="font-sans text-sm text-paper/60">Loading…</p>
  if (!userId || !adapter) return <Navigate to="/app" replace />

  return <ActiveSessionScreen key={id} adapterOverride={adapter} />
}
