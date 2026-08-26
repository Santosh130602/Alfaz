// import { create } from 'zustand'
// import { persist } from 'zustand/middleware'
// import { tokenStorage } from '../api/client'
// import type { AuthUser, TokenPair } from '../types'

// interface AuthState {
//   user: AuthUser | null
//   isAuthenticated: boolean
//   isLoading: boolean

//   setAuth: (user: AuthUser, tokens: TokenPair) => void
//   setUser: (user: AuthUser) => void
//   logout: () => void
//   setLoading: (v: boolean) => void
// }

// export const useAuthStore = create<AuthState>()(
//   persist(
//     (set) => ({
//       user            : null,
//       isAuthenticated : false,
//       isLoading       : true,

//       setAuth: (user, tokens) => {
//         tokenStorage.set(tokens.accessToken)
//         tokenStorage.setRefresh(tokens.refreshToken)
//         set({ user, isAuthenticated: true, isLoading: false })
//       },

//       setUser: (user) => set({ user }),

//       logout: () => {
//         tokenStorage.clear()
//         set({ user: null, isAuthenticated: false })
//       },

//       setLoading: (v) => set({ isLoading: v }),
//     }),
//     {
//       name: 'sayari_auth',
//       // partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
//       partialize: (state) => ({ user: state.user }),
//     }
//   )
// )







import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { tokenStorage } from '../api/client'
import type { AuthUser, TokenPair } from '../types'

interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean

  setAuth: (user: AuthUser, tokens: TokenPair) => void
  setUser: (user: AuthUser) => void
  logout: () => void
  setLoading: (v: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user            : null,
      isAuthenticated : false,
      isLoading       : true,

      // setAuth: (user, tokens) => {
      //   tokenStorage.set(tokens.accessToken)
      //   // tokenStorage.setRefresh(...) हटाया — अब refresh token httpOnly cookie में है
      //   set({ user, isAuthenticated: true, isLoading: false })
      // },
      setAuth: (user, tokens: { accessToken: string; refreshToken?: string }) => {
        tokenStorage.set(tokens.accessToken)
        set({ user, isAuthenticated: true, isLoading: false })
      },

      setUser: (user) => set({ user }),

      logout: () => {
        tokenStorage.clear()
        set({ user: null, isAuthenticated: false })
      },

      setLoading: (v) => set({ isLoading: v }),
    }),
    {
      name: 'sayari_auth',
      partialize: (state) => ({ user: state.user }),
    }
  )
)