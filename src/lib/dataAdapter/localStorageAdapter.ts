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
  type StartSessionInput,
} from './types'

const STORAGE_KEY = 'cashout_guest_sessions'

const baseFields = {
  id: z.string(),
  userId: z.null(),
  date: z.string(),
  buyInCents: z.number(),
  locationLabel: z.string().optional(),
  durationMinutes: z.number().optional(),
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

function upgradeLegacy(row: unknown): Session | null {
  const current = currentSessionSchema.safeParse(row)
  if (current.success) return current.data
  const legacy = legacySessionSchema.safeParse(row)
  if (!legacy.success) return null
  return { ...legacy.data, status: 'closed', startedAt: null, closedAt: legacy.data.createdAt }
}

function readAll(): Session[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return []
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return []
  }
  if (!Array.isArray(parsed)) return []
  return parsed.map(upgradeLegacy).filter((s): s is Session => s !== null)
}

function writeAll(sessions: Session[]): void {
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
    const session: OpenSession = {
      ...input,
      id: crypto.randomUUID(),
      userId: null,
      status: 'open',
      cashOutCents: null,
      startedAt: new Date().toISOString(),
      closedAt: null,
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
    const updated: OpenSession = { ...target, buyInCents: target.buyInCents + amountCents }
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
    const updated = {
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
    const session = {
      ...input,
      id: crypto.randomUUID(),
      userId: null,
      status: 'closed' as const,
      startedAt: null,
      closedAt: null,
      createdAt: new Date().toISOString(),
    }
    sessions.push(session)
    writeAll(sessions)
    return session
  }

  async deleteSession(id: string): Promise<void> {
    writeAll(readAll().filter((s) => s.id !== id))
  }
}
