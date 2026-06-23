import { useState } from 'react'
import { Card } from '@/components/Common/Card'
import { Badge } from '@/components/Common/Badge'
import { Button } from '@/components/Common/Button'
import { Input } from '@/components/Forms/Input'
import { 
  FileText, Search, Download, RefreshCw,
  TrendingUp, TrendingDown, DollarSign, Clock,
  CheckCircle, XCircle, AlertCircle, Filter
} from 'lucide-react'
import toast from 'react-hot-toast'

export const Transactions = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('')

  const [transactions, setTransactions] = useState([
    { id: 'TX-001', user: 'admin@cs.com', type: '充值', amount: 500, fee: 0, status: 'success', time: '2025-06-22 14:30', desc: 'USDT充值' },
    { id: 'TX-002', user: 'user@example.com', type: '转账', amount: 100, fee: 1, status: 'success', time: '2025-06-22 13:20', desc: '转账给 agent@cs.com' },
    { id: 'TX-003', user: 'agent@cs.com', type: '任务扣费', amount: 50, fee: 0, status: 'success', time: '2025-06-22 12:00', desc: 'WhatsApp检测' },
    { id: 'TX-004', user: 'user@cs.com', type: '转账', amount: 200, fee: 2, status: 'failed', time: '2025-06-21 16:45', desc: '转账失败-余额不足' },
    { id: 'TX-005', user: 'admin@cs.com', type: '充值', amount: 1000, fee: 0, status: 'pending', time: '2025-06-21 10:00', desc: '支付宝充值' },
  ])

  // ✅ 刷新
  const handleRefresh = () => {
    toast.loading('刷新中...')
    setTimeout(() => {
      toast.dismiss()
      toast.success('✅ 交易流水已刷新')
    }, 800)
  }

  // ✅ 导出CSV
  const handleExport = () => {
    try {
      const data = transactions.map(t => ({
        '交易ID': t.id,
        '用户': t.user,
        '类型': t.type,
        '金额': t.amount,
        '手续费': t.fee,
        '状态': t.status,
        '时间': t.time,
        '说明': t.desc
      }))
      
      let csv = '交易ID,用户,类型,金额,手续费,状态,时间,说明\n'
      data.forEach(row => {
        csv += `${row['交易ID']},${row['用户']},${row['类型']},${row['金额']},${row['手续费']},${row['状态']},${row['时间']},${row['说明']}\n`
      })

      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `交易流水_${new Date().toISOString().slice(0, 10)}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('✅ 交易流水已导出')
    } catch (error) {
      toast.error('导出失败')
    }
  }

  const filtered = transactions.filter(t => 
    t.id.includes(searchTerm) || t.user.includes(searchTerm) || t.desc.includes(searchTerm)
  ).filter(t => typeFilter ? t.type === typeFilter : true)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">交易流水</h1>
          <p className="text-muted text-sm">所有资金变动记录</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={handleRefresh}><RefreshCw size={18} className="mr-1" />刷新</Button>
          <Button variant="ghost" onClick={handleExport}><Download size={18} className="mr-2" />导出</Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card><div className="text-center"><p className="text-sm text-muted">总交易</p><p className="text-2xl font-bold text-white">{transactions.length}</p></div></Card>
        <Card><div className="text-center"><p className="text-sm text-muted">成功</p><p className="text-2xl font-bold text-green">{transactions.filter(t => t.status === 'success').length}</p></div></Card>
        <Card><div className="text-center"><p className="text-sm text-muted">总金额</p><p className="text-2xl font-bold text-blue">¥{transactions.reduce((sum, t) => sum + t.amount, 0)}</p></div></Card>
      </div>

      <Card>
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex-1 min-w-[200px]"><Input placeholder="搜索交易..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
          <select className="w-auto min-w-[120px] bg-panel/50 border border-border rounded-xl text-white px-4 py-2.5 outline-none" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="">全部类型</option>
            <option value="充值">充值</option>
            <option value="转账">转账</option>
            <option value="任务扣费">任务扣费</option>
          </select>
          <Button variant="ghost" onClick={() => { setSearchTerm(''); setTypeFilter('') }}>重置</Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-border">
              <th className="text-left text-xs font-bold text-muted uppercase py-3 px-4">交易ID</th>
              <th className="text-left text-xs font-bold text-muted uppercase py-3 px-4">用户</th>
              <th className="text-left text-xs font-bold text-muted uppercase py-3 px-4">类型</th>
              <th className="text-left text-xs font-bold text-muted uppercase py-3 px-4">金额</th>
              <th className="text-left text-xs font-bold text-muted uppercase py-3 px-4">手续费</th>
              <th className="text-left text-xs font-bold text-muted uppercase py-3 px-4">状态</th>
              <th className="text-left text-xs font-bold text-muted uppercase py-3 px-4">时间</th>
              <th className="text-left text-xs font-bold text-muted uppercase py-3 px-4">说明</th>
            </tr></thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id} className="border-b border-border/50 hover:bg-panel/50">
                  <td className="py-3 px-4 text-white font-mono text-sm">{t.id}</td>
                  <td className="py-3 px-4 text-white">{t.user}</td>
                  <td className="py-3 px-4"><Badge variant={t.type === '充值' ? 'green' : t.type === '转账' ? 'orange' : 'blue'}>{t.type}</Badge></td>
                  <td className={`py-3 px-4 font-bold ${t.type === '充值' ? 'text-green' : t.type === '转账' ? 'text-orange' : 'text-blue'}`}>¥{t.amount}</td>
                  <td className="py-3 px-4 text-sm text-muted">{t.fee > 0 ? `¥${t.fee}` : '-'}</td>
                  <td className="py-3 px-4"><Badge variant={t.status === 'success' ? 'green' : t.status === 'pending' ? 'orange' : 'red'}>{t.status}</Badge></td>
                  <td className="py-3 px-4 text-sm text-muted">{t.time}</td>
                  <td className="py-3 px-4 text-sm text-muted">{t.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
