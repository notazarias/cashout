import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
    return <p className="font-sans text-sm text-paper/60">Loading your sessions…</p>
  }

  if (error) {
    return <p className="font-sans text-sm text-loss">{error}</p>
  }

  return (
    <div className="flex flex-col gap-8">
      <ActiveSessionBanner
        session={openSession}
        onStart={async (input) => {
          const session = await startSession(input)
          navigate(`/app/session/${session.id}`)
        }}
      />

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[55fr_45fr] lg:items-start">
        <div className="flex flex-col gap-8">
          <div>
            <p className="mb-2 font-sans text-xs uppercase tracking-wide text-paper/60">
              {locationFilter ?? 'All Locations'} · Running Total
            </p>
            <Money cents={totalNet} className="block text-5xl font-medium tracking-tight md:text-6xl" />
            <div className="mt-4">
              <ProfitChart points={profitOverTime(filteredClosedSessions)} />
            </div>
          </div>

          <StatsSummary
            winRate={winRate(filteredClosedSessions)}
            avgPerSessionCents={avgNetPerSession(filteredClosedSessions)}
            avgPerHourCents={avgNetPerHour(filteredClosedSessions)}
            sessionCount={filteredClosedSessions.length}
          />

          <div className="flex flex-col gap-8 border-t border-paper/10 pt-8">
            <div>
              <h2 className="mb-4 font-serif text-lg text-paper">Volume vs. Performance</h2>
              <VolumeVsPerformanceChart data={volumeByMonth(filteredClosedSessions)} />
            </div>
            <div className="border-t border-paper/10 pt-8">
              <h2 className="mb-4 font-serif text-lg text-paper">Bankroll by Location</h2>
              <LocationBreakdown rows={locationRows} selected={locationFilter} onSelect={setLocationFilter} />
            </div>
          </div>
        </div>

        <div className="lg:sticky lg:top-8 lg:max-h-[calc(100vh-4rem)] lg:overflow-y-auto">
          <SessionHistoryList
            sessions={filteredClosedSessions}
            onCreate={logCompletedSession}
            onDelete={deleteSession}
          />
        </div>
      </div>
    </div>
  )
}
