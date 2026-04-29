import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@analytiq/shared'

interface AuthState {
  user:      User | null
  token:     string | null
  isAuthed:  boolean
  setAuth:   (user: User, token: string) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user:     null,
      token:    null,
      isAuthed: false,

      setAuth: (user, token) => {
        localStorage.setItem('analytiq_token', token)
        set({ user, token, isAuthed: true })
      },

      clearAuth: () => {
        localStorage.removeItem('analytiq_token')
        localStorage.removeItem('analytiq_refresh_token')
        set({ user: null, token: null, isAuthed: false })
      },
    }),
    { name: 'analytiq-auth', partialize: (s) => ({ user: s.user, token: s.token, isAuthed: s.isAuthed }) }
  )
)
