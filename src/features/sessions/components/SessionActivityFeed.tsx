import { Mono } from '@/components/ui/Mono'
import type { SessionActivityEntry } from '@/lib/dataAdapter/types'

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

function describeActivity(entry: SessionActivityEntry): string {
  switch (entry.type) {
    case 'buy_in':
      return `Added chips — $${((entry.amountCents ?? 0) / 100).toFixed(2)}`
    case 'pause':
      return 'Paused'
    case 'resume':
      return 'Resumed'
  }
}

export function SessionActivityFeed({
  entries,
  loading,
}: {
  entries: SessionActivityEntry[]
  loading: boolean
}) {
  if (loading) return <p className="font-sans text-sm text-paper/60">Loading activity…</p>
  if (entries.length === 0) return <p className="font-sans text-sm text-paper/60">No activity yet.</p>

  const sorted = [...entries].sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  return (
    <ul className="flex flex-col gap-2">
      {sorted.map((entry) => (
        <li
          key={entry.id}
          className="flex items-center justify-between border-b border-paper/10 pb-2 font-sans text-sm"
        >
          <span className="text-paper">{describeActivity(entry)}</span>
          <Mono className="text-xs text-paper/60">{formatTime(entry.createdAt)}</Mono>
        </li>
      ))}
    </ul>
  )
}
