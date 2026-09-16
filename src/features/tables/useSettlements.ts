import type { SupabaseClient } from '@supabase/supabase-js'
import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { reportError } from '@/lib/sentry'
import { listSettlements } from './settlementsApi'
import type { Settlement } from './types'

export function useSettlements(tableId: string | null, client: SupabaseClient = supabase) {
  const [settlements, setSettlements] = useState<Settlement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!tableId) {
      setSettlements([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      setSettlements(await listSettlements(tableId, client))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settlement.')
      reportError(err, 'load settlements')
    } finally {
      setLoading(false)
    }
  }, [tableId, client])

  useEffect(() => {
    void refresh()
  }, [refresh])

  useEffect(() => {
    if (!tableId) return
    const channel = client
      .channel(`table-settlements-${tableId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'settlements', filter: `table_id=eq.${tableId}` },
        () => void refresh(),
      )
      .subscribe()
    return () => {
      void client.removeChannel(channel)
    }
  }, [tableId, client, refresh])

  return { settlements, loading, error, refresh }
}
