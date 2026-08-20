import type { SupabaseClient } from '@supabase/supabase-js'
import {
  DuplicateOpenSessionError,
  type CloseSessionInput,
  type ClosedSession,
  type DataAdapter,
  type LogCompletedSessionInput,
  type OpenSession,
  type Session,
  type StartSessionInput,
} from './types'

interface SessionRow {
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
  created_at: string
}

function fromRow(row: SessionRow): Session {
  const base = {
    id: row.id,
    userId: row.user_id,
    date: row.date,
    buyInCents: row.buy_in_cents,
    durationMinutes: row.duration_minutes ?? undefined,
    locationLabel: row.location_label ?? undefined,
    startedAt: row.started_at,
    closedAt: row.closed_at,
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

/**
 * Real enforcement of per-user isolation is Postgres RLS on `sessions`
 * (`user_id = auth.uid()`) — this class is only the ergonomic wrapper.
 */
export class SupabaseAdapter implements DataAdapter {
  readonly mode = 'account' as const

  private readonly client: SupabaseClient
  private readonly userId: string

  constructor(client: SupabaseClient, userId: string) {
    this.client = client
    this.userId = userId
  }

  async listSessions(): Promise<Session[]> {
    const { data, error } = await this.client
      .from('sessions')
      .select('*')
      .eq('user_id', this.userId)
      .order('date', { ascending: false })
    if (error) throw error
    return (data as SessionRow[]).map(fromRow)
  }

  async startSession(input: StartSessionInput): Promise<OpenSession> {
    const existing = await this.client
      .from('sessions')
      .select('id')
      .eq('user_id', this.userId)
      .eq('status', 'open')
      .maybeSingle()
    if (existing.error) throw existing.error
    if (existing.data) throw new DuplicateOpenSessionError()

    const { data, error } = await this.client
      .from('sessions')
      .insert({
        user_id: this.userId,
        date: input.date,
        location_label: input.locationLabel ?? null,
        buy_in_cents: input.buyInCents,
        status: 'open',
        started_at: new Date().toISOString(),
        cash_out_cents: null,
      })
      .select('*')
      .single()
    if (error) {
      if (error.code === '23505') throw new DuplicateOpenSessionError()
      throw error
    }
    return fromRow(data as SessionRow) as OpenSession
  }

  async addBuyIn(id: string, amountCents: number): Promise<OpenSession> {
    const { data: current, error: fetchError } = await this.client
      .from('sessions')
      .select('buy_in_cents, status')
      .eq('id', id)
      .eq('user_id', this.userId)
      .single()
    if (fetchError) throw fetchError
    if (current.status !== 'open') throw new Error('Cannot add a buy-in to a closed session.')

    const { data, error } = await this.client
      .from('sessions')
      .update({ buy_in_cents: current.buy_in_cents + amountCents })
      .eq('id', id)
      .eq('user_id', this.userId)
      .eq('status', 'open')
      .select('*')
      .single()
    if (error) throw error
    return fromRow(data as SessionRow) as OpenSession
  }

  async closeSession(id: string, input: CloseSessionInput): Promise<ClosedSession> {
    const { data, error } = await this.client
      .from('sessions')
      .update({ status: 'closed', cash_out_cents: input.cashOutCents, closed_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', this.userId)
      .eq('status', 'open')
      .select('*')
      .single()
    if (error) {
      if (error.code === 'PGRST116') throw new Error('Session not found or already closed.')
      throw error
    }
    return fromRow(data as SessionRow) as ClosedSession
  }

  async logCompletedSession(input: LogCompletedSessionInput): Promise<ClosedSession> {
    const { data, error } = await this.client
      .from('sessions')
      .insert({
        user_id: this.userId,
        date: input.date,
        location_label: input.locationLabel ?? null,
        buy_in_cents: input.buyInCents,
        cash_out_cents: input.cashOutCents,
        duration_minutes: input.durationMinutes ?? null,
        status: 'closed',
        started_at: null,
        closed_at: null,
      })
      .select('*')
      .single()
    if (error) throw error
    return fromRow(data as SessionRow) as ClosedSession
  }

  async deleteSession(id: string): Promise<void> {
    const { error } = await this.client
      .from('sessions')
      .delete()
      .eq('id', id)
      .eq('user_id', this.userId)
    if (error) throw error
  }
}
