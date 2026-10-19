import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AuthUserData {
  id?: string | number
  name?: string
  email?: string
  role?: string
}

export interface AuthState {
  token: string | null
  userName: string | null
  user: AuthUserData | null
  setAuth: (token: string, user: AuthUserData) => void
  login: (name: string, token?: string, user?: AuthUserData) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      userName: null,
      user: null,
      setAuth: (token: string, user: AuthUserData) =>
        set({
          token,
          userName: user.name || user.email?.split('@')[0] || 'User',
          user,
        }),
      login: (name: string, token?: string, user?: AuthUserData) =>
        set({
          token: token || `demo-token-${name}`,
          userName: name,
          user: user || { name },
        }),
      logout: () => set({ token: null, userName: null, user: null }),
    }),
    {
      name: 'itelect4-auth',
      partialize: (state) => ({
        token: state.token,
        userName: state.userName,
        user: state.user,
      }),
    }
  )
)

export default useAuthStore
