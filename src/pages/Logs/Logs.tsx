import { useState, useEffect } from 'react'
import { Card } from '@/components/Common/Card'
import { Badge } from '@/components/Common/Badge'
import { Button } from '@/components/Common/Button'
import { Input } from '@/components/Forms/Input'
import { supabase } from '@/lib/supabase'
import {
  FileText, Search, RefreshCw, Download, Filter,
  AlertCircle, Info, AlertTriangle, XCircle,
  Clock, User, Server
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Log {
  id: string
  user_id: string
  action: string
  level: string
  message: string
  ip: string
  user_agent: string
  created_at: string
  user?: {
    email: string
    username: string
  }
}

export const Logs = () => {
  const [logs, setLogs] = useState<Log[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterLevel, setFilterLevel] = useState('')

  const loadLogs = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('logs')
      .select('*, user:users(email, username)')
      .order('created_at', { ascending: false })
      .limit(200)

    if (error) {
      toast.error('加载日志失败: ' + error.message)
    } else {
      setLogs(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    loadLogs()
  }, [])

  const handleExport = () => {
    const csv = [
      ['ID', '用户', '级别', '操作', '消息', 'IP', '时间'],
      ...logs.map(l => [
        l.id.slice(0, 8),
        l.user?.email || l.user_id || 'system',
        l.level,
        l.action,
        l.message,
        l.ip || '-',
        new Date(l.created_at).toLocaleString()
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `logs_${new Date().toISOString().slice(0,10)}.csv`
    a.click()
    toast.success('导出成功')
  }

  const levelColors: Record<string, string> = {
    info: 'info',
    warning: 'warning',
    error: 'danger',
    debug: 'default'
  }

  const levelIcons: Record<string, any> = {
    info: Info,
    warning: AlertTriangle,
    error: XCircle,
    debug: Server
  }

  const filtered = logs.filter(l => {
    const matchSearch = l.message.includes(search) || l.action.includes(search) || l.user?.email?.includes(search)
    const matchLevel = !filterLevel || l.level === filterLevel
    return matchSearch && matchLevel
  })

  if (loading) {
    return (
      <div className="p-6 bg-[#0a0f1f] min-h-screen flex items-center justify-center">
        <div className="text-gray-400">加载中...</div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-[#0a0f1f] min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">日志系统</h1>
            <p className="text-gray-400 text-sm">查看所有系统日志</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadLogs}>
              <RefreshCw size={16} className="mr-2" /> 刷新
            </Button>
            <Button variant="primary" onClick={handleExport}>
              <Download size={16} className="mr-2" /> 导出
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#12182b] border border-gray-800 rounded-lg p-4">
            <div className="text-gray-400 text-sm">总日志</div>
            <div className="text-white text-2xl font-bold">{logs.length}</div>
          </div>
          <div className="bg-[#12182b] border border-gray-800 rounded-lg p-4">
            <div className="text-gray-400 text-sm">信息</div>
            <div className="text-blue-400 text-2xl font-bold">
              {logs.filter(l => l.level === 'info').length}
            </div>
          </div>
          <div className="bg-[#12182b] border border-gray-800 rounded-lg p-4">
            <div className="text-gray-400 text-sm">警告</div>
            <div className="text-yellow-400 text-2xl font-bold">
              {logs.filter(l => l.level === 'warning').length}
            </div>
          </div>
          <div className="bg-[#12182b] border border-gray-800 rounded-lg p-4">
            <div className="text-gray-400 text-sm">错误</div>
            <div className="text-red-400 text-2xl font-bold">
              {logs.filter(l => l.level === 'error').length}
            </div>
          </div>
        </div>

        <Card>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="搜索日志..."
                value={search}
                onChange={(e: any) => setSearch(e.target.value)}
                className="bg-[#1a1f35] border-gray-700 text-white"
                prefix={<Search size={16} className="text-gray-400" />}
              />
            </div>
            <select
              className="px-4 py-2 bg-[#1a1f35] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
            >
              <option value="">全部级别</option>
              <option value="info">信息</option>
              <option value="warning">警告</option>
              <option value="error">错误</option>
              <option value="debug">调试</option>
            </select>
            <Button variant="ghost" onClick={() => { setSearch(''); setFilterLevel('') }}>
              重置
            </Button>
          </div>
        </Card>

        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#1a1f35]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">级别</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">用户</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">操作</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">消息</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">IP</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">时间</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((log) => {
                  const Icon = levelIcons[log.level] || Info
                  return (
                    <tr key={log.id} className="border-t border-gray-800 hover:bg-[#1a1f35]/50">
                      <td className="px-4 py-3">
                        <Badge variant={levelColors[log.level] || 'default'}>
                          <Icon size={12} className="mr-1" />
                          {log.level}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-white text-sm">
                        {log.user?.email || log.user_id || 'system'}
                      </td>
                      <td className="px-4 py-3 text-gray-300 text-sm">{log.action}</td>
                      <td className="px-4 py-3 text-gray-400 text-sm max-w-xs truncate">{log.message}</td>
                      <td className="px-4 py-3 text-gray-400 text-sm font-mono">{log.ip || '-'}</td>
                      <td className="px-4 py-3 text-gray-400 text-sm">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                    </tr>
                  )
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-400">暂无日志</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}
