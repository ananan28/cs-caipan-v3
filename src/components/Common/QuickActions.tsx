import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Wallet, TrendingUp, Settings, Grid, Plus, X, LayoutDashboard, Gift, Ticket, FileText } from 'lucide-react'

const defaultActions = [
  { icon: Users, label: '用户管理', path: '/users', color: 'text-blue' },
  { icon: Wallet, label: '钱包', path: '/wallet', color: 'text-green' },
  { icon: TrendingUp, label: '财务管理', path: '/finance', color: 'text-orange' },
  { icon: Settings, label: '系统设置', path: '/settings', color: 'text-purple' },
  { icon: LayoutDashboard, label: '控制台', path: '/dashboard', color: 'text-sky' },
]

export const QuickActions = () => {
  const [actions, setActions] = useState(defaultActions)
  const [showAll, setShowAll] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const saved = localStorage.getItem('quickActions')
    if (saved) {
      try { setActions(JSON.parse(saved)) } catch {}
    }
  }, [])

  const handleClick = (path: string) => navigate(path)

  const displayActions = showAll ? actions : actions.slice(0, 4)

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {displayActions.map((action, i) => (
        <button
          key={i}
          onClick={() => handleClick(action.path)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-panel/50 border border-border hover:border-sky/30 transition-all text-muted hover:text-white text-sm"
        >
          <action.icon size={14} className={action.color} />
          <span className="hidden sm:inline">{action.label}</span>
        </button>
      ))}
      {actions.length > 4 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="p-1.5 rounded-xl bg-panel/50 border border-border hover:border-sky/30 transition-all text-muted hover:text-white"
        >
          {showAll ? <X size={14} /> : <Plus size={14} />}
        </button>
      )}
    </div>
  )
}
