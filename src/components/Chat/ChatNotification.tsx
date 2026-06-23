import { useEffect, useState } from 'react'
import { useChatStore } from '@/store/chatStore'
import { useAuthStore } from '@/store/authStore'
import { Bell, MessageSquare, X, User, Clock, CheckCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export const ChatNotification = () => {
  const { sessions, unreadTotal, markRead, setActiveSession } = useChatStore()
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [lastUnread, setLastUnread] = useState(unreadTotal)

  // 检查用户是否有客服权限
  const hasChatPermission = user?.role === 'SuperAdmin' || user?.role === 'Admin' || user?.role === 'Finance'

  // 监听未读数量变化
  useEffect(() => {
    if (unreadTotal > lastUnread && hasChatPermission) {
      const newSessions = sessions.filter(s => s.unreadCount > 0)
      if (newSessions.length > 0) {
        const latest = newSessions[0]
        toast.custom(
          (t) => (
            <div 
              className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-panel border border-sky/30 rounded-xl shadow-lg p-4 pointer-events-auto flex items-start gap-3`}
              onClick={() => {
                toast.dismiss(t.id)
                navigate('/chat')
                setActiveSession(latest.id)
              }}
            >
              <div className="p-2 rounded-xl bg-blue/20 text-blue">
                <MessageSquare size={20} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">{latest.userName}</span>
                  <span className="text-xs text-muted">{latest.lastMessageTime}</span>
                </div>
                <p className="text-sm text-muted">{latest.lastMessage}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-blue">新会话</span>
                  <span className="text-xs text-muted">点击回复</span>
                </div>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation()
                  toast.dismiss(t.id)
                }}
                className="text-muted hover:text-white"
              >
                <X size={16} />
              </button>
            </div>
          ),
          { duration: 10000, position: 'top-right' }
        )
        
        if (Notification.permission === 'granted') {
          new Notification('💬 新客服消息', {
            body: `${latest.userName}: ${latest.lastMessage}`,
            icon: '/favicon.ico'
          })
        }
      }
    }
    setLastUnread(unreadTotal)
  }, [unreadTotal, sessions, hasChatPermission, navigate, setActiveSession])

  if (!hasChatPermission) return null
  if (unreadTotal === 0) return null

  return (
    <button
      onClick={() => {
        navigate('/chat')
        sessions.forEach(s => {
          if (s.unreadCount > 0) markRead(s.id)
        })
      }}
      className="relative p-2 rounded-xl hover:bg-panel/50 text-muted hover:text-white transition-colors"
    >
      <Bell size={20} />
      {unreadTotal > 0 && (
        <span className="absolute -top-0.5 -right-0.5 bg-red text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
          {unreadTotal}
        </span>
      )}
    </button>
  )
}
