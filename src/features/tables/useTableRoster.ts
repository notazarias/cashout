import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { listTableRoster } from './tablesApi'
import type { TableRosterEntry } from './types'

export function useTableRoster(tableId: string | null) {
  const [entries, setEntries] = useState<TableRosterEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!tableId) {
      setEntries([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      setEntries(await listTableRoster(tableId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load roster.')
    } finally {
      setLoading(false)
    }
  }, [tableId])

  useEffect(() => {
    void refresh()
  }, [refresh])

  useEffect(() => {
    if (!tableId) return
    const channel = supabase
      .channel(`table-roster-${tableId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'sessions', filter: `table_id=eq.${tableId}` },
        () => void refresh(),
      )
      .subscribe()
    return () => {
      void supabase.removeChannel(channel)
    }
  }, [tableId, refresh])

  return { entries, loading, error, refresh }
}
