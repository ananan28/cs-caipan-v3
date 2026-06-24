import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

interface User {
  id: string
  email: string
  name?: string
  role?: string
  phone?: string
  status?: string
  balance?: number
  points?: number
  avatar?: string
  owner_id?: string
  owner_type?: string
  permissions?: Record<string, any>
  created_at?: string
  updated_at?: string
}

interface AuthState {
  user: User | null
  token: string | null
  login: (user: User, token: string) => void
  logout: () => void
  updateUser: (user: Partial<User>) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  login: (user, token) => set({ user, token }),
  logout: () => {
    supabase.auth.signOut()
    set({ user: null, token: null })
  },
  updateUser: (userData) => set((state) => ({
    user: state.user ? { ...state.user, ...userData } : null
  }))
}))
