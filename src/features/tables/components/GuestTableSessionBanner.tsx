import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { useGuestTableSession } from '../useGuestTableSession'

export function GuestTableSessionBanner() {
  const { session } = useGuestTableSession()

  if (!session) return null

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
