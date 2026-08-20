import { useCallback, useEffect, useState } from 'react'
import { useDataAdapter } from '@/lib/dataAdapter'
import type { NewSessionInput, Session } from '@/lib/dataAdapter/types'

export function useSessions() {
  const adapter = useDataAdapter()
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setSessions(await adapter.listSessions())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sessions.')
    } finally {
      setLoading(false)
    }
  }, [adapter])

  useEffect(() => {
    void refresh()
  }, [refresh])

  async function createSession(input: NewSessionInput) {
    const session = await adapter.createSession(input)
    setSessions((prev) => [...prev, session])
    return session
  }

  async function updateSession(id: string, patch: Partial<NewSessionInput>) {
    const updated = await adapter.updateSession(id, patch)
    setSessions((prev) => prev.map((s) => (s.id === id ? updated : s)))
    return updated
  }

  async function deleteSession(id: string) {
    await adapter.deleteSession(id)
    setSessions((prev) => prev.filter((s) => s.id !== id))
  }

  return { sessions, loading, error, refresh, createSession, updateSession, deleteSession }
}
