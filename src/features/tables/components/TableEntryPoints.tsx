import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useAuth } from '@/features/auth/authContext'
import { anonSupabase } from '@/lib/anonSupabaseClient'
import { ensureGuestTableIdentity } from '../guestTableAuth'
import { createTable, joinTable } from '../tablesApi'
import { useGuestTableSession } from '../useGuestTableSession'
import { HostTableForm } from './HostTableForm'
import { JoinTableForm } from './JoinTableForm'

export function TableEntryPoints() {
  const auth = useAuth()
  const navigate = useNavigate()
  const guestTable = useGuestTableSession()
  const [showHost, setShowHost] = useState(false)
  const [showJoin, setShowJoin] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (auth.status !== 'account' && auth.status !== 'guest') {
    return (
      <Card>
        <p className="font-sans text-sm text-paper/60">
          Create an account to host or join a table with friends.
        </p>
      </Card>
    )
  }

  if (auth.status === 'guest') {
    if (guestTable.session) {
      return (
        <Card className="border-amber/60">
          <Link
            to={`/app/table-session/${guestTable.session.id}`}
            className="flex items-center justify-between gap-3"
          >
            <span className="font-sans text-sm text-paper">You're already playing at a table.</span>
            <span className="font-sans text-sm font-medium text-amber">Resume →</span>
          </Link>
        </Card>
      )
    }

    return (
      <Card className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-sans text-sm text-paper/60">Playing with friends?</p>
          <p className="font-sans text-xs text-paper/40">Joining as a guest doesn't create a permanent account.</p>
        </div>
        <Button variant="secondary" onClick={() => setShowJoin(true)}>
          Join a Table
        </Button>

        {showJoin && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 px-4">
            <Card className="w-full max-w-md">
              <h2 className="mb-4 font-serif text-xl text-paper">Join a Table</h2>
              <JoinTableForm
                onSubmit={async (input) => {
                  setError(null)
                  try {
                    await ensureGuestTableIdentity()
                    const session = await joinTable(input, anonSupabase)
                    setShowJoin(false)
                    navigate(`/app/table-session/${session.id}`)
                  } catch (err) {
                    setError(err instanceof Error ? err.message : 'Could not join that table.')
                  }
                }}
                onCancel={() => setShowJoin(false)}
              />
              {error && <p className="mt-2 text-sm text-loss">{error}</p>}
            </Card>
          </div>
        )}
      </Card>
    )
  }

  return (
    <Card className="flex flex-wrap items-center justify-between gap-3">
      <p className="font-sans text-sm text-paper/60">Playing with friends?</p>
      <div className="flex gap-2">
        <Button variant="secondary" onClick={() => setShowHost(true)}>
          Host a Table
        </Button>
        <Button variant="secondary" onClick={() => setShowJoin(true)}>
          Join a Table
        </Button>
      </div>

      {showHost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 px-4">
          <Card className="w-full max-w-sm">
            <h2 className="mb-4 font-serif text-xl text-paper">Host a Table</h2>
            <HostTableForm
              onSubmit={async (input) => {
                setError(null)
                try {
                  const table = await createTable(auth.user.id, input)
                  const session = await joinTable({
                    code: table.code,
                    date: new Date().toISOString().slice(0, 10),
                    locationLabel: table.locationLabel,
                    buyInCents: table.buyInCents,
                  })
                  setShowHost(false)
                  navigate(`/app/session/${session.id}`)
                } catch (err) {
                  setError(err instanceof Error ? err.message : 'Could not host a table.')
                }
              }}
              onCancel={() => setShowHost(false)}
            />
            {error && <p className="mt-2 text-sm text-loss">{error}</p>}
          </Card>
        </div>
      )}

      {showJoin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 px-4">
          <Card className="w-full max-w-sm">
            <h2 className="mb-4 font-serif text-xl text-paper">Join a Table</h2>
            <JoinTableForm
              onSubmit={async (input) => {
                setError(null)
                try {
                  const session = await joinTable(input)
                  setShowJoin(false)
                  navigate(`/app/session/${session.id}`)
                } catch (err) {
                  setError(err instanceof Error ? err.message : 'Could not join that table.')
                }
              }}
              onCancel={() => setShowJoin(false)}
            />
            {error && <p className="mt-2 text-sm text-loss">{error}</p>}
          </Card>
        </div>
      )}
    </Card>
  )
}
