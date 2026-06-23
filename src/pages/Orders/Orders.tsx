import { useState, useEffect } from 'react'
import { Card } from '@/components/Common/Card'
import { Badge } from '@/components/Common/Badge'
import { Button } from '@/components/Common/Button'
import { Input } from '@/components/Forms/Input'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import {
  Package, Search, RefreshCw, Eye, CheckCircle, XCircle,
  Clock, Download, Filter, Truck, DollarSign
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Order {
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

export const Orders = () => {
  const { user } = useAuthStore()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterType, setFilterType] = useState('')

  const loadOrders = async () => {
    setLoading(true)
    let query = supabase
      .from('transactions')
      .select('*, user:users(email, username)')
      .eq('type', 'recharge')
      .order('created_at', { ascending: false })

    if (user?.role !== 'SuperAdmin' && user?.role !== 'Admin') {
      query = query.eq('user_id', user?.id)
    }

    const { data, error } = await query

    if (error) {
      toast.error('加载订单失败: ' + error.message)
    } else {
      setOrders(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    loadOrders()
  }, [user])

  const handleUpdateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from('transactions')
      .update({ status })
      .eq('id', id)

    if (error) {
      toast.error('更新失败: ' + error.message)
    } else {
      toast.success(`订单已${status === 'completed' ? '完成' : '取消'}`)
      loadOrders()
    }
  }

  const statusColors: Record<string, string> = {
    pending: 'warning',
    processing: 'info',
    completed: 'success',
    failed: 'danger',
    cancelled: 'default'
  }

  const statusLabels: Record<string, string> = {
    pending: '待处理',
    processing: '处理中',
    completed: '已完成',
    failed: '失败',
    cancelled: '已取消'
  }

  const filtered = orders.filter(o => {
    const matchSearch = o.id.includes(search) || o.user?.email?.includes(search)
    const matchStatus = !filterStatus || o.status === filterStatus
    const matchType = !filterType || o.type === filterType
    return matchSearch && matchStatus && matchType
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
            <h1 className="text-2xl font-bold text-white">订单中心</h1>
            <p className="text-gray-400 text-sm">管理所有充值订单</p>
          </div>
          <Button variant="outline" onClick={loadOrders}>
            <RefreshCw size={16} className="mr-2" /> 刷新
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#12182b] border border-gray-800 rounded-lg p-4">
            <div className="text-gray-400 text-sm">总订单</div>
            <div className="text-white text-2xl font-bold">{orders.length}</div>
          </div>
          <div className="bg-[#12182b] border border-gray-800 rounded-lg p-4">
            <div className="text-gray-400 text-sm">待处理</div>
            <div className="text-yellow-400 text-2xl font-bold">
              {orders.filter(o => o.status === 'pending').length}
            </div>
          </div>
          <div className="bg-[#12182b] border border-gray-800 rounded-lg p-4">
            <div className="text-gray-400 text-sm">已完成</div>
            <div className="text-green-400 text-2xl font-bold">
              {orders.filter(o => o.status === 'completed').length}
            </div>
          </div>
          <div className="bg-[#12182b] border border-gray-800 rounded-lg p-4">
            <div className="text-gray-400 text-sm">总金额</div>
            <div className="text-blue-400 text-2xl font-bold">
              ${orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.amount, 0).toFixed(2)}
            </div>
          </div>
        </div>

        <Card>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="搜索订单..."
                value={search}
                onChange={(e: any) => setSearch(e.target.value)}
                className="bg-[#1a1f35] border-gray-700 text-white"
                prefix={<Search size={16} className="text-gray-400" />}
              />
            </div>
            <select
              className="px-4 py-2 bg-[#1a1f35] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">全部状态</option>
              <option value="pending">待处理</option>
              <option value="processing">处理中</option>
              <option value="completed">已完成</option>
              <option value="failed">失败</option>
            </select>
            <Button variant="ghost" onClick={() => { setSearch(''); setFilterStatus('') }}>
              重置
            </Button>
          </div>
        </Card>

        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#1a1f35]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">订单号</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">用户</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">金额</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">状态</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">时间</th>
                  {(user?.role === 'SuperAdmin' || user?.role === 'Admin') && (
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">操作</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <tr key={order.id} className="border-t border-gray-800 hover:bg-[#1a1f35]/50">
                    <td className="px-4 py-3 text-gray-400 text-xs font-mono">{order.id.slice(0, 8)}</td>
                    <td className="px-4 py-3 text-white text-sm">{order.user?.email || order.user_id}</td>
                    <td className="px-4 py-3 text-white text-sm font-medium">${order.amount.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={statusColors[order.status] || 'default'}>
                        {order.status === 'completed' && <CheckCircle size={12} className="mr-1" />}
                        {order.status === 'pending' && <Clock size={12} className="mr-1" />}
                        {order.status === 'failed' && <XCircle size={12} className="mr-1" />}
                        {statusLabels[order.status] || order.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-sm">
                      {new Date(order.created_at).toLocaleString()}
                    </td>
                    {(user?.role === 'SuperAdmin' || user?.role === 'Admin') && order.status === 'pending' && (
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'completed')}
                            className="p-1.5 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30"
                          >
                            <CheckCircle size={16} />
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'failed')}
                            className="p-1.5 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30"
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
                    <td colSpan={6} className="text-center py-8 text-gray-400">暂无订单</td>
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
