import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthContext } from '../authContext'

export function RequireSession({ children }: { children: ReactNode }) {
  const { auth } = useAuthContext()

  if (auth.status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink">
        <p className="font-sans text-sm text-sage">Loading…</p>
      </div>
    )
  }

  if (auth.status === 'logged_out') return <Navigate to="/" replace />

  return <>{children}</>
}
