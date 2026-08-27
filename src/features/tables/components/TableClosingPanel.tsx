import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { closeTable } from '../tablesApi'
import type { Table, TableRosterEntry } from '../types'
import { TableRosterCard } from './TableRosterCard'
import { TableSettlementSection } from './TableSettlementSection'

/** Roster + close-table + settlement, shared by the host's revisit screen (TableManageScreen) and the
 * live consolidated view (TableLiveStatusSection) so Close Table and settlement generation behave
 * identically whether reached in the moment or on a later visit. */
export function TableClosingPanel({
  table,
  roster,
  rosterLoading = false,
  onTableUpdate,
}: {
  table: Table
  roster: TableRosterEntry[]
  rosterLoading?: boolean
  onTableUpdate: (table: Table) => void
}) {
  const [closeError, setCloseError] = useState<string | null>(null)
  const [closing, setClosing] = useState(false)

  const anyOpen = roster.some((e) => e.status === 'open')

  async function handleClose() {
    setCloseError(null)
    setClosing(true)
    try {
      onTableUpdate(await closeTable(table.id))
    } catch (err) {
      setCloseError(err instanceof Error ? err.message : 'Could not close the table.')
    } finally {
      setClosing(false)
    }
  }

  return (
    <>
      <TableRosterCard entries={roster} loading={rosterLoading} />

      {table.status === 'open' && (
        <div>
          <Button size="lg" onClick={handleClose} disabled={closing || anyOpen}>
            Close Table
          </Button>
          {anyOpen && (
            <p className="mt-2 font-sans text-xs text-paper/60">
              Every player needs to cash out before you can close the table.
            </p>
          )}
          {closeError && <p className="mt-2 font-sans text-sm text-loss">{closeError}</p>}
        </div>
      )}

      {table.status === 'closed' && <TableSettlementSection table={table} roster={roster} />}
    </>
  )
}
