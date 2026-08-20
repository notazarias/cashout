import { useMemo, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Money } from '@/components/ui/Mono'
import { SessionHistoryList } from '@/features/sessions/components/SessionHistoryList'
import { useSessions } from '@/features/sessions/useSessions'
import { LocationBreakdown } from './components/LocationBreakdown'
import { ProfitChart } from './components/ProfitChart'
import { StatsSummary } from './components/StatsSummary'
import { VolumeVsPerformanceChart } from './components/VolumeVsPerformanceChart'
import {
  avgNetPerHour,
  avgNetPerSession,
  breakdownByLocation,
  netCents,
  profitOverTime,
  volumeByMonth,
  winRate,
} from './stats'

export function DashboardPage() {
  const { sessions, loading, error, createSession, updateSession, deleteSession } = useSessions()
  const [locationFilter, setLocationFilter] = useState<string | null>(null)

  const locationRows = useMemo(() => breakdownByLocation(sessions), [sessions])

  const filteredSessions = useMemo(() => {
    if (!locationFilter) return sessions
    return sessions.filter((s) => (s.locationLabel?.trim() || 'Unspecified') === locationFilter)
  }, [sessions, locationFilter])

  const totalNet = useMemo(
    () => filteredSessions.reduce((sum, s) => sum + netCents(s), 0),
    [filteredSessions],
  )

  if (loading) {
    return <p className="font-sans text-sm text-sage">Loading your sessions…</p>
  }

  if (error) {
    return <p className="font-sans text-sm text-brick">{error}</p>
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="font-serif text-xl font-semibold text-paper">
            {locationFilter ?? 'All Locations'}
          </h2>
          <Money cents={totalNet} className="text-2xl" />
        </div>
        <ProfitChart points={profitOverTime(filteredSessions)} />
      </Card>

      <StatsSummary
        winRate={winRate(filteredSessions)}
        avgPerSessionCents={avgNetPerSession(filteredSessions)}
        avgPerHourCents={avgNetPerHour(filteredSessions)}
        sessionCount={filteredSessions.length}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <h2 className="mb-3 font-serif text-lg font-semibold text-paper">Volume vs. Performance</h2>
          <VolumeVsPerformanceChart data={volumeByMonth(filteredSessions)} />
        </Card>
        <Card>
          <h2 className="mb-3 font-serif text-lg font-semibold text-paper">Bankroll by Location</h2>
          <LocationBreakdown rows={locationRows} selected={locationFilter} onSelect={setLocationFilter} />
        </Card>
      </div>

      <SessionHistoryList
        sessions={filteredSessions}
        onCreate={createSession}
        onUpdate={updateSession}
        onDelete={deleteSession}
      />
    </div>
  )
}
