import { useState, useEffect } from 'react'
import { Card } from '@/components/Common/Card'
import { Badge } from '@/components/Common/Badge'
import { Button } from '@/components/Common/Button'
import { Input } from '@/components/Forms/Input'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import {
  TrendingUp, TrendingDown, DollarSign, Calendar, Search,
  RefreshCw, Download, Filter, CheckCircle, XCircle, Clock,
  Eye, Wallet, CreditCard
} from 'lucide-react'
import toast from 'react-hot-toast'

interface FinanceRecord {
  id: string
  user_id: string
  type: string
  amount: number
  status: string
  description: string
  created_at: string
  user?: {
    email: string
    username: string
  }
}

export const Finance = () => {
  const { user } = useAuthStore()
  const [records, setRecords] = useState<FinanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [dateRange, setDateRange] = useState('7d')
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpense: 0,
    pendingAmount: 0,
    netProfit: 0
  })

  const loadFinance = async () => {
    setLoading(true)

    let query = supabase
      .from('transactions')
      .select('*, user:users(email, username)')
      .order('created_at', { ascending: false })

    // 非管理员只查看自己的
    if (user?.role !== 'SuperAdmin' && user?.role !== 'Admin') {
      query = query.eq('user_id', user?.id)
    }

    const { data, error } = await query

    if (error) {
      toast.error('加载数据失败: ' + error.message)
    } else {
      setRecords(data || [])

      // 计算统计
      const income = data?.filter(t => t.amount > 0 && t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0) || 0
      const expense = data?.filter(t => t.amount < 0 && t.status === 'completed')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0) || 0
      const pending = data?.filter(t => t.status === 'pending')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0) || 0

      setStats({
        totalIncome: income,
        totalExpense: expense,
        pendingAmount: pending,
        netProfit: income - expense
      })
    }
    setLoading(false)
  }

  useEffect(() => {
    loadFinance()
  }, [user])

  const handleApprove = async (id: string) => {
    const { error } = await supabase
      .from('transactions')
      .update({ status: 'completed' })
      .eq('id', id)

    if (error) {
      toast.error('审批失败: ' + error.message)
    } else {
      toast.success('已通过')
      loadFinance()
    }
  }

  const handleReject = async (id: string) => {
    if (!confirm('确定要拒绝这笔交易吗？')) return

    const { error } = await supabase
      .from('transactions')
      .update({ status: 'failed' })
      .eq('id', id)

    if (error) {
      toast.error('操作失败: ' + error.message)
    } else {
      toast.success('已拒绝')
      loadFinance()
    }
  }

  const handleExport = () => {
    const csv = [
      ['ID', '用户', '类型', '金额', '状态', '说明', '时间'],
      ...records.map(r => [
        r.id.slice(0, 8),
        r.user?.email || r.user_id,
        r.type,
        r.amount,
        r.status,
        r.description || '',
        new Date(r.created_at).toLocaleString()
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `finance_${new Date().toISOString().slice(0,10)}.csv`
    a.click()
    toast.success('导出成功')
  }

  const typeLabels: Record<string, string> = {
    recharge: '充值',
    transfer_out: '转出',
    transfer_in: '转入',
    reward: '奖励'
  }

  const statusColors: Record<string, string> = {
    pending: 'warning',
    completed: 'success',
    failed: 'danger'
  }

  const filtered = records.filter(r => {
    const matchSearch = r.id.includes(search) || r.user?.email?.includes(search)
    const matchType = !filterType || r.type === filterType
    const matchStatus = !filterStatus || r.status === filterStatus
    return matchSearch && matchType && matchStatus
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
        {/* 头部 */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">财务管理</h1>
            <p className="text-gray-400 text-sm">查看所有财务记录和统计</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadFinance}>
              <RefreshCw size={16} className="mr-2" /> 刷新
            </Button>
            <Button variant="primary" onClick={handleExport}>
              <Download size={16} className="mr-2" /> 导出
            </Button>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[#12182b] border border-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="text-green-400" size={20} />
              <span className="text-gray-400 text-sm">总收入</span>
            </div>
            <div className="text-2xl font-bold text-green-400 mt-1">
              ${stats.totalIncome.toFixed(2)}
            </div>
          </div>
          <div className="bg-[#12182b] border border-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="text-red-400" size={20} />
              <span className="text-gray-400 text-sm">总支出</span>
            </div>
            <div className="text-2xl font-bold text-red-400 mt-1">
              ${stats.totalExpense.toFixed(2)}
            </div>
          </div>
          <div className="bg-[#12182b] border border-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Wallet className="text-blue-400" size={20} />
              <span className="text-gray-400 text-sm">净利润</span>
            </div>
            <div className={`text-2xl font-bold mt-1 ${stats.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              ${stats.netProfit.toFixed(2)}
            </div>
          </div>
          <div className="bg-[#12182b] border border-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Clock className="text-yellow-400" size={20} />
              <span className="text-gray-400 text-sm">待处理金额</span>
            </div>
            <div className="text-2xl font-bold text-yellow-400 mt-1">
              ${stats.pendingAmount.toFixed(2)}
            </div>
          </div>
        </div>

        {/* 搜索和筛选 */}
        <Card>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="搜索ID、用户..."
                value={search}
                onChange={(e: any) => setSearch(e.target.value)}
                className="bg-[#1a1f35] border-gray-700 text-white"
                prefix={<Search size={16} className="text-gray-400" />}
              />
            </div>
            <select
              className="px-4 py-2 bg-[#1a1f35] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="">全部类型</option>
              <option value="recharge">充值</option>
              <option value="transfer_out">转出</option>
              <option value="transfer_in">转入</option>
              <option value="reward">奖励</option>
            </select>
            <select
              className="px-4 py-2 bg-[#1a1f35] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">全部状态</option>
              <option value="pending">待处理</option>
              <option value="completed">已完成</option>
              <option value="failed">失败</option>
            </select>
            <Button variant="ghost" onClick={() => { setSearch(''); setFilterType(''); setFilterStatus('') }}>
              重置
            </Button>
          </div>
        </Card>

        {/* 记录列表 */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#1a1f35]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">ID</th>
                  {(user?.role === 'SuperAdmin' || user?.role === 'Admin') && (
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">用户</th>
                  )}
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">类型</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">金额</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">状态</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">说明</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">时间</th>
                  {(user?.role === 'SuperAdmin' || user?.role === 'Admin') && (
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">操作</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-t border-gray-800 hover:bg-[#1a1f35]/50">
                    <td className="px-4 py-3 text-gray-400 text-xs font-mono">{r.id.slice(0, 8)}</td>
                    {(user?.role === 'SuperAdmin' || user?.role === 'Admin') && (
                      <td className="px-4 py-3 text-white text-sm">{r.user?.email || r.user_id.slice(0, 8)}</td>
                    )}
                    <td className="px-4 py-3">
                      <Badge variant="info">{typeLabels[r.type] || r.type}</Badge>
                    </td>
                    <td className={`px-4 py-3 text-sm font-medium ${
                      r.amount > 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {r.amount > 0 ? '+' : ''}{r.amount}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusColors[r.status] || 'default'}>
                        {r.status === 'completed' && <CheckCircle size={12} className="mr-1" />}
                        {r.status === 'pending' && <Clock size={12} className="mr-1" />}
                        {r.status === 'failed' && <XCircle size={12} className="mr-1" />}
                        {r.status === 'completed' ? '已完成' :
                         r.status === 'pending' ? '待处理' :
                         r.status === 'failed' ? '失败' : r.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-sm">{r.description || '-'}</td>
                    <td className="px-4 py-3 text-gray-400 text-sm">
                      {new Date(r.created_at).toLocaleString()}
                    </td>
                    {(user?.role === 'SuperAdmin' || user?.role === 'Admin') && r.status === 'pending' && (
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(r.id)}
                            className="p-1.5 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30"
                            title="通过"
                          >
                            <CheckCircle size={16} />
                          </button>
                          <button
                            onClick={() => handleReject(r.id)}
                            className="p-1.5 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30"
                            title="拒绝"
                          >
                            <XCircle size={16} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-gray-400">
                      暂无记录
                    </td>
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
