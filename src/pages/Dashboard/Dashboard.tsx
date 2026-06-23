import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useUserStore } from '@/store/userStore'
import { useWalletStore } from '@/store/walletStore'
import { Card } from '@/components/Common/Card'
import { Badge } from '@/components/Common/Badge'
import { Button } from '@/components/Common/Button'
import { 
  Users, UserPlus, Coins, TrendingUp, 
  Clock, CheckCircle, AlertCircle, Activity,
  Zap, Shield, Calendar, ArrowUp, ArrowDown,
  RefreshCw
} from 'lucide-react'
import toast from 'react-hot-toast'

export const Dashboard = () => {
  const { user } = useAuthStore()
  const { users } = useUserStore()
  const { points, transactions } = useWalletStore()
  const [time, setTime] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    const updateTime = () => {
      setTime(new Date().toLocaleString('zh-CN'))
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleRefresh = () => {
    setRefreshing(true)
    toast.loading('刷新中...')
    setTimeout(() => {
      setRefreshing(false)
      toast.dismiss()
      toast.success('✅ 数据已刷新')
    }, 1000)
  }

  const totalPoints = users.reduce((sum, u) => sum + (u.points || 0), 0)
  const activeUsers = users.filter(u => u.status === 'Active').length

  const stats = [
    { label: '总用户', value: users.length, icon: Users, color: 'text-blue', change: '+12%' },
    { label: '活跃用户', value: activeUsers, icon: UserPlus, color: 'text-green', change: '+5%' },
    { label: '总积分', value: totalPoints.toFixed(0), icon: Coins, color: 'text-orange', change: '+8%' },
    { label: '交易次数', value: transactions.length, icon: TrendingUp, color: 'text-purple', change: '+3%' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">控制台</h1>
          <p className="text-muted text-sm">欢迎回来，{user?.name || '用户'} · {time}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw size={16} className={`mr-1 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? '刷新中...' : '刷新'}
          </Button>
          <Badge variant="blue">角色：{user?.role || 'Guest'}</Badge>
          <Badge variant="green">状态：{user?.status || 'Active'}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted">{stat.label}</p>
                <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                <p className="text-xs text-green mt-1">{stat.change}</p>
              </div>
              <div className={`p-3 rounded-xl bg-${stat.color.split('-')[1]}/10 ${stat.color}`}>
                <stat.icon size={24} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2" title="最近活动">
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 rounded-xl bg-panel/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green/20 flex items-center justify-center text-green"><ArrowUp size={14} /></div>
                <div><p className="text-sm text-white">admin@cs.com</p><p className="text-xs text-muted">充值 +500 积分</p></div>
              </div>
              <span className="text-xs text-muted">14:30</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-panel/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-orange/20 flex items-center justify-center text-orange"><ArrowDown size={14} /></div>
                <div><p className="text-sm text-white">user@example.com</p><p className="text-xs text-muted">转账 -100 积分</p></div>
              </div>
              <span className="text-xs text-muted">13:20</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-panel/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-purple/20 flex items-center justify-center text-purple"><Zap size={14} /></div>
                <div><p className="text-sm text-white">agent@cs.com</p><p className="text-xs text-muted">购买套餐</p></div>
              </div>
              <span className="text-xs text-muted">12:00</span>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <Card title="我的资产">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-panel/50">
                <span className="text-muted">积分</span>
                <span className="text-xl font-bold text-blue">{points?.toFixed(2) || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-panel/50">
                <span className="text-muted">交易次数</span>
                <span className="text-xl font-bold text-purple">{transactions?.length || 0}</span>
              </div>
            </div>
          </Card>

          <Card title="系统状态">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">系统版本</span>
                <span className="font-bold text-white">V3.0.0</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">运行状态</span>
                <Badge variant="green">✅ 正常</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">在线用户</span>
                <span className="text-white">{activeUsers}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">今日交易</span>
                <span className="text-white">{transactions?.length || 0}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
