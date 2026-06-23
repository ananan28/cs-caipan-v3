import { useState, useEffect } from 'react'
import { Card } from '@/components/Common/Card'
import { Badge } from '@/components/Common/Badge'
import { Button } from '@/components/Common/Button'
import { Input } from '@/components/Forms/Input'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import {
  BookOpen, Search, RefreshCw, Download, Filter,
  TrendingUp, TrendingDown, DollarSign, Calendar
} from 'lucide-react'
import toast from 'react-hot-toast'

interface LedgerEntry {
  id: string
  user_id: string
  type: string
  amount: number
  balance_before: number
  balance_after: number
  description: string
  created_at: string
  user?: {
    email: string
    username: string
  }
}

export const Ledger = () => {
  const { user } = useAuthStore()
  const [entries, setEntries] = useState<LedgerEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('')
  const [stats, setStats] = useState({ income: 0, expense: 0, net: 0 })

  const loadLedger = async () => {
    setLoading(true)
    let query = supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false })

    if (user?.role !== 'SuperAdmin' && user?.role !== 'Admin') {
      query = query.eq('user_id', user?.id)
    }

    const { data, error } = await query

    if (error) {
      toast.error('加载账目失败: ' + error.message)
    } else {
      setEntries(data || [])
      const income = data?.filter(t => t.amount > 0 && t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0) || 0
      const expense = data?.filter(t => t.amount < 0 && t.status === 'completed')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0) || 0
      setStats({ income, expense, net: income - expense })
    }
    setLoading(false)
  }

  useEffect(() => {
    loadLedger()
  }, [user])

  const handleExport = () => {
    const csv = [
      ['ID', '用户', '类型', '金额', '说明', '时间'],
      ...entries.map(e => [
        e.id.slice(0, 8),
        e.user_id,
        e.type,
        e.amount,
        e.description || '',
        new Date(e.created_at).toLocaleString()
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ledger_${new Date().toISOString().slice(0,10)}.csv`
    a.click()
    toast.success('导出成功')
  }

  const typeLabels: Record<string, string> = {
    recharge: '充值',
    transfer_out: '转出',
    transfer_in: '转入',
    reward: '奖励'
  }

  const filtered = entries.filter(e => {
    const matchSearch = e.id.includes(search) || e.user_id.includes(search)
    const matchType = !filterType || e.type === filterType
    return matchSearch && matchType
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
            <h1 className="text-2xl font-bold text-white">查账中心</h1>
            <p className="text-gray-400 text-sm">查看所有账目流水</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadLedger}>
              <RefreshCw size={16} className="mr-2" /> 刷新
            </Button>
            <Button variant="primary" onClick={handleExport}>
              <Download size={16} className="mr-2" /> 导出
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#12182b] border border-gray-800 rounded-lg p-4">
            <div className="text-gray-400 text-sm">总收入</div>
            <div className="text-2xl font-bold text-green-400">${stats.income.toFixed(2)}</div>
          </div>
          <div className="bg-[#12182b] border border-gray-800 rounded-lg p-4">
            <div className="text-gray-400 text-sm">总支出</div>
            <div className="text-2xl font-bold text-red-400">${stats.expense.toFixed(2)}</div>
          </div>
          <div className="bg-[#12182b] border border-gray-800 rounded-lg p-4">
            <div className="text-gray-400 text-sm">净额</div>
            <div className={`text-2xl font-bold ${stats.net >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              ${stats.net.toFixed(2)}
            </div>
          </div>
        </div>

        <Card>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="搜索账目..."
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
            <Button variant="ghost" onClick={() => { setSearch(''); setFilterType('') }}>
              重置
            </Button>
          </div>
        </Card>

        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#1a1f35]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">用户</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">类型</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">金额</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">说明</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">时间</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((entry) => (
                  <tr key={entry.id} className="border-t border-gray-800 hover:bg-[#1a1f35]/50">
                    <td className="px-4 py-3 text-gray-400 text-xs font-mono">{entry.id.slice(0, 8)}</td>
                    <td className="px-4 py-3 text-white text-sm">{entry.user_id}</td>
                    <td className="px-4 py-3">
                      <Badge variant="info">{typeLabels[entry.type] || entry.type}</Badge>
                    </td>
                    <td className={`px-4 py-3 text-sm font-medium ${entry.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {entry.amount > 0 ? '+' : ''}{entry.amount}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-sm">{entry.description || '-'}</td>
                    <td className="px-4 py-3 text-gray-400 text-sm">
                      {new Date(entry.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-400">暂无账目</td>
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
