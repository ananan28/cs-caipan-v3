import { create } from 'zustand'

export interface Notification {
  id: number
  title: string
  content: string
  type: 'success' | 'info' | 'warning' | 'error'
  time: string
  read: boolean
  from: string
}

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  addNotification: (notification: Notification) => void
  markRead: (id: number) => void
  markAllRead: () => void
  deleteNotification: (id: number) => void
  deleteAll: () => void
  getUnreadCount: () => number
}

// 默认通知
const defaultNotifications: Notification[] = [
  { id: 1, title: '系统初始化', content: '欢迎使用财盛集团系统 V3.0', type: 'info', time: new Date().toISOString().slice(0, 16).replace('T', ' '), read: true, from: '系统' },
]

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: defaultNotifications,
  unreadCount: 0,

  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1
    }))
  },

  markRead: (id) => {
    set((state) => {
      const updated = state.notifications.map(n => 
        n.id === id ? { ...n, read: true } : n
      )
      return {
        notifications: updated,
        unreadCount: updated.filter(n => !n.read).length
      }
    })
  },

  markAllRead: () => {
    set((state) => ({
      notifications: state.notifications.map(n => ({ ...n, read: true })),
      unreadCount: 0
    }))
  },

  deleteNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter(n => n.id !== id),
      unreadCount: state.notifications.filter(n => n.id !== id && !n.read).length
    }))
  },

  deleteAll: () => {
    set({ notifications: [], unreadCount: 0 })
  },

  getUnreadCount: () => {
    return get().unreadCount
  },
}))
