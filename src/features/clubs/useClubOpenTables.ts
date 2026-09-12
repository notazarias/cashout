import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/features/auth/authContext'
import { listOpenClubTables } from '@/features/tables/tablesApi'
import type { Table } from '@/features/tables/types'
import { listMyClubs } from './clubsApi'
import type { Club } from './types'

export interface ClubOpenTable {
  table: Table
  club: Club
}

/** Open tables at the caller's clubs that someone *else* is hosting — a table you host yourself is
 * already covered by HostedTableBanner, so including it here would double up on the dashboard. */
export function useClubOpenTables() {
  const auth = useAuth()
  const [rows, setRows] = useState<ClubOpenTable[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (auth.status !== 'account') {
      setRows([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const [tables, clubs] = await Promise.all([listOpenClubTables(), listMyClubs()])
      const clubsById = new Map(clubs.map((club) => [club.id, club]))
      setRows(
        tables.flatMap((table) => {
          if (table.hostId === auth.user.id || !table.clubId) return []
          const club = clubsById.get(table.clubId)
          return club ? [{ table, club }] : []
        }),
      )
    } finally {
      setLoading(false)
    }
  }, [auth])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { rows, loading, refresh }
}
