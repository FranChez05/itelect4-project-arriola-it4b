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
          // Never create a local-only token: protected API calls require a server JWT.
          token: token || null,
          userName: name,
          user: token ? (user || { name }) : null,
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
      // Clear fake tokens written by older local-auth recovery code on rehydrate.
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<AuthState>
        const token = typeof persisted.token === 'string' && persisted.token.split('.').length === 3
          ? persisted.token
          : null
        return {
          ...currentState,
          ...persisted,
          token,
          userName: token ? persisted.userName ?? null : null,
          user: token ? persisted.user ?? null : null,
        }
      },
    }
  )
)

export default useAuthStore
