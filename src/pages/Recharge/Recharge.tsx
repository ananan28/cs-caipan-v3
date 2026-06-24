import { useState, useEffect } from 'react'
import { Card } from '@/components/Common/Card'
import { Badge } from '@/components/Common/Badge'
import { Button } from '@/components/Common/Button'
import { Input } from '@/components/Forms/Input'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { generateQRCode } from '@/utils/qrcode'
import {
  CreditCard, Copy, RefreshCw, CheckCircle, XCircle,
  Clock, AlertCircle, Wallet
} from 'lucide-react'
import toast from 'react-hot-toast'

export const Recharge = () => {
  const { user } = useAuthStore()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [usdtAmount, setUsdtAmount] = useState('')
  const [remark, setRemark] = useState('')
  const [rate, setRate] = useState(6.75)
  const [countdown, setCountdown] = useState(0)
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null)
  const [showPayment, setShowPayment] = useState(false)
  const [currentAddress, setCurrentAddress] = useState('')
  const [currentAmount, setCurrentAmount] = useState(0)
  const [adminAddresses, setAdminAddresses] = useState<any[]>([])

  const isAdmin = user?.role === 'SuperAdmin' || user?.role === 'Admin'

  const loadAdminAddresses = async () => {
    const { data, error } = await supabase
      .from('payment_addresses')
      .select('*')
      .eq('status', 'active')
      .order('is_default', { ascending: false })

    if (!error && data) {
      setAdminAddresses(data)
    }
  }

  const loadOrders = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('recharge_orders')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false })

    if (error) {
      toast.error('加载订单失败: ' + error.message)
    } else {
      setOrders(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    loadOrders()
    fetchRate()
    loadAdminAddresses()
  }, [user])

  const fetchRate = async () => {
    const { data } = await supabase
      .from('system_configs')
      .select('value')
      .eq('key', 'usdt_rate')
      .single()
    if (data) {
      setRate(parseFloat(data.value) || 6.75)
    }
  }

  const getPaymentAddress = () => {
    const defaultAddr = adminAddresses.find(a => a.is_default)
    if (defaultAddr) return defaultAddr.address
    if (adminAddresses.length > 0) return adminAddresses[0].address
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let address = 'TA1k'
    for (let i = 0; i < 30; i++) {
      address += chars[Math.floor(Math.random() * chars.length)]
    }
    return address
  }

  const handleCreateOrder = async () => {
    const amount = parseFloat(usdtAmount)
    if (!amount || amount <= 0) {
      toast.error('请输入有效金额')
      return
    }
    if (amount > 10000) {
      toast.error('单笔最大 10000 USDT')
      return
    }

    if (adminAddresses.length === 0) {
      toast.error('系统尚未配置收款地址，请联系客服')
      return
    }

    const points = amount * rate
    const address = getPaymentAddress()

    const { data, error } = await supabase
      .from('recharge_orders')
      .insert({
        user_id: user?.id,
        amount: amount,
        usdt_amount: amount,
        rate: rate,
        points: points,
        address: address,
        status: 'pending',
        remark: remark,
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString()
      })
      .select()

    if (error) {
      toast.error('创建订单失败: ' + error.message)
    } else if (data) {
      setCurrentOrderId(data[0].id)
      setCurrentAddress(address)
      setCurrentAmount(amount)
      setShowPayment(true)
      setShowCreate(false)
      setCountdown(1800)
      loadOrders()
    }
  }

  const handleMarkPaid = async () => {
    if (!currentOrderId) return

    const { error } = await supabase
      .from('recharge_orders')
      .update({ 
        status: 'paid',
        updated_at: new Date().toISOString()
      })
      .eq('id', currentOrderId)

    if (error) {
      toast.error('提交失败: ' + error.message)
    } else {
      toast.success('✅ 已标记为已支付，等待管理员审核')
      setShowPayment(false)
      setCurrentOrderId(null)
      setCountdown(0)
      loadOrders()
    }
  }

  const handleConfirmComplete = async (id: string) => {
    if (!isAdmin) {
      toast.error('只有管理员可以确认到账')
      return
    }

    const { error } = await supabase
      .from('recharge_orders')
      .update({ 
        status: 'completed',
        confirmed_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) {
      toast.error('确认失败: ' + error.message)
    } else {
      toast.success('✅ 已确认到账')
      loadOrders()
    }
  }

  const handleReject = async (id: string) => {
    if (!isAdmin) {
      toast.error('只有管理员可以拒绝')
      return
    }

    if (!confirm('确定要拒绝此充值订单吗？')) return

    const { error } = await supabase
      .from('recharge_orders')
      .update({ status: 'cancelled' })
      .eq('id', id)

    if (error) {
      toast.error('拒绝失败: ' + error.message)
    } else {
      toast.success('已拒绝')
      loadOrders()
    }
  }

  const handleCancelOrder = async (id: string) => {
    if (!confirm('确定要取消此订单吗？')) return

    const { error } = await supabase
      .from('recharge_orders')
      .update({ status: 'cancelled' })
      .eq('id', id)

    if (error) {
      toast.error('取消失败: ' + error.message)
    } else {
      toast.success('订单已取消')
      loadOrders()
    }
  }

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address)
    toast.success('地址已复制')
  }

  useEffect(() => {
    if (countdown > 0 && currentOrderId) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else if (countdown === 0 && currentOrderId) {
      supabase
        .from('recharge_orders')
        .update({ status: 'expired' })
        .eq('id', currentOrderId)
        .then(() => {
          toast.warning('⏰ 订单已超时取消')
          setShowPayment(false)
          setCurrentOrderId(null)
          loadOrders()
        })
    }
  }, [countdown, currentOrderId])

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

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

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
            <h1 className="text-2xl font-bold text-gray-900">自助充值</h1>
            <p className="text-gray-500 text-sm">USDT-TRC20 充值</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadOrders}>
              <RefreshCw size={16} className="mr-2" /> 刷新
            </Button>
            <Button variant="primary" onClick={() => setShowCreate(true)}>
              <CreditCard size={16} className="mr-2" /> 充值
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-gray-500 text-sm">总充值</div>
            <div className="text-gray-900 text-xl font-bold">
              ${orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.amount, 0).toFixed(2)}
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-gray-500 text-sm">待支付</div>
            <div className="text-yellow-500 text-xl font-bold">
              {orders.filter(o => o.status === 'pending').length}
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-gray-500 text-sm">待审核</div>
            <div className="text-blue-500 text-xl font-bold">
              {orders.filter(o => o.status === 'paid').length}
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-gray-500 text-sm">已完成</div>
            <div className="text-green-500 text-xl font-bold">
              {orders.filter(o => o.status === 'completed').length}
            </div>
          </div>
        </div>

        <Card>
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-gray-900 font-semibold">充值记录</h3>
            <span className="text-gray-400 text-sm">{orders.length} 条</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">订单</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">USDT</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">积分</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">时间</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-t border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-900 text-xs font-mono">{order.id.slice(0, 8)}</td>
                    <td className="px-4 py-3 text-gray-900 font-medium">{order.amount.toFixed(2)}</td>
                    <td className="px-4 py-3 text-gray-900">{order.points.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={statusColors[order.status] || 'default'}>
                        {statusLabels[order.status] || order.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-sm">
                      {new Date(order.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {order.status === 'pending' && (
                          <button
                            onClick={() => handleCancelOrder(order.id)}
                            className="p-1.5 bg-red-500/20 text-red-500 rounded hover:bg-red-500/30"
                            title="取消"
                          >
                            <XCircle size={14} />
                          </button>
                        )}
                        {isAdmin && order.status === 'paid' && (
                          <>
                            <button
                              onClick={() => handleConfirmComplete(order.id)}
                              className="p-1.5 bg-green-500/20 text-green-500 rounded hover:bg-green-500/30"
                              title="确认到账"
                            >
                              <CheckCircle size={14} />
                            </button>
                            <button
                              onClick={() => handleReject(order.id)}
                              className="p-1.5 bg-red-500/20 text-red-500 rounded hover:bg-red-500/30"
                              title="拒绝"
                            >
                              <XCircle size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-400">暂无充值记录</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {showCreate && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">自助充值</h2>
                <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-600">
                  <XCircle size={24} />
                </button>
              </div>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-gray-500 text-sm">当前汇率</p>
                  <p className="text-2xl font-bold text-yellow-500">1 USDT = {rate} 积分</p>
                </div>
                <div>
                  <label className="text-gray-700 text-sm font-medium block mb-1">USDT 数量</label>
                  <Input
                    type="number"
                    value={usdtAmount}
                    onChange={(e: any) => setUsdtAmount(e.target.value)}
                    placeholder="请输入 USDT 数量"
                    className="bg-gray-50 border-gray-200 text-gray-900 text-lg"
                  />
                  <p className="text-gray-400 text-xs mt-1">最小 1 USDT，最大 10000 USDT</p>
                </div>
                <div>
                  <label className="text-gray-700 text-sm font-medium block mb-1">备注 (可选)</label>
                  <Input
                    value={remark}
                    onChange={(e: any) => setRemark(e.target.value)}
                    placeholder="充值备注"
                    className="bg-gray-50 border-gray-200 text-gray-900"
                  />
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setShowCreate(false)}>
                    取消
                  </Button>
                  <Button className="flex-1 bg-gradient-to-r from-yellow-400 to-yellow-500" onClick={handleCreateOrder}>
                    生成支付地址
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showPayment && currentOrderId && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 w-full max-w-md">
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                  <Wallet className="text-blue-500" size={32} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">支付 USDT</h2>
                <p className="text-gray-500 text-sm mt-1">请向以下地址转账</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-4 text-center">
                <p className="text-gray-500 text-sm">金额</p>
                <p className="text-3xl font-bold text-gray-900">{currentAmount.toFixed(2)} USDT</p>
                <p className="text-gray-400 text-xs mt-1">≈ {rate * currentAmount} 积分</p>
              </div>

              <div className="text-center mb-4">
                <img 
                  src={generateQRCode(currentAddress)} 
                  alt="QR Code" 
                  className="mx-auto w-48 h-48 rounded-lg border border-gray-200"
                />
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <p className="text-gray-500 text-sm text-center">收款地址 (TRC20)</p>
                <p className="text-gray-900 font-mono text-xs break-all text-center mt-1">{currentAddress}</p>
                <div className="flex justify-center gap-3 mt-3">
                  <Button variant="primary" size="sm" onClick={() => copyAddress(currentAddress)}>
                    <Copy size={14} className="mr-1" /> 复制地址
                  </Button>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <p className="text-yellow-600 text-xs text-center">
                  ⏰ 请在 <span className="font-bold">{formatTime(countdown)}</span> 内完成支付
                </p>
              </div>

              <div className="space-y-3">
                <Button className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500" onClick={handleMarkPaid}>
                  <CheckCircle size={16} className="mr-2" /> 我已支付，提交审核
                </Button>
                <Button variant="outline" className="w-full" onClick={() => {
                  setShowPayment(false)
                  setCurrentOrderId(null)
                  setCountdown(0)
                }}>
                  关闭
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
