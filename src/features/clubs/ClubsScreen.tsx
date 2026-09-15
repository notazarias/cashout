import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Mono } from '@/components/ui/Mono'
import { ModalOverlay } from '@/components/ui/ModalOverlay'
import { PageShell } from '@/components/ui/PageShell'
import { useAuth } from '@/features/auth/authContext'
import { createClub, joinClub } from './clubsApi'
import { CreateClubForm } from './components/CreateClubForm'
import { JoinClubForm } from './components/JoinClubForm'
import { useMyClubs } from './useMyClubs'

export function ClubsScreen() {
  const auth = useAuth()
  const { clubs, loading, refresh } = useMyClubs()
  const [showCreate, setShowCreate] = useState(false)
  const [showJoin, setShowJoin] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (auth.status !== 'account') {
    return (
      <PageShell>
        <Card>
          <p className="font-sans text-sm text-paper/60">
            Create an account to set up a club with your regular group.
          </p>
        </Card>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl text-paper">Clubs</h1>
          <p className="mt-1 font-sans text-sm text-paper/60">
            A standing group with a join code that doesn't expire.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setShowCreate(true)}>
            Create Club
          </Button>
          <Button variant="secondary" onClick={() => setShowJoin(true)}>
            Join Club
          </Button>
        </div>
      </div>

      {loading ? (
        <p className="font-sans text-sm text-paper/60">Loading your clubs…</p>
      ) : clubs.length === 0 ? (
        <Card>
          <p className="font-sans text-sm text-paper/60">
            You're not in any clubs yet. Create one for your regular game, or join with a code.
          </p>
        </Card>
      ) : (
        <Card className="p-0">
          <ul className="divide-y divide-paper/10">
            {clubs.map((club) => (
              <li key={club.id}>
                <Link
                  to={`/app/clubs/${club.id}`}
                  className="flex items-center justify-between gap-3 px-6 py-4 hover:bg-paper/5"
                >
                  <div>
                    <p className="font-serif text-xl text-paper">{club.name}</p>
                    <p className="mt-0.5 font-sans text-xs text-paper/60">
                      Code <Mono className="text-paper/80">{club.joinCode}</Mono>
                      {club.ownerId === auth.user.id && ' · you own this club'}
                    </p>
                  </div>
                  <span className="font-sans text-sm font-medium text-amber">Open →</span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Link to="/app" className="font-sans text-sm text-teal hover:text-paper">
        ← Back to Dashboard
      </Link>

      {showCreate && (
        <ModalOverlay>
          <Card className="w-full max-w-md">
            <h2 className="mb-4 font-serif text-xl text-paper">Create a Club</h2>
            <CreateClubForm
              onSubmit={async (input) => {
                setError(null)
                try {
                  await createClub(input)
                  setShowCreate(false)
                  await refresh()
                } catch (err) {
                  setError(err instanceof Error ? err.message : 'Could not create that club.')
                }
              }}
              onCancel={() => {
                setError(null)
                setShowCreate(false)
              }}
            />
            {error && <p className="mt-2 font-sans text-sm text-loss">{error}</p>}
          </Card>
        </ModalOverlay>
      )}

      {showJoin && (
        <ModalOverlay>
          <Card className="w-full max-w-md">
            <h2 className="mb-4 font-serif text-xl text-paper">Join a Club</h2>
            <JoinClubForm
              onSubmit={async (code) => {
                setError(null)
                try {
                  await joinClub(code)
                  setShowJoin(false)
                  await refresh()
                } catch (err) {
                  setError(err instanceof Error ? err.message : 'Could not join that club.')
                }
              }}
              onCancel={() => {
                setError(null)
                setShowJoin(false)
              }}
            />
            {error && <p className="mt-2 font-sans text-sm text-loss">{error}</p>}
          </Card>
        </ModalOverlay>
      )}
    </PageShell>
  )
}
