import { Mono } from '@/components/ui/Mono'
import type { OpenSession } from '@/lib/dataAdapter/types'
import { formatElapsedMinutes, useElapsedSeconds } from '../useElapsedSeconds'

/** Isolated so its 1-second tick doesn't re-render the rest of the screen. */
export function ElapsedClock({ session, className = '' }: { session: OpenSession; className?: string }) {
  const elapsed = useElapsedSeconds(session)
  return <Mono className={className}>{formatElapsedMinutes(elapsed)}</Mono>
}
