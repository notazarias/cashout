import type { ClosedSession } from '@/lib/dataAdapter/types'

export function netCents(session: ClosedSession): number {
  return session.cashOutCents - session.buyInCents
}

/**
 * Prefers the real elapsed time when both timestamps are present (the live
 * start/close flow); falls back to the manual field for backfilled/legacy
 * sessions, which never get live timestamps.
 */
export function derivedDurationMinutes(
  session: Pick<ClosedSession, 'startedAt' | 'closedAt' | 'durationMinutes'>,
): number | undefined {
  if (session.startedAt && session.closedAt) {
    const ms = new Date(session.closedAt).getTime() - new Date(session.startedAt).getTime()
    return Math.round(ms / 60000)
  }
  return session.durationMinutes
}

export interface ProfitPoint {
  sessionId: string
  date: string
  netCents: number
  cumulativeCents: number
}

/** Sorted by date ascending, running total for the hero chart. */
export function profitOverTime(sessions: ClosedSession[]): ProfitPoint[] {
  const sorted = [...sessions].sort((a, b) => a.date.localeCompare(b.date))
  let running = 0
  return sorted.map((s) => {
    running += netCents(s)
    return { sessionId: s.id, date: s.date, netCents: netCents(s), cumulativeCents: running }
  })
}

export function winRate(sessions: ClosedSession[]): number | null {
  if (sessions.length === 0) return null
  const wins = sessions.filter((s) => netCents(s) > 0).length
  return wins / sessions.length
}

export function avgNetPerSession(sessions: ClosedSession[]): number | null {
  if (sessions.length === 0) return null
  const total = sessions.reduce((sum, s) => sum + netCents(s), 0)
  return total / sessions.length
}

/** Averaged only over sessions where duration was tracked. */
export function avgNetPerHour(sessions: ClosedSession[]): number | null {
  const withDuration = sessions
    .map((s) => ({ session: s, minutes: derivedDurationMinutes(s) }))
    .filter((x): x is { session: ClosedSession; minutes: number } => !!x.minutes && x.minutes > 0)
  if (withDuration.length === 0) return null
  const totalNet = withDuration.reduce((sum, x) => sum + netCents(x.session), 0)
  const totalHours = withDuration.reduce((sum, x) => sum + x.minutes / 60, 0)
  if (totalHours === 0) return null
  return totalNet / totalHours
}

export interface MonthlyVolume {
  month: string // YYYY-MM
  sessionCount: number
  netCents: number
}

/** Groups by calendar month for the volume-vs-performance chart. */
export function volumeByMonth(sessions: ClosedSession[]): MonthlyVolume[] {
  const buckets = new Map<string, MonthlyVolume>()
  for (const s of sessions) {
    const month = s.date.slice(0, 7)
    const bucket = buckets.get(month) ?? { month, sessionCount: 0, netCents: 0 }
    bucket.sessionCount += 1
    bucket.netCents += netCents(s)
    buckets.set(month, bucket)
  }
  return [...buckets.values()].sort((a, b) => a.month.localeCompare(b.month))
}

export interface LocationBreakdown {
  location: string
  sessionCount: number
  netCents: number
}

const UNSPECIFIED_LOCATION = 'Unspecified'

export function breakdownByLocation(sessions: ClosedSession[]): LocationBreakdown[] {
  const buckets = new Map<string, LocationBreakdown>()
  for (const s of sessions) {
    const location = s.locationLabel?.trim() || UNSPECIFIED_LOCATION
    const bucket = buckets.get(location) ?? { location, sessionCount: 0, netCents: 0 }
    bucket.sessionCount += 1
    bucket.netCents += netCents(s)
    buckets.set(location, bucket)
  }
  return [...buckets.values()].sort((a, b) => b.netCents - a.netCents)
}

export function locationsIn(sessions: ClosedSession[]): string[] {
  const set = new Set(sessions.map((s) => s.locationLabel?.trim() || UNSPECIFIED_LOCATION))
  return [...set].sort()
}
