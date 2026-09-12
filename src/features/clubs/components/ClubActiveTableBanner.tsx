import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Mono } from '@/components/ui/Mono'
import { joinTable } from '@/features/tables/tablesApi'
import type { Table } from '@/features/tables/types'

/** The payoff of attaching club_id: a member joins their club's running table with one click and
 * never types a code. It's the same join_table RPC the code-entry path uses — the code is just
 * already known, because tables_select_club_member let us read the table row. */
export function ClubActiveTableBanner({ table, clubName }: { table: Table; clubName: string }) {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [joining, setJoining] = useState(false)

  async function handleJoin() {
    setError(null)
    setJoining(true)
    try {
      const session = await joinTable({
        code: table.code,
        date: new Date().toISOString().slice(0, 10),
        locationLabel: table.locationLabel,
        buyInCents: table.buyInCents,
      })
      navigate(`/app/session/${session.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not join that table.')
      setJoining(false)
    }
  }

  return (
    <Card className="border-teal/60">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="rounded-sm bg-teal px-1.5 py-0.5 font-mono text-[10px] font-medium text-paper">
            LIVE
          </span>
          <span className="font-sans text-sm text-paper">
            {clubName} has a table running
            {table.locationLabel ? ` at ${table.locationLabel}` : ''} · buy-in{' '}
            <Mono className="text-paper/80">${(table.buyInCents / 100).toFixed(2)}</Mono>
          </span>
        </div>
        <Button variant="secondary" onClick={handleJoin} disabled={joining}>
          {joining ? 'Joining…' : 'Join Table'}
        </Button>
      </div>
      {error && <p className="mt-2 font-sans text-sm text-loss">{error}</p>}
    </Card>
  )
}
