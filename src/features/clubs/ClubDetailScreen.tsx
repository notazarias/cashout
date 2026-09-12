import { Link, Navigate, useParams } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Mono } from '@/components/ui/Mono'
import { PageShell } from '@/components/ui/PageShell'
import { useAuth } from '@/features/auth/authContext'
import { ClubActiveTableBanner } from './components/ClubActiveTableBanner'
import { ClubMemberList } from './components/ClubMemberList'
import { useClub } from './useClub'

export function ClubDetailScreen() {
  const { clubId } = useParams<{ clubId: string }>()
  const auth = useAuth()
  const { club, members, openTable, loading } = useClub(clubId)

  if (auth.status !== 'account') {
    return <Navigate to="/app" replace />
  }

  if (loading) {
    return <p className="font-sans text-sm text-paper/60">Loading club…</p>
  }

  if (!club) {
    return <Navigate to="/app/clubs" replace />
  }

  return (
    <PageShell>
      <Card>
        <h1 className="font-serif text-3xl text-paper">{club.name}</h1>
        <p className="mt-2 font-sans text-sm text-paper/60">
          Join code <Mono className="text-lg tracking-widest text-paper">{club.joinCode}</Mono>
        </p>
        <p className="mt-1 font-sans text-xs text-paper/40">
          Share this with your group — it doesn't expire.
        </p>
      </Card>

      {openTable ? (
        openTable.hostId === auth.user.id ? (
          <Card className="border-amber/60">
            <Link to={`/app/table/${openTable.id}`} className="flex items-center justify-between gap-3">
              <span className="font-sans text-sm text-paper">
                You're hosting this club's table · code{' '}
                <Mono className="text-paper">{openTable.code}</Mono>
              </span>
              <span className="font-sans text-sm font-medium text-amber">Manage →</span>
            </Link>
          </Card>
        ) : (
          <ClubActiveTableBanner table={openTable} clubName={club.name} />
        )
      ) : null}

      <Card>
        <h2 className="mb-2 font-serif text-2xl text-paper">
          Members <span className="font-sans text-base text-paper/40">({members.length})</span>
        </h2>
        <ClubMemberList members={members} currentUserId={auth.user.id} />
      </Card>

      <Link to="/app/clubs" className="font-sans text-sm text-teal hover:text-paper">
        ← All Clubs
      </Link>
    </PageShell>
  )
}
