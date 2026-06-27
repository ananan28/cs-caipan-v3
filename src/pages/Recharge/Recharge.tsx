import { useState, useEffect, useRef } from 'react'
import { Card } from '@/components/Common/Card'
import { Button } from '@/components/Common/Button'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { RefreshCw, Copy, CheckCircle, AlertCircle, QrCode } from 'lucide-react'
import toast from 'react-hot-toast'
import QRCode from 'qrcode'

export const Recharge = () => {
  const { user } = useAuthStore()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [usdtAmount, setUsdtAmount] = useState('')
  const [remark, setRemark] = useState('')
  const [rate, setRate] = useState(6.75)
  const [adminAddresses, setAdminAddresses] = useState<any[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null)
  const [showQrModal, setShowQrModal] = useState(false)
  const [currentOrder, setCurrentOrder] = useState<any>(null)
  const qrCanvasRef = useRef<HTMLCanvasElement>(null)

  const isAdmin = user?.role === 'SuperAdmin' || user?.role === 'Admin'

  // 加载汇率
  const fetchRate = async () => {
    try {
      const { data } = await supabase
        .from('system_configs')
        .select('value')
        .eq('key', 'usdt_rate')
        .single()
      if (data) {
        setRate(parseFloat(data.value) || 6.75)
      }
    } catch (error) {
      console.error('获取汇率失败:', error)
    }
  }

  // 加载收款地址
  const loadAdminAddresses = async () => {
    try {
      const { data } = await supabase
        .from('payment_addresses')
        .select('*')
        .eq('status', 'active')
        .order('is_default', { ascending: false })
      if (data) {
        setAdminAddresses(data)
      }
    } catch (error) {
      console.error('加载收款地址失败:', error)
    }
  }

  // 加载订单
  const loadOrders = async () => {
    if (!user) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('recharge_orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        toast.error('加载订单失败: ' + error.message)
      } else {
        setOrders(data || [])
      }
    } catch (error: any) {
      toast.error('加载订单失败: ' + error.message)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchRate()
    loadAdminAddresses()
    loadOrders()
  }, [user])

  // 获取默认收款地址
  const getPaymentAddress = () => {
    const defaultAddr = adminAddresses.find(a => a.is_default)
    if (defaultAddr) return defaultAddr.address
    if (adminAddresses.length > 0) return adminAddresses[0].address
    return ''
  }

  // 生成随机尾数（0.01 - 0.99）
  const generateRandomTail = () => {
    return Math.round((Math.random() * 98 + 1)) / 100
  }

  // 创建充值订单
  const handleCreateOrder = async () => {
    const amount = parseFloat(usdtAmount)
    if (!amount || amount <= 0) {
      toast.error('请输入有效的USDT数量')
      return
    }
    if (amount > 10000) {
      toast.error('单笔最大 10000 USDT')
      return
    }

    const address = getPaymentAddress()
    if (!address) {
      toast.error('暂无收款地址，请联系管理员')
      return
    }

    setSubmitting(true)
    try {
      // 生成随机尾数
      const tail = generateRandomTail()
      const finalAmount = amount + tail
      const pointsAmount = finalAmount * rate

      const { data, error } = await supabase
        .from('recharge_orders')
        .insert({
          user_id: user?.id,
          amount: finalAmount,
          usdt_amount: finalAmount,
          rate: rate,
          points: pointsAmount,
          address: address,
          remark: remark || null,
          status: 'pending',
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        toast.error('创建订单失败: ' + error.message)
      } else {
        setCurrentOrder(data)
        setQrCodeDataUrl(null)
        
        // 生成二维码
        const qrData = `usdt:${address}?amount=${finalAmount.toFixed(2)}`
        try {
          const qrUrl = await QRCode.toDataURL(qrData, {
            width: 300,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#ffffff'
            }
          })
          setQrCodeDataUrl(qrUrl)
        } catch (qrError) {
          console.error('二维码生成失败:', qrError)
        }
        
        setShowQrModal(true)
        toast.success(`✅ 订单已创建，请扫码支付 ${finalAmount.toFixed(2)} USDT`)
        setUsdtAmount('')
        setRemark('')
        loadOrders()
      }
    } catch (error: any) {
      toast.error('创建订单失败: ' + error.message)
    }
    setSubmitting(false)
  }

  // 复制地址
  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address)
    toast.success('已复制收款地址')
  }

  // 复制金额
  const copyAmount = (amount: number) => {
    navigator.clipboard.writeText(amount.toFixed(2))
    toast.success('已复制金额')
  }

  // 管理员确认到账
  const handleConfirmPayment = async (orderId: string) => {
    if (!isAdmin) {
      toast.error('只有管理员可以确认到账')
      return
    }
    try {
      const { error } = await supabase
        .from('recharge_orders')
        .update({ status: 'completed', updated_at: new Date().toISOString() })
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

  const statusLabels: Record<string, string> = {
    pending: '待支付',
    paid: '已支付-待审核',
    completed: '已完成',
    cancelled: '已取消',
    expired: '已过期'
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-500/20 text-yellow-400',
    paid: 'bg-blue-500/20 text-blue-400',
    completed: 'bg-green-500/20 text-green-400',
    cancelled: 'bg-gray-500/20 text-gray-200',
    expired: 'bg-red-500/20 text-red-400'
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-white flex items-center gap-2 mb-6">
        💰 自助充值
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 左侧：充值表单 */}
        <Card className="bg-gray-800/50 border-gray-700 p-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-200 block mb-1">
                USDT-TRC20
              </label>
              <div className="text-3xl font-bold text-white">$0.00</div>
              <div className="text-sm text-gray-200 mt-1">
                当前汇率：1 USDT = {rate} 积分
              </div>
              <div className="text-xs text-yellow-400 mt-1">
                ⚡ 订单金额将自动添加随机尾数（0.01-0.99），用于对账验证
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-200 block mb-1">
                USDT数量
              </label>
              <input
                type="number"
                value={usdtAmount}
                onChange={(e) => setUsdtAmount(e.target.value)}
                placeholder="最小 1 USDT，最大 10000 USDT"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-400"
                min="1"
                max="10000"
              />
            </div>

            <div>
              <label className="text-sm text-gray-200 block mb-1">
                备注（可选）
              </label>
              <input
                type="text"
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                placeholder="充值备注"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-400"
              />
            </div>

            <button
              onClick={handleCreateOrder}
              disabled={submitting}
              className="w-full py-3 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-300 transition disabled:opacity-50"
            >
              {submitting ? '创建中...' : '生成支付地址'}
            </button>
          </div>
        </Card>

        {/* 右侧：订单列表 */}
        <Card className="bg-gray-800/50 border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-medium">充值记录</h2>
            <button
              onClick={loadOrders}
              className="p-1 hover:bg-gray-700 rounded transition"
            >
              <RefreshCw className="w-4 h-4 text-gray-200" />
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-yellow-400"></div>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center text-gray-200 py-8">
              <p>暂无充值记录</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-gray-700/30 rounded-lg p-3 flex items-center justify-between"
                >
                  <div>
                    <p className="text-white text-sm font-mono">
                      {order.id?.slice(0, 8)}
                    </p>
                    <p className="text-xs text-gray-200">
                      {order.created_at ? new Date(order.created_at).toLocaleString() : '-'}
                    </p>
                    {order.amount && (
                      <p className="text-xs text-yellow-400">
                        金额: {order.amount.toFixed(2)} USDT
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[order.status] || 'bg-gray-500/20 text-gray-200'}`}>
                      {statusLabels[order.status] || order.status || '未知'}
                    </span>
                    {isAdmin && order.status === 'paid' && (
                      <button
                        onClick={() => handleConfirmPayment(order.id)}
                        className="block mt-1 text-xs text-green-400 hover:text-green-300 transition"
                      >
                        <CheckCircle className="w-3 h-3 inline" />
                        确认到账
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* 二维码弹窗 */}
      {showQrModal && currentOrder && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl p-6 w-full max-w-md border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4 text-center">扫码支付</h2>
            
            {qrCodeDataUrl ? (
              <div className="flex flex-col items-center">
                <img 
                  src={qrCodeDataUrl} 
                  alt="USDT支付二维码" 
                  className="w-64 h-64 bg-white rounded-lg p-4"
                />
                <div className="mt-4 text-center w-full">
                  <p className="text-gray-200 text-sm">收款地址</p>
                  <div className="flex items-center gap-2 bg-gray-800 rounded-lg p-2 mt-1">
                    <p className="text-white text-xs font-mono truncate flex-1">
                      {currentOrder.address}
                    </p>
                    <button
                      onClick={() => copyAddress(currentOrder.address)}
                      className="p-1 hover:bg-gray-700 rounded transition"
                    >
                      <Copy className="w-4 h-4 text-gray-200" />
                    </button>
                  </div>
                </div>
                <div className="mt-3 text-center w-full">
                  <p className="text-gray-200 text-sm">支付金额</p>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <p className="text-2xl font-bold text-yellow-400">
                      {currentOrder.amount?.toFixed(2)} USDT
                    </p>
                    <button
                      onClick={() => copyAmount(currentOrder.amount)}
                      className="p-1 hover:bg-gray-700 rounded transition"
                    >
                      <Copy className="w-4 h-4 text-gray-200" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-200 mt-1">
                    ⚡ 请转账精确金额，含随机尾数
                  </p>
                </div>
                <button
                  onClick={() => setShowQrModal(false)}
                  className="mt-4 px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
                >
                  关闭
                </button>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-200">二维码生成中...</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
