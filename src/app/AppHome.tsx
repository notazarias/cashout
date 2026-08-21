import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { useAuthContext } from '@/features/auth/authContext'
import { GuestConversionPrompt } from '@/features/auth/components/GuestConversionPrompt'
import { hasGuestData } from '@/features/auth/guestSession'

export function AppHome() {
  const { auth, signOutAccount, exitGuestSession } = useAuthContext()
  const [showConversionPrompt, setShowConversionPrompt] = useState(false)

  if (auth.status !== 'guest' && auth.status !== 'account') return null

  const isGuest = auth.status === 'guest'

  function handleLogoutClick() {
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
    <div className="min-h-screen bg-ink px-6 py-8 lg:px-12">
      <div className="mx-auto max-w-[1600px]">
        <header className="mb-6 flex items-center justify-between">
          <h1 className="font-serif text-2xl text-paper">CashOut</h1>
          <div className="flex items-center gap-3 font-sans text-sm text-paper/60">
            <span className="font-mono text-paper">
              {auth.status === 'account' ? auth.user.email : `guest-${auth.guestId.slice(0, 8)}`}
            </span>
            <button onClick={handleLogoutClick} className="text-paper/60 hover:text-paper">
              Log Out
            </button>
          </div>
        </header>

        {isGuest && (
          <div className="mb-4 rounded-sm border border-amber/40 bg-paper-dim px-4 py-3 font-sans text-sm text-paper">
            You're in guest mode — nothing here is saved.{' '}
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
      </div>

      {showConversionPrompt && (
        <GuestConversionPrompt onDecline={() => setShowConversionPrompt(false)} />
      )}
    </div>
  )
}
