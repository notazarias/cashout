import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuthContext } from '../authContext'

/** Supabase reports a failed OAuth exchange (wrong client secret, denied consent, expired code,
 * etc.) by redirecting back here with error info in the query string or hash — never as a thrown
 * exception, so there's nothing to catch. Both are checked since GoTrue's error placement has
 * varied by flow. */
function readOAuthError(): string | null {
  const params = new URLSearchParams(window.location.search || window.location.hash.replace(/^#/, ''))
  const description = params.get('error_description')
  return description ? description.replace(/\+/g, ' ') : params.get('error')
}

/** How long to wait for detectSessionInUrl to resolve before assuming it silently failed —
 * generous, since it's async, but a real user should never be stuck here indefinitely. */
const STUCK_TIMEOUT_MS = 8000

export function AuthCallback() {
  const { auth } = useAuthContext()
  const [oauthError] = useState(readOAuthError)
  const [timedOut, setTimedOut] = useState(false)

  useEffect(() => {
    if (oauthError || auth.status === 'account') return
    const timer = setTimeout(() => setTimedOut(true), STUCK_TIMEOUT_MS)
    return () => clearTimeout(timer)
  }, [oauthError, auth.status])

  if (auth.status === 'account') return <Navigate to="/app" replace />

  if (oauthError || timedOut) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-ink px-4 text-center">
        <p className="font-serif text-xl text-paper">Couldn't sign you in</p>
        <p className="max-w-sm font-sans text-sm text-paper/60">
          {oauthError ?? 'That took longer than expected — the sign-in link may have expired.'}
        </p>
        <Link to="/" className="font-sans text-sm text-amber underline underline-offset-2">
          Back to log in
        </Link>
      </div>
    )
  }

  // Deliberately don't redirect on 'logged_out' here: supabase-js processes
  // the OAuth redirect URL asynchronously, so status can flash 'logged_out'
  // before the SIGNED_IN event lands. Wait it out (up to STUCK_TIMEOUT_MS)
  // rather than bouncing the user back to "/" mid-login.
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink">
      <p className="font-sans text-sm text-paper/60">Signing you in…</p>
    </div>
  )
}
