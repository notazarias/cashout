import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import type { ClosedSession, LogCompletedSessionInput } from '@/lib/dataAdapter/types'
import { SessionForm } from './SessionForm'
import { SessionTicketCard } from './SessionTicketCard'

export function SessionHistoryList({
  sessions,
  onCreate,
  onDelete,
}: {
  sessions: ClosedSession[]
  onCreate: (input: LogCompletedSessionInput) => Promise<unknown>
  onDelete: (id: string) => Promise<unknown>
}) {
  const [modalOpen, setModalOpen] = useState(false)

  const sorted = [...sessions].sort((a, b) => b.date.localeCompare(a.date))

  async function handleSubmit(input: LogCompletedSessionInput) {
    await onCreate(input)
    setModalOpen(false)
  }

  async function handleDelete(session: ClosedSession) {
    if (!window.confirm(`Delete the ${session.date} session? This can't be undone.`)) return
    await onDelete(session.id)
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-serif text-xl font-semibold text-paper">Session History</h2>
        <Button variant="secondary" onClick={() => setModalOpen(true)}>
          + Log a Past Session
        </Button>
      </div>

      {sorted.length === 0 ? (
        <Card>
          <p className="font-sans text-sm text-sage">
            No sessions yet — start one live, or log a past session to start tracking your bankroll.
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {sorted.map((session) => (
            <SessionTicketCard key={session.id} session={session} onDelete={() => handleDelete(session)} />
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 px-4">
          <Card className="w-full max-w-sm">
            <h2 className="mb-4 font-serif text-xl font-semibold text-paper">Log a Past Session</h2>
            <SessionForm onSubmit={handleSubmit} onCancel={() => setModalOpen(false)} />
          </Card>
        </div>
      )}
    </div>
  )
}
