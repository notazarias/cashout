import type { Session } from './types'

export interface SessionRow {
  id: string
  user_id: string
  date: string
  buy_in_cents: number
  cash_out_cents: number | null
  duration_minutes: number | null
  location_label: string | null
  status: 'open' | 'closed'
  started_at: string | null
  closed_at: string | null
  paused_at: string | null
  total_paused_seconds: number
  table_id: string | null
  table_code: string | null
  created_at: string
}

export function fromRow(row: SessionRow): Session {
  const base = {
    id: row.id,
    userId: row.user_id,
    date: row.date,
    buyInCents: row.buy_in_cents,
    durationMinutes: row.duration_minutes ?? undefined,
    locationLabel: row.location_label ?? undefined,
    startedAt: row.started_at,
    closedAt: row.closed_at,
    pausedAt: row.paused_at,
    totalPausedSeconds: row.total_paused_seconds,
    tableId: row.table_id,
    tableCode: row.table_code,
    createdAt: row.created_at,
  }
  if (row.status === 'open') {
    return { ...base, status: 'open', cashOutCents: null }
  }
  if (row.cash_out_cents === null) {
    throw new Error(`Closed session ${row.id} has no cash_out_cents — data invariant violated.`)
  }
  return { ...base, status: 'closed', cashOutCents: row.cash_out_cents }
}
