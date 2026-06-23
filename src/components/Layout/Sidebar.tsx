import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, Users, Gift, Wallet, TrendingUp,
  CheckSquare, Ticket, Megaphone, Settings, FileText, 
  Shield, User, ChevronLeft, ChevronRight,
  ShoppingCart, BookOpen, DollarSign, Plug, Grid,
  Bell, BarChart3, MessageSquare
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
  { path: '/finance', icon: TrendingUp, label: '财务管理' },
  { path: '/transactions', icon: DollarSign, label: '交易流水' },
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
    <aside className={`fixed left-0 top-0 z-50 h-full bg-panel/95 backdrop-blur-xl border-r border-border transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className={`flex items-center gap-3 ${collapsed && 'justify-center w-full'}`}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue to-sky flex items-center justify-center font-bold text-white text-sm">CS</div>
          {!collapsed && <div><div className="font-bold text-white text-sm">财盛集团</div><div className="text-xs text-muted">V3.0</div></div>}
        </div>
        <button onClick={onToggle} className="text-muted hover:text-white hidden md:block">{collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}</button>
      </div>
      <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100vh-80px)]">
        {menuItems.map((item) => {
          const isMessages = item.path === '/notifications'
          return (
            <NavLink key={item.path} to={item.path} className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative ${isActive ? 'bg-blue/20 text-white border border-sky/30' : 'text-muted hover:text-white hover:bg-panel/50'} ${collapsed && 'justify-center'}`
            }>
              <item.icon size={20} />
              {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
              {isMessages && unreadCount > 0 && (
                <span className={`${collapsed ? 'absolute -top-1 -right-1' : 'ml-auto'} bg-red text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center`}>
                  {unreadCount}
                </span>
              )}
            </NavLink>
          )
        })}
      </nav>
    </aside>
  )
}
