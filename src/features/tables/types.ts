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
  displayName?: string
}

/** Roster-only view — playerEmail/playerDisplayName are join-time snapshots, not general Session fields. */
export type TableRosterEntry = Session & { playerEmail: string | null; playerDisplayName: string | null }

export type SettlementMode = 'direct' | 'host'

export interface Settlement {
  id: string
  tableId: string
  fromUserId: string
  fromDisplayName: string | null
  toUserId: string
  toDisplayName: string | null
  amountCents: number
  paid: boolean
  paidAt: string | null
  createdAt: string
}

export class DuplicateOpenTableError extends Error {
  constructor() {
    super('You already host an active table — close it before hosting a new one.')
    this.name = 'DuplicateOpenTableError'
  }
}
