import type { SupabaseClient } from '@supabase/supabase-js'
import type { DataAdapter, NewSessionInput, Session } from './types'

interface SessionRow {
  id: string
  user_id: string
  date: string
  buy_in_cents: number
  cash_out_cents: number
  duration_minutes: number | null
  location_label: string | null
  created_at: string
}

function fromRow(row: SessionRow): Session {
  return {
    id: row.id,
    userId: row.user_id,
    date: row.date,
    buyInCents: row.buy_in_cents,
    cashOutCents: row.cash_out_cents,
    durationMinutes: row.duration_minutes ?? undefined,
    locationLabel: row.location_label ?? undefined,
    createdAt: row.created_at,
  }
}

function toInsertRow(input: NewSessionInput, userId: string) {
  return {
    user_id: userId,
    date: input.date,
    buy_in_cents: input.buyInCents,
    cash_out_cents: input.cashOutCents,
    duration_minutes: input.durationMinutes ?? null,
    location_label: input.locationLabel ?? null,
  }
}

/**
 * Real enforcement of per-user isolation is Postgres RLS on `sessions`
 * (`user_id = auth.uid()`) — this class is only the ergonomic wrapper.
 * Note: the `sessions` table itself lands in the Phase 2 migration.
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

  async createSession(input: NewSessionInput): Promise<Session> {
    const { data, error } = await this.client
      .from('sessions')
      .insert(toInsertRow(input, this.userId))
      .select('*')
      .single()
    if (error) throw error
    return fromRow(data as SessionRow)
  }

  async updateSession(id: string, patch: Partial<NewSessionInput>): Promise<Session> {
    const updateRow: Record<string, unknown> = {}
    if (patch.date !== undefined) updateRow.date = patch.date
    if (patch.buyInCents !== undefined) updateRow.buy_in_cents = patch.buyInCents
    if (patch.cashOutCents !== undefined) updateRow.cash_out_cents = patch.cashOutCents
    if (patch.durationMinutes !== undefined) updateRow.duration_minutes = patch.durationMinutes
    if (patch.locationLabel !== undefined) updateRow.location_label = patch.locationLabel

    const { data, error } = await this.client
      .from('sessions')
      .update(updateRow)
      .eq('id', id)
      .eq('user_id', this.userId)
      .select('*')
      .single()
    if (error) throw error
    return fromRow(data as SessionRow)
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
