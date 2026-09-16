import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Mono } from '@/components/ui/Mono'
import { netCents } from '@/features/dashboard/stats'
import { reportError } from '@/lib/sentry'
import type { ClosedSession } from '@/lib/dataAdapter/types'
import { computeDirectSettlement, computeHostSettlement, totalImbalanceCents, type PlayerNet } from '../settlement'
import { generateSettlement, markSettlementPaid } from '../settlementsApi'
import { useSettlements } from '../useSettlements'
import type { Settlement, SettlementMode, Table, TableRosterEntry } from '../types'

function formatDollars(cents: number): string {
  return `$${(Math.abs(cents) / 100).toFixed(2)}`
}

// A plain `.filter(isClosedSession)` on TableRosterEntry[] would narrow to bare ClosedSession and drop
// playerEmail/playerDisplayName — this predicate preserves the roster-only fields too.
function isClosedRosterEntry(entry: TableRosterEntry): entry is TableRosterEntry & ClosedSession {
  return entry.status === 'closed'
}

export function TableSettlementSection({ table, roster }: { table: Table; roster: TableRosterEntry[] }) {
  const { settlements, loading, refresh } = useSettlements(table.id)
  const [mode, setMode] = useState<SettlementMode>('direct')
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [markingId, setMarkingId] = useState<string | null>(null)
  const [pickingMode, setPickingMode] = useState(false)

  const nets: PlayerNet[] = roster
    .filter(isClosedRosterEntry)
    .filter((entry) => entry.userId)
    .map((entry) => ({
      userId: entry.userId as string,
      displayName: entry.playerDisplayName?.trim() || entry.playerEmail?.trim() || 'Unknown player',
      netCents: netCents(entry),
    }))

  const imbalance = totalImbalanceCents(nets)

  async function handleGenerate() {
    setError(null)
    setGenerating(true)
    try {
      const hostDisplayName = nets.find((n) => n.userId === table.hostId)?.displayName ?? 'Host'
      const payments =
        mode === 'direct' ? computeDirectSettlement(nets) : computeHostSettlement(nets, table.hostId, hostDisplayName)
      await generateSettlement(table.id, mode, payments)
      await refresh()
      setPickingMode(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not generate a settlement.')
      reportError(err, 'generate settlement')
    } finally {
      setGenerating(false)
    }
  }

  async function handleTogglePaid(settlement: Settlement) {
    setMarkingId(settlement.id)
    try {
      await markSettlementPaid(settlement.id, !settlement.paid)
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update that payment.')
      reportError(err, 'mark settlement paid')
    } finally {
      setMarkingId(null)
    }
  }

  if (loading) {
    return (
      <Card>
        <p className="font-sans text-sm text-paper/60">Loading settlement…</p>
      </Card>
    )
  }

  const fullySettled = settlements.length > 0 && settlements.every((s) => s.paid)
  const anyPaid = settlements.some((s) => s.paid)

  return (
    <Card>
      <h2 className="mb-4 font-serif text-lg text-paper">Settlement</h2>

      {nets.length === 0 ? (
        <p className="font-sans text-sm text-paper/60">No closed sessions to settle yet.</p>
      ) : imbalance !== 0 ? (
        <p className="font-sans text-sm text-loss">
          Buy-ins and cash-outs don't balance by {formatDollars(imbalance)} — check that every player's numbers
          are correct before generating a settlement.
        </p>
      ) : settlements.length === 0 || pickingMode ? (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3">
            <label className="flex items-start gap-2 font-sans text-sm text-paper">
              <input
                type="radio"
                name="settlement-mode"
                checked={mode === 'direct'}
                onChange={() => setMode('direct')}
                className="mt-1"
              />
              <span>
                <span className="block font-medium">Direct</span>
                <span className="block text-xs text-paper/60">
                  Fewest total payments, straight between players. Best for a casual group comfortable
                  coordinating payments themselves.
                </span>
              </span>
            </label>
            <label className="flex items-start gap-2 font-sans text-sm text-paper">
              <input
                type="radio"
                name="settlement-mode"
                checked={mode === 'host'}
                onChange={() => setMode('host')}
                className="mt-1"
              />
              <span>
                <span className="block font-medium">Through the Host</span>
                <span className="block text-xs text-paper/60">
                  Every loser pays you, you pay every winner. Simpler to track, but means you temporarily
                  hold the group's imbalance.
                </span>
              </span>
            </label>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleGenerate} disabled={generating}>
              Generate Settlement
            </Button>
            {pickingMode && settlements.length > 0 && (
              <Button variant="ghost" onClick={() => setPickingMode(false)} disabled={generating}>
                Cancel
              </Button>
            )}
          </div>
          {error && <p className="font-sans text-sm text-loss">{error}</p>}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col divide-y divide-paper/10">
            {settlements.map((s) => (
              <div key={s.id} className="flex items-center justify-between py-3">
                <p className="font-sans text-sm text-paper">
                  {s.fromDisplayName?.trim() || 'Unknown player'} → {s.toDisplayName?.trim() || 'Unknown player'}
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
            ))}
          </div>
          {fullySettled && <p className="font-sans text-sm text-teal">Fully Settled ✓</p>}
          {!anyPaid && (
            <Button variant="ghost" onClick={() => setPickingMode(true)}>
              Regenerate
            </Button>
          )}
          {error && <p className="font-sans text-sm text-loss">{error}</p>}
        </div>
      )}

      <p className="mt-6 font-sans text-xs text-paper/40">
        CashOut doesn't move money — this only tracks who owes what and whether it's been paid in real life.
      </p>
    </Card>
  )
}
