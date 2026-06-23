import React, { useState } from 'react'
import { Search, X, FileText, Users, Wallet, Settings } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface SearchResult {
  id: string
  title: string
  description: string
  path: string
  icon: React.ReactNode
}

export const GlobalSearch: React.FC = () => {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])

  const handleSearch = (value: string) => {
    setQuery(value)
    if (value.length < 2) {
      setResults([])
      return
    }

    const items: SearchResult[] = [
      { id: '1', title: '控制台', description: '仪表盘概览', path: '/dashboard', icon: <FileText size={16} /> },
      { id: '2', title: '用户管理', description: '管理系统用户', path: '/users', icon: <Users size={16} /> },
      { id: '3', title: '钱包', description: '管理账户余额', path: '/wallet', icon: <Wallet size={16} /> },
      { id: '4', title: '系统设置', description: '系统配置', path: '/settings', icon: <Settings size={16} /> },
    ]

    setResults(items.filter(item => 
      item.title.includes(value) || item.description.includes(value)
    ))
  }

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)} 
        className="text-gray-400 hover:text-white p-2"
        title="搜索 (Ctrl+K)"
      >
        <Search size={20} />
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-start justify-center pt-20 z-[300]">
      <div className="bg-[#12182b] border border-gray-700 rounded-2xl w-full max-w-2xl shadow-2xl">
        <div className="flex items-center border-b border-gray-700 p-4">
          <Search size={20} className="text-gray-400 mr-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="搜索页面、功能..."
            className="flex-1 bg-transparent text-white text-lg outline-none"
            autoFocus
          />
          <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>
        
        {results.length > 0 && (
          <div className="p-2">
            {results.map((result) => (
              <button
                key={result.id}
                onClick={() => {
                  navigate(result.path)
                  setIsOpen(false)
                }}
                className="w-full flex items-center gap-3 p-3 hover:bg-[#1a1f35] rounded-lg transition-colors"
              >
                <span className="text-gray-400">{result.icon}</span>
                <div className="text-left">
                  <p className="text-white font-medium">{result.title}</p>
                  <p className="text-gray-400 text-sm">{result.description}</p>
                </div>
              </button>
            ))}
          </div>
        )}
        
        {query.length >= 2 && results.length === 0 && (
          <div className="p-8 text-center text-gray-400">
            没有找到匹配结果
          </div>
        )}
      </div>
    </div>
  )
}
