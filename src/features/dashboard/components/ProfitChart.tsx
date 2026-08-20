import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { ProfitPoint } from '../stats'

function formatDollars(cents: number): string {
  return (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

function splitOffset(points: ProfitPoint[]): number {
  const values = points.map((p) => p.cumulativeCents)
  const max = Math.max(...values, 0)
  const min = Math.min(...values, 0)
  if (max <= 0) return 0
  if (min >= 0) return 1
  return max / (max - min)
}

function ChartTooltip({ active, payload }: { active?: boolean; payload?: { payload: ProfitPoint }[] }) {
  if (!active || !payload?.length) return null
  const point = payload[0].payload
  return (
    <div className="rounded-sm border border-sage/40 bg-ink px-3 py-2 font-mono text-xs text-paper shadow-lg">
      <div className="text-sage">{point.date}</div>
      <div className={point.cumulativeCents >= 0 ? 'text-brass' : 'text-brick'}>
        {formatDollars(point.cumulativeCents)}
      </div>
    </div>
  )
}

export function ProfitChart({ points }: { points: ProfitPoint[] }) {
  if (points.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center font-sans text-sm text-sage">
        Log a session to start your profit graph.
      </div>
    )
  }

  const offset = splitOffset(points)

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={points} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
          <defs>
            <linearGradient id="profitSplit" x1="0" y1="0" x2="0" y2="1">
              <stop offset={offset} stopColor="#C9A227" stopOpacity={1} />
              <stop offset={offset} stopColor="#B24B3C" stopOpacity={1} />
            </linearGradient>
            <linearGradient id="profitSplitFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset={offset} stopColor="#C9A227" stopOpacity={0.25} />
              <stop offset={offset} stopColor="#B24B3C" stopOpacity={0.25} />
            </linearGradient>
          </defs>
          <XAxis dataKey="date" hide />
          <YAxis hide domain={['auto', 'auto']} />
          <Tooltip content={<ChartTooltip />} />
          <Area
            type="linear"
            dataKey="cumulativeCents"
            stroke="url(#profitSplit)"
            strokeWidth={2}
            fill="url(#profitSplitFill)"
            isAnimationActive
            animationDuration={600}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
