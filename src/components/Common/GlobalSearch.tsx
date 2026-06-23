import { useState, useEffect } from 'react'
import { Search, X, Command } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const routes = [
  { path: '/dashboard', label: '控制台', shortcut: 'G D' },
  { path: '/users', label: '用户管理', shortcut: 'G U' },
  { path: '/wallet', label: '钱包', shortcut: 'G W' },
  { path: '/finance', label: '财务管理', shortcut: 'G F' },
  { path: '/tasks', label: '任务中心', shortcut: 'G T' },
  { path: '/settings', label: '系统设置', shortcut: 'G S' },
  { path: '/invites', label: '邀请系统', shortcut: 'G I' },
  { path: '/tickets', label: '工单系统', shortcut: 'G K' },
  { path: '/logs', label: '日志', shortcut: 'G L' },
]

export const GlobalSearch = () => {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(true)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  const filtered = routes.filter(r => 
    r.label.includes(query) || 
    r.path.includes(query) ||
    query === ''
  )

  const handleSelect = (path: string) => {
    navigate(path)
    setOpen(false)
    setQuery('')
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur flex items-start justify-center pt-20">
      <div className="w-full max-w-lg">
        <div className="bg-panel border border-border rounded-xl shadow-2xl overflow-hidden">
          <div className="flex items-center gap-3 p-4 border-b border-border">
            <Search size={18} className="text-muted" />
            <input
              type="text"
              placeholder="搜索功能... (Ctrl+K)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent outline-none text-white"
              autoFocus
            />
            <kbd className="px-2 py-1 text-xs bg-panel/50 rounded text-muted">ESC</kbd>
          </div>
          <div className="max-h-64 overflow-y-auto p-2">
            {filtered.map(r => (
              <button
                key={r.path}
                onClick={() => handleSelect(r.path)}
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-panel/50 transition-colors"
              >
                <span className="text-white">{r.label}</span>
                <span className="text-xs text-muted">{r.shortcut}</span>
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="text-center text-muted py-4">没有找到结果</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
