export type ClubRole = 'owner' | 'member'

export interface Club {
  id: string
  name: string
  ownerId: string
  joinCode: string
  createdAt: string
}

export interface ClubMember {
  clubId: string
  userId: string
  role: ClubRole
  /** Join-time snapshot, same denormalization as a session's playerDisplayName. */
  displayName: string | null
  joinedAt: string
}

export interface CreateClubInput {
  name: string
}

export interface JoinClubInput {
  code: string
}

export class ClubNotFoundError extends Error {
  constructor() {
    super('No club found with that code.')
    this.name = 'ClubNotFoundError'
  }
}
