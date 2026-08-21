import type { ReactNode } from 'react'
import { Money, Mono } from '@/components/ui/Mono'

function StatTile({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex-1 px-4 py-2 first:pl-0 sm:py-0">
      <div className="mb-1 font-sans text-xs uppercase tracking-wide text-paper/60">{label}</div>
      <div className="text-lg">{children}</div>
    </div>
  )
}

export function StatsSummary({
  winRate,
  avgPerSessionCents,
  avgPerHourCents,
  sessionCount,
}: {
  winRate: number | null
  avgPerSessionCents: number | null
  avgPerHourCents: number | null
  sessionCount: number
}) {
  return (
    <div className="flex flex-col divide-y divide-paper/10 sm:flex-row sm:divide-x sm:divide-y-0">
      <StatTile label="Sessions">
        <Mono className="text-paper">{sessionCount}</Mono>
      </StatTile>
      <StatTile label="Win Rate">
        <Mono className="text-paper">{winRate === null ? '—' : `${Math.round(winRate * 100)}%`}</Mono>
      </StatTile>
      <StatTile label="$ / Session">
        {avgPerSessionCents === null ? (
          <Mono className="text-paper/60">—</Mono>
        ) : (
          <Money cents={avgPerSessionCents} />
        )}
      </StatTile>
      <StatTile label="$ / Hour">
        {avgPerHourCents === null ? <Mono className="text-paper/60">—</Mono> : <Money cents={avgPerHourCents} />}
      </StatTile>
    </div>
  )
}
