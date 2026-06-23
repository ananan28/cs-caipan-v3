import { create } from 'zustand'
import { User } from '@/types'

interface UserState {
  users: User[]
  isLoading: boolean
  setUsers: (users: User[]) => void
  addUser: (user: User) => void
  updateUser: (id: string, data: Partial<User>) => void
  deleteUser: (id: string) => void
  getUser: (id: string) => User | undefined
}

export const useUserStore = create<UserState>((set, get) => ({
  users: [
    { id: '1', name: '平台拥有者', email: 'admin@cs.com', phone: '', role: 'SuperAdmin', status: 'Active', points: 99999, avatar: '', owner_id: '', owner_type: 'Platform', permissions: {}, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: '2', name: '管理员', email: 'admin2@cs.com', phone: '', role: 'Admin', status: 'Active', points: 10000, avatar: '', owner_id: '', owner_type: 'Platform', permissions: {}, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: '3', name: '财务', email: 'finance@cs.com', phone: '', role: 'Finance', status: 'Active', points: 5000, avatar: '', owner_id: '', owner_type: 'Platform', permissions: {}, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: '4', name: '代理', email: 'agent@cs.com', phone: '', role: 'Agent', status: 'Active', points: 1000, avatar: '', owner_id: '', owner_type: 'GM', permissions: {}, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: '5', name: '普通用户', email: 'user@cs.com', phone: '', role: 'User', status: 'Active', points: 100, avatar: '', owner_id: '', owner_type: 'Direct', permissions: {}, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  ],
  isLoading: false,
  setUsers: (users) => set({ users }),
  addUser: (user) => set((state) => ({ users: [...state.users, user] })),
  updateUser: (id, data) => set((state) => ({ users: state.users.map(u => u.id === id ? { ...u, ...data } : u) })),
  deleteUser: (id) => set((state) => ({ users: state.users.filter(u => u.id !== id) })),
  getUser: (id) => get().users.find(u => u.id === id),
}))
