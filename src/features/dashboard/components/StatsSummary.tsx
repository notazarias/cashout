import type { ReactNode } from 'react'
import { Money, Mono } from '@/components/ui/Mono'

function StatTile({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rounded-sm border border-sage/30 bg-felt px-4 py-3">
      <div className="mb-1 font-sans text-xs uppercase tracking-wide text-sage">{label}</div>
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
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <StatTile label="Sessions">
        <Mono className="text-paper">{sessionCount}</Mono>
      </StatTile>
      <StatTile label="Win Rate">
        <Mono className="text-paper">{winRate === null ? '—' : `${Math.round(winRate * 100)}%`}</Mono>
      </StatTile>
      <StatTile label="$ / Session">
        {avgPerSessionCents === null ? <Mono className="text-sage">—</Mono> : <Money cents={avgPerSessionCents} />}
      </StatTile>
      <StatTile label="$ / Hour">
        {avgPerHourCents === null ? <Mono className="text-sage">—</Mono> : <Money cents={avgPerHourCents} />}
      </StatTile>
    </div>
  )
}
