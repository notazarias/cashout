import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import type { OpenSession, StartSessionInput } from '@/lib/dataAdapter/types'
import { StartSessionForm } from './StartSessionForm'

export function ActiveSessionBanner({
  session,
  onStart,
}: {
  session: OpenSession | null
  onStart: (input: StartSessionInput) => Promise<void>
}) {
  const [showStart, setShowStart] = useState(false)

  if (!session) {
    return (
      <>
        <Card className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-sans text-sm text-paper/60">No session in progress.</p>
          <Button onClick={() => setShowStart(true)}>Start Session</Button>
        </Card>
        {showStart && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 px-4">
            <Card className="w-full max-w-sm">
              <h2 className="mb-4 font-serif text-xl text-paper">Start a Session</h2>
              <StartSessionForm
                onSubmit={async (input) => {
                  await onStart(input)
                  setShowStart(false)
                }}
                onCancel={() => setShowStart(false)}
              />
            </Card>
          </div>
        )}
      </>
    )
  }

  return (
    <Card className="border-amber/60">
      <Link to={`/app/session/${session.id}`} className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="rounded-sm bg-amber px-1.5 py-0.5 font-mono text-[10px] font-medium text-ink">
            LIVE
          </span>
          <span className="font-sans text-sm text-paper">
            Session in progress{session.locationLabel ? ` at ${session.locationLabel}` : ''}
          </span>
        </div>
        <span className="font-sans text-sm font-medium text-amber">Resume →</span>
      </Link>
    </Card>
  )
}
