import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'

// ─────────────────────────────────────────────
//  AXIOS INSTANCE
// ─────────────────────────────────────────────

const api: AxiosInstance = axios.create({
  baseURL: '/api/v1',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

// ─────────────────────────────────────────────
//  TOKEN HELPERS
// ─────────────────────────────────────────────

const TOKEN_KEY   = 'sayari_admin_access_token'
const REFRESH_KEY = 'sayari_admin_refresh_token'

export const tokenStorage = {
  get        : ()          => localStorage.getItem(TOKEN_KEY),
  set        : (t: string) => localStorage.setItem(TOKEN_KEY, t),
  remove     : ()          => localStorage.removeItem(TOKEN_KEY),
  getRefresh : ()          => localStorage.getItem(REFRESH_KEY),
  setRefresh : (t: string) => localStorage.setItem(REFRESH_KEY, t),
  removeRefresh: ()        => localStorage.removeItem(REFRESH_KEY),
  clear      : ()          => { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(REFRESH_KEY) },
}

// ─────────────────────────────────────────────
//  REQUEST INTERCEPTOR — attach access token
// ─────────────────────────────────────────────

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStorage.get()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ─────────────────────────────────────────────
//  RESPONSE INTERCEPTOR — auto-refresh on 401
// ─────────────────────────────────────────────

let isRefreshing = false
let failedQueue: { resolve: (v: string) => void; reject: (e: unknown) => void }[] = []

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach(p => error ? p.reject(error) : p.resolve(token!))
  failedQueue = []
}

api.interceptors.response.use(
  res => res,
  async error => {
    const original = error.config

    // Skip if it's the refresh endpoint itself
    if (error.response?.status === 401 && !original._retry && !original.url?.includes('/auth/refresh')) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          original.headers.Authorization = `Bearer ${token}`
          return api(original)
        })
      }

      original._retry = true
      isRefreshing    = true

      const refreshToken = tokenStorage.getRefresh()
      if (!refreshToken) {
        tokenStorage.clear()
        window.location.href = '/login'
        return Promise.reject(error)
      }

      try {
        const { data } = await axios.post('/api/v1/auth/refresh', { refreshToken })
        const { accessToken, refreshToken: newRefresh } = data.data.tokens
        tokenStorage.set(accessToken)
        tokenStorage.setRefresh(newRefresh)
        processQueue(null, accessToken)
        original.headers.Authorization = `Bearer ${accessToken}`
        return api(original)
      } catch (refreshError) {
        processQueue(refreshError, null)
        tokenStorage.clear()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api
