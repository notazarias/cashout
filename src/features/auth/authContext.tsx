import type { Session as SupabaseSession, User as SupabaseUser } from '@supabase/supabase-js'
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { anonSupabase } from '@/lib/anonSupabaseClient'
import { supabase } from '@/lib/supabaseClient'
import { migrateGuestDataToAccount } from '@/lib/dataAdapter/migration'
import { clearGuestSession, getGuestId, startGuestSession } from './guestSession'

const PENDING_MIGRATION_KEY = 'cashout_pending_guest_migration'

export type AuthStatus =
  | { status: 'loading' }
  | { status: 'logged_out' }
  | { status: 'guest'; guestId: string }
  | { status: 'account'; user: SupabaseUser }

export interface SignUpResult {
  confirmationRequired: boolean
}

interface AuthContextValue {
  auth: AuthStatus
  continueAsGuest: () => void
  exitGuestSession: () => void
  signInWithPassword: (email: string, password: string) => Promise<void>
  signUpWithPassword: (
    email: string,
    password: string,
    opts?: { migrateGuestData?: boolean },
  ) => Promise<SignUpResult>
  signInWithGoogle: (opts?: { migrateGuestData?: boolean }) => Promise<void>
  signOutAccount: () => Promise<void>
  resetPasswordForEmail: (email: string) => Promise<void>
  updatePassword: (newPassword: string) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

async function runPendingMigrationIfAny(userId: string) {
  if (localStorage.getItem(PENDING_MIGRATION_KEY) !== 'true') return
  try {
    await migrateGuestDataToAccount(supabase, userId)
  } finally {
    localStorage.removeItem(PENDING_MIGRATION_KEY)
    clearGuestSession()
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthStatus>({ status: 'loading' })

  useEffect(() => {
    let cancelled = false

    function resolveFromSupabaseSession(session: SupabaseSession | null) {
      if (cancelled) return
      if (session) {
        setAuth({ status: 'account', user: session.user })
        void runPendingMigrationIfAny(session.user.id)
        return
      }
      const guestId = getGuestId()
      setAuth(guestId ? { status: 'guest', guestId } : { status: 'logged_out' })
    }

    supabase.auth.getSession().then(({ data }) => resolveFromSupabaseSession(data.session))

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      resolveFromSupabaseSession(session)
    })

    return () => {
      cancelled = true
      subscription.subscription.unsubscribe()
    }
  }, [])

  function continueAsGuest() {
    const guestId = startGuestSession()
    setAuth({ status: 'guest', guestId })
  }

  function exitGuestSession() {
    clearGuestSession()
    // Callers (AppHome, GuestConversionPrompt) already warn first if an open
    // table session exists — by the time this runs, that's been confirmed.
    void anonSupabase.auth.signOut()
    setAuth({ status: 'logged_out' })
  }

  async function signInWithPassword(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  async function signUpWithPassword(
    email: string,
    password: string,
    opts?: { migrateGuestData?: boolean },
  ): Promise<SignUpResult> {
    if (opts?.migrateGuestData) {
      localStorage.setItem(PENDING_MIGRATION_KEY, 'true')
    }
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) {
      if (opts?.migrateGuestData) localStorage.removeItem(PENDING_MIGRATION_KEY)
      throw error
    }
    // If email confirmation is required, Supabase returns no session yet —
    // the pending-migration flag stays set and runs on the user's first
    // confirmed sign-in (see resolveFromSupabaseSession above).
    if (data.session && opts?.migrateGuestData) {
      await runPendingMigrationIfAny(data.session.user.id)
    }
    return { confirmationRequired: !data.session }
  }

  async function signInWithGoogle(opts?: { migrateGuestData?: boolean }) {
    if (opts?.migrateGuestData) {
      localStorage.setItem(PENDING_MIGRATION_KEY, 'true')
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) {
      if (opts?.migrateGuestData) localStorage.removeItem(PENDING_MIGRATION_KEY)
      throw error
    }
  }

  async function signOutAccount() {
    await supabase.auth.signOut()
  }

  async function resetPasswordForEmail(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    if (error) throw error
  }

  async function updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) throw error
  }

  return (
    <AuthContext.Provider
      value={{
        auth,
        continueAsGuest,
        exitGuestSession,
        signInWithPassword,
        signUpWithPassword,
        signInWithGoogle,
        signOutAccount,
        resetPasswordForEmail,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used within an AuthProvider')
  return ctx
}

/** Convenience hook for consumers that only need the current status. */
export function useAuth(): AuthStatus {
  return useAuthContext().auth
}
