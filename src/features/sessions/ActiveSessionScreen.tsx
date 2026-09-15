import type { SupabaseClient } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Money, Mono } from '@/components/ui/Mono'
import { ModalOverlay } from '@/components/ui/ModalOverlay'
import { PageShell } from '@/components/ui/PageShell'
import { derivedDurationMinutes, netCents } from '@/features/dashboard/stats'
import { TableLiveStatusSection } from '@/features/tables/components/TableLiveStatusSection'
import type { ClosedSession, DataAdapter } from '@/lib/dataAdapter/types'
import { supabase } from '@/lib/supabaseClient'
import { AddBuyInForm } from './components/AddBuyInForm'
import { CloseSessionForm } from './components/CloseSessionForm'
import { ElapsedClock } from './components/ElapsedClock'
import { SessionActivityFeed } from './components/SessionActivityFeed'
import { useSessionActivity } from './useSessionActivity'
import { useSessions } from './useSessions'

function formatStartedAt(iso: string | null): string {
  if (!iso) return ''
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function ActiveSessionScreen({
  adapterOverride,
  client = supabase,
}: { adapterOverride?: DataAdapter; client?: SupabaseClient } = {}) {
  const { id } = useParams<{ id: string }>()
  const { openSession, loading, addBuyIn, pauseSession, resumeSession, closeSession } =
    useSessions(adapterOverride)
  const activity = useSessionActivity(id ?? null, adapterOverride)
  const [showAddChips, setShowAddChips] = useState(false)
  const [showClose, setShowClose] = useState(false)
  const [closedSession, setClosedSession] = useState<ClosedSession | null>(null)
  // Latches once we've successfully matched an open session for this :id. After
  // that, a transient null openSession (e.g. right after our own Cash Out call,
  // before closedSession's setState has committed) must never bounce the user
  // back to the dashboard — only an id that was never valid should redirect.
  const [confirmedValid, setConfirmedValid] = useState(false)

  useEffect(() => {
    if (!loading && openSession && openSession.id === id) setConfirmedValid(true)
  }, [loading, openSession, id])

  if (loading) {
    return <p className="font-sans text-sm text-paper/60">Loading session…</p>
  }

  if (closedSession) {
    // handled below, before the redirect guard runs
  } else if (!confirmedValid && (!openSession || openSession.id !== id)) {
    return <Navigate to="/app" replace />
  } else if (!openSession) {
    // Transient gap between Cash Out succeeding and closedSession committing.
    return <p className="font-sans text-sm text-paper/60">Loading session…</p>
  }

  if (closedSession) {
    const net = netCents(closedSession)
    const duration = derivedDurationMinutes(closedSession)
    return (
      <PageShell>
        <Card>
          <h1 className="mb-1 font-serif text-2xl text-paper">Session Complete</h1>
          <p className="mb-8 font-sans text-sm text-paper/60">
            {closedSession.locationLabel || 'Session'} · {closedSession.date}
          </p>
          <div className="mb-8">
            <Money cents={net} className="text-6xl font-medium tracking-tight lg:text-7xl" />
          </div>
          <div className="mb-8 flex flex-col gap-1 font-sans text-base text-paper/60">
            <span>
              Buy-in <Mono className="text-paper">${(closedSession.buyInCents / 100).toFixed(2)}</Mono>
            </span>
            <span>
              Cash-out <Mono className="text-paper">${(closedSession.cashOutCents / 100).toFixed(2)}</Mono>
            </span>
            {duration !== undefined && (
              <span>
                Duration <Mono className="text-paper">{duration}m</Mono>
              </span>
            )}
          </div>

          {closedSession.tableId && (
            <div className="mb-8 flex flex-col gap-6">
              <TableLiveStatusSection tableId={closedSession.tableId} client={client} />
            </div>
          )}

          <Link to="/app">
            <Button size="lg" className="w-full">
              Back to Dashboard
            </Button>
          </Link>
        </Card>
      </PageShell>
    )
  }

  const session = openSession!
  const mostRecent = [...activity.entries].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0]

  return (
    <PageShell>
      <Link to="/app" className="font-sans text-sm text-teal hover:text-paper">
        ← Dashboard
      </Link>

      {/* Game type/stakes and a visibility indicator are deliberately omitted —
          CashOut doesn't track either concept. */}
      <Card>
        <div className="flex items-center gap-2">
          <span className="rounded-sm bg-amber px-1.5 py-0.5 font-mono text-[10px] font-medium text-ink">LIVE</span>
          <h1 className="font-serif text-xl text-paper">
            {session.locationLabel || 'Session in progress'}
          </h1>
        </div>
        <p className="mt-1 font-sans text-sm text-paper/60">
          Started {formatStartedAt(session.startedAt)}
        </p>
        {session.tableId && (
          <p className="mt-1 font-sans text-sm text-paper/60">
            Table code <Mono className="text-paper">{session.tableCode}</Mono>
          </p>
        )}
      </Card>

      <Card>
        <p className="mb-3 font-sans text-xs uppercase tracking-wide text-paper/60">In for</p>
        <Mono className="text-6xl font-medium tracking-tight text-paper lg:text-7xl">
          ${(session.buyInCents / 100).toFixed(2)}
        </Mono>
        <div className="mt-8 flex items-center gap-4">
          <div>
            <p className="mb-2 font-sans text-xs uppercase tracking-wide text-paper/60">Elapsed</p>
            <ElapsedClock session={session} className="text-3xl text-paper lg:text-4xl" />
          </div>
        </div>
        <p className="mt-6 font-sans text-sm text-paper/60">
          {mostRecent ? `Last activity: ${new Date(mostRecent.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}` : 'No activity yet.'}
        </p>
      </Card>

      <div className="flex flex-wrap gap-4">
        <Button
          size="lg"
          variant="secondary"
          onClick={async () => {
            if (session.pausedAt) {
              await resumeSession(session.id)
            } else {
              await pauseSession(session.id)
            }
            void activity.refresh()
          }}
        >
          {session.pausedAt ? 'Resume' : 'Pause'}
        </Button>
        <Button size="lg" variant="secondary" onClick={() => setShowAddChips(true)}>
          Add Chips
        </Button>
        <Button size="lg" onClick={() => setShowClose(true)}>
          Cash Out
        </Button>
      </div>

      <Card>
        <h2 className="mb-4 font-serif text-lg text-paper">Activity</h2>
        <SessionActivityFeed entries={activity.entries} loading={activity.loading} />
      </Card>

      {showAddChips && (
        <ModalOverlay>
          <Card className="w-full max-w-sm">
            <h2 className="mb-4 font-serif text-xl text-paper">Add Chips</h2>
            <AddBuyInForm
              submitLabel="Add Chips"
              onSubmit={async (amountCents) => {
                await addBuyIn(session.id, amountCents)
                void activity.refresh()
                setShowAddChips(false)
              }}
            />
            <Button variant="ghost" className="mt-2 w-full" onClick={() => setShowAddChips(false)}>
              Cancel
            </Button>
          </Card>
        </ModalOverlay>
      )}

      {showClose && (
        <ModalOverlay>
          <Card className="w-full max-w-sm">
            <h2 className="mb-4 font-serif text-xl text-paper">Cash Out</h2>
            <CloseSessionForm
              onSubmit={async (input) => {
                if (session.pausedAt) {
                  await resumeSession(session.id)
                }
                const result = await closeSession(session.id, input)
                setShowClose(false)
                setClosedSession(result)
              }}
              onCancel={() => setShowClose(false)}
            />
          </Card>
        </ModalOverlay>
      )}
    </PageShell>
  )
}
