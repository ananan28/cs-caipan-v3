import React from 'react'
import { Bell, X } from 'lucide-react'
import { Badge } from '@/components/Common/Badge'

interface ChatNotificationProps {
  unreadCount: number
  onClose: () => void
}

export const ChatNotification: React.FC<ChatNotificationProps> = ({ unreadCount, onClose }) => {
  if (unreadCount === 0) return null
  
  return (
    <div className="fixed bottom-24 right-6 z-50 bg-blue-500 text-white rounded-xl px-4 py-3 shadow-lg flex items-center gap-3 animate-bounce">
      <Bell size={18} />
      <span className="text-sm font-medium">{unreadCount} 条未读消息</span>
      <Badge variant="info">新</Badge>
      <button onClick={onClose} className="hover:bg-white/20 rounded p-1">
        <X size={16} />
      </button>
    </div>
  )
}
