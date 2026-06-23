import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { Card } from '@/components/Common/Card'
import { Badge } from '@/components/Common/Badge'
import { Button } from '@/components/Common/Button'
import { Input } from '@/components/Forms/Input'
import { supabase } from '@/lib/supabase'
import {
  Coins, RefreshCw, Send, CreditCard, X, Copy,
  CheckCircle, Clock, Wallet as WalletIcon, AlertCircle
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Transaction {
  id: string
  user_id: string
  type: string
  amount: number
  status: string
  description: string
  created_at: string
}

export const Wallet = () => {
  const { user } = useAuthStore()
  const [balance, setBalance] = useState(0)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [showRecharge, setShowRecharge] = useState(false)
  const [showTransfer, setShowTransfer] = useState(false)
  const [amount, setAmount] = useState('')
  const [recipient, setRecipient] = useState('')
  const [description, setDescription] = useState('')

  // 加载钱包数据
  const loadWallet = async () => {
    if (!user?.id) return

    const { data: walletData, error: walletError } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (walletError && walletError.code !== 'PGRST116') {
      toast.error('加载钱包失败: ' + walletError.message)
    } else if (walletData) {
      setBalance(walletData.balance || 0)
    }

    // 加载交易记录
    const { data: txData, error: txError } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (txError) {
      toast.error('加载交易记录失败: ' + txError.message)
    } else {
      setTransactions(txData || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    loadWallet()
  }, [user])

  // 充值
  const handleRecharge = async () => {
    const numAmount = parseFloat(amount)
    if (!numAmount || numAmount <= 0) {
      toast.error('请输入有效金额')
      return
    }

    const { data, error } = await supabase
      .from('transactions')
      .insert({
        user_id: user?.id,
        type: 'recharge',
        amount: numAmount,
        status: 'pending',
        description: description || '充值'
      })
      .select()

    if (error) {
      toast.error('充值失败: ' + error.message)
    } else {
      toast.success('充值申请已提交，等待审核')
      setShowRecharge(false)
      setAmount('')
      setDescription('')
      loadWallet()
    }
  }

  // 转账
  const handleTransfer = async () => {
    const numAmount = parseFloat(amount)
    if (!numAmount || numAmount <= 0) {
      toast.error('请输入有效金额')
      return
    }
    if (numAmount > balance) {
      toast.error('余额不足')
      return
    }
    if (!recipient) {
      toast.error('请输入接收方邮箱')
      return
    }

    // 查找接收方
    const { data: recipientUser, error: findError } = await supabase
      .from('users')
      .select('id')
      .eq('email', recipient)
      .single()

    if (findError || !recipientUser) {
      toast.error('接收方不存在')
      return
    }

    // 扣减发送方余额
    const { error: deductError } = await supabase
      .from('wallets')
      .update({ balance: balance - numAmount })
      .eq('user_id', user?.id)

    if (deductError) {
      toast.error('转账失败: ' + deductError.message)
      return
    }

    // 增加接收方余额
    const { data: receiverWallet } = await supabase
      .from('wallets')
      .select('balance')
      .eq('user_id', recipientUser.id)
      .single()

    await supabase
      .from('wallets')
      .update({ balance: (receiverWallet?.balance || 0) + numAmount })
      .eq('user_id', recipientUser.id)

    // 记录交易
    await supabase
      .from('transactions')
      .insert([
        {
          user_id: user?.id,
          type: 'transfer_out',
          amount: -numAmount,
          status: 'completed',
          description: `转账给 ${recipient}`
        },
        {
          user_id: recipientUser.id,
          type: 'transfer_in',
          amount: numAmount,
          status: 'completed',
          description: `来自 ${user?.email} 的转账`
        }
      ])

    toast.success('转账成功')
    setShowTransfer(false)
    setAmount('')
    setRecipient('')
    loadWallet()
  }

  // 刷新
  const handleRefresh = () => {
    toast.loading('刷新中...')
    loadWallet()
    toast.dismiss()
    toast.success('已刷新')
  }

  const statusColors: Record<string, string> = {
    pending: 'warning',
    completed: 'success',
    failed: 'danger'
  }

  const statusLabels: Record<string, string> = {
    pending: '待处理',
    completed: '已完成',
    failed: '失败'
  }

  const typeLabels: Record<string, string> = {
    recharge: '充值',
    transfer_out: '转出',
    transfer_in: '转入',
    reward: '奖励'
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
        {/* 头部 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <WalletIcon className="text-blue-400" />
              我的钱包
            </h1>
            <p className="text-gray-400 text-sm">管理账户余额和交易</p>
          </div>
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw size={16} className="mr-2" /> 刷新
          </Button>
        </div>

        {/* 余额卡片 */}
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="p-6">
            <p className="text-white/70 text-sm">当前余额</p>
            <p className="text-4xl font-bold text-white mt-1">${balance.toFixed(2)}</p>
            <div className="flex gap-3 mt-4">
              <Button variant="primary" onClick={() => setShowRecharge(true)}>
                <CreditCard size={16} className="mr-2" /> 充值
              </Button>
              <Button variant="secondary" onClick={() => setShowTransfer(true)}>
                <Send size={16} className="mr-2" /> 转账
              </Button>
            </div>
          </div>
        </Card>

        {/* 交易记录 */}
        <Card>
          <div className="p-4 border-b border-gray-800">
            <h3 className="text-white font-semibold">交易记录</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#1a1f35]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">类型</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">金额</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">状态</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">说明</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">时间</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id} className="border-t border-gray-800 hover:bg-[#1a1f35]/50">
                    <td className="px-4 py-3 text-white text-sm">{typeLabels[tx.type] || tx.type}</td>
                    <td className={`px-4 py-3 text-sm font-medium ${
                      tx.amount > 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusColors[tx.status] || 'default'}>
                        {statusLabels[tx.status] || tx.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-sm">{tx.description || '-'}</td>
                    <td className="px-4 py-3 text-gray-400 text-sm">
                      {new Date(tx.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
                {transactions.length === 0 && (
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

      {/* 充值弹窗 */}
      {showRecharge && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#12182b] border border-gray-800 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">充值</h2>
              <button onClick={() => setShowRecharge(false)} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-white text-sm font-medium block mb-1">金额 (USDT)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="请输入金额"
                  className="w-full px-4 py-2 bg-[#1a1f35] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-white text-sm font-medium block mb-1">备注</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="可选备注"
                  className="w-full px-4 py-2 bg-[#1a1f35] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <Button className="w-full" onClick={handleRecharge}>
                提交充值申请
              </Button>
              <p className="text-xs text-gray-400 text-center">充值需人工审核，请耐心等待</p>
            </div>
          </div>
        </div>
      )}

      {/* 转账弹窗 */}
      {showTransfer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#12182b] border border-gray-800 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">转账</h2>
              <button onClick={() => setShowTransfer(false)} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-white text-sm font-medium block mb-1">接收方邮箱</label>
                <input
                  type="email"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full px-4 py-2 bg-[#1a1f35] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-white text-sm font-medium block mb-1">金额 (USDT)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={`当前余额: $${balance.toFixed(2)}`}
                  className="w-full px-4 py-2 bg-[#1a1f35] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <Button className="w-full" onClick={handleTransfer}>
                确认转账
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
