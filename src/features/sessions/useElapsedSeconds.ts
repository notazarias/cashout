import { useEffect, useState } from 'react'
import type { OpenSession } from '@/lib/dataAdapter/types'

function computeElapsedSeconds(session: OpenSession, nowMs: number): number {
  if (!session.startedAt) return 0
  const startedMs = new Date(session.startedAt).getTime()
  const referenceMs = session.pausedAt ? new Date(session.pausedAt).getTime() : nowMs
  return Math.max(0, Math.floor((referenceMs - startedMs) / 1000) - session.totalPausedSeconds)
}

/** Ticks every second while the session is active; frozen while paused. */
export function useElapsedSeconds(session: OpenSession): number {
  const [elapsed, setElapsed] = useState(() => computeElapsedSeconds(session, Date.now()))

  useEffect(() => {
    setElapsed(computeElapsedSeconds(session, Date.now()))
    if (session.pausedAt) return
    const interval = setInterval(() => setElapsed(computeElapsedSeconds(session, Date.now())), 1000)
    return () => clearInterval(interval)
  }, [session])

  return elapsed
}

/** Matches the app's existing "Xh Ym" duration vocabulary, not a digital clock. */
export function formatElapsedMinutes(totalSeconds: number): string {
  const totalMinutes = Math.floor(totalSeconds / 60)
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}
