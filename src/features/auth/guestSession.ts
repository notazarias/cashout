const GUEST_ID_KEY = 'cashout_guest_id'
const GUEST_CREATED_AT_KEY = 'cashout_guest_created_at'
const GUEST_SESSIONS_KEY = 'cashout_guest_sessions'

export function getGuestId(): string | null {
  return localStorage.getItem(GUEST_ID_KEY)
}

export function startGuestSession(): string {
  const id = crypto.randomUUID()
  localStorage.setItem(GUEST_ID_KEY, id)
  localStorage.setItem(GUEST_CREATED_AT_KEY, new Date().toISOString())
  return id
}

export function clearGuestSession(): void {
  localStorage.removeItem(GUEST_ID_KEY)
  localStorage.removeItem(GUEST_CREATED_AT_KEY)
  localStorage.removeItem(GUEST_SESSIONS_KEY)
}

export function hasGuestData(): boolean {
  const raw = localStorage.getItem(GUEST_SESSIONS_KEY)
  if (!raw) return false
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length > 0
  } catch {
    return false
  }
}
