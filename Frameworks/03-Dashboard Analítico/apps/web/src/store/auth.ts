import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@analytiq/shared'

interface AuthState {
  user:          User | null
  token:         string | null
  refreshToken:  string | null
  isAuthed:      boolean
  setAuth:       (user: User, token: string, refreshToken: string) => void
  updateTokens:  (token: string, refreshToken: string) => void
  clearAuth:     () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user:         null,
      token:        null,
      refreshToken: null,
      isAuthed:     false,

      setAuth: (user, token, refreshToken) => {
        localStorage.setItem('analytiq_refresh_token', refreshToken)
        set({ user, token, refreshToken, isAuthed: true })
      },

      updateTokens: (token, refreshToken) => {
        localStorage.setItem('analytiq_refresh_token', refreshToken)
        set({ token, refreshToken })
      },

      clearAuth: () => {
        localStorage.removeItem('analytiq_refresh_token')
        set({ user: null, token: null, refreshToken: null, isAuthed: false })
      },
    }),
    {
      name: 'analytiq-auth',
      partialize: (s) => ({ user: s.user, token: s.token, refreshToken: s.refreshToken, isAuthed: s.isAuthed }),
    }
  )
)
