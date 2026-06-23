import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Users, Gift, Wallet, TrendingUp,
  CheckSquare, Ticket, Megaphone, Settings, FileText,
  Shield, User, ChevronLeft, ChevronRight,
  ShoppingCart, BookOpen, DollarsSign, Plug, Grid,
  Bell, BarChart3, MessageSquare, CreditCard
} from 'lucide-react'
import { useNotificationStore } from '@/store/notificationStore'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

const menuItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: '控制台' },
  { path: '/stats', icon: BarChart3, label: '数据统计' },
  { path: '/notifications', icon: Bell, label: '消息' },
  { path: '/chat', icon: MessageSquare, label: '客服中心' },
  { path: '/users', icon: Users, label: '用户管理' },
  { path: '/invites', icon: Gift, label: '邀请系统' },
  { path: '/wallet', icon: Wallet, label: '钱包' },
  { path: '/recharge', icon: CreditCard, label: '自助充值' },
  { path: '/payment-addresses', icon: CreditCard, label: '收款地址' },
  { path: '/finance', icon: TrendingUp, label: '财务管理' },
  { path: '/transactions', icon: DollarsSign, label: '交易流水' },
  { path: '/orders', icon: ShoppingCart, label: '订单中心' },
  { path: '/ledger', icon: BookOpen, label: '查账中心' },
  { path: '/tasks', icon: CheckSquare, label: '任务中心' },
  { path: '/features', icon: Grid, label: '功能中心' },
  { path: '/api', icon: Plug, label: '接口中心' },
  { path: '/tickets', icon: Ticket, label: '工单系统' },
  { path: '/announcements', icon: Megaphone, label: '公告' },
  { path: '/settings', icon: Settings, label: '系统设置' },
  { path: '/logs', icon: FileText, label: '日志' },
  { path: '/permissions', icon: Shield, label: '权限管理' },
  { path: '/profile', icon: User, label: '个人中心' },
]

export const Sidebar = ({ collapsed, onToggle }: SidebarProps) => {
  const { unreadCount } = useNotificationStore()

  return (
    <aside className={`fixed left-0 top-0 z-50 h-full bg-[#12182b]/95 backdrop-blur-xl border-r border-gray-800 transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
      <div className={`flex items-center justify-between p-4 border-b border-gray-800 ${collapsed ? 'justify-center' : ''}`}>
        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center w-full' : ''}`}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-sky-400 flex items-center justify-center font-bold text-white text-sm">CS</div>
          {!collapsed && (
            <div>
              <div className="font-bold text-white text-sm">财盛集团</div>
              <div className="text-xs text-gray-400">V3.0</div>
            </div>
          )}
        </div>
        <button onClick={onToggle} className="text-gray-400 hover:text-white hidden md:block">
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-80px)]">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                isActive
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              } ${collapsed ? 'justify-center' : ''}`
            }
            title={collapsed ? item.label : undefined}
          >
            <item.icon size={20} />
            {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
