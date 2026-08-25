import { z } from 'zod'
import {
  DuplicateOpenSessionError,
  isOpenSession,
  type CloseSessionInput,
  type ClosedSession,
  type DataAdapter,
  type LogCompletedSessionInput,
  type OpenSession,
  type Session,
  type SessionActivityEntry,
  type StartSessionInput,
} from './types'

const STORAGE_KEY = 'cashout_guest_sessions'

/** Wider than the public Session type — the itemized log is an adapter-internal detail. */
type StoredSession = Session & { activity: SessionActivityEntry[] }

const activityEntrySchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  userId: z.null(),
  type: z.enum(['buy_in', 'pause', 'resume']),
  amountCents: z.number().nullable(),
  createdAt: z.string(),
})

const baseFields = {
  id: z.string(),
  userId: z.null(),
  date: z.string(),
  buyInCents: z.number(),
  locationLabel: z.string().optional(),
  durationMinutes: z.number().optional(),
  pausedAt: z.string().nullable().default(null),
  totalPausedSeconds: z.number().default(0),
  tableId: z.null().default(null),
  tableCode: z.null().default(null),
  activity: z.array(activityEntrySchema).default([]),
  createdAt: z.string(),
}

const openSessionSchema = z.object({
  ...baseFields,
  status: z.literal('open'),
  cashOutCents: z.null(),
  startedAt: z.string().nullable(),
  closedAt: z.null(),
})

const closedSessionSchema = z.object({
  ...baseFields,
  status: z.literal('closed'),
  cashOutCents: z.number(),
  startedAt: z.string().nullable(),
  closedAt: z.string().nullable(),
})

const currentSessionSchema = z.discriminatedUnion('status', [openSessionSchema, closedSessionSchema])

/** Pre-lifecycle shape — guest data written before status/startedAt/closedAt existed. */
const legacySessionSchema = z.object({ ...baseFields, cashOutCents: z.number() })

function upgradeLegacy(row: unknown): StoredSession | null {
  const current = currentSessionSchema.safeParse(row)
  if (current.success) return current.data
  const legacy = legacySessionSchema.safeParse(row)
  if (!legacy.success) return null
  return { ...legacy.data, status: 'closed', startedAt: null, closedAt: legacy.data.createdAt }
}

function readAll(): StoredSession[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return []
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return []
  }
  if (!Array.isArray(parsed)) return []
  return parsed.map(upgradeLegacy).filter((s): s is StoredSession => s !== null)
}

function writeAll(sessions: StoredSession[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
}

export class LocalStorageAdapter implements DataAdapter {
  readonly mode = 'guest' as const

  async listSessions(): Promise<Session[]> {
    return readAll()
  }

  async startSession(input: StartSessionInput): Promise<OpenSession> {
    const sessions = readAll()
    if (sessions.some(isOpenSession)) throw new DuplicateOpenSessionError()
    const session: StoredSession & OpenSession = {
      ...input,
      id: crypto.randomUUID(),
      userId: null,
      status: 'open',
      cashOutCents: null,
      startedAt: new Date().toISOString(),
      closedAt: null,
      pausedAt: null,
      totalPausedSeconds: 0,
      tableId: null,
      tableCode: null,
      activity: [],
      createdAt: new Date().toISOString(),
    }
    sessions.push(session)
    writeAll(sessions)
    return session
  }

  async addBuyIn(id: string, amountCents: number): Promise<OpenSession> {
    const sessions = readAll()
    const index = sessions.findIndex((s) => s.id === id)
    if (index === -1) throw new Error(`Session ${id} not found`)
    const target = sessions[index]
    if (!isOpenSession(target)) throw new Error('Cannot add a buy-in to a closed session.')
    const entry: SessionActivityEntry = {
      id: crypto.randomUUID(),
      sessionId: id,
      userId: null,
      type: 'buy_in',
      amountCents,
      createdAt: new Date().toISOString(),
    }
    const updated: StoredSession & OpenSession = {
      ...target,
      buyInCents: target.buyInCents + amountCents,
      activity: [...target.activity, entry],
    }
    sessions[index] = updated
    writeAll(sessions)
    return updated
  }

  async pauseSession(id: string): Promise<OpenSession> {
    const sessions = readAll()
    const index = sessions.findIndex((s) => s.id === id)
    if (index === -1) throw new Error(`Session ${id} not found`)
    const target = sessions[index]
    if (!isOpenSession(target)) throw new Error('Cannot pause a closed session.')
    if (target.pausedAt) throw new Error('Session is already paused.')
    const entry: SessionActivityEntry = {
      id: crypto.randomUUID(),
      sessionId: id,
      userId: null,
      type: 'pause',
      amountCents: null,
      createdAt: new Date().toISOString(),
    }
    const updated: StoredSession & OpenSession = {
      ...target,
      pausedAt: new Date().toISOString(),
      activity: [...target.activity, entry],
    }
    sessions[index] = updated
    writeAll(sessions)
    return updated
  }

  async resumeSession(id: string): Promise<OpenSession> {
    const sessions = readAll()
    const index = sessions.findIndex((s) => s.id === id)
    if (index === -1) throw new Error(`Session ${id} not found`)
    const target = sessions[index]
    if (!isOpenSession(target)) throw new Error('Cannot resume a closed session.')
    if (!target.pausedAt) throw new Error('Session is not paused.')
    const pausedSeconds = Math.max(0, Math.floor((Date.now() - new Date(target.pausedAt).getTime()) / 1000))
    const entry: SessionActivityEntry = {
      id: crypto.randomUUID(),
      sessionId: id,
      userId: null,
      type: 'resume',
      amountCents: null,
      createdAt: new Date().toISOString(),
    }
    const updated: StoredSession & OpenSession = {
      ...target,
      pausedAt: null,
      totalPausedSeconds: target.totalPausedSeconds + pausedSeconds,
      activity: [...target.activity, entry],
    }
    sessions[index] = updated
    writeAll(sessions)
    return updated
  }

  async closeSession(id: string, input: CloseSessionInput): Promise<ClosedSession> {
    const sessions = readAll()
    const index = sessions.findIndex((s) => s.id === id)
    if (index === -1) throw new Error(`Session ${id} not found`)
    const target = sessions[index]
    if (!isOpenSession(target)) throw new Error('Session is already closed.')
    const updated: StoredSession & ClosedSession = {
      ...target,
      status: 'closed' as const,
      cashOutCents: input.cashOutCents,
      closedAt: new Date().toISOString(),
    }
    sessions[index] = updated
    writeAll(sessions)
    return updated
  }

  async logCompletedSession(input: LogCompletedSessionInput): Promise<ClosedSession> {
    const sessions = readAll()
    const session: StoredSession & ClosedSession = {
      ...input,
      id: crypto.randomUUID(),
      userId: null,
      status: 'closed' as const,
      startedAt: null,
      closedAt: null,
      pausedAt: null,
      totalPausedSeconds: 0,
      tableId: null,
      tableCode: null,
      activity: [],
      createdAt: new Date().toISOString(),
    }
    sessions.push(session)
    writeAll(sessions)
    return session
  }

  async listActivity(sessionId: string): Promise<SessionActivityEntry[]> {
    const target = readAll().find((s) => s.id === sessionId)
    if (!target) return []
    return [...target.activity].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  }

  async deleteSession(id: string): Promise<void> {
    writeAll(readAll().filter((s) => s.id !== id))
  }
}
