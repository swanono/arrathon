import { create } from 'zustand'

export type AuthUser = {
  id: string
  name: string
  familyName: string
  email: string
  avatarUrl: string | null
}

type AuthStore = {
  user: AuthUser | null
  accessToken: string | null
  login: (user: AuthUser, accessToken: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  accessToken: null,
  login: (user, accessToken) => set({ user, accessToken }),
  logout: () => set({ user: null, accessToken: null }),
}))
