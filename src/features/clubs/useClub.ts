import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/features/auth/authContext'
import { getClubOpenTable } from '@/features/tables/tablesApi'
import type { Table } from '@/features/tables/types'
import { getClub, listClubMembers } from './clubsApi'
import type { Club, ClubMember } from './types'

/** `club === null` after loading means "no such club, or you're not a member" — RLS makes those
 * indistinguishable on purpose, and both should send the user back to the clubs list. */
export function useClub(clubId: string | undefined) {
  const auth = useAuth()
  const [club, setClub] = useState<Club | null>(null)
  const [members, setMembers] = useState<ClubMember[]>([])
  const [openTable, setOpenTable] = useState<Table | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (auth.status !== 'account' || !clubId) {
      setClub(null)
      setMembers([])
      setOpenTable(null)
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const found = await getClub(clubId)
      setClub(found)
      if (!found) {
        setMembers([])
        setOpenTable(null)
        return
      }
      const [clubMembers, table] = await Promise.all([listClubMembers(clubId), getClubOpenTable(clubId)])
      setMembers(clubMembers)
      setOpenTable(table)
    } finally {
      setLoading(false)
    }
  }, [auth, clubId])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { club, members, openTable, loading, refresh }
}
