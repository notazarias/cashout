import { Stamp } from '@/components/ui/Stamp'
import { Money, Mono } from '@/components/ui/Mono'
import type { ClosedSession } from '@/lib/dataAdapter/types'
import { derivedDurationMinutes, netCents } from '@/features/dashboard/stats'

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatDuration(minutes?: number): string | null {
  if (!minutes) return null
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

export function SessionTicketCard({
  session,
  onDelete,
}: {
  session: ClosedSession
  onDelete: () => void
}) {
  const net = netCents(session)
  const duration = formatDuration(derivedDurationMinutes(session))
  const isWin = net > 0
  const isLoss = net < 0

  return (
    <div className="group flex items-center justify-between gap-4 py-4">
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <Mono className="text-sm text-paper">{formatDate(session.date)}</Mono>
          {session.locationLabel && (
            <span className="truncate font-sans text-sm text-paper/60">{session.locationLabel}</span>
          )}
        </div>
        <div className="mt-1 flex flex-wrap gap-x-4 font-sans text-xs text-paper/60">
          <span>
            Buy-in <Mono className="text-paper/80">${(session.buyInCents / 100).toFixed(2)}</Mono>
          </span>
          <span>
            Cash-out <Mono className="text-paper/80">${(session.cashOutCents / 100).toFixed(2)}</Mono>
          </span>
          {duration && (
            <span>
              Duration <Mono className="text-paper/80">{duration}</Mono>
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {(isWin || isLoss) && <Stamp variant={isWin ? 'win' : 'loss'} />}
        <div className="flex flex-col items-end gap-1">
          <Money cents={net} className="text-xl font-medium" />
          <button
            onClick={onDelete}
            className="font-sans text-xs text-paper/50 opacity-0 transition-opacity hover:text-loss focus-visible:opacity-100 group-hover:opacity-100"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
