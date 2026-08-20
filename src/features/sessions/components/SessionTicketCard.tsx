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

/** The torn top edge — a jagged strip cut against the page background. */
function TornEdge() {
  return (
    <div
      className="h-2 w-full"
      style={{
        backgroundImage:
          'linear-gradient(135deg, var(--color-ink) 50%, transparent 50%), linear-gradient(45deg, var(--color-ink) 50%, transparent 50%)',
        backgroundSize: '12px 12px',
        backgroundPosition: '0 0, 6px 0',
        backgroundRepeat: 'repeat-x',
      }}
    />
  )
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

  return (
    <div className="overflow-hidden rounded-sm border border-sage/30">
      <TornEdge />
      <div className="bg-felt px-4 py-4">
        <div className="mb-3 flex items-baseline justify-between">
          <div>
            <Mono className="text-sm text-paper">{formatDate(session.date)}</Mono>
            {session.locationLabel && (
              <span className="ml-2 font-sans text-sm text-sage">{session.locationLabel}</span>
            )}
          </div>
          <Money cents={net} className="text-xl font-medium" />
        </div>

        <div className="flex items-center justify-between font-sans text-xs text-sage">
          <div className="flex gap-4">
            <span>
              Buy-in <Mono className="text-paper">${(session.buyInCents / 100).toFixed(2)}</Mono>
            </span>
            <span>
              Cash-out <Mono className="text-paper">${(session.cashOutCents / 100).toFixed(2)}</Mono>
            </span>
            {duration && (
              <span>
                Duration <Mono className="text-paper">{duration}</Mono>
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <button onClick={onDelete} className="text-sage hover:text-brick">
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
