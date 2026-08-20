import { z } from 'zod'
import type { DataAdapter, NewSessionInput, Session } from './types'

const STORAGE_KEY = 'cashout_guest_sessions'

const sessionSchema = z.object({
  id: z.string(),
  userId: z.null(),
  date: z.string(),
  buyInCents: z.number(),
  cashOutCents: z.number(),
  durationMinutes: z.number().optional(),
  locationLabel: z.string().optional(),
  createdAt: z.string(),
})

const sessionListSchema = z.array(sessionSchema)

function readAll(): Session[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return []
  try {
    return sessionListSchema.parse(JSON.parse(raw))
  } catch {
    // Corrupted or stale-shape data — treat as empty rather than crash the app.
    return []
  }
}

function writeAll(sessions: Session[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
}

export class LocalStorageAdapter implements DataAdapter {
  readonly mode = 'guest' as const

  async listSessions(): Promise<Session[]> {
    return readAll()
  }

  async createSession(input: NewSessionInput): Promise<Session> {
    const session: Session = {
      ...input,
      id: crypto.randomUUID(),
      userId: null,
      createdAt: new Date().toISOString(),
    }
    const sessions = readAll()
    sessions.push(session)
    writeAll(sessions)
    return session
  }

  async updateSession(id: string, patch: Partial<NewSessionInput>): Promise<Session> {
    const sessions = readAll()
    const index = sessions.findIndex((s) => s.id === id)
    if (index === -1) throw new Error(`Guest session ${id} not found`)
    const updated = { ...sessions[index], ...patch }
    sessions[index] = updated
    writeAll(sessions)
    return updated
  }

  async deleteSession(id: string): Promise<void> {
    writeAll(readAll().filter((s) => s.id !== id))
  }
}
