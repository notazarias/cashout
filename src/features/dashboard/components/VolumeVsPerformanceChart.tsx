import { Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { MonthlyVolume } from '../stats'

function formatDollars(cents: number): string {
  return (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

function ChartTooltip({ active, payload }: { active?: boolean; payload?: { payload: MonthlyVolume }[] }) {
  if (!active || !payload?.length) return null
  const point = payload[0].payload
  return (
    <div className="rounded-sm border border-paper/15 bg-paper-dim px-3 py-2 font-mono text-xs text-paper shadow-lg">
      <div className="text-paper/60">{point.month}</div>
      <div>{point.sessionCount} sessions</div>
      <div className={point.netCents >= 0 ? 'text-amber' : 'text-loss'}>{formatDollars(point.netCents)}</div>
    </div>
  )
}

export function VolumeVsPerformanceChart({ data }: { data: MonthlyVolume[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center font-sans text-sm text-paper/60">
        Not enough sessions yet to compare volume against results.
      </div>
    )
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
          <CartesianGrid stroke="#3E7C74" strokeOpacity={0.15} vertical={false} />
          <XAxis dataKey="month" tick={{ fill: '#3E7C74', fontSize: 12 }} axisLine={{ stroke: '#3E7C74' }} tickLine={false} />
          <YAxis yAxisId="count" hide />
          <YAxis yAxisId="net" hide />
          <Tooltip content={<ChartTooltip />} />
          <Bar yAxisId="count" dataKey="sessionCount" fill="#3E7C74" fillOpacity={0.5} radius={[2, 2, 0, 0]} />
          <Line yAxisId="net" type="monotone" dataKey="netCents" stroke="#D4A24C" strokeWidth={2} dot={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
