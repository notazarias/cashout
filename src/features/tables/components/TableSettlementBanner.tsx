import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { useHostedTable } from '../useHostedTable'
import { useUnsettledHostedTable } from '../useUnsettledHostedTable'

/** Shown only when there's no currently-open hosted table, so it never doubles up with HostedTableBanner. */
export function TableSettlementBanner() {
  const { table: openTable } = useHostedTable()
  const { table } = useUnsettledHostedTable()

  if (openTable || !table) return null

  return (
    <Card className="border-teal/60">
      <Link to={`/app/table/${table.id}`} className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="rounded-sm bg-teal px-1.5 py-0.5 font-mono text-[10px] font-medium text-ink">
            SETTLEMENT
          </span>
          <span className="font-sans text-sm text-paper">
            Your table{table.locationLabel ? ` at ${table.locationLabel}` : ''} closed · code{' '}
            <span className="font-mono text-paper">{table.code}</span>
          </span>
        </div>
        <span className="font-sans text-sm font-medium text-teal">View Settlement →</span>
      </Link>
    </Card>
  )
}
