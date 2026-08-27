import { useEffect, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Mono } from '@/components/ui/Mono'
import { PageShell } from '@/components/ui/PageShell'
import { useAuth } from '@/features/auth/authContext'
import { TableClosingPanel } from './components/TableClosingPanel'
import { getTable } from './tablesApi'
import { useTableRoster } from './useTableRoster'
import type { Table } from './types'

export function TableManageScreen() {
  const { tableId } = useParams<{ tableId: string }>()
  const auth = useAuth()
  const [table, setTable] = useState<Table | null | 'loading'>('loading')
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

  return (
    <PageShell>
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

      <TableClosingPanel
        table={table}
        roster={roster.entries}
        rosterLoading={roster.loading}
        onTableUpdate={setTable}
      />
    </PageShell>
  )
}
