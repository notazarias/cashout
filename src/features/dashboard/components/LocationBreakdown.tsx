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
    return <p className="font-sans text-sm text-paper/60">No locations logged yet.</p>
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={() => onSelect(null)}
        className={`flex items-center justify-between border-l-2 px-3 py-2.5 text-left font-sans text-base transition-colors ${
          selected === null ? 'border-amber text-amber' : 'border-transparent text-paper/70 hover:text-paper'
        }`}
      >
        <span>All Locations</span>
      </button>
      {rows.map((row) => (
        <button
          key={row.location}
          onClick={() => onSelect(row.location)}
          className={`flex items-center justify-between border-l-2 px-3 py-2.5 text-left font-sans text-base transition-colors ${
            selected === row.location ? 'border-amber text-amber' : 'border-transparent text-paper/70 hover:text-paper'
          }`}
        >
          <span>
            {row.location} <Mono className="text-sm text-paper/60">({row.sessionCount})</Mono>
          </span>
          <Money cents={row.netCents} className="text-base" />
        </button>
      ))}
    </div>
  )
}
