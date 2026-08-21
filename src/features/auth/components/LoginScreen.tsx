import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useAuthContext } from '../authContext'
import { EmailPasswordForm } from './EmailPasswordForm'
import { GoogleOAuthButton } from './GoogleOAuthButton'

export function LoginScreen() {
  const { continueAsGuest } = useAuthContext()

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-1 font-serif text-3xl text-paper">CashOut</h1>
        <p className="mb-8 font-sans text-sm text-paper/60">Track your sessions. Settle up with the truth.</p>

        <Card className="mb-4">
          <EmailPasswordForm />
          <div className="my-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-paper/15" />
            <span className="font-sans text-xs text-paper/60">or</span>
            <div className="h-px flex-1 bg-paper/15" />
          </div>
          <GoogleOAuthButton />
        </Card>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-paper/15" />
          <span className="font-sans text-xs text-paper/60">or</span>
          <div className="h-px flex-1 bg-paper/15" />
        </div>

        <Button variant="ghost" className="mt-4 w-full" onClick={continueAsGuest}>
          Continue as Guest
        </Button>
      </div>
    </div>
  )
}
