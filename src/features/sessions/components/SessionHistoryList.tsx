import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import type { NewSessionInput, Session } from '@/lib/dataAdapter/types'
import { SessionForm } from './SessionForm'
import { SessionTicketCard } from './SessionTicketCard'

export function SessionHistoryList({
  sessions,
  onCreate,
  onUpdate,
  onDelete,
}: {
  sessions: Session[]
  onCreate: (input: NewSessionInput) => Promise<unknown>
  onUpdate: (id: string, patch: Partial<NewSessionInput>) => Promise<unknown>
  onDelete: (id: string) => Promise<unknown>
}) {
  const [modal, setModal] = useState<'closed' | 'new' | Session>('closed')

  const sorted = [...sessions].sort((a, b) => b.date.localeCompare(a.date))

  async function handleSubmit(input: NewSessionInput) {
    if (modal !== 'closed' && modal !== 'new') {
      await onUpdate(modal.id, input)
    } else {
      await onCreate(input)
    }
    setModal('closed')
  }

  async function handleDelete(session: Session) {
    if (!window.confirm(`Delete the ${session.date} session? This can't be undone.`)) return
    await onDelete(session.id)
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-serif text-xl font-semibold text-paper">Session History</h2>
        <Button onClick={() => setModal('new')}>+ Log Session</Button>
      </div>

      {sorted.length === 0 ? (
        <Card>
          <p className="font-sans text-sm text-sage">
            No sessions yet — log your first one to start tracking your bankroll.
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {sorted.map((session) => (
            <SessionTicketCard
              key={session.id}
              session={session}
              onEdit={() => setModal(session)}
              onDelete={() => handleDelete(session)}
            />
          ))}
        </div>
      )}

      {modal !== 'closed' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 px-4">
          <Card className="w-full max-w-sm">
            <h2 className="mb-4 font-serif text-xl font-semibold text-paper">
              {modal === 'new' ? 'Log a Session' : 'Edit Session'}
            </h2>
            <SessionForm
              initial={modal === 'new' ? undefined : modal}
              submitLabel={modal === 'new' ? 'Log Session' : 'Save Changes'}
              onSubmit={handleSubmit}
              onCancel={() => setModal('closed')}
            />
          </Card>
        </div>
      )}
    </div>
  )
}
