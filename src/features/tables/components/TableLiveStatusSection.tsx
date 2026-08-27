import type { SupabaseClient } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'
import { getTable } from '../tablesApi'
import { useTableRoster } from '../useTableRoster'
import type { Table } from '../types'
import { TableClosingPanel } from './TableClosingPanel'
import { TableRosterCard } from './TableRosterCard'

/** Lives inline on a player's own "Session Complete" card once their session is table-linked. A
 * non-null `getTable` result *is* the "am I the host" check — RLS already enforces `host_id = auth.uid()`
 * for that query, so no separate identity comparison is needed. Hosts get the full close/settlement
 * flow (the same TableClosingPanel TableManageScreen uses); everyone else gets a read-only status view. */
export function TableLiveStatusSection({ tableId, client }: { tableId: string; client: SupabaseClient }) {
  const [table, setTable] = useState<Table | null | 'loading'>('loading')
  const roster = useTableRoster(tableId, client)

  useEffect(() => {
    let cancelled = false
    setTable('loading')
    getTable(tableId, client).then((t) => {
      if (!cancelled) setTable(t)
    })
    return () => {
      cancelled = true
    }
  }, [tableId, client])

  if (table === 'loading') {
    return <p className="font-sans text-sm text-paper/60">Loading table status…</p>
  }

  if (table) {
    return <TableClosingPanel table={table} roster={roster.entries} rosterLoading={roster.loading} onTableUpdate={setTable} />
  }

  return <TableRosterCard entries={roster.entries} loading={roster.loading} />
}
