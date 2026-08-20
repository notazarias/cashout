import type { Session } from '@/lib/dataAdapter/types'

export function netCents(session: Session): number {
  return session.cashOutCents - session.buyInCents
}

export interface ProfitPoint {
  sessionId: string
  date: string
  netCents: number
  cumulativeCents: number
}

/** Sorted by date ascending, running total for the hero chart. */
export function profitOverTime(sessions: Session[]): ProfitPoint[] {
  const sorted = [...sessions].sort((a, b) => a.date.localeCompare(b.date))
  let running = 0
  return sorted.map((s) => {
    running += netCents(s)
    return { sessionId: s.id, date: s.date, netCents: netCents(s), cumulativeCents: running }
  })
}

export function winRate(sessions: Session[]): number | null {
  if (sessions.length === 0) return null
  const wins = sessions.filter((s) => netCents(s) > 0).length
  return wins / sessions.length
}

export function avgNetPerSession(sessions: Session[]): number | null {
  if (sessions.length === 0) return null
  const total = sessions.reduce((sum, s) => sum + netCents(s), 0)
  return total / sessions.length
}

/** Averaged only over sessions where duration was tracked. */
export function avgNetPerHour(sessions: Session[]): number | null {
  const timed = sessions.filter((s) => s.durationMinutes && s.durationMinutes > 0)
  if (timed.length === 0) return null
  const totalNet = timed.reduce((sum, s) => sum + netCents(s), 0)
  const totalHours = timed.reduce((sum, s) => sum + (s.durationMinutes ?? 0) / 60, 0)
  if (totalHours === 0) return null
  return totalNet / totalHours
}

export interface MonthlyVolume {
  month: string // YYYY-MM
  sessionCount: number
  netCents: number
}

/** Groups by calendar month for the volume-vs-performance chart. */
export function volumeByMonth(sessions: Session[]): MonthlyVolume[] {
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

export function breakdownByLocation(sessions: Session[]): LocationBreakdown[] {
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

export function locationsIn(sessions: Session[]): string[] {
  const set = new Set(sessions.map((s) => s.locationLabel?.trim() || UNSPECIFIED_LOCATION))
  return [...set].sort()
}
