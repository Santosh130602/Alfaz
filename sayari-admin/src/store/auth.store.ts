import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { tokenStorage } from '../api/client'
import type { AuthUser, TokenPair } from '../types'

const ADMIN_ROLES = ['admin', 'superadmin', 'moderator']

interface AdminAuthState {
  user           : AuthUser | null
  isAuthenticated: boolean
  isLoading      : boolean
  isSuperAdmin   : boolean

  setAuth: (user: AuthUser, tokens: TokenPair) => void
  setUser: (user: AuthUser) => void
  logout : () => void
  setLoading: (v: boolean) => void
}

export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set) => ({
      user           : null,
      isAuthenticated: false,
      isLoading      : true,
      isSuperAdmin   : false,

      setAuth: (user, tokens) => {
        if (!ADMIN_ROLES.includes(user.role)) {
          // Not an admin — reject silently, caller should show error
          tokenStorage.clear()
          set({ user: null, isAuthenticated: false, isLoading: false })
          return
        }
        tokenStorage.set(tokens.accessToken)
        tokenStorage.setRefresh(tokens.refreshToken)
        set({ user, isAuthenticated: true, isLoading: false, isSuperAdmin: user.role === 'superadmin' })
      },

      setUser: (user) => set({ user, isSuperAdmin: user.role === 'superadmin' }),

      logout: () => {
        tokenStorage.clear()
        set({ user: null, isAuthenticated: false, isSuperAdmin: false })
      },

      setLoading: (v) => set({ isLoading: v }),
    }),
    {
      name: 'sayari_admin_auth',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated, isSuperAdmin: state.isSuperAdmin }),
    }
  )
)

export { ADMIN_ROLES }
