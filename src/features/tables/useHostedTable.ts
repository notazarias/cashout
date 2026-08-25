import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/features/auth/authContext'
import { getHostedOpenTable } from './tablesApi'
import type { Table } from './types'

export function useHostedTable() {
  const auth = useAuth()
  const [table, setTable] = useState<Table | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (auth.status !== 'account') {
      setTable(null)
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      setTable(await getHostedOpenTable(auth.user.id))
    } finally {
      setLoading(false)
    }
  }, [auth])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { table, loading, refresh }
}
