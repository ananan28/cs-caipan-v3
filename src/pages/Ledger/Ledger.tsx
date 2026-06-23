import { useState } from 'react'
import { Card } from '@/components/Common/Card'
import { Badge } from '@/components/Common/Badge'
import { Button } from '@/components/Common/Button'
import { Input } from '@/components/Forms/Input'
import { BookOpen, Search, Download, RefreshCw, TrendingUp, TrendingDown, DollarSign, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

export const Ledger = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('')

  const [ledger, setLedger] = useState([
    { id: 1, user: 'admin@cs.com', type: '充值', before: 5000, after: 5500, change: 500, desc: 'USDT充值', time: '2025-06-22 14:30' },
    { id: 2, user: 'user@example.com', type: '转账', before: 1000, after: 900, change: -100, desc: '转账给 agent@cs.com', time: '2025-06-22 13:20' },
    { id: 3, user: 'agent@cs.com', type: '任务扣费', before: 2000, after: 1950, change: -50, desc: 'WhatsApp检测', time: '2025-06-22 12:00' },
    { id: 4, user: 'user@cs.com', type: '充值', before: 100, after: 300, change: 200, desc: '支付宝充值', time: '2025-06-21 16:45' },
    { id: 5, user: 'admin@cs.com', type: '转账', before: 5500, after: 5400, change: -100, desc: '转账给 user@cs.com', time: '2025-06-21 10:00' },
    { id: 6, user: 'finance@cs.com', type: '调整', before: 3000, after: 3500, change: 500, desc: '管理员调整', time: '2025-06-20 14:30' },
  ])

  // ✅ 刷新
  const handleRefresh = () => {
    toast.loading('刷新中...')
    setTimeout(() => {
      toast.dismiss()
      toast.success('✅ 查账记录已刷新')
    }, 800)
  }

  // ✅ 导出
  const handleExport = () => {
    try {
      const data = ledger.map(l => ({
        '时间': l.time,
        '用户': l.user,
        '类型': l.type,
        '变动前': l.before,
        '变动': l.change,
        '变动后': l.after,
        '说明': l.desc
      }))
      
      let csv = '时间,用户,类型,变动前,变动,变动后,说明\n'
      data.forEach(row => {
        csv += `${row['时间']},${row['用户']},${row['类型']},${row['变动前']},${row['变动']},${row['变动后']},${row['说明']}\n`
      })

      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `查账_${new Date().toISOString().slice(0, 10)}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('✅ 查账记录已导出')
    } catch (error) {
      toast.error('导出失败')
    }
  }

  const filtered = ledger.filter(l => 
    l.user.includes(searchTerm) || l.desc.includes(searchTerm)
  ).filter(l => typeFilter ? l.type === typeFilter : true)

  const totalChange = ledger.reduce((sum, l) => sum + l.change, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">查账中心</h1>
          <p className="text-muted text-sm">所有资金变动明细</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={handleRefresh}><RefreshCw size={18} className="mr-1" />刷新</Button>
          <Button variant="ghost" onClick={handleExport}><Download size={18} className="mr-2" />导出</Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card><div className="text-center"><p className="text-sm text-muted">总记录</p><p className="text-2xl font-bold text-white">{ledger.length}</p></div></Card>
        <Card><div className="text-center"><p className="text-sm text-muted">总变动</p><p className={`text-2xl font-bold ${totalChange >= 0 ? 'text-green' : 'text-red'}`}>{totalChange >= 0 ? '+' : ''}{totalChange}</p></div></Card>
        <Card><div className="text-center"><p className="text-sm text-muted">记录数</p><p className="text-2xl font-bold text-blue">{filtered.length}</p></div></Card>
      </div>

      <Card>
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex-1 min-w-[200px]"><Input placeholder="搜索..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
          <select className="w-auto min-w-[120px] bg-panel/50 border border-border rounded-xl text-white px-4 py-2.5 outline-none" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="">全部类型</option>
            <option value="充值">充值</option>
            <option value="转账">转账</option>
            <option value="任务扣费">任务扣费</option>
            <option value="调整">调整</option>
          </select>
          <Button variant="ghost" onClick={() => { setSearchTerm(''); setTypeFilter('') }}>重置</Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-border">
              <th className="text-left text-xs font-bold text-muted uppercase py-3 px-4">时间</th>
              <th className="text-left text-xs font-bold text-muted uppercase py-3 px-4">用户</th>
              <th className="text-left text-xs font-bold text-muted uppercase py-3 px-4">类型</th>
              <th className="text-left text-xs font-bold text-muted uppercase py-3 px-4">变动前</th>
              <th className="text-left text-xs font-bold text-muted uppercase py-3 px-4">变动</th>
              <th className="text-left text-xs font-bold text-muted uppercase py-3 px-4">变动后</th>
              <th className="text-left text-xs font-bold text-muted uppercase py-3 px-4">说明</th>
            </tr></thead>
            <tbody>
              {filtered.map(l => (
                <tr key={l.id} className="border-b border-border/50 hover:bg-panel/50">
                  <td className="py-3 px-4 text-sm text-muted">{l.time}</td>
                  <td className="py-3 px-4 text-white">{l.user}</td>
                  <td className="py-3 px-4"><Badge variant={l.type === '充值' ? 'green' : l.type === '转账' ? 'orange' : l.type === '调整' ? 'purple' : 'blue'}>{l.type}</Badge></td>
                  <td className="py-3 px-4 text-white">¥{l.before}</td>
                  <td className={`py-3 px-4 font-bold ${l.change >= 0 ? 'text-green' : 'text-red'}`}>{l.change >= 0 ? '+' : ''}{l.change}</td>
                  <td className="py-3 px-4 text-white">¥{l.after}</td>
                  <td className="py-3 px-4 text-sm text-muted">{l.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
