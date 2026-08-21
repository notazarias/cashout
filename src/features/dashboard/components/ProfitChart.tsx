import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { ProfitPoint } from '../stats'

function formatDollars(cents: number): string {
  return (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

function formatAxisDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
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
    <div className="rounded-sm border border-paper/15 bg-paper-dim px-3 py-2 font-mono text-xs text-paper shadow-lg">
      <div className="text-paper/60">{formatAxisDate(point.date)}</div>
      <div className={point.cumulativeCents >= 0 ? 'text-amber' : 'text-loss'}>
        {formatDollars(point.cumulativeCents)}
      </div>
    </div>
  )
}

function ProfitDot({ cx, cy, payload }: { cx?: number; cy?: number; payload?: ProfitPoint }) {
  if (cx === undefined || cy === undefined || !payload) return null
  const positive = payload.cumulativeCents >= 0
  return <circle cx={cx} cy={cy} r={3.5} fill={positive ? '#D4A24C' : '#C0574A'} stroke="none" />
}

const axisTick = { fill: '#EDE7D9', fillOpacity: 0.5, fontSize: 12, fontFamily: 'JetBrains Mono' }

export function ProfitChart({ points }: { points: ProfitPoint[] }) {
  if (points.length === 0) {
    return (
      <div className="flex h-64 items-center font-sans text-sm text-paper/60 md:h-72">
        Log a session to start your profit graph.
      </div>
    )
  }

  const offset = splitOffset(points)

  return (
    <div className="h-64 w-full md:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={points} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="profitSplit" x1="0" y1="0" x2="0" y2="1">
              <stop offset={offset} stopColor="#D4A24C" />
              <stop offset={offset} stopColor="#C0574A" />
            </linearGradient>
            <linearGradient id="profitSplitFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset={offset} stopColor="#D4A24C" stopOpacity={0.2} />
              <stop offset={offset} stopColor="#C0574A" stopOpacity={0.2} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#3E7C74" strokeOpacity={0.12} vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={formatAxisDate}
            tick={axisTick}
            axisLine={{ stroke: '#EDE7D9', strokeOpacity: 0.15 }}
            tickLine={false}
          />
          <YAxis tickFormatter={formatDollars} tick={axisTick} axisLine={false} tickLine={false} width={64} />
          <Tooltip content={<ChartTooltip />} />
          <Area
            type="linear"
            dataKey="cumulativeCents"
            stroke="url(#profitSplit)"
            strokeWidth={2}
            fill="url(#profitSplitFill)"
            dot={<ProfitDot />}
            activeDot={{ r: 5 }}
            isAnimationActive
            animationDuration={600}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
