import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Money } from '@/components/ui/Mono'
import { ActiveSessionBanner } from '@/features/sessions/components/ActiveSessionBanner'
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
  const { openSession, closedSessions, loading, error, startSession, logCompletedSession, deleteSession } =
    useSessions()
  const navigate = useNavigate()
  const [locationFilter, setLocationFilter] = useState<string | null>(null)

  const locationRows = useMemo(() => breakdownByLocation(closedSessions), [closedSessions])

  const filteredClosedSessions = useMemo(() => {
    if (!locationFilter) return closedSessions
    return closedSessions.filter((s) => (s.locationLabel?.trim() || 'Unspecified') === locationFilter)
  }, [closedSessions, locationFilter])

  const totalNet = useMemo(
    () => filteredClosedSessions.reduce((sum, s) => sum + netCents(s), 0),
    [filteredClosedSessions],
  )

  if (loading) {
    return <p className="font-sans text-sm text-sage">Loading your sessions…</p>
  }

  if (error) {
    return <p className="font-sans text-sm text-brick">{error}</p>
  }

  return (
    <div className="flex flex-col gap-4">
      <ActiveSessionBanner
        session={openSession}
        onStart={async (input) => {
          const session = await startSession(input)
          navigate(`/app/session/${session.id}`)
        }}
      />

      <Card>
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="font-serif text-xl font-semibold text-paper">
            {locationFilter ?? 'All Locations'}
          </h2>
          <Money cents={totalNet} className="text-2xl" />
        </div>
        <ProfitChart points={profitOverTime(filteredClosedSessions)} />
      </Card>

      <StatsSummary
        winRate={winRate(filteredClosedSessions)}
        avgPerSessionCents={avgNetPerSession(filteredClosedSessions)}
        avgPerHourCents={avgNetPerHour(filteredClosedSessions)}
        sessionCount={filteredClosedSessions.length}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <h2 className="mb-3 font-serif text-lg font-semibold text-paper">Volume vs. Performance</h2>
          <VolumeVsPerformanceChart data={volumeByMonth(filteredClosedSessions)} />
        </Card>
        <Card>
          <h2 className="mb-3 font-serif text-lg font-semibold text-paper">Bankroll by Location</h2>
          <LocationBreakdown rows={locationRows} selected={locationFilter} onSelect={setLocationFilter} />
        </Card>
      </div>

      <SessionHistoryList
        sessions={filteredClosedSessions}
        onCreate={logCompletedSession}
        onDelete={deleteSession}
      />
    </div>
  )
}
