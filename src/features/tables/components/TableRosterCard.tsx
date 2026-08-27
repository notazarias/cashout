import { Card } from '@/components/ui/Card'
import { Money, Mono } from '@/components/ui/Mono'
import { netCents } from '@/features/dashboard/stats'
import { isClosedSession } from '@/lib/dataAdapter/types'
import type { TableRosterEntry } from '../types'

export function TableRosterCard({ entries, loading }: { entries: TableRosterEntry[]; loading: boolean }) {
  return (
    <Card>
      <h2 className="mb-4 font-serif text-lg text-paper">Roster</h2>
      {loading ? (
        <p className="font-sans text-sm text-paper/60">Loading roster…</p>
      ) : entries.length === 0 ? (
        <p className="font-sans text-sm text-paper/60">No one has joined yet.</p>
      ) : (
        <div className="flex flex-col divide-y divide-paper/10">
          {entries.map((entry) => (
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
  )
}
