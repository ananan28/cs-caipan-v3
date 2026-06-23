import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '@/types'
import { supabase } from '@/services/supabase/config'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (user: User, token: string) => void
  logout: () => Promise<void>
  updateUser: (data: Partial<User>) => void
  loadUser: (userId: string) => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: (user, token) => set({ user, token, isAuthenticated: true }),

      logout: async () => {
        await supabase.auth.signOut()
        set({ user: null, token: null, isAuthenticated: false })
      },

      updateUser: (data) => {
        const { user } = get()
        if (user) {
          set({ user: { ...user, ...data } })
          supabase
            .from('users')
            .update(data)
            .eq('id', user.id)
            .then(({ error }) => {
              if (error) console.error('更新用户失败:', error)
            })
        }
      },

      loadUser: async (userId: string) => {
        try {
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single()

          if (error) throw error
          if (data) {
            set((state) => ({
              user: state.user ? { ...state.user, ...data } : data
            }))
          }
        } catch (error) {
          console.error('加载用户失败:', error)
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
