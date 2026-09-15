import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ModalOverlay } from '@/components/ui/ModalOverlay'
import { useGuestTableSession } from '@/features/tables/useGuestTableSession'
import { useAuthContext } from '../authContext'
import { EmailPasswordForm } from './EmailPasswordForm'
import { GoogleOAuthButton } from './GoogleOAuthButton'

/**
 * Shown when a guest explicitly logs out. Tab-close can't trigger a custom
 * prompt (browsers only allow a generic beforeunload confirm) — the
 * fallback for that case is that guest mode simply persists across reload
 * (see guestSession.ts), so the same "save your results" ask surfaces here
 * next time they choose to log out, rather than being lost.
 */
export function GuestConversionPrompt({ onDecline }: { onDecline: () => void }) {
  const { exitGuestSession } = useAuthContext()
  const guestTable = useGuestTableSession()
  const [wantsAccount, setWantsAccount] = useState(false)

  function handleDiscard() {
    if (guestTable.session) {
      const proceed = window.confirm(
        "You have an open table session — logging out means you can't get back into it until you rejoin. Log out anyway?",
      )
      if (!proceed) return
    }
    exitGuestSession()
    onDecline()
  }

  return (
    <ModalOverlay>
      <Card className="w-full max-w-md">
        {!wantsAccount ? (
          <>
            <h2 className="mb-2 font-serif text-xl text-paper">
              Save this session's results?
            </h2>
            <p className="mb-6 font-sans text-sm text-paper/60">
              Create an account and we'll move your guest data over. Otherwise it's gone once you log out.
            </p>
            <div className="flex flex-col gap-2">
              <Button onClick={() => setWantsAccount(true)}>Create an Account</Button>
              <Button variant="ghost" onClick={handleDiscard}>
                No thanks, discard it
              </Button>
            </div>
          </>
        ) : (
          <>
            <h2 className="mb-4 font-serif text-xl text-paper">Create your account</h2>
            <EmailPasswordForm migrateGuestData />
            <div className="my-4 flex items-center gap-3">
              <div className="h-px flex-1 bg-paper/15" />
              <span className="font-sans text-xs text-paper/60">or</span>
              <div className="h-px flex-1 bg-paper/15" />
            </div>
            <GoogleOAuthButton migrateGuestData />
          </>
        )}
      </Card>
    </ModalOverlay>
  )
}
