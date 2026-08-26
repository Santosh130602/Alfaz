// ********************************************************************************************************************************************
//                                                        MASTER PIECE
// ********************************************************************************************************************************************


// import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
// import { Toaster } from 'react-hot-toast'
// import { useEffect } from 'react'

// import { useAuthStore } from './store/auth.store'
// import { useNotifStore } from './store/index'
// import { authApi, notificationsApi } from './api'
// import { tokenStorage } from './api/client'
// import { useSocket } from './hooks/useSocket'

// import { AppLayout } from './components/layout/AppLayout'
// import { AudioMiniPlayer } from './components/audio/AudioPlayer'
// import { PostCreateModal } from './components/post/PostCreateModal'

// import { LoginPage, RegisterPage, ForgotPasswordPage, ProtectedRoute } from './pages/auth/index'
// import { HomePage, ExplorePage, MoodFeedPage } from './pages/feed/index'
// import { PostDetailPage } from './pages/post/PostDetail'
// import { SearchPage } from './pages/search/index'
// import { ChannelPage, UserProfilePage } from './pages/channel/index'
// import { NotificationsPage, SavedPage, BadgesPage } from './pages/notification/index'
// import { SeriesDetailPage, CreateSeriesPage, MySeriesPage } from './pages/series/index'
// import { CreatorDashboardPage } from './pages/creator/Dashboard'
// import { SettingsPage } from './pages/settings/index'
// import { CanvasEditorPage } from './pages/editor/CanvasEditor'
// import { AudioUploadPage } from './pages/editor/AudioUpload'


// import HomePages from './pages/home/HomePage'
// import {StoryPlayerPage} from './pages/story/index'

// const queryClient = new QueryClient({
//   defaultOptions: {
//     queries: { staleTime: 60000, retry: 1, refetchOnWindowFocus: false },
//   },
// })

// function SocketInit() { useSocket(); return null }

// function AuthHydrator() {
//   const { setAuth, logout, setLoading, isAuthenticated } = useAuthStore()
//   const { setUnreadCount } = useNotifStore()

//   useEffect(() => {
//     const token = tokenStorage.get()
//     if (!token) { setLoading(false); return }
//     authApi.me()
//       .then(res => setAuth(res.data.data.user, { accessToken: tokenStorage.get()!, refreshToken: tokenStorage.getRefresh()! }))
//       .catch(() => { logout(); setLoading(false) })
//   }, [])

//   useEffect(() => {
//     if (!isAuthenticated) return
//     notificationsApi.unreadCount().then(res => setUnreadCount(res.data.data.count)).catch(() => {})
//   }, [isAuthenticated])

//   return null
// }

// function AppLayoutWrapper() {
//   return (
//     <AppLayout>
//       <Outlet />
//     </AppLayout>
//   )
// }

// export default function App() {
//   return (
//     <QueryClientProvider client={queryClient}>
//       <BrowserRouter>
//         <AuthHydrator />
//         <SocketInit />
//         <Routes>
//           <Route path="/login"           element={<LoginPage />} />
//           <Route path="/register"        element={<RegisterPage />} />
//           <Route path="/forgot-password" element={<ForgotPasswordPage />} />
//           <Route path="/post/:id/edit" element={<ProtectedRoute><CanvasEditorPage /></ProtectedRoute>} />
//           <Route path="/post/:id/upload-audio" element={<ProtectedRoute><AudioUploadPage /></ProtectedRoute>} />

//           <Route element={<AppLayoutWrapper />}>
//           <Route path='/hom' element={<HomePages/>} />
//           <Route path='/str' element={<StoryPlayerPage/>} />



//             <Route path="/"                element={<HomePage />} />
//             <Route path="/explore"         element={<ExplorePage />} />
//             <Route path="/mood/:mood"      element={<MoodFeedPage />} />
//             <Route path="/search"          element={<SearchPage />} />
//             <Route path="/post/:id"        element={<PostDetailPage />} />
//             <Route path="/@:handle"        element={<ChannelPage />} />
//             <Route path="/users/:username" element={<UserProfilePage />} />
//             <Route path="/series/:id"      element={<SeriesDetailPage />} />
//             <Route path="/notifications"   element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
//             <Route path="/saved"           element={<ProtectedRoute><SavedPage /></ProtectedRoute>} />
//             <Route path="/badges"          element={<ProtectedRoute><BadgesPage /></ProtectedRoute>} />
//             <Route path="/dashboard"       element={<ProtectedRoute><CreatorDashboardPage /></ProtectedRoute>} />
//             <Route path="/series/create"   element={<ProtectedRoute><CreateSeriesPage /></ProtectedRoute>} />
//             <Route path="/series/mine"     element={<ProtectedRoute><MySeriesPage /></ProtectedRoute>} />
//             <Route path="/settings"        element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
//             <Route path="*"                element={<Navigate to="/" replace />} />
//           </Route>
//         </Routes>
//         <AudioMiniPlayer />
//         <PostCreateModal />
//         <Toaster
//           position="top-center"
//           toastOptions={{
//             style: { background: '#1A1A1A', color: '#fff', border: '1px solid #2E2E2E', borderRadius: '12px', fontSize: '14px' },
//             success: { iconTheme: { primary: '#6C63FF', secondary: '#fff' } },
//             error  : { iconTheme: { primary: '#FF6584', secondary: '#fff' } },
//           }}
//         />
//       </BrowserRouter>
//     </QueryClientProvider>
//   )
// }














































import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { useEffect } from 'react'

