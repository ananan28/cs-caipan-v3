import { useState, useEffect } from 'react'
import { Card } from '@/components/Common/Card'
import { Badge } from '@/components/Common/Badge'
import { Button } from '@/components/Common/Button'
import { Input } from '@/components/Forms/Input'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import {
  ShoppingCart, Search, RefreshCw, CheckCircle, XCircle,
  Clock, Download, Filter
} from 'lucide-react'
import toast from 'react-hot-toast'

export const Orders = () => {
  const { user } = useAuthStore()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0, paid: 0 })

  const isAdmin = user?.role === 'SuperAdmin' || user?.role === 'Admin'

  const loadOrders = async () => {
    setLoading(true)
    let query = supabase
      .from('recharge_orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (!isAdmin) {
      query = query.eq('user_id', user?.id)
    }

    const { data, error } = await query

    if (error) {
      toast.error('加载订单失败: ' + error.message)
      setOrders([])
    } else {
      setOrders(data || [])
      setStats({
        total: data?.length || 0,
        pending: data?.filter(o => o.status === 'pending').length || 0,
        completed: data?.filter(o => o.status === 'completed').length || 0,
        paid: data?.filter(o => o.status === 'paid').length || 0
      })
    }
    setLoading(false)
  }

  useEffect(() => {
    loadOrders()
  }, [user])

  const handleUpdateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from('recharge_orders')
      .update({ status, updated_at: new Date().toISOString() })
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

  const filtered = orders.filter(o => {
    const matchSearch = o.id.includes(search)
    const matchStatus = !filterStatus || o.status === filterStatus
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
            <h1 className="text-2xl font-bold text-gray-900">订单中心</h1>
            <p className="text-gray-500 text-sm">管理所有充值订单</p>
          </div>
          <Button variant="outline" onClick={loadOrders}>
            <RefreshCw size={16} className="mr-2" /> 刷新
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-gray-500 text-sm">总订单</div>
            <div className="text-gray-900 text-2xl font-bold">{stats.total}</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-gray-500 text-sm">待支付</div>
            <div className="text-yellow-500 text-2xl font-bold">{stats.pending}</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-gray-500 text-sm">待审核</div>
            <div className="text-blue-500 text-2xl font-bold">{stats.paid}</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-gray-500 text-sm">已完成</div>
            <div className="text-green-500 text-2xl font-bold">{stats.completed}</div>
          </div>
        </div>

        <Card>
          <div className="flex flex-wrap gap-4 p-4">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="搜索订单..."
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">订单号</th>
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
                {filtered.map((order) => (
                  <tr key={order.id} className="border-t border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-400 text-xs font-mono">{order.id.slice(0, 8)}</td>
                    <td className="px-4 py-3 text-gray-900 text-sm">{order.user_id?.slice(0, 8) || '未知'}</td>
                    <td className="px-4 py-3 text-gray-900 font-medium">${order.amount.toFixed(2)}</td>
                    <td className="px-4 py-3 text-gray-900">{order.points?.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={statusColors[order.status] || 'default'}>
                        {statusLabels[order.status] || order.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-sm">
                      {new Date(order.created_at).toLocaleString()}
                    </td>
                    {isAdmin && (order.status === 'paid' || order.status === 'pending') && (
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {order.status === 'paid' && (
                            <button
                              onClick={() => handleUpdateStatus(order.id, 'completed')}
                              className="p-1.5 bg-green-500/20 text-green-500 rounded hover:bg-green-500/30"
                              title="确认完成"
                            >
                              <CheckCircle size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                            className="p-1.5 bg-red-500/20 text-red-500 rounded hover:bg-red-500/30"
                            title="取消订单"
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
                    <td colSpan={isAdmin ? 7 : 6} className="text-center py-8 text-gray-400">暂无订单</td>
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
