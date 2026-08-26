import { useEffect, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Money, Mono } from '@/components/ui/Mono'
import { useAuth } from '@/features/auth/authContext'
import { netCents } from '@/features/dashboard/stats'
import { isClosedSession } from '@/lib/dataAdapter/types'
import { TableSettlementSection } from './components/TableSettlementSection'
import { closeTable, getTable } from './tablesApi'
import { useTableRoster } from './useTableRoster'
import type { Table } from './types'

export function TableManageScreen() {
  const { tableId } = useParams<{ tableId: string }>()
  const auth = useAuth()
  const [table, setTable] = useState<Table | null | 'loading'>('loading')
  const [closeError, setCloseError] = useState<string | null>(null)
  const [closing, setClosing] = useState(false)
  const roster = useTableRoster(table !== 'loading' && table ? table.id : null)

  useEffect(() => {
    let cancelled = false
    if (!tableId || auth.status !== 'account') return
    setTable('loading')
    getTable(tableId).then((t) => {
      if (!cancelled) setTable(t)
    })
    return () => {
      cancelled = true
    }
  }, [tableId, auth.status])

  if (table === 'loading') {
    return <p className="font-sans text-sm text-paper/60">Loading table…</p>
  }

  if (!table) {
    return <Navigate to="/app" replace />
  }

  const anyOpen = roster.entries.some((e) => e.status === 'open')

  async function handleClose() {
    if (table === 'loading' || !table) return
    setCloseError(null)
    setClosing(true)
    try {
      const updated = await closeTable(table.id)
      setTable(updated)
    } catch (err) {
      setCloseError(err instanceof Error ? err.message : 'Could not close the table.')
    } finally {
      setClosing(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-2xl text-paper">
              {table.locationLabel || 'Your Table'}
            </h1>
            <p className="mt-1 font-sans text-sm text-paper/60">
              Code <Mono className="text-paper">{table.code}</Mono>
              {table.maxPlayers && ` · Max ${table.maxPlayers} players`}
            </p>
          </div>
          {table.status === 'closed' && (
            <span className="rounded-sm bg-paper-dim px-2 py-1 font-mono text-xs uppercase tracking-widest text-paper/60">
              Closed
            </span>
          )}
        </div>
      </Card>

      <Card>
        <h2 className="mb-4 font-serif text-lg text-paper">Roster</h2>
        {roster.loading ? (
          <p className="font-sans text-sm text-paper/60">Loading roster…</p>
        ) : roster.entries.length === 0 ? (
          <p className="font-sans text-sm text-paper/60">No one has joined yet.</p>
        ) : (
          <div className="flex flex-col divide-y divide-paper/10">
            {roster.entries.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-sans text-sm text-paper">
                    {entry.playerDisplayName?.trim() || entry.playerEmail?.trim() || 'Unknown player'}
                  </p>
                  <p className="font-sans text-xs text-paper/60">
                    {entry.status === 'open' ? (
                      <span className="text-amber">Playing</span>
                    ) : (
                      <span>Cashed out</span>
                    )}{' '}
                    · Buy-in <Mono className="text-paper/80">${(entry.buyInCents / 100).toFixed(2)}</Mono>
                  </p>
                </div>
                {isClosedSession(entry) && <Money cents={netCents(entry)} className="text-lg" />}
              </div>
            ))}
          </div>
        )}
      </Card>

      {table.status === 'open' && (
        <div>
          <Button onClick={handleClose} disabled={closing || anyOpen}>
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

      {table.status === 'closed' && <TableSettlementSection table={table} roster={roster.entries} />}
    </div>
  )
}
