import { Line, LineChart, ResponsiveContainer } from 'recharts'
import type { ProfitPoint } from '../stats'

function splitOffset(points: ProfitPoint[]): number {
  const values = points.map((p) => p.cumulativeCents)
  const max = Math.max(...values, 0)
  const min = Math.min(...values, 0)
  if (max <= 0) return 0
  if (min >= 0) return 1
  return max / (max - min)
}

export function ProfitChart({ points }: { points: ProfitPoint[] }) {
  if (points.length === 0) {
    return (
      <div className="flex h-20 items-center font-sans text-sm text-paper/60">
        Log a session to start your profit graph.
      </div>
    )
  }

  const offset = splitOffset(points)

  return (
    <div className="h-20 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points} margin={{ top: 4, right: 2, bottom: 4, left: 2 }}>
          <defs>
            <linearGradient id="profitSplit" x1="0" y1="0" x2="0" y2="1">
              <stop offset={offset} stopColor="#D4A24C" />
              <stop offset={offset} stopColor="#C0574A" />
            </linearGradient>
          </defs>
          <Line
            type="linear"
            dataKey="cumulativeCents"
            stroke="url(#profitSplit)"
            strokeWidth={2}
            dot={false}
            isAnimationActive
            animationDuration={600}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
