import { useState } from 'react'
import { Link, Outlet } from 'react-router-dom'
import { useAuthContext } from '@/features/auth/authContext'
import { GuestConversionPrompt } from '@/features/auth/components/GuestConversionPrompt'
import { hasGuestData } from '@/features/auth/guestSession'
import { useGuestTableSession } from '@/features/tables/useGuestTableSession'

export function AppHome() {
  const { auth, signOutAccount, exitGuestSession } = useAuthContext()
  const guestTable = useGuestTableSession()
  const [showConversionPrompt, setShowConversionPrompt] = useState(false)

  if (auth.status !== 'guest' && auth.status !== 'account') return null

  const isGuest = auth.status === 'guest'

  function handleLogoutClick() {
    if (isGuest && guestTable.session) {
      const proceed = window.confirm(
        "You have an open table session — logging out means you can't get back into it until you rejoin. Log out anyway?",
      )
      if (!proceed) return
    }
    if (isGuest && hasGuestData()) {
      setShowConversionPrompt(true)
      return
    }
    if (isGuest) {
      // Nothing to lose — skip the prompt entirely.
      exitGuestSession()
    } else {
      void signOutAccount()
    }
  }

  return (
    <div className="min-h-screen bg-ink px-6 py-8 lg:px-12 xl:px-16">
      <div className="mx-auto max-w-[1920px]">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <h1 className="font-serif text-4xl text-paper">CashOut</h1>
          <div className="flex min-w-0 items-center gap-3 font-sans text-sm text-paper/60 sm:gap-4 sm:text-base">
            {!isGuest && (
              <Link to="/app/clubs" className="shrink-0 text-paper/60 hover:text-paper">
                Clubs
              </Link>
            )}
            <span className="min-w-0 truncate font-mono text-paper">
              {auth.status === 'account' ? auth.user.email : `guest-${auth.guestId.slice(0, 8)}`}
            </span>
            <button onClick={handleLogoutClick} className="shrink-0 text-paper/60 hover:text-paper">
              Log Out
            </button>
          </div>
        </header>

        {isGuest && (
          <div className="mb-4 rounded-sm border border-amber/40 bg-paper-dim px-4 py-3 font-sans text-sm text-paper">
            You're in guest mode — nothing here is saved
            {guestTable.session ? ', except your live table session, which the host can see' : ''}.{' '}
            <button
              className="font-medium text-amber underline underline-offset-2"
              onClick={() => setShowConversionPrompt(true)}
            >
              Create an account
            </button>{' '}
            to keep it.
          </div>
        )}

        <Outlet />

        <footer className="mt-12 border-t border-paper/10 pt-6">
          <Link to="/privacy" className="font-sans text-xs text-paper/40 hover:text-paper/60">
            Privacy
          </Link>
        </footer>
      </div>

      {showConversionPrompt && (
        <GuestConversionPrompt onDecline={() => setShowConversionPrompt(false)} />
      )}
    </div>
  )
}
