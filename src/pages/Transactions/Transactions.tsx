import { useState, useEffect } from 'react'
import { Card } from '@/components/Common/Card'
import { Badge } from '@/components/Common/Badge'
import { Button } from '@/components/Common/Button'
import { Input } from '@/components/Forms/Input'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { Search, RefreshCw, Download, Filter } from 'lucide-react'
import toast from 'react-hot-toast'

interface Transaction {
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

export const Transactions = () => {
  const { user } = useAuthStore()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  const loadTransactions = async () => {
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
      toast.error('加载交易记录失败: ' + error.message)
    } else {
      setTransactions(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    loadTransactions()
  }, [user])

  const handleRefresh = () => {
    toast.loading('刷新中...')
    loadTransactions()
    toast.dismiss()
    toast.success('已刷新')
  }

  const handleExport = () => {
    const csv = [
      ['ID', '用户', '类型', '金额', '状态', '说明', '时间'],
      ...transactions.map(t => [
        t.id.slice(0, 8),
        t.user?.email || t.user_id,
        t.type,
        t.amount,
        t.status,
        t.description || '',
        new Date(t.created_at).toLocaleString()
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transactions_${new Date().toISOString().slice(0,10)}.csv`
    a.click()
    toast.success('导出成功')
  }

  const typeLabels: Record<string, string> = {
    recharge: '充值',
    transfer_out: '转出',
    transfer_in: '转入',
    reward: '奖励'
  }

  const typeColors: Record<string, string> = {
    recharge: 'info',
    transfer_out: 'danger',
    transfer_in: 'success',
    reward: 'warning'
  }

  const statusLabels: Record<string, string> = {
    pending: '待处理',
    completed: '已完成',
    failed: '失败'
  }

  const statusColors: Record<string, string> = {
    pending: 'warning',
    completed: 'success',
    failed: 'danger'
  }

  const filtered = transactions.filter(t => {
    const matchSearch = 
      t.id.includes(search) ||
      t.user?.email?.includes(search) ||
      t.description?.includes(search)
    const matchType = !filterType || t.type === filterType
    const matchStatus = !filterStatus || t.status === filterStatus
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
            <h1 className="text-2xl font-bold text-white">交易流水</h1>
            <p className="text-gray-400 text-sm">查看所有交易记录</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCw size={16} className="mr-2" /> 刷新
            </Button>
            <Button variant="primary" onClick={handleExport}>
              <Download size={16} className="mr-2" /> 导出
            </Button>
          </div>
        </div>

        {/* 搜索和筛选 */}
        <Card>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="搜索交易ID、用户、备注..."
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

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[#12182b] border border-gray-800 rounded-lg p-4">
            <div className="text-gray-400 text-sm">总交易数</div>
            <div className="text-white text-2xl font-bold">{transactions.length}</div>
          </div>
          <div className="bg-[#12182b] border border-gray-800 rounded-lg p-4">
            <div className="text-gray-400 text-sm">总充值</div>
            <div className="text-green-400 text-2xl font-bold">
              ${transactions.filter(t => t.type === 'recharge' && t.status === 'completed')
                .reduce((sum, t) => sum + t.amount, 0).toFixed(2)}
            </div>
          </div>
          <div className="bg-[#12182b] border border-gray-800 rounded-lg p-4">
            <div className="text-gray-400 text-sm">总转出</div>
            <div className="text-red-400 text-2xl font-bold">
              ${transactions.filter(t => t.type === 'transfer_out' && t.status === 'completed')
                .reduce((sum, t) => sum + Math.abs(t.amount), 0).toFixed(2)}
            </div>
          </div>
          <div className="bg-[#12182b] border border-gray-800 rounded-lg p-4">
            <div className="text-gray-400 text-sm">待处理</div>
            <div className="text-yellow-400 text-2xl font-bold">
              {transactions.filter(t => t.status === 'pending').length}
            </div>
          </div>
        </div>

        {/* 交易列表 */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#1a1f35]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">ID</th>
                  {user?.role === 'SuperAdmin' || user?.role === 'Admin' ? (
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">用户</th>
                  ) : null}
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">类型</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">金额</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">状态</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">说明</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">时间</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr key={t.id} className="border-t border-gray-800 hover:bg-[#1a1f35]/50">
                    <td className="px-4 py-3 text-gray-400 text-xs font-mono">{t.id.slice(0, 8)}</td>
                    {(user?.role === 'SuperAdmin' || user?.role === 'Admin') ? (
                      <td className="px-4 py-3 text-white text-sm">{t.user?.email || t.user_id.slice(0, 8)}</td>
                    ) : null}
                    <td className="px-4 py-3">
                      <Badge variant={typeColors[t.type] || 'default'}>
                        {typeLabels[t.type] || t.type}
                      </Badge>
                    </td>
                    <td className={`px-4 py-3 text-sm font-medium ${
                      t.amount > 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {t.amount > 0 ? '+' : ''}{t.amount}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusColors[t.status] || 'default'}>
                        {statusLabels[t.status] || t.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-sm">{t.description || '-'}</td>
                    <td className="px-4 py-3 text-gray-400 text-sm">
                      {new Date(t.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-400">
                      暂无交易记录
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
