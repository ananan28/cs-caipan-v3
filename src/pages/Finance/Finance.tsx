import { useState, useEffect } from 'react'
import { Card } from '@/components/Common/Card'
import { Badge } from '@/components/Common/Badge'
import { Button } from '@/components/Common/Button'
import { Input } from '@/components/Forms/Input'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import {
  TrendingUp, TrendingDown, DollarSign, Calendar, Search,
  RefreshCw, Download, Filter, CheckCircle, XCircle, Clock
} from 'lucide-react'
import toast from 'react-hot-toast'

export const Finance = () => {
  const { user } = useAuthStore()
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpense: 0,
    pendingAmount: 0,
    netProfit: 0
  })

  const isAdmin = user?.role === 'SuperAdmin' || user?.role === 'Admin'

  const loadFinance = async () => {
    setLoading(true)

    // 管理员看所有，用户看自己的
    let query = supabase
      .from('recharge_orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (!isAdmin) {
      query = query.eq('user_id', user?.id)
    }

    const { data, error } = await query

    if (error) {
      toast.error('加载数据失败: ' + error.message)
    } else {
      setRecords(data || [])
      const income = data?.filter(t => t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0) || 0
      const pending = data?.filter(t => t.status === 'pending' || t.status === 'paid')
        .reduce((sum, t) => sum + t.amount, 0) || 0

      setStats({
        totalIncome: income,
        totalExpense: 0,
        pendingAmount: pending,
        netProfit: income
      })
    }
    setLoading(false)
  }

  useEffect(() => {
    loadFinance()
  }, [user])

  // 管理员审核通过
  const handleApprove = async (id: string) => {
    if (!isAdmin) {
      toast.error('只有管理员可以审核')
      return
    }

    const { error } = await supabase
      .from('recharge_orders')
      .update({ status: 'completed', confirmed_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      toast.error('审核失败: ' + error.message)
    } else {
      toast.success('✅ 已通过')
      loadFinance()
    }
  }

  // 管理员拒绝
  const handleReject = async (id: string) => {
    if (!isAdmin) {
      toast.error('只有管理员可以拒绝')
      return
    }

    if (!confirm('确定要拒绝此订单吗？')) return

    const { error } = await supabase
      .from('recharge_orders')
      .update({ status: 'cancelled' })
      .eq('id', id)

    if (error) {
      toast.error('操作失败: ' + error.message)
    } else {
      toast.success('已拒绝')
      loadFinance()
    }
  }

  const handleExport = () => {
    // 导出逻辑
    const csv = [
      ['ID', '用户', '金额', '积分', '状态', '时间'],
      ...records.map(r => [
        r.id.slice(0, 8),
        r.user_id,
        r.amount,
        r.points,
        r.status,
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

  const statusColors: Record<string, string> = {
    pending: 'warning',
    paid: 'info',
    completed: 'success',
    cancelled: 'default',
    expired: 'danger'
  }

  const statusLabels: Record<string, string> = {
    pending: '待支付',
    paid: '已支付-待审核',
    completed: '已完成',
    cancelled: '已取消',
    expired: '已过期'
  }

  const filtered = records.filter(r => {
    const matchSearch = r.id.includes(search) || r.user_id?.includes(search)
    const matchStatus = !filterStatus || r.status === filterStatus
    return matchSearch && matchStatus
  })

  if (loading) {
    return (
      <div className="p-6 bg-[#f0f2f5] min-h-screen flex items-center justify-center">
        <div className="text-gray-400">加载中...</div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-[#f0f2f5] min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">财务管理</h1>
            <p className="text-gray-500 text-sm">查看所有财务记录和统计</p>
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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="text-green-500" size={20} />
              <span className="text-gray-500 text-sm">总收入</span>
            </div>
            <div className="text-2xl font-bold text-green-500 mt-1">
              ${stats.totalIncome.toFixed(2)}
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="text-red-500" size={20} />
              <span className="text-gray-500 text-sm">总支出</span>
            </div>
            <div className="text-2xl font-bold text-red-500 mt-1">
              ${stats.totalExpense.toFixed(2)}
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="text-blue-500" size={20} />
              <span className="text-gray-500 text-sm">净利润</span>
            </div>
            <div className={`text-2xl font-bold mt-1 ${stats.netProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              ${stats.netProfit.toFixed(2)}
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Clock className="text-yellow-500" size={20} />
              <span className="text-gray-500 text-sm">待处理金额</span>
            </div>
            <div className="text-2xl font-bold text-yellow-500 mt-1">
              ${stats.pendingAmount.toFixed(2)}
            </div>
          </div>
        </div>

        <Card>
          <div className="flex flex-wrap gap-4 p-4">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="搜索ID、用户..."
                value={search}
                onChange={(e: any) => setSearch(e.target.value)}
                className="bg-gray-50 border-gray-200 text-gray-900"
                prefix={<Search size={16} className="text-gray-400" />}
              />
            </div>
            <select
              className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-yellow-400"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">全部状态</option>
              <option value="pending">待支付</option>
              <option value="paid">待审核</option>
              <option value="completed">已完成</option>
              <option value="cancelled">已取消</option>
              <option value="expired">已过期</option>
            </select>
            <Button variant="ghost" onClick={() => { setSearch(''); setFilterStatus('') }}>
              重置
            </Button>
          </div>
        </Card>

        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">用户</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">金额</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">积分</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">时间</th>
                  {isAdmin && (
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-t border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-400 text-xs font-mono">{r.id.slice(0, 8)}</td>
                    <td className="px-4 py-3 text-gray-900 text-sm">{r.user_id?.slice(0, 8) || '未知'}</td>
                    <td className="px-4 py-3 text-gray-900 font-medium">${r.amount.toFixed(2)}</td>
                    <td className="px-4 py-3 text-gray-900">{r.points?.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={statusColors[r.status] || 'default'}>
                        {statusLabels[r.status] || r.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-sm">
                      {new Date(r.created_at).toLocaleString()}
                    </td>
                    {isAdmin && r.status === 'paid' && (
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(r.id)}
                            className="p-1.5 bg-green-500/20 text-green-500 rounded hover:bg-green-500/30"
                            title="通过"
                          >
                            <CheckCircle size={16} />
                          </button>
                          <button
                            onClick={() => handleReject(r.id)}
                            className="p-1.5 bg-red-500/20 text-red-500 rounded hover:bg-red-500/30"
                            title="拒绝"
                          >
                            <XCircle size={16} />
                          </button>
                        </div>
                      </td>
                    )}
                    {isAdmin && r.status === 'pending' && (
                      <td className="px-4 py-3 text-gray-400 text-xs">等待用户支付</td>
                    )}
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={isAdmin ? 7 : 6} className="text-center py-8 text-gray-400">暂无记录</td>
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
