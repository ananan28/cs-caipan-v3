import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface QuickReply {
  id: string
  title: string
  content: string
  category: 'general' | 'technical' | 'finance' | 'recharge' | 'task'
  sortOrder: number
}

export interface ChatSettings {
  onlineHours: string
  autoReply: string
  welcomeMessage: string
  quickReplies: QuickReply[]
}

interface ChatSettingsState {
  settings: ChatSettings
  updateSettings: (settings: Partial<ChatSettings>) => void
  addQuickReply: (reply: QuickReply) => void
  updateQuickReply: (id: string, data: Partial<QuickReply>) => void
  deleteQuickReply: (id: string) => void
  getQuickRepliesByCategory: (category: string) => QuickReply[]
}

const defaultQuickReplies: QuickReply[] = [
  { id: '1', title: '充值问题', content: '您好，关于充值问题，请提供您的订单号，我们会为您查询处理。', category: 'recharge', sortOrder: 1 },
  { id: '2', title: '任务失败', content: '您好，任务检测失败请提供任务ID，我们会帮您排查原因。', category: 'technical', sortOrder: 2 },
  { id: '3', title: '账号问题', content: '您好，关于账号问题，请描述具体情况，我们会为您解决。', category: 'general', sortOrder: 3 },
  { id: '4', title: '积分查询', content: '您好，您的当前积分余额可以在钱包页面查看。如需帮助请提供账号。', category: 'finance', sortOrder: 4 },
  { id: '5', title: '邀请码问题', content: '您好，邀请码相关问题，请提供您的邀请码，我们会帮您处理。', category: 'general', sortOrder: 5 },
  { id: '6', title: '投诉建议', content: '您好，感谢您的反馈！我们会认真处理并尽快回复您。', category: 'general', sortOrder: 6 },
]

const defaultSettings: ChatSettings = {
  onlineHours: '7x24小时',
  autoReply: '您好！感谢您的咨询，客服正在处理您的消息，请稍等片刻。',
  welcomeMessage: '您好！欢迎来到财盛集团客服中心，请问有什么可以帮助您的？',
  quickReplies: defaultQuickReplies,
}

export const useChatSettingsStore = create<ChatSettingsState>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,

      updateSettings: (updates) => {
        set((state) => ({
          settings: { ...state.settings, ...updates }
        }))
      },

      addQuickReply: (reply) => {
        set((state) => ({
          settings: {
            ...state.settings,
            quickReplies: [...state.settings.quickReplies, reply]
          }
        }))
      },

      updateQuickReply: (id, data) => {
        set((state) => ({
          settings: {
            ...state.settings,
            quickReplies: state.settings.quickReplies.map(r =>
              r.id === id ? { ...r, ...data } : r
            )
          }
        }))
      },

      deleteQuickReply: (id) => {
        set((state) => ({
          settings: {
            ...state.settings,
            quickReplies: state.settings.quickReplies.filter(r => r.id !== id)
          }
        }))
      },

      getQuickRepliesByCategory: (category) => {
        const { quickReplies } = get().settings
        if (category === 'all') return quickReplies
        return quickReplies.filter(r => r.category === category)
      },
    }),
    {
      name: 'chat-settings-storage',
    }
  )
)
