import React from 'react'
import { useAuthStore } from '../../store/authStore'
import { useNotificationStore } from '../../store/notificationStore'
import { Bell, User, LogOut, Sun, Moon } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { useNavigate } from 'react-router-dom'

interface TopbarProps {
  collapsed?: boolean
}

export const Topbar: React.FC<TopbarProps> = ({ collapsed }) => {
  const { user, logout } = useAuthStore()
  const { unreadCount } = useNotificationStore()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className={`fixed top-0 right-0 z-40 h-16 bg-white/80 backdrop-blur-xl border-b border-gray-200 flex items-center justify-between px-6 transition-all duration-300 ${collapsed ? 'left-20' : 'left-64'}`}>
      <div className="flex items-center gap-4">
        <h2 className="text-gray-900 font-semibold text-lg">财盛集团 V3.0</h2>
      </div>

      <div className="flex items-center gap-2">
        <button onClick={toggleTheme} className="p-2.5 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all">
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button 
          onClick={() => navigate('/notifications')} 
          className="relative p-2.5 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>

        <button 
          onClick={() => navigate('/profile')} 
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center text-white text-sm font-bold">
            {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
          </div>
          <span className="text-sm hidden md:block font-medium">{user?.name || user?.email || '用户'}</span>
        </button>

        <button 
          onClick={handleLogout} 
          className="p-2.5 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  )
}
