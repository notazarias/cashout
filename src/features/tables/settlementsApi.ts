import type { SupabaseClient } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabaseClient'
import type { SettlementPayment } from './settlement'
import type { Settlement, SettlementMode } from './types'

interface SettlementRow {
  id: string
  table_id: string
  from_user: string
  from_display_name: string | null
  to_user: string
  to_display_name: string | null
  amount_cents: number
  paid: boolean
  paid_at: string | null
  created_at: string
}

function fromSettlementRow(row: SettlementRow): Settlement {
  return {
    id: row.id,
    tableId: row.table_id,
    fromUserId: row.from_user,
    fromDisplayName: row.from_display_name,
    toUserId: row.to_user,
    toDisplayName: row.to_display_name,
    amountCents: row.amount_cents,
    paid: row.paid,
    paidAt: row.paid_at,
    createdAt: row.created_at,
  }
}

export async function listSettlements(tableId: string, client: SupabaseClient = supabase): Promise<Settlement[]> {
  const { data, error } = await client
    .from('settlements')
    .select('*')
    .eq('table_id', tableId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data as SettlementRow[]).map(fromSettlementRow)
}

/** Host only — always the main `supabase` client, since a host is never an anonymous identity. */
export async function generateSettlement(
  tableId: string,
  mode: SettlementMode,
  payments: SettlementPayment[],
): Promise<Settlement[]> {
  const { data, error } = await supabase.rpc('generate_settlement', {
    p_table_id: tableId,
    p_mode: mode,
    p_payments: payments,
  })
  if (error) throw new Error(error.message)
  return (data as SettlementRow[]).map(fromSettlementRow)
}

export async function markSettlementPaid(
  settlementId: string,
  paid: boolean,
  client: SupabaseClient = supabase,
): Promise<Settlement> {
  const { data, error } = await client.rpc('mark_settlement_paid', {
    p_settlement_id: settlementId,
    p_paid: paid,
  })
  if (error) throw new Error(error.message)
  return fromSettlementRow(data as SettlementRow)
}
