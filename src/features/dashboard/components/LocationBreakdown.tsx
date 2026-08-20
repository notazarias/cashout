import { Money, Mono } from '@/components/ui/Mono'
import type { LocationBreakdown as LocationBreakdownRow } from '../stats'

export function LocationBreakdown({
  rows,
  selected,
  onSelect,
}: {
  rows: LocationBreakdownRow[]
  selected: string | null
  onSelect: (location: string | null) => void
}) {
  if (rows.length === 0) {
    return <p className="font-sans text-sm text-sage">No locations logged yet.</p>
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={() => onSelect(null)}
        className={`flex items-center justify-between rounded-sm px-2 py-1.5 text-left font-sans text-sm transition-colors ${
          selected === null ? 'bg-ink text-paper' : 'text-sage hover:bg-ink/50'
        }`}
      >
        <span>All Locations</span>
      </button>
      {rows.map((row) => (
        <button
          key={row.location}
          onClick={() => onSelect(row.location)}
          className={`flex items-center justify-between rounded-sm px-2 py-1.5 text-left font-sans text-sm transition-colors ${
            selected === row.location ? 'bg-ink text-paper' : 'text-sage hover:bg-ink/50'
          }`}
        >
          <span>
            {row.location} <Mono className="text-xs text-sage">({row.sessionCount})</Mono>
          </span>
          <Money cents={row.netCents} className="text-sm" />
        </button>
      ))}
    </div>
  )
}
