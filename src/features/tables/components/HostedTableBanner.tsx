import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { useHostedTable } from '../useHostedTable'

export function HostedTableBanner() {
  const { table } = useHostedTable()

  if (!table) return null

  return (
    <Card className="border-amber/60">
      <Link to={`/app/table/${table.id}`} className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="rounded-sm bg-amber px-1.5 py-0.5 font-mono text-[10px] font-medium text-ink">
            HOSTING
          </span>
          <span className="font-sans text-sm text-paper">
            You're hosting a table{table.locationLabel ? ` at ${table.locationLabel}` : ''} · code{' '}
            <span className="font-mono text-paper">{table.code}</span>
          </span>
        </div>
        <span className="font-sans text-sm font-medium text-amber">Manage →</span>
      </Link>
    </Card>
  )
}
