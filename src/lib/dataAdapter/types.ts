export type AdapterMode = 'guest' | 'account'
export type SessionStatus = 'open' | 'closed'

interface BaseSession {
  id: string
  userId: string | null
  date: string
  buyInCents: number
  locationLabel?: string
  durationMinutes?: number
  startedAt: string | null
  closedAt: string | null
  pausedAt: string | null
  totalPausedSeconds: number
  tableId: string | null
  tableCode: string | null
  createdAt: string
}

export interface OpenSession extends BaseSession {
  status: 'open'
  cashOutCents: null
}

export interface ClosedSession extends BaseSession {
  status: 'closed'
  cashOutCents: number
}

export type Session = OpenSession | ClosedSession

export function isOpenSession(s: Session): s is OpenSession {
  return s.status === 'open'
}

export function isClosedSession(s: Session): s is ClosedSession {
  return s.status === 'closed'
}

export interface StartSessionInput {
  date: string
  locationLabel?: string
  buyInCents: number
}

export interface LogCompletedSessionInput {
  date: string
  locationLabel?: string
  buyInCents: number
  cashOutCents: number
  durationMinutes?: number
}

export interface CloseSessionInput {
  cashOutCents: number
}

export type SessionActivityType = 'buy_in' | 'pause' | 'resume'

export interface SessionActivityEntry {
  id: string
  sessionId: string
  userId: string | null
  type: SessionActivityType
  amountCents: number | null
  createdAt: string
}

/** Thrown by the app-level pre-check and the DB unique-index fallback alike. */
export class DuplicateOpenSessionError extends Error {
  constructor() {
    super('You already have an active session — close it before starting a new one.')
    this.name = 'DuplicateOpenSessionError'
  }
}

export interface DataAdapter {
  readonly mode: AdapterMode
  listSessions(): Promise<Session[]>
  /** v1 deliberately does not auto-close or nudge long-open sessions. */
  startSession(input: StartSessionInput): Promise<OpenSession>
  addBuyIn(id: string, amountCents: number): Promise<OpenSession>
  closeSession(id: string, input: CloseSessionInput): Promise<ClosedSession>
  logCompletedSession(input: LogCompletedSessionInput): Promise<ClosedSession>
  pauseSession(id: string): Promise<OpenSession>
  resumeSession(id: string): Promise<OpenSession>
  listActivity(sessionId: string): Promise<SessionActivityEntry[]>
  deleteSession(id: string): Promise<void>
}
