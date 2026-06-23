import { useState, useEffect } from 'react'
import { Card } from '@/components/Common/Card'
import { Badge } from '@/components/Common/Badge'
import { Button } from '@/components/Common/Button'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import {
  Users, Wallet, TrendingUp, Activity, ArrowUp, ArrowDown,
  RefreshCw, Clock, CheckCircle, XCircle, AlertCircle
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Stats {
  totalUsers: number
  activeUsers: number
  totalRevenue: number
  totalTransactions: number
  pendingTransactions: number
  todayTransactions: number
}

export const Dashboard = () => {
  const { user } = useAuthStore()
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    activeUsers: 0,
    totalRevenue: 0,
    totalTransactions: 0,
    pendingTransactions: 0,
    todayTransactions: 0
  })
  const [recentTransactions, setRecentTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadDashboard = async () => {
    setLoading(true)

    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })

    const { count: activeUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')

    const { data: transactions } = await supabase
      .from('transactions')
      .select('*')

    const totalRevenue = transactions?.filter(t => t.status === 'completed' && t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0) || 0

    const pendingTransactions = transactions?.filter(t => t.status === 'pending').length || 0

    const today = new Date().toISOString().split('T')[0]
    const todayTransactions = transactions?.filter(t => t.created_at?.startsWith(today)).length || 0

    const { data: recent } = await supabase
      .from('transactions')
      .select('*, user:users(email, username)')
      .order('created_at', { ascending: false })
      .limit(5)

    setStats({
      totalUsers: totalUsers || 0,
      activeUsers: activeUsers || 0,
      totalRevenue,
      totalTransactions: transactions?.length || 0,
      pendingTransactions,
      todayTransactions
    })
    setRecentTransactions(recent || [])
    setLoading(false)
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  const handleRefresh = () => {
    toast.loading('刷新中...')
    loadDashboard()
    toast.dismiss()
    toast.success('已刷新')
  }

  const statCards = [
    {
      label: '总用户',
      value: stats.totalUsers,
      sub: `活跃 ${stats.activeUsers}`,
      icon: Users,
      color: 'blue'
    },
    {
      label: '总营收',
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: Wallet,
      color: 'green'
    },
    {
      label: '交易总数',
      value: stats.totalTransactions,
      sub: `今日 ${stats.todayTransactions}`,
      icon: Activity,
      color: 'purple'
    },
    {
      label: '待处理',
      value: stats.pendingTransactions,
      sub: '等待审核',
      icon: Clock,
      color: 'yellow'
    }
  ]

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">控制台</h1>
            <p className="text-gray-400 text-sm">
              欢迎回来，{user?.name || user?.email || '用户'}
            </p>
          </div>
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw size={16} className="mr-2" /> 刷新
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => (
            <Card key={stat.label} className="bg-[#12182b] border border-gray-800">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-400 text-sm">{stat.label}</p>
                  <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                  {stat.sub && (
                    <p className="text-gray-500 text-xs mt-1">{stat.sub}</p>
                  )}
                </div>
                <div className={`p-2 rounded-lg bg-${stat.color}-500/20`}>
                  <stat.icon className={`text-${stat.color}-400`} size={20} />
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card>
          <div className="p-4 border-b border-gray-800 flex items-center justify-between">
            <h3 className="text-white font-semibold">最近交易</h3>
            <Badge variant="info">{recentTransactions.length} 条</Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#1a1f35]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">用户</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">类型</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">金额</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">状态</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">时间</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((t) => (
                  <tr key={t.id} className="border-t border-gray-800 hover:bg-[#1a1f35]/50">
                    <td className="px-4 py-3 text-white text-sm">{t.user?.email || t.user_id}</td>
                    <td className="px-4 py-3 text-gray-300 text-sm">{t.type}</td>
                    <td className={`px-4 py-3 text-sm font-medium ${
                      t.amount > 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {t.amount > 0 ? '+' : ''}{t.amount}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={
                        t.status === 'completed' ? 'success' :
                        t.status === 'pending' ? 'warning' : 'danger'
                      }>
                        {t.status === 'completed' && <CheckCircle size={12} className="mr-1" />}
                        {t.status === 'pending' && <Clock size={12} className="mr-1" />}
                        {t.status === 'failed' && <XCircle size={12} className="mr-1" />}
                        {t.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-sm">
                      {new Date(t.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
                {recentTransactions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-400">
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
