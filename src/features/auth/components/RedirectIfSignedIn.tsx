import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthContext } from '../authContext'

/** Keeps the login screen reachable only while truly logged out. */
export function RedirectIfSignedIn({ children }: { children: ReactNode }) {
  const { auth } = useAuthContext()

  if (auth.status === 'guest' || auth.status === 'account') return <Navigate to="/app" replace />

  return <>{children}</>
}
