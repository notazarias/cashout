import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/features/auth/authContext'
import { listMyClubs } from './clubsApi'
import type { Club } from './types'

export function useMyClubs() {
  const auth = useAuth()
  const [clubs, setClubs] = useState<Club[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (auth.status !== 'account') {
      setClubs([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      setClubs(await listMyClubs())
    } finally {
      setLoading(false)
    }
  }, [auth])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { clubs, loading, refresh }
}
