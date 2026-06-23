import { useAuthStore } from '@/store/authStore'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '@/context/ThemeContext'
import { useNotificationStore } from '@/store/notificationStore'
import { ChatNotification } from '@/components/Chat/ChatNotification'
import { LogOut, User, Moon, Sun, Bell } from 'lucide-react'
import toast from 'react-hot-toast'

export const Topbar = () => {
  const { user, logout } = useAuthStore()
  const { theme, toggleTheme } = useTheme()
  const { unreadCount } = useNotificationStore()
  const navigate = useNavigate()

  const handleLogout = () => { 
    logout()
    toast.success('已退出登录')
    navigate('/login') 
  }

  return (
    <header className="sticky top-0 z-40 bg-panel/80 backdrop-blur-xl border-b border-border h-[72px] flex items-center px-6">
      <div className="flex items-center justify-between w-full">
        <div>
          <h1 className="text-xl font-bold text-white">财盛集团</h1>
          <p className="text-xs text-muted">博亿研发中心 · V3.0</p>
        </div>
        <div className="flex items-center gap-3">
          <ChatNotification />
          
          <button 
            onClick={() => navigate('/notifications')}
            className="relative p-2 rounded-xl hover:bg-panel/50 text-muted hover:text-white transition-colors"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-red text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
          
          <button 
            onClick={toggleTheme} 
            className="p-2 rounded-xl hover:bg-panel/50 text-muted hover:text-white transition-colors"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          
          <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-panel/50 border border-border">
            <User size={18} className="text-muted" />
            <span className="text-sm font-medium text-white">{user?.name || '用户'}</span>
            <span className="text-xs text-muted">({user?.role || 'Guest'})</span>
          </div>
          <button onClick={handleLogout} className="p-2 rounded-xl hover:bg-red/10 text-red transition-colors"><LogOut size={20} /></button>
        </div>
      </div>
    </header>
  )
}
