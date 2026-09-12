import { generateJoinCode, MAX_CODE_ATTEMPTS } from '@/lib/joinCode'
import { supabase } from '@/lib/supabaseClient'
import { ClubNotFoundError, type Club, type ClubMember, type CreateClubInput } from './types'

/** Every function here is account-only, so all hardcode `supabase` with no client param — matching
 * the convention for host/account-only calls (createTable, closeTable) rather than the parameterized
 * guest-reachable ones. Guests never see club UI. */

interface ClubRow {
  id: string
  name: string
  owner_id: string
  join_code: string
  created_at: string
}

interface ClubMemberRow {
  club_id: string
  user_id: string
  role: 'owner' | 'member'
  display_name: string | null
  joined_at: string
}

function fromClubRow(row: ClubRow): Club {
  return {
    id: row.id,
    name: row.name,
    ownerId: row.owner_id,
    joinCode: row.join_code,
    createdAt: row.created_at,
  }
}

function fromClubMemberRow(row: ClubMemberRow): ClubMember {
  return {
    clubId: row.club_id,
    userId: row.user_id,
    role: row.role,
    displayName: row.display_name,
    joinedAt: row.joined_at,
  }
}

export async function createClub(input: CreateClubInput): Promise<Club> {
  for (let attempt = 0; attempt < MAX_CODE_ATTEMPTS; attempt++) {
    const { data, error } = await supabase.rpc('create_club', {
      p_name: input.name,
      p_join_code: generateJoinCode(),
    })
    if (!error) return fromClubRow(data as ClubRow)
    if (error.code === '23505' && error.message.includes('clubs_join_code_key')) {
      continue // code collision — retry with a freshly generated code
    }
    throw new Error(error.message)
  }
  throw new Error('Could not generate a unique club code — please try again.')
}

export async function joinClub(code: string): Promise<Club> {
  const { data, error } = await supabase.rpc('join_club', { p_code: code })
  if (error) {
    if (error.message.includes('No club found')) throw new ClubNotFoundError()
    throw new Error(error.message)
  }
  return fromClubRow(data as ClubRow)
}

export async function listMyClubs(): Promise<Club[]> {
  const { data, error } = await supabase.from('clubs').select('*').order('created_at', { ascending: true })
  if (error) throw error
  return (data as ClubRow[]).map(fromClubRow)
}

/** RLS returns no row for a non-member, so a null result *is* the "am I in this club" check. */
export async function getClub(clubId: string): Promise<Club | null> {
  const { data, error } = await supabase.from('clubs').select('*').eq('id', clubId).maybeSingle()
  if (error) throw error
  return data ? fromClubRow(data as ClubRow) : null
}

export async function listClubMembers(clubId: string): Promise<ClubMember[]> {
  const { data, error } = await supabase
    .from('club_members')
    .select('*')
    .eq('club_id', clubId)
    .order('joined_at', { ascending: true })
  if (error) throw error
  return (data as ClubMemberRow[]).map(fromClubMemberRow)
}
