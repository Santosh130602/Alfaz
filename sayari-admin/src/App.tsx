import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { useEffect } from 'react'

import { useAdminAuthStore } from './store/auth.store'
import { authApi } from './api'
import { tokenStorage } from './api/client'
import { AdminLayout } from './components/layout/AdminLayout'
import { AdminLoginPage, AdminProtectedRoute } from './pages/auth/index'
import { DashboardPage }         from './pages/dashboard/index'
import { UsersListPage, UserDetailPage } from './pages/users/index'
import { ContentManagementPage } from './pages/posts/index'
import { ReportsPage }           from './pages/reports/index'
import { TemplatesPage }         from './pages/templates/index'
import { AnnouncementsPage }     from './pages/announcements/index'
import { AuditLogPage }          from './pages/audit/index'
import { AppConfigPage }         from './pages/config/index'

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30000, retry: 1, refetchOnWindowFocus: false } },
})

function AuthHydrator() {
  const { setAuth, logout, setLoading } = useAdminAuthStore()

  useEffect(() => {
    const token = tokenStorage.get()
    if (!token) { setLoading(false); return }
    authApi.me()
      .then(res => setAuth(res.data.data.user, {
        accessToken : tokenStorage.get()!,
        refreshToken: tokenStorage.getRefresh()!,
      }))
      .catch(() => { logout(); setLoading(false) })
  }, [])

  return null
}

function AdminLayoutWrapper() {
  return (
    <AdminProtectedRoute>
      <AdminLayout><Outlet /></AdminLayout>
    </AdminProtectedRoute>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthHydrator />
        <Routes>
          <Route path="/login" element={<AdminLoginPage />} />
          <Route element={<AdminLayoutWrapper />}>
            <Route path="/"                   element={<DashboardPage />} />
            <Route path="/users"              element={<UsersListPage />} />
            <Route path="/users/:userId"      element={<UserDetailPage />} />
            <Route path="/posts"              element={<ContentManagementPage />} />
            <Route path="/reports"            element={<ReportsPage />} />
            <Route path="/templates"          element={<TemplatesPage />} />
            <Route path="/announcements"      element={<AnnouncementsPage />} />
            <Route path="/audit-log"          element={<AuditLogPage />} />
            <Route path="/config"             element={<AppConfigPage />} />
            <Route path="*"                   element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
        {/* <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#1A1A1A', color: '#fff', border: '1px solid #2E2E2E', borderRadius: '12px', fontSize: '14px' },
            success: { iconTheme: { primary: '#6C63FF', secondary: '#fff' } },
            error  : { iconTheme: { primary: '#FF6584', secondary: '#fff' } },
          }}
        /> */}


        <Toaster
  position="top-right"
  toastOptions={{
    // Base styles for all toasts
    style: { 
      background: '#141414', 
      color: '#FFFFFF', 
      borderRadius: '12px', 
      fontSize: '14px',
      fontWeight: '500',
      padding: '16px',
      border: '1px solid #2A2A2A',
    },
    success: { 
      // Attaches the green breathing glow to success messages
      className: 'toast-success-glow',
      iconTheme: { 
        primary: '#00E676', 
        secondary: '#141414' 
      } 
    },
    error: { 
      // Attaches the red breathing glow to error messages
      className: 'toast-error-glow',
      iconTheme: { 
        primary: '#E60000', 
        secondary: '#FFFFFF' 
      } 
    },
  }}
/>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
