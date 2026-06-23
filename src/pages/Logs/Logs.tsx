import { useState } from 'react'
import { Card } from '@/components/Common/Card'
import { Badge } from '@/components/Common/Badge'
import { Button } from '@/components/Common/Button'
import { Input } from '@/components/Forms/Input'
import { FileText, Search, Download, RefreshCw, Filter, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export const Logs = () => {
  const [activeTab, setActiveTab] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [logs, setLogs] = useState([
    { id: 1, time: '2025-06-22 14:30:25', user: 'admin@cs.com', action: '用户登录', type: 'login', ip: '192.168.1.1', status: 'success' },
    { id: 2, time: '2025-06-22 14:28:10', user: 'user@example.com', action: '转账操作', type: 'finance', ip: '192.168.1.5', status: 'success' },
    { id: 3, time: '2025-06-22 14:25:33', user: 'admin@cs.com', action: '修改设置', type: 'system', ip: '192.168.1.1', status: 'success' },
    { id: 4, time: '2025-06-22 14:20:18', user: 'agent@cs.com', action: '登录失败', type: 'login', ip: '192.168.1.10', status: 'failed' },
    { id: 5, time: '2025-06-22 14:15:42', user: 'finance@cs.com', action: '审核充值', type: 'finance', ip: '192.168.1.8', status: 'success' },
    { id: 6, time: '2025-06-22 14:10:05', user: 'admin@cs.com', action: '删除用户', type: 'system', ip: '192.168.1.1', status: 'success' },
    { id: 7, time: '2025-06-22 14:05:30', user: 'user@cs.com', action: '创建任务', type: 'task', ip: '192.168.1.15', status: 'success' },
    { id: 8, time: '2025-06-22 14:00:00', user: 'system', action: '系统启动', type: 'system', ip: 'localhost', status: 'info' },
  ])

  // ✅ 刷新
  const handleRefresh = () => {
    toast.loading('刷新中...')
    setTimeout(() => {
      toast.dismiss()
      toast.success('✅ 日志已刷新')
    }, 800)
  }

  // ✅ 导出
  const handleExport = () => {
    try {
      const data = logs.map(l => ({
        '时间': l.time,
        '用户': l.user,
        '操作': l.action,
        '类型': l.type,
        'IP': l.ip,
        '状态': l.status
      }))
      
      let csv = '时间,用户,操作,类型,IP,状态\n'
      data.forEach(row => {
        csv += `${row['时间']},${row['用户']},${row['操作']},${row['类型']},${row['IP']},${row['状态']}\n`
      })

      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `日志_${new Date().toISOString().slice(0, 10)}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('✅ 日志已导出')
    } catch (error) {
      toast.error('导出失败')
    }
  }

  const handleReset = () => {
    setSearchTerm('')
    setFilterType('')
    setFilterStatus('')
    toast.success('已重置筛选条件')
  }

  const typeColors: any = { login: 'blue', finance: 'green', system: 'purple', task: 'orange' }
  const statusColors: any = { success: 'green', failed: 'red', info: 'blue' }

  const filteredLogs = logs
    .filter(l => l.user.includes(searchTerm) || l.action.includes(searchTerm) || l.ip.includes(searchTerm))
    .filter(l => filterType ? l.type === filterType : true)
    .filter(l => filterStatus ? l.status === filterStatus : true)

  const filteredByTab = activeTab === 'all' ? filteredLogs : filteredLogs.filter(l => l.type === activeTab)

  const errorCount = logs.filter(l => l.status === 'failed').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">系统日志</h1>
          <p className="text-muted text-sm">操作日志、登录日志、资金日志</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={handleRefresh}><RefreshCw size={18} className="mr-1" />刷新</Button>
          <Button variant="ghost" onClick={handleExport}><Download size={18} className="mr-2" />导出</Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card><div className="text-center"><p className="text-sm text-muted">总日志</p><p className="text-2xl font-bold text-white">{logs.length}</p></div></Card>
        <Card><div className="text-center"><p className="text-sm text-muted">今日</p><p className="text-2xl font-bold text-blue">{logs.filter(l => new Date(l.time).toDateString() === new Date().toDateString()).length}</p></div></Card>
        <Card><div className="text-center"><p className="text-sm text-muted">异常</p><p className="text-2xl font-bold text-red">{errorCount}</p></div></Card>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setActiveTab('all')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'all' ? 'bg-blue text-white' : 'bg-panel/50 text-muted hover:text-white'}`}>📋 全部</button>
        <button onClick={() => setActiveTab('login')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'login' ? 'bg-blue text-white' : 'bg-panel/50 text-muted hover:text-white'}`}>🔐 登录</button>
        <button onClick={() => setActiveTab('finance')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'finance' ? 'bg-blue text-white' : 'bg-panel/50 text-muted hover:text-white'}`}>💰 资金</button>
        <button onClick={() => setActiveTab('system')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'system' ? 'bg-blue text-white' : 'bg-panel/50 text-muted hover:text-white'}`}>⚙️ 系统</button>
        <button onClick={() => setActiveTab('task')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'task' ? 'bg-blue text-white' : 'bg-panel/50 text-muted hover:text-white'}`}>📊 任务</button>
      </div>

      <Card>
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex-1 min-w-[200px]"><Input placeholder="搜索日志..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
          <select className="w-auto min-w-[120px] bg-panel/50 border border-border rounded-xl text-white px-4 py-2.5 outline-none" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="">全部类型</option>
            <option value="login">登录</option>
            <option value="finance">资金</option>
            <option value="system">系统</option>
            <option value="task">任务</option>
          </select>
          <select className="w-auto min-w-[120px] bg-panel/50 border border-border rounded-xl text-white px-4 py-2.5 outline-none" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">全部状态</option>
            <option value="success">成功</option>
            <option value="failed">失败</option>
            <option value="info">信息</option>
          </select>
          <Button variant="ghost" onClick={handleReset}>重置</Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-border">
              <th className="text-left text-xs font-bold text-muted uppercase py-3 px-4">时间</th>
              <th className="text-left text-xs font-bold text-muted uppercase py-3 px-4">用户</th>
              <th className="text-left text-xs font-bold text-muted uppercase py-3 px-4">操作</th>
              <th className="text-left text-xs font-bold text-muted uppercase py-3 px-4">类型</th>
              <th className="text-left text-xs font-bold text-muted uppercase py-3 px-4">IP</th>
              <th className="text-left text-xs font-bold text-muted uppercase py-3 px-4">状态</th>
            </tr></thead>
            <tbody>
              {filteredByTab.map(log => (
                <tr key={log.id} className="border-b border-border/50 hover:bg-panel/50">
                  <td className="py-3 px-4 text-sm text-muted">{log.time}</td>
                  <td className="py-3 px-4 text-white">{log.user}</td>
                  <td className="py-3 px-4 text-white">{log.action}</td>
                  <td className="py-3 px-4"><Badge variant={typeColors[log.type]}>{log.type}</Badge></td>
                  <td className="py-3 px-4 text-sm text-muted">{log.ip}</td>
                  <td className="py-3 px-4"><Badge variant={statusColors[log.status]}>{log.status}</Badge></td>
                </tr>
              ))}
              {filteredByTab.length === 0 && <tr><td colSpan={6} className="text-center py-8 text-muted">暂无日志记录</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
