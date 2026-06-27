import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { RefreshCw, CheckCircle, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export const Finance = () => {
  const { user } = useAuthStore()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [stats, setStats] = useState({ total: 0, pending: 0, paid: 0, completed: 0, cancelled: 0, expired: 0 })

  const isAdmin = user?.role === 'SuperAdmin' || user?.role === 'Admin'

  const loadOrders = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('recharge_orders')
        .select('*')
        .order('created_at', { ascending: false })

      if (filter !== 'all') {
        query = query.eq('status', filter)
      }

      const { data, error } = await query

      if (error) {
        toast.error('加载订单失败: ' + error.message)
      } else {
        setOrders(data || [])
        setStats({
          total: data?.length || 0,
          pending: data?.filter((o: any) => o.status === 'pending').length || 0,
          paid: data?.filter((o: any) => o.status === 'paid').length || 0,
          completed: data?.filter((o: any) => o.status === 'completed').length || 0,
          cancelled: data?.filter((o: any) => o.status === 'cancelled').length || 0,
          expired: data?.filter((o: any) => o.status === 'expired').length || 0
        })
      }
    } catch (error: any) {
      toast.error('加载订单失败: ' + error.message)
    }
    setLoading(false)
  }

  useEffect(() => {
    if (isAdmin) {
      loadOrders()
    }
  }, [user, filter])

  const handleConfirm = async (orderId: string) => {
    if (!confirm('确认该订单已到账？')) return
    try {
      const { error } = await supabase
        .from('recharge_orders')
        .update({ status: 'completed', confirmed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq('id', orderId)

      if (error) {
        toast.error('确认失败: ' + error.message)
      } else {
        toast.success('✅ 已确认到账')
        loadOrders()
      }
    } catch (error: any) {
      toast.error('确认失败: ' + error.message)
    }
  }

  const handleCancel = async (orderId: string) => {
    if (!confirm('确定要取消该订单吗？')) return
    try {
      const { error } = await supabase
        .from('recharge_orders')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('id', orderId)

      if (error) {
        toast.error('取消失败: ' + error.message)
      } else {
        toast.success('✅ 订单已取消')
        loadOrders()
      }
    } catch (error: any) {
      toast.error('取消失败: ' + error.message)
    }
  }

  const statusLabels: Record<string, string> = {
    pending: '待支付',
    paid: '已支付-待审核',
    completed: '已完成',
    cancelled: '已取消',
    expired: '已过期'
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-500/30 text-yellow-300 font-semibold',
    paid: 'bg-blue-500/30 text-blue-300 font-semibold',
    completed: 'bg-green-500/30 text-green-300 font-semibold',
    cancelled: 'bg-gray-500/30 text-gray-300 font-semibold',
    expired: 'bg-red-500/30 text-red-300 font-semibold'
  }

  if (!isAdmin) {
    return <div className="p-6 text-center text-white text-lg">您没有权限访问此页面</div>
  }

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-900">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-white">💰 财务管理</h1>
        <button onClick={loadOrders} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white text-base flex items-center gap-2 transition">
          <RefreshCw className="w-5 h-5" />
          刷新
        </button>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
        {[
          { label: '全部', value: stats.total, color: 'text-white' },
          { label: '待支付', value: stats.pending, color: 'text-yellow-400' },
          { label: '待审核', value: stats.paid, color: 'text-blue-400' },
          { label: '已完成', value: stats.completed, color: 'text-green-400' },
          { label: '已取消', value: stats.cancelled, color: 'text-yellow-400' },
          { label: '已过期', value: stats.expired, color: 'text-red-400' }
        ].map((item) => (
          <div key={item.label} className="bg-gray-800/50 rounded-lg p-4 text-center border border-gray-700/50">
            <p className={`text-3xl font-bold ${item.color}`}>{item.value}</p>
            <p className="text-sm text-gray-300">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-4">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-base"
        >
          <option value="all">全部状态</option>
          <option value="pending">待支付</option>
          <option value="paid">已支付-待审核</option>
          <option value="completed">已完成</option>
          <option value="cancelled">已取消</option>
          <option value="expired">已过期</option>
        </select>
      </div>

      <div className="bg-gray-800/30 rounded-lg overflow-hidden border border-gray-700/50">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">订单号</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">用户</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">金额</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">积分</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">状态</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">创建时间</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-300">操作</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-8 text-yellow-400 text-base">加载中...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-yellow-400 text-base">暂无订单</td></tr>
              ) : (
                orders.map((order: any) => (
                  <tr key={order.id} className="border-t border-gray-700/30 hover:bg-gray-700/20 transition">
                    <td className="px-4 py-3 text-white font-mono text-sm">{order.id?.slice(0, 8)}</td>
                    <td className="px-4 py-3 text-white text-sm">{order.user_id?.slice(0, 8)}</td>
                    <td className="px-4 py-3 text-yellow-400 font-semibold text-sm">${order.amount?.toFixed(2)}</td>
                    <td className="px-4 py-3 text-white text-sm">{order.points?.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColors[order.status] || 'bg-gray-500/30 text-gray-300'}`}>
                        {statusLabels[order.status] || order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-300 text-sm">
                      {order.created_at ? new Date(order.created_at).toLocaleString() : '-'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {order.status === 'paid' && (
                          <button
                            onClick={() => handleConfirm(order.id)}
                            className="px-3 py-1.5 bg-green-500/30 text-green-300 rounded-lg text-sm hover:bg-green-500/50 transition flex items-center gap-1 font-medium"
                          >
                            <CheckCircle className="w-4 h-4" />
                            确认到账
                          </button>
                        )}
                        {(order.status === 'pending' || order.status === 'paid') && (
                          <button
                            onClick={() => handleCancel(order.id)}
                            className="px-3 py-1.5 bg-red-500/30 text-red-300 rounded-lg text-sm hover:bg-red-500/50 transition flex items-center gap-1 font-medium"
                          >
                            <XCircle className="w-4 h-4" />
                            取消
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
