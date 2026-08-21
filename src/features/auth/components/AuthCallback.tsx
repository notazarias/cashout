import { Navigate } from 'react-router-dom'
import { useAuthContext } from '../authContext'

/**
 * supabase-js reads the OAuth code/fragment from the URL automatically
 * (detectSessionInUrl) and fires onAuthStateChange — this screen just
 * waits for AuthProvider to resolve the resulting status.
 */
export function AuthCallback() {
  const { auth } = useAuthContext()

  if (auth.status === 'account') return <Navigate to="/app" replace />

  // Deliberately don't redirect on 'logged_out' here: supabase-js processes
  // the OAuth redirect URL asynchronously, so status can flash 'logged_out'
  // before the SIGNED_IN event lands. Wait it out rather than bouncing the
  // user back to "/" mid-login.
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink">
      <p className="font-sans text-sm text-paper/60">Signing you in…</p>
    </div>
  )
}
