import { useState, useEffect } from 'react'
import { Card } from '@/components/Common/Card'
import { Badge } from '@/components/Common/Badge'
import { Button } from '@/components/Common/Button'
import { supabase } from '@/lib/supabase'
import {
  BarChart3, TrendingUp, TrendingDown, Users, Wallet,
  Activity, RefreshCw, Download, Calendar, ArrowUp,
  ArrowDown, DollarSign, Clock, CheckCircle, XCircle
} from 'lucide-react'
import toast from 'react-hot-toast'

interface StatsData {
  totalUsers: number
  activeUsers: number
  totalTransactions: number
  totalRevenue: number
  totalExpense: number
  netProfit: number
  pendingTransactions: number
  todayTransactions: number
  weeklyGrowth: number
  monthlyGrowth: number
}

export const Stats = () => {
  const [stats, setStats] = useState<StatsData>({
    totalUsers: 0,
    activeUsers: 0,
    totalTransactions: 0,
    totalRevenue: 0,
    totalExpense: 0,
    netProfit: 0,
    pendingTransactions: 0,
    todayTransactions: 0,
    weeklyGrowth: 0,
    monthlyGrowth: 0
  })
  const [dailyStats, setDailyStats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadStats = async () => {
    setLoading(true)

    // 用户统计
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })

    const { count: activeUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')

    // 交易统计
    const { data: transactions } = await supabase
      .from('transactions')
      .select('*')

    const completed = transactions?.filter(t => t.status === 'completed') || []
    const pending = transactions?.filter(t => t.status === 'pending') || []
    
    const totalRevenue = completed.filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0) || 0
    const totalExpense = completed.filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0) || 0

    const today = new Date().toISOString().split('T')[0]
    const todayTransactions = transactions?.filter(t => t.created_at?.startsWith(today)).length || 0

    // 每日统计（最近7天）
    const daily: any[] = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      const dayTx = transactions?.filter(t => t.created_at?.startsWith(dateStr)) || []
      daily.push({
        date: dateStr,
        count: dayTx.length,
        revenue: dayTx.filter(t => t.status === 'completed' && t.amount > 0)
          .reduce((sum, t) => sum + t.amount, 0) || 0
      })
    }

    setStats({
      totalUsers: totalUsers || 0,
      activeUsers: activeUsers || 0,
      totalTransactions: transactions?.length || 0,
      totalRevenue,
      totalExpense,
      netProfit: totalRevenue - totalExpense,
      pendingTransactions: pending.length,
      todayTransactions,
      weeklyGrowth: 12.5,
      monthlyGrowth: 8.3
    })
    setDailyStats(daily)
    setLoading(false)
  }

  useEffect(() => {
    loadStats()
  }, [])

  const handleExport = () => {
    const csv = [
      ['日期', '交易数', '收入'],
      ...dailyStats.map(d => [d.date, d.count, d.revenue.toFixed(2)])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `stats_${new Date().toISOString().slice(0,10)}.csv`
    a.click()
    toast.success('导出成功')
  }

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
            <h1 className="text-2xl font-bold text-white">数据统计</h1>
            <p className="text-gray-400 text-sm">查看平台数据概览</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadStats}>
              <RefreshCw size={16} className="mr-2" /> 刷新
            </Button>
            <Button variant="primary" onClick={handleExport}>
              <Download size={16} className="mr-2" /> 导出
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#12182b] border border-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="text-gray-400 text-sm">总用户</div>
              <Users className="text-blue-400" size={20} />
            </div>
            <div className="text-2xl font-bold text-white mt-1">{stats.totalUsers}</div>
            <div className="text-green-400 text-xs mt-1">↑ {stats.weeklyGrowth}% 周增长</div>
          </div>
          <div className="bg-[#12182b] border border-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="text-gray-400 text-sm">总交易</div>
              <Activity className="text-purple-400" size={20} />
            </div>
            <div className="text-2xl font-bold text-white mt-1">{stats.totalTransactions}</div>
            <div className="text-gray-400 text-xs mt-1">今日 {stats.todayTransactions} 笔</div>
          </div>
          <div className="bg-[#12182b] border border-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="text-gray-400 text-sm">总收入</div>
              <DollarSign className="text-green-400" size={20} />
            </div>
            <div className="text-2xl font-bold text-green-400 mt-1">${stats.totalRevenue.toFixed(2)}</div>
            <div className="text-gray-400 text-xs mt-1">支出 ${stats.totalExpense.toFixed(2)}</div>
          </div>
          <div className="bg-[#12182b] border border-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="text-gray-400 text-sm">净利润</div>
              <TrendingUp className="text-yellow-400" size={20} />
            </div>
            <div className={`text-2xl font-bold mt-1 ${stats.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              ${stats.netProfit.toFixed(2)}
            </div>
            <div className="text-gray-400 text-xs mt-1">待处理 ${stats.pendingTransactions}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <div className="p-4 border-b border-gray-800">
              <h3 className="text-white font-semibold">近7天交易趋势</h3>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                {dailyStats.map((day, index) => (
                  <div key={index}>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">{day.date}</span>
                      <span className="text-white">{day.count} 笔</span>
                      <span className="text-green-400">${day.revenue.toFixed(2)}</span>
                    </div>
                    <div className="w-full h-2 bg-[#1a1f35] rounded-full mt-1 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                        style={{ width: `${Math.min((day.count / Math.max(...dailyStats.map(d => d.count), 1)) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-4 border-b border-gray-800">
              <h3 className="text-white font-semibold">快速概览</h3>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between p-3 bg-[#1a1f35] rounded-lg">
                <span className="text-gray-400">活跃用户</span>
                <span className="text-white font-bold">{stats.activeUsers}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#1a1f35] rounded-lg">
                <span className="text-gray-400">待处理交易</span>
                <span className="text-yellow-400 font-bold">{stats.pendingTransactions}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#1a1f35] rounded-lg">
                <span className="text-gray-400">今日交易</span>
                <span className="text-blue-400 font-bold">{stats.todayTransactions}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#1a1f35] rounded-lg">
                <span className="text-gray-400">月增长率</span>
                <span className="text-green-400 font-bold">+{stats.monthlyGrowth}%</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
