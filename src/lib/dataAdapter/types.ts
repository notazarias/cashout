export type AdapterMode = 'guest' | 'account'

export interface Session {
  id: string
  userId: string | null
  date: string
  buyInCents: number
  cashOutCents: number
  durationMinutes?: number
  locationLabel?: string
  createdAt: string
}

export type NewSessionInput = Omit<Session, 'id' | 'userId' | 'createdAt'>

export interface DataAdapter {
  readonly mode: AdapterMode
  listSessions(): Promise<Session[]>
  createSession(input: NewSessionInput): Promise<Session>
  updateSession(id: string, patch: Partial<NewSessionInput>): Promise<Session>
  deleteSession(id: string): Promise<void>
}
