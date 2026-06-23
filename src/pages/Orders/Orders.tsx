import { useState } from 'react'
import { Card } from '@/components/Common/Card'
import { Badge } from '@/components/Common/Badge'
import { Button } from '@/components/Common/Button'
import { Input } from '@/components/Forms/Input'
import { ShoppingCart, Package, CreditCard, Clock, CheckCircle, XCircle, Search, Eye, Download, RefreshCw, DollarSign } from 'lucide-react'
import toast from 'react-hot-toast'

export const Orders = () => {
  const [activeTab, setActiveTab] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const [orders, setOrders] = useState([
    { id: 'ORD-001', user: 'user@example.com', type: '套餐购买', amount: 499, points: 6000, status: 'completed', time: '2025-06-22 14:30' },
    { id: 'ORD-002', user: 'admin@cs.com', type: '任务扣费', amount: 50, points: 500, status: 'processing', time: '2025-06-22 13:20' },
    { id: 'ORD-003', user: 'agent@cs.com', type: '套餐购买', amount: 1999, points: 30000, status: 'pending', time: '2025-06-22 12:00' },
    { id: 'ORD-004', user: 'user@cs.com', type: '任务扣费', amount: 30, points: 300, status: 'failed', time: '2025-06-21 16:45' },
    { id: 'ORD-005', user: 'admin@cs.com', type: '套餐购买', amount: 99, points: 1000, status: 'completed', time: '2025-06-21 10:00' },
  ])

  // ✅ 刷新
  const handleRefresh = () => {
    toast.loading('刷新中...')
    setTimeout(() => {
      toast.dismiss()
      toast.success('✅ 订单已刷新')
    }, 800)
  }

  // ✅ 导出
  const handleExport = () => {
    try {
      const data = orders.map(o => ({
        '订单号': o.id,
        '用户': o.user,
        '类型': o.type,
        '金额': o.amount,
        '积分': o.points,
        '状态': o.status,
        '时间': o.time
      }))
      
      let csv = '订单号,用户,类型,金额,积分,状态,时间\n'
      data.forEach(row => {
        csv += `${row['订单号']},${row['用户']},${row['类型']},${row['金额']},${row['积分']},${row['状态']},${row['时间']}\n`
      })

      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `订单_${new Date().toISOString().slice(0, 10)}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('✅ 订单已导出')
    } catch (error) {
      toast.error('导出失败')
    }
  }

  const statusColors: any = { pending: 'orange', processing: 'blue', completed: 'green', failed: 'red' }

  const filteredOrders = orders.filter(o => 
    o.id.includes(searchTerm) || o.user.includes(searchTerm)
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">订单中心</h1>
          <p className="text-muted text-sm">查看所有订单记录</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={handleRefresh}><RefreshCw size={18} className="mr-1" />刷新</Button>
          <Button variant="ghost" onClick={handleExport}><Download size={18} className="mr-2" />导出</Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card><div className="text-center"><p className="text-sm text-muted">总订单</p><p className="text-2xl font-bold text-white">{orders.length}</p></div></Card>
        <Card><div className="text-center"><p className="text-sm text-muted">已完成</p><p className="text-2xl font-bold text-green">{orders.filter(o => o.status === 'completed').length}</p></div></Card>
        <Card><div className="text-center"><p className="text-sm text-muted">总金额</p><p className="text-2xl font-bold text-blue">¥{orders.reduce((sum, o) => sum + o.amount, 0)}</p></div></Card>
      </div>

      <Card>
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex-1 min-w-[200px]"><Input placeholder="搜索订单..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setActiveTab('all')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'all' ? 'bg-blue text-white' : 'bg-panel/50 text-muted hover:text-white'}`}>全部</button>
            <button onClick={() => setActiveTab('pending')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'pending' ? 'bg-blue text-white' : 'bg-panel/50 text-muted hover:text-white'}`}>待处理</button>
            <button onClick={() => setActiveTab('completed')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'completed' ? 'bg-blue text-white' : 'bg-panel/50 text-muted hover:text-white'}`}>已完成</button>
          </div>
          <Button variant="ghost" onClick={() => setSearchTerm('')}>重置</Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-border">
              <th className="text-left text-xs font-bold text-muted uppercase py-3 px-4">订单号</th>
              <th className="text-left text-xs font-bold text-muted uppercase py-3 px-4">用户</th>
              <th className="text-left text-xs font-bold text-muted uppercase py-3 px-4">类型</th>
              <th className="text-left text-xs font-bold text-muted uppercase py-3 px-4">金额</th>
              <th className="text-left text-xs font-bold text-muted uppercase py-3 px-4">积分</th>
              <th className="text-left text-xs font-bold text-muted uppercase py-3 px-4">状态</th>
              <th className="text-left text-xs font-bold text-muted uppercase py-3 px-4">时间</th>
            </tr></thead>
            <tbody>
              {filteredOrders.map(o => (
                <tr key={o.id} className="border-b border-border/50 hover:bg-panel/50">
                  <td className="py-3 px-4 text-white font-mono text-sm">{o.id}</td>
                  <td className="py-3 px-4 text-white">{o.user}</td>
                  <td className="py-3 px-4"><Badge variant="blue">{o.type}</Badge></td>
                  <td className="py-3 px-4 text-green font-bold">¥{o.amount}</td>
                  <td className="py-3 px-4 text-blue">{o.points}</td>
                  <td className="py-3 px-4"><Badge variant={statusColors[o.status]}>{o.status}</Badge></td>
                  <td className="py-3 px-4 text-sm text-muted">{o.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
