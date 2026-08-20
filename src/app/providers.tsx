import type { ReactNode } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@/features/auth/authContext'
import { DataAdapterProvider } from '@/lib/dataAdapter'

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataAdapterProvider>{children}</DataAdapterProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
