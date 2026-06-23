import { create } from 'zustand'

export interface ChatSession {
  id: string
  userId: string
  userName: string
  userEmail: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  status: 'waiting' | 'processing' | 'resolved' | 'closed'
  assignedTo: string | null
  category: string
  createdAt: string
}

export interface ChatMessage {
  id: string
  sessionId: string
  from: 'user' | 'system' | 'admin'
  content: string
  time: string
  isRead: boolean
}

interface ChatState {
  sessions: ChatSession[]
  messages: Record<string, ChatMessage[]>
  unreadTotal: number
  activeSessionId: string | null
  isConnected: boolean
  
  // 方法
  addSession: (session: ChatSession) => void
  addMessage: (sessionId: string, message: ChatMessage) => void
  markRead: (sessionId: string) => void
  assignSession: (sessionId: string, adminId: string) => void
  updateStatus: (sessionId: string, status: ChatSession['status']) => void
  setActiveSession: (sessionId: string | null) => void
  getUnreadForAdmin: () => number
  setConnected: (connected: boolean) => void
}

// 模拟初始会话
const initialSessions: ChatSession[] = [
  {
    id: 'SESS-001',
    userId: 'user@example.com',
    userName: '张三',
    userEmail: 'user@example.com',
    lastMessage: '你好，我的充值没到账',
    lastMessageTime: new Date().toISOString().slice(0, 16).replace('T', ' '),
    unreadCount: 1,
    status: 'waiting',
    assignedTo: null,
    category: 'recharge',
    createdAt: new Date().toISOString()
  },
  {
    id: 'SESS-002',
    userId: 'user2@example.com',
    userName: '李四',
    userEmail: 'user2@example.com',
    lastMessage: '任务检测一直失败',
    lastMessageTime: new Date().toISOString().slice(0, 16).replace('T', ' '),
    unreadCount: 0,
    status: 'processing',
    assignedTo: 'admin@cs.com',
    category: 'technical',
    createdAt: new Date().toISOString()
  }
]

export const useChatStore = create<ChatState>((set, get) => ({
  sessions: initialSessions,
  messages: {},
  unreadTotal: 1,
  activeSessionId: null,
  isConnected: false,

  addSession: (session) => {
    set((state) => ({
      sessions: [session, ...state.sessions],
      unreadTotal: state.unreadTotal + 1
    }))
    // 触发通知
    if (typeof window !== 'undefined') {
      // 发送浏览器通知
      if (Notification.permission === 'granted') {
        new Notification('📩 新客服请求', {
          body: `${session.userName} 请求客服帮助`,
          icon: '/favicon.ico'
        })
      }
    }
  },

  addMessage: (sessionId, message) => {
    set((state) => {
      const currentMessages = state.messages[sessionId] || []
      const updated = [...currentMessages, message]
      
      // 更新会话最后消息
      const updatedSessions = state.sessions.map(s => 
        s.id === sessionId 
          ? { 
              ...s, 
              lastMessage: message.content, 
              lastMessageTime: message.time,
              unreadCount: message.from === 'user' ? s.unreadCount + 1 : s.unreadCount
            }
          : s
      )
      
      // 如果是用户消息，增加未读总数
      const unreadTotal = message.from === 'user' 
        ? state.unreadTotal + 1 
        : state.unreadTotal

      return {
        messages: { ...state.messages, [sessionId]: updated },
        sessions: updatedSessions,
        unreadTotal: unreadTotal
      }
    })
  },

  markRead: (sessionId) => {
    set((state) => {
      const updatedSessions = state.sessions.map(s => 
        s.id === sessionId ? { ...s, unreadCount: 0 } : s
      )
      const unreadTotal = updatedSessions.reduce((sum, s) => sum + s.unreadCount, 0)
      return { sessions: updatedSessions, unreadTotal }
    })
  },

  assignSession: (sessionId, adminId) => {
    set((state) => ({
      sessions: state.sessions.map(s => 
        s.id === sessionId ? { ...s, assignedTo: adminId, status: 'processing' } : s
      )
    }))
  },

  updateStatus: (sessionId, status) => {
    set((state) => ({
      sessions: state.sessions.map(s => 
        s.id === sessionId ? { ...s, status } : s
      )
    }))
  },

  setActiveSession: (sessionId) => {
    set({ activeSessionId: sessionId })
    if (sessionId) {
      get().markRead(sessionId)
    }
  },

  getUnreadForAdmin: () => {
    return get().unreadTotal
  },

  setConnected: (connected) => {
    set({ isConnected: connected })
  },
}))

// 请求浏览器通知权限
if (typeof window !== 'undefined' && 'Notification' in window) {
  if (Notification.permission === 'default') {
    Notification.requestPermission()
  }
}
