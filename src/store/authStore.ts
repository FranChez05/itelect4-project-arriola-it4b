import { create } from 'zustand'

export interface AuthState {
  token: string | null
  login: (newToken: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  token: window.localStorage.getItem('auth-token') ?? 'mock-player-token-badminton',

  login: (newToken: string) => {
    window.localStorage.setItem('auth-token', newToken)
    set({ token: newToken })
  },

  logout: () => {
    window.localStorage.removeItem('auth-token')
    set({ token: null })
  },
}))
