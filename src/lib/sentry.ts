import * as Sentry from '@sentry/react'

let initialized = false

/** No-ops if VITE_SENTRY_DSN isn't set (e.g. local dev without it configured) rather than
 * spamming an invalid-DSN warning on every load. */
export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN
  if (!dsn) return
  Sentry.init({ dsn, environment: import.meta.env.MODE })
  initialized = true
}

/** Call from the catch block of anything that talks to Supabase — same call sites that already
 * setError() to tell the user, so failures reach us with the same context, not just a UI message
 * only they see. `context` is a short label for what operation failed (e.g. "join table"). */
export function reportError(error: unknown, context: string) {
  if (!initialized) return
  Sentry.captureException(error, { extra: { context } })
}

export { ErrorBoundary } from '@sentry/react'
