import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { useGuestTableSession } from '../useGuestTableSession'

export function GuestTableSessionBanner() {
  const { session, closedSession } = useGuestTableSession()

  if (session) {
    return (
      <Card className="border-amber/60">
        <Link to={`/app/table-session/${session.id}`} className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="rounded-sm bg-amber px-1.5 py-0.5 font-mono text-[10px] font-medium text-ink">
              LIVE
            </span>
            <span className="font-sans text-sm text-paper">
              You're playing at a table{session.locationLabel ? ` at ${session.locationLabel}` : ''}
            </span>
          </div>
          <span className="font-sans text-sm font-medium text-amber">Resume →</span>
        </Link>
      </Card>
    )
  }

  if (closedSession) {
    return (
      <Card className="border-teal/60">
        <Link
          to={`/app/table/${closedSession.tableId}/settlement`}
          className="flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-2">
            <span className="rounded-sm bg-teal px-1.5 py-0.5 font-mono text-[10px] font-medium text-ink">
              SETTLEMENT
            </span>
            <span className="font-sans text-sm text-paper">
              You played at a table{closedSession.locationLabel ? ` at ${closedSession.locationLabel}` : ''}
            </span>
          </div>
          <span className="font-sans text-sm font-medium text-teal">View Settlement →</span>
        </Link>
      </Card>
    )
  }

  return null
}
