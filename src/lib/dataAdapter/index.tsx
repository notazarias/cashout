import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { useAuth } from '@/features/auth/authContext'
import { supabase } from '@/lib/supabaseClient'
import { LocalStorageAdapter } from './localStorageAdapter'
import { SupabaseAdapter } from './supabaseAdapter'
import type { DataAdapter } from './types'

class NullAdapter implements DataAdapter {
  readonly mode = 'guest' as const
  private fail(): never {
    throw new Error('No active session — cannot access data yet.')
  }
  listSessions(): Promise<never> {
    this.fail()
  }
  startSession(): Promise<never> {
    this.fail()
  }
  addBuyIn(): Promise<never> {
    this.fail()
  }
  closeSession(): Promise<never> {
    this.fail()
  }
  logCompletedSession(): Promise<never> {
    this.fail()
  }
  deleteSession(): Promise<never> {
    this.fail()
  }
}

const DataAdapterContext = createContext<DataAdapter | null>(null)

export function DataAdapterProvider({ children }: { children: ReactNode }) {
  const auth = useAuth()
  const accountUserId = auth.status === 'account' ? auth.user.id : null

  const adapter = useMemo<DataAdapter>(() => {
    if (accountUserId) return new SupabaseAdapter(supabase, accountUserId)
    if (auth.status === 'guest') return new LocalStorageAdapter()
    return new NullAdapter()
  }, [auth.status, accountUserId])

  return <DataAdapterContext.Provider value={adapter}>{children}</DataAdapterContext.Provider>
}

export function useDataAdapter(): DataAdapter {
  const adapter = useContext(DataAdapterContext)
  if (!adapter) throw new Error('useDataAdapter must be used within a DataAdapterProvider')
  return adapter
}
