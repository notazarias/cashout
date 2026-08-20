import { Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { MonthlyVolume } from '../stats'

function formatDollars(cents: number): string {
  return (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

function ChartTooltip({ active, payload }: { active?: boolean; payload?: { payload: MonthlyVolume }[] }) {
  if (!active || !payload?.length) return null
  const point = payload[0].payload
  return (
    <div className="rounded-sm border border-sage/40 bg-ink px-3 py-2 font-mono text-xs text-paper shadow-lg">
      <div className="text-sage">{point.month}</div>
      <div>{point.sessionCount} sessions</div>
      <div className={point.netCents >= 0 ? 'text-brass' : 'text-brick'}>{formatDollars(point.netCents)}</div>
    </div>
  )
}

export function VolumeVsPerformanceChart({ data }: { data: MonthlyVolume[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center font-sans text-sm text-sage">
        Not enough sessions yet to compare volume against results.
      </div>
    )
  }

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
          <CartesianGrid stroke="#5B7A6C" strokeOpacity={0.15} vertical={false} />
          <XAxis dataKey="month" tick={{ fill: '#5B7A6C', fontSize: 11 }} axisLine={{ stroke: '#5B7A6C' }} tickLine={false} />
          <YAxis yAxisId="count" hide />
          <YAxis yAxisId="net" hide />
          <Tooltip content={<ChartTooltip />} />
          <Bar yAxisId="count" dataKey="sessionCount" fill="#5B7A6C" fillOpacity={0.5} radius={[2, 2, 0, 0]} />
          <Line yAxisId="net" type="monotone" dataKey="netCents" stroke="#C9A227" strokeWidth={2} dot={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
