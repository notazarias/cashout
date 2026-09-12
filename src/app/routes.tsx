import { Route, Routes } from 'react-router-dom'
import { AuthCallback } from '@/features/auth/components/AuthCallback'
import { LoginScreen } from '@/features/auth/components/LoginScreen'
import { RedirectIfSignedIn } from '@/features/auth/components/RedirectIfSignedIn'
import { RequireSession } from '@/features/auth/components/RequireSession'
import { ClubDetailScreen } from '@/features/clubs/ClubDetailScreen'
import { ClubsScreen } from '@/features/clubs/ClubsScreen'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { ActiveSessionScreen } from '@/features/sessions/ActiveSessionScreen'
import { GuestTableSessionScreen } from '@/features/tables/GuestTableSessionScreen'
import { TableManageScreen } from '@/features/tables/TableManageScreen'
import { TableSettlementScreen } from '@/features/tables/TableSettlementScreen'
import { AppHome } from './AppHome'

export function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <RedirectIfSignedIn>
            <LoginScreen />
          </RedirectIfSignedIn>
        }
      />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route
        path="/app"
        element={
          <RequireSession>
            <AppHome />
          </RequireSession>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="clubs" element={<ClubsScreen />} />
        <Route path="clubs/:clubId" element={<ClubDetailScreen />} />
        <Route path="session/:id" element={<ActiveSessionScreen />} />
        <Route path="table-session/:id" element={<GuestTableSessionScreen />} />
        <Route path="table/:tableId" element={<TableManageScreen />} />
        <Route path="table/:tableId/settlement" element={<TableSettlementScreen />} />
      </Route>
    </Routes>
  )
}
