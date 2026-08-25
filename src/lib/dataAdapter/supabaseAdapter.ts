import type { SupabaseClient } from '@supabase/supabase-js'
import { fromRow, type SessionRow } from './sessionRow'
import {
  DuplicateOpenSessionError,
  type CloseSessionInput,
  type ClosedSession,
  type DataAdapter,
  type LogCompletedSessionInput,
  type OpenSession,
  type Session,
  type SessionActivityEntry,
  type StartSessionInput,
} from './types'

interface SessionActivityRow {
  id: string
  session_id: string
  user_id: string | null
  type: 'buy_in' | 'pause' | 'resume'
  amount_cents: number | null
  created_at: string
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
    const { data, error } = await this.client.rpc('add_buy_in', {
      p_session_id: id,
      p_amount_cents: amountCents,
    })
    if (error) throw error
    return fromRow(data as SessionRow) as OpenSession
  }

  async pauseSession(id: string): Promise<OpenSession> {
    const { data, error } = await this.client.rpc('pause_session', { p_session_id: id })
    if (error) throw error
    return fromRow(data as SessionRow) as OpenSession
  }

  async resumeSession(id: string): Promise<OpenSession> {
    const { data, error } = await this.client.rpc('resume_session', { p_session_id: id })
    if (error) throw error
    return fromRow(data as SessionRow) as OpenSession
  }

  async listActivity(sessionId: string): Promise<SessionActivityEntry[]> {
    const { data, error } = await this.client
      .from('session_activity')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
    if (error) throw error
    return (data as SessionActivityRow[]).map((row) => ({
      id: row.id,
      sessionId: row.session_id,
      userId: row.user_id,
      type: row.type,
      amountCents: row.amount_cents,
      createdAt: row.created_at,
    }))
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
