import { useState, useEffect } from 'react'
import { Card } from '@/components/Common/Card'
import { Badge } from '@/components/Common/Badge'
import { Button } from '@/components/Common/Button'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { Search, RefreshCw, CheckCircle, XCircle, ShoppingCart } from 'lucide-react'
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
    try {
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
          pending: data?.filter((o: any) => o.status === 'pending').length || 0,
          completed: data?.filter((o: any) => o.status === 'completed').length || 0,
          paid: data?.filter((o: any) => o.status === 'paid').length || 0
        })
      }
    } catch (error: any) {
      toast.error('加载订单失败: ' + error.message)
      setOrders([])
    }
    setLoading(false)
  }

  useEffect(() => {
    loadOrders()
  }, [user])

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
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
    } catch (error: any) {
      toast.error('更新失败: ' + error.message)
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

  const filtered = orders.filter((o: any) => {
    const matchSearch = o.id?.includes(search) || o.order_number?.includes(search)
    const matchStatus = filterStatus ? o.status === filterStatus : true
    return matchSearch && matchStatus
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-yellow-400"></div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <ShoppingCart className="w-6 h-6 text-yellow-400" />
          订单中心
        </h1>
        <button
          onClick={loadOrders}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white flex items-center gap-2 transition"
        >
          <RefreshCw className="w-4 h-4" />
          刷新
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-gray-800/50 rounded-lg p-4 text-center border border-gray-700/50">
          <p className="text-2xl font-bold text-white">{stats.total}</p>
          <p className="text-xs text-gray-400">总订单</p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4 text-center border border-gray-700/50">
          <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
          <p className="text-xs text-gray-400">待支付</p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4 text-center border border-gray-700/50">
          <p className="text-2xl font-bold text-blue-400">{stats.paid}</p>
          <p className="text-xs text-gray-400">已支付-待审核</p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-4 text-center border border-gray-700/50">
          <p className="text-2xl font-bold text-green-400">{stats.completed}</p>
          <p className="text-xs text-gray-400">已完成</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4 bg-gray-800/30 rounded-lg p-3">
        <div className="flex items-center gap-2 bg-gray-700/50 rounded-lg px-3 py-1.5 flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索订单号..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none text-white text-sm w-full"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-1.5 bg-gray-700/50 border border-gray-600 rounded-lg text-white text-sm"
        >
          <option value="">全部状态</option>
          <option value="pending">待支付</option>
          <option value="paid">已支付-待审核</option>
          <option value="completed">已完成</option>
          <option value="cancelled">已取消</option>
          <option value="expired">已过期</option>
        </select>
        <button
          onClick={loadOrders}
          className="px-4 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-white text-sm transition"
        >
          <RefreshCw className="w-4 h-4 inline mr-1" />
          刷新
        </button>
      </div>

      <div className="bg-gray-800/30 rounded-lg overflow-hidden border border-gray-700/50">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-700/50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">订单号</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">金额</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">状态</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">创建时间</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-400 uppercase">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-400">暂无订单</td>
                </tr>
              ) : (
                filtered.map((order: any) => {
                  const color = statusColors[order.status] || 'default'
                  const label = statusLabels[order.status] || order.status || '未知'
                  return (
                    <tr key={order.id} className="border-t border-gray-700/30 hover:bg-gray-700/20 transition">
                      <td className="px-4 py-2 text-white font-mono text-xs">{order.id?.slice(0, 8)}</td>
                      <td className="px-4 py-2 text-yellow-400">${order.amount}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded-full text-xs bg-gray-700/50 text-gray-300`}>
                          {label}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-gray-400 text-xs">
                        {order.created_at ? new Date(order.created_at).toLocaleString() : '-'}
                      </td>
                      <td className="px-4 py-2 text-center">
                        {isAdmin && order.status === 'paid' && (
                          <button
                            className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs hover:bg-green-500/30 transition"
                            onClick={() => handleUpdateStatus(order.id, 'completed')}
                          >
                            <CheckCircle className="w-3 h-3 inline mr-1" />
                            确认到账
                          </button>
                        )}
                        {isAdmin && order.status === 'pending' && (
                          <button
                            className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs hover:bg-red-500/30 transition"
                            onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                          >
                            <XCircle className="w-3 h-3 inline mr-1" />
                            取消
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
