import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDataAdapter } from '@/lib/dataAdapter'
import {
  DuplicateOpenSessionError,
  isClosedSession,
  isOpenSession,
  type CloseSessionInput,
  type LogCompletedSessionInput,
  type Session,
  type StartSessionInput,
} from '@/lib/dataAdapter/types'

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

  const openSession = useMemo(() => sessions.find(isOpenSession) ?? null, [sessions])
  const closedSessions = useMemo(() => sessions.filter(isClosedSession), [sessions])

  async function startSession(input: StartSessionInput) {
    if (openSession) throw new DuplicateOpenSessionError()
    const session = await adapter.startSession(input)
    setSessions((prev) => [...prev, session])
    return session
  }

  async function addBuyIn(id: string, amountCents: number) {
    const updated = await adapter.addBuyIn(id, amountCents)
    setSessions((prev) => prev.map((s) => (s.id === id ? updated : s)))
    return updated
  }

  async function closeSession(id: string, input: CloseSessionInput) {
    const updated = await adapter.closeSession(id, input)
    setSessions((prev) => prev.map((s) => (s.id === id ? updated : s)))
    return updated
  }

  async function logCompletedSession(input: LogCompletedSessionInput) {
    const session = await adapter.logCompletedSession(input)
    setSessions((prev) => [...prev, session])
    return session
  }

  async function deleteSession(id: string) {
    await adapter.deleteSession(id)
    setSessions((prev) => prev.filter((s) => s.id !== id))
  }

  return {
    sessions,
    openSession,
    closedSessions,
    loading,
    error,
    refresh,
    startSession,
    addBuyIn,
    closeSession,
    logCompletedSession,
    deleteSession,
  }
}
