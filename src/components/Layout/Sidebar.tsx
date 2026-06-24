import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Users, Gift, Wallet, TrendingUp,
  CheckSquare, Ticket, Megaphone, Settings, FileText,
  Shield, User, ChevronLeft, ChevronRight,
  ShoppingCart, BookOpen, DollarSign, Plug, Grid,
  Bell, BarChart3, MessageSquare, CreditCard
} from 'lucide-react'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

const menuItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: '控制台' },
  { path: '/stats', icon: BarChart3, label: '数据统计' },
  { path: '/notifications', icon: Bell, label: '消息' },
  { path: '/chat', icon: MessageSquare, label: '客服中心' },
  { divider: true },
  { path: '/users', icon: Users, label: '用户管理' },
  { path: '/invites', icon: Gift, label: '邀请系统' },
  { path: '/wallet', icon: Wallet, label: '钱包' },
  { path: '/recharge', icon: CreditCard, label: '自助充值' },
  { path: '/payment-addresses', icon: CreditCard, label: '收款地址' },
  { divider: true },
  { path: '/finance', icon: TrendingUp, label: '财务管理' },
  { path: '/transactions', icon: DollarSign, label: '交易流水' },
  { path: '/orders', icon: ShoppingCart, label: '订单中心' },
  { path: '/ledger', icon: BookOpen, label: '查账中心' },
  { path: '/tasks', icon: CheckSquare, label: '任务中心' },
  { path: '/features', icon: Grid, label: '功能中心' },
  { path: '/api', icon: Plug, label: '接口中心' },
  { divider: true },
  { path: '/tickets', icon: Ticket, label: '工单系统' },
  { path: '/announcements', icon: Megaphone, label: '公告' },
  { path: '/settings', icon: Settings, label: '系统设置' },
  { path: '/logs', icon: FileText, label: '日志' },
  { path: '/permissions', icon: Shield, label: '权限管理' },
  { path: '/profile', icon: User, label: '个人中心' },
]

const sidebarWallpaper = 'https://fuqhvyqxibepmbauohmh.supabase.co/storage/v1/object/public/wallpapers/messageImage_1781065571804.jpg'

export const Sidebar = ({ collapsed, onToggle }: SidebarProps) => {
  return (
    <aside 
      className={`fixed left-0 top-0 z-50 h-full transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}
      style={{
        backgroundImage: `url(${sidebarWallpaper})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="absolute inset-0 bg-black/40" />
      
      <div className="relative z-10 flex flex-col h-full">
        <div className={`flex items-center justify-between p-4 border-b border-white/10 ${collapsed ? 'justify-center' : ''}`}>
          <div className={`flex items-center gap-3 ${collapsed ? 'justify-center w-full' : ''}`}>
            <div className="w-12 h-12 rounded-full bg-black border-2 border-yellow-400 flex items-center justify-center shadow-lg shadow-yellow-500/20 flex-shrink-0">
              <span className="text-xl font-bold text-yellow-400">財</span>
            </div>
            {!collapsed && (
              <div>
                <div className="font-bold text-white text-sm tracking-wide drop-shadow-md">财盛集团</div>
                <div className="text-xs text-white/70 drop-shadow-md">V3.0</div>
              </div>
            )}
          </div>
          <button onClick={onToggle} className="text-white/60 hover:text-white hidden md:block transition-colors">
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        <nav className="p-3 space-y-1 overflow-y-auto flex-1">
          {menuItems.map((item, idx) => {
            if ('divider' in item) {
              return <div key={`divider-${idx}`} className="h-px bg-white/10 my-2" />
            }
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-yellow-400/30 to-yellow-500/30 text-yellow-200'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  } ${collapsed ? 'justify-center' : ''}`
                }
                title={collapsed ? item.label : undefined}
              >
                <item.icon size={20} strokeWidth={1.8} />
                {!collapsed && <span className="text-sm font-medium drop-shadow-sm">{item.label}</span>}
              </NavLink>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