import { useAuthStore } from './store/auth.store'
import { useNotifStore } from './store/index'
import { authApi, notificationsApi } from './api'
import { tokenStorage } from './api/client'
import { useSocket } from './hooks/useSocket'

import { AppLayout } from './components/layout/AppLayout'
import { AudioMiniPlayer } from './components/audio/AudioPlayer'
import { PostCreateModal } from './components/post/PostCreateModal'

import { LoginPage, RegisterPage, ForgotPasswordPage, ProtectedRoute } from './pages/auth/index'
import { HomePage, ExplorePage, MoodFeedPage } from './pages/feed/index'
import { PostDetailPage } from './pages/post/PostDetail'
import { SearchPage } from './pages/search/index'
import { ChannelPage, UserProfilePage } from './pages/channel/index'
import { NotificationsPage, SavedPage, BadgesPage } from './pages/notification/index'
import { SeriesDetailPage, CreateSeriesPage, MySeriesPage } from './pages/series/index'
import { CreatorDashboardPage } from './pages/creator/Dashboard'
import { SettingsPage } from './pages/settings/index'
import { CanvasEditorPage } from './pages/editor/CanvasEditor'
import { AudioUploadPage } from './pages/editor/AudioUpload'


import HomePages from './pages/home/HomePage'
import {StoryPage} from './pages/story/index'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60000, retry: 1, refetchOnWindowFocus: false },
  },
})

function SocketInit() { useSocket(); return null }

// function AuthHydrator() {
//   const { setAuth, logout, setLoading, isAuthenticated } = useAuthStore()
//   const { setUnreadCount } = useNotifStore()

//   // useEffect(() => {
//   //   const token = tokenStorage.get()
//   //   if (!token) { setLoading(false); return }
//   //   authApi.me()
//   //     .then(res => setAuth(res.data.data.user, { accessToken: tokenStorage.get()!, refreshToken: tokenStorage.getRefresh()! }))
//   //     .catch(() => { logout(); setLoading(false) })
//   // }, [])

//   useEffect(() => {
//   const token = tokenStorage.get()
//   if (!token) {
//     logout()          // 🔧 clears isAuthenticated + persisted store, not just loading
//     setLoading(false)
//     return
//   }
//   authApi.me()
//     .then(res => setAuth(res.data.data.user, {
//       accessToken: tokenStorage.get()!,
//       refreshToken: tokenStorage.getRefresh()!,
//     }))
//     .catch(() => { logout(); setLoading(false) })
// }, [])

//   useEffect(() => {
//     if (!isAuthenticated) return
//     notificationsApi.unreadCount().then(res => setUnreadCount(res.data.data.count)).catch(() => {})
//   }, [isAuthenticated])

//   return null
// }


function AuthHydrator() {
  const { setAuth, logout, setLoading, isAuthenticated } = useAuthStore()
  const { setUnreadCount } = useNotifStore()

  useEffect(() => {
    const token = tokenStorage.get()
    if (!token) {
      logout()
      setLoading(false)
      return
    }
    authApi.me()
      .then(res => setAuth(res.data.data.user, { 
        accessToken: tokenStorage.get()!
        // refreshToken हटाया — अब ज़रूरत नहीं, cookie में है
      }))
      .catch(() => { logout(); setLoading(false) })
  }, [])

  useEffect(() => {
    if (!isAuthenticated) return
    notificationsApi.unreadCount().then(res => setUnreadCount(res.data.data.count)).catch(() => {})
  }, [isAuthenticated])

  return null
}






function AppLayoutWrapper() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthHydrator />
        <SocketInit />
        <Routes>
          <Route path="/login"           element={<LoginPage />} />
          <Route path="/register"        element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/post/:id/edit" element={<ProtectedRoute><CanvasEditorPage /></ProtectedRoute>} />
          <Route path="/post/:id/upload-audio" element={<ProtectedRoute><AudioUploadPage /></ProtectedRoute>} />

          <Route element={<AppLayoutWrapper />}>
          <Route path='/' element={<HomePages/>} />
          <Route path='/story' element={<StoryPage/>} />



            <Route path="/sayari"                element={<HomePage />} />
            <Route path="/explore"         element={<ExplorePage />} />
            <Route path="/mood/:mood"      element={<MoodFeedPage />} />
            <Route path="/search"          element={<SearchPage />} />
            <Route path="/post/:id"        element={<PostDetailPage />} />
            <Route path="/:handle"        element={<ChannelPage />} />
            <Route path="/users/:username" element={<UserProfilePage />} />
            <Route path="/series/:id"      element={<SeriesDetailPage />} />
            <Route path="/notifications"   element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
            <Route path="/saved"           element={<ProtectedRoute><SavedPage /></ProtectedRoute>} />
            <Route path="/badges"          element={<ProtectedRoute><BadgesPage /></ProtectedRoute>} />
            <Route path="/dashboard"       element={<ProtectedRoute><CreatorDashboardPage /></ProtectedRoute>} />
            <Route path="/series/create"   element={<ProtectedRoute><CreateSeriesPage /></ProtectedRoute>} />
            <Route path="/series/mine"     element={<ProtectedRoute><MySeriesPage /></ProtectedRoute>} />
            <Route path="/settings"        element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            <Route path="*"                element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
        <AudioMiniPlayer />
        <PostCreateModal />
        <Toaster
          position="top-center"
          toastOptions={{
            style: { background: '#1A1A1A', color: '#fff', border: '1px solid #2E2E2E', borderRadius: '12px', fontSize: '14px' },
            success: { iconTheme: { primary: '#6C63FF', secondary: '#fff' } },
            error  : { iconTheme: { primary: '#FF6584', secondary: '#fff' } },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  )
}
