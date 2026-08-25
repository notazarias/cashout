import type { Session } from '@/lib/dataAdapter/types'

export type TableStatus = 'open' | 'closed'

export interface Table {
  id: string
  hostId: string
  code: string
  buyInCents: number
  locationLabel?: string
  maxPlayers?: number
  status: TableStatus
  createdAt: string
  closedAt: string | null
}

export interface HostTableInput {
  locationLabel?: string
  buyInCents: number
  maxPlayers?: number
}

export interface JoinTableInput {
  code: string
  date: string
  locationLabel?: string
  buyInCents: number
}

/** Roster-only view — playerEmail is a join-time snapshot, not a general Session field. */
export type TableRosterEntry = Session & { playerEmail: string | null }

export class DuplicateOpenTableError extends Error {
  constructor() {
    super('You already host an active table — close it before hosting a new one.')
    this.name = 'DuplicateOpenTableError'
  }
}
