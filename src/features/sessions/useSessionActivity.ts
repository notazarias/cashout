import { useCallback, useEffect, useState } from 'react'
import { useDataAdapter } from '@/lib/dataAdapter'
import type { DataAdapter, SessionActivityEntry } from '@/lib/dataAdapter/types'

export function useSessionActivity(sessionId: string | null, overrideAdapter?: DataAdapter) {
  const contextAdapter = useDataAdapter()
  const adapter = overrideAdapter ?? contextAdapter
  const [entries, setEntries] = useState<SessionActivityEntry[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!sessionId) {
      setEntries([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      setEntries(await adapter.listActivity(sessionId))
    } finally {
      setLoading(false)
    }
  }, [adapter, sessionId])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { entries, loading, refresh }
}
