import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Mono } from '@/components/ui/Mono'
import { useAuth } from '@/features/auth/authContext'
import { anonSupabase } from '@/lib/anonSupabaseClient'
import { supabase } from '@/lib/supabaseClient'
import { listSettlements, markSettlementPaid } from './settlementsApi'
import type { Settlement } from './types'

function formatDollars(cents: number): string {
  return `$${(Math.abs(cents) / 100).toFixed(2)}`
}

/** For any participant who isn't managing the table — the host uses TableManageScreen's own settlement
 * section instead. RLS scopes `settlements` rows to whichever identity is calling, so this never needs
 * `tables`/roster access (which non-hosts don't have). */
export function TableSettlementScreen() {
  const { tableId } = useParams<{ tableId: string }>()
  const auth = useAuth()
  const [userId, setUserId] = useState<string | null>(null)
  const [checked, setChecked] = useState(false)
  const [settlements, setSettlements] = useState<Settlement[]>([])
  const [loading, setLoading] = useState(true)
  const [markingId, setMarkingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const client = auth.status === 'guest' ? anonSupabase : supabase

  useEffect(() => {
    let cancelled = false
    if (auth.status === 'account') {
      setUserId(auth.user.id)
      setChecked(true)
    } else if (auth.status === 'guest') {
      void anonSupabase.auth.getSession().then(({ data }) => {
        if (cancelled) return
        setUserId(data.session?.user.id ?? null)
        setChecked(true)
      })
    } else {
      setChecked(true)
    }
    return () => {
      cancelled = true
    }
  }, [auth])

  const refresh = useCallback(async () => {
    if (!tableId) return
    setLoading(true)
    try {
      setSettlements(await listSettlements(tableId, client))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load settlement.')
    } finally {
      setLoading(false)
    }
  }, [tableId, client])

  useEffect(() => {
    if (checked) void refresh()
  }, [checked, refresh])

  async function handleTogglePaid(settlement: Settlement) {
    setMarkingId(settlement.id)
    try {
      await markSettlementPaid(settlement.id, !settlement.paid, client)
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update that payment.')
    } finally {
      setMarkingId(null)
    }
  }

  if (!checked || loading) {
    return <p className="font-sans text-sm text-paper/60">Loading settlement…</p>
  }

  const mine = settlements.filter((s) => s.fromUserId === userId || s.toUserId === userId)

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      <Link to="/app" className="font-sans text-sm text-teal hover:text-paper">
        ← Dashboard
      </Link>
      <Card>
        <h1 className="mb-4 font-serif text-xl text-paper">Settlement</h1>
        {error && <p className="mb-4 font-sans text-sm text-loss">{error}</p>}
        {mine.length === 0 ? (
          <p className="font-sans text-sm text-paper/60">
            No settlement yet — check back once the host closes out the table.
          </p>
        ) : (
          <div className="flex flex-col divide-y divide-paper/10">
            {mine.map((s) => {
              const iOwe = s.fromUserId === userId
              return (
                <div key={s.id} className="flex items-center justify-between py-3">
                  <p className="font-sans text-sm text-paper">
                    {iOwe
                      ? `You owe ${s.toDisplayName?.trim() || 'Unknown player'}`
                      : `${s.fromDisplayName?.trim() || 'Unknown player'} owes you`}
                  </p>
                  <div className="flex items-center gap-3">
                    <Mono className="text-paper">{formatDollars(s.amountCents)}</Mono>
                    <Button
                      variant={s.paid ? 'secondary' : 'primary'}
                      disabled={markingId === s.id}
                      onClick={() => handleTogglePaid(s)}
                    >
                      {s.paid ? 'Paid ✓' : 'Mark Paid'}
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
        <p className="mt-6 font-sans text-xs text-paper/40">
          CashOut doesn't move money — this only tracks who owes what and whether it's been paid in real life.
        </p>
      </Card>
    </div>
  )
}
