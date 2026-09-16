import type { SupabaseClient } from '@supabase/supabase-js'
import { fromRow, type SessionRow } from '@/lib/dataAdapter/sessionRow'
import { DuplicateOpenSessionError, type OpenSession } from '@/lib/dataAdapter/types'
import { generateJoinCode, MAX_CODE_ATTEMPTS } from '@/lib/joinCode'
import { supabase } from '@/lib/supabaseClient'
import {
  DuplicateOpenTableError,
  type HostTableInput,
  type JoinTableInput,
  type Table,
  type TableRosterEntry,
} from './types'

interface TableRow {
  id: string
  host_id: string
  code: string
  buy_in_cents: number
  location_label: string | null
  max_players: number | null
  status: 'open' | 'closed'
  created_at: string
  closed_at: string | null
  club_id: string | null
}

interface RosterSessionRow extends SessionRow {
  player_email: string | null
  player_display_name: string | null
}

function fromTableRow(row: TableRow): Table {
  return {
    id: row.id,
    hostId: row.host_id,
    code: row.code,
    buyInCents: row.buy_in_cents,
    locationLabel: row.location_label ?? undefined,
    maxPlayers: row.max_players ?? undefined,
    status: row.status,
    createdAt: row.created_at,
    closedAt: row.closed_at,
    clubId: row.club_id,
  }
}

export async function createTable(hostId: string, input: HostTableInput): Promise<Table> {
  for (let attempt = 0; attempt < MAX_CODE_ATTEMPTS; attempt++) {
    const { data, error } = await supabase
      .from('tables')
      .insert({
        host_id: hostId,
        code: generateJoinCode(),
        buy_in_cents: input.buyInCents,
        location_label: input.locationLabel ?? null,
        max_players: input.maxPlayers ?? null,
        status: 'open',
        club_id: input.clubId ?? null,
      })
      .select('*')
      .single()
    if (!error) return fromTableRow(data as TableRow)
    if (error.code === '23505' && error.message.includes('tables_one_open_per_host')) {
      throw new DuplicateOpenTableError()
    }
    if (error.code === '23505' && error.message.includes('tables_code_key')) {
      continue // code collision — retry with a freshly generated code
    }
    throw error
  }
  throw new Error('Could not generate a unique table code — please try again.')
}

export async function joinTable(input: JoinTableInput, client: SupabaseClient = supabase): Promise<OpenSession> {
  // Two separate RPC calls, deliberately — PostgREST commits one transaction per call, so if this
  // were folded into join_table itself, a later failure there (bad code, full table) would roll
  // back the attempt-counter insert along with it, silently defeating the rate limit against
  // exactly the case it exists for (repeated wrong-code guesses). See migration
  // fix_join_attempt_recording_across_transactions.
  const { error: attemptError } = await client.rpc('record_join_attempt')
  if (attemptError) throw new Error(attemptError.message)

  const { data, error } = await client.rpc('join_table', {
    p_code: input.code,
    p_date: input.date,
    p_buy_in_cents: input.buyInCents,
    p_location_label: input.locationLabel ?? null,
    p_display_name: input.displayName ?? null,
  })
  if (error) {
    if (error.code === '23505') throw new DuplicateOpenSessionError()
    throw new Error(error.message)
  }
  return fromRow(data as SessionRow) as OpenSession
}

export async function getHostedOpenTable(hostId: string): Promise<Table | null> {
  const { data, error } = await supabase
    .from('tables')
    .select('*')
    .eq('host_id', hostId)
    .eq('status', 'open')
    .maybeSingle()
  if (error) throw error
  return data ? fromTableRow(data as TableRow) : null
}

/** RLS naturally returns no row for a non-host — treated as "not found." A non-null result from a
 * given client *is* the "am I the host" check for whoever that client is authenticated as. */
export async function getTable(tableId: string, client: SupabaseClient = supabase): Promise<Table | null> {
  const { data, error } = await client.from('tables').select('*').eq('id', tableId).maybeSingle()
  if (error) throw error
  return data ? fromTableRow(data as TableRow) : null
}

export async function listTableRoster(tableId: string, client: SupabaseClient = supabase): Promise<TableRosterEntry[]> {
  const { data, error } = await client
    .from('sessions')
    .select('*')
    .eq('table_id', tableId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data as RosterSessionRow[]).map((row) => ({
    ...fromRow(row),
    playerEmail: row.player_email,
    playerDisplayName: row.player_display_name,
  }))
}

export async function closeTable(tableId: string): Promise<Table> {
  const { data, error } = await supabase.rpc('close_table', { p_table_id: tableId })
  if (error) throw new Error(error.message)
  return fromTableRow(data as TableRow)
}

/** The club's currently-running table, if any. Visible to every club member via
 * tables_select_club_member, which is what lets a member join without ever typing a code. */
export async function getClubOpenTable(clubId: string): Promise<Table | null> {
  const { data, error } = await supabase
    .from('tables')
    .select('*')
    .eq('club_id', clubId)
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return data ? fromTableRow(data as TableRow) : null
}

/** Every open club table the caller can see. One query does it: tables_select_club_member already
 * scopes this to the caller's own clubs server-side, so there's no need to fan out per club. */
export async function listOpenClubTables(): Promise<Table[]> {
  const { data, error } = await supabase
    .from('tables')
    .select('*')
    .eq('status', 'open')
    .not('club_id', 'is', null)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data as TableRow[]).map(fromTableRow)
}

/** Most recently closed table this host has that either has no settlement yet, or has one with an
 * unpaid row — used to keep the settlement reachable from the dashboard after the table closes. */
export async function getRecentUnsettledHostedTable(hostId: string): Promise<Table | null> {
  const { data: closedTables, error } = await supabase
    .from('tables')
    .select('*')
    .eq('host_id', hostId)
    .eq('status', 'closed')
    .order('closed_at', { ascending: false })
    .limit(5)
  if (error) throw error
  for (const row of (closedTables ?? []) as TableRow[]) {
    const { data: settlements, error: settlementsError } = await supabase
      .from('settlements')
      .select('paid')
      .eq('table_id', row.id)
    if (settlementsError) throw settlementsError
    if (!settlements || settlements.length === 0 || settlements.some((s) => !s.paid)) {
      return fromTableRow(row)
    }
  }
  return null
}
