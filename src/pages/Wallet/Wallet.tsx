import { useState, useEffect } from 'react'
import { Card } from '@/components/Common/Card'
import { Badge } from '@/components/Common/Badge'
import { Button } from '@/components/Common/Button'
import { Input } from '@/components/Forms/Input'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { useNavigate } from 'react-router-dom'
import {
  Wallet as WalletIcon, RefreshCw, Send, CreditCard,
  CheckCircle, Clock, X
} from 'lucide-react'
import toast from 'react-hot-toast'

export const Wallet = () => {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [balance, setBalance] = useState(0)
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showTransfer, setShowTransfer] = useState(false)
  const [recipientEmail, setRecipientEmail] = useState('')
  const [transferAmount, setTransferAmount] = useState('')
  const [transferNote, setTransferNote] = useState('')

  const loadWallet = async () => {
    if (!user?.id) return

    // 加载余额
    const { data: walletData } = await supabase
      .from('wallets')
      .select('points')
      .eq('user_id', user.id)
      .single()

    if (walletData) {
      setBalance(walletData.points || 0)
    } else {
      // 如果没有钱包，创建
      await supabase
        .from('wallets')
        .insert({ user_id: user.id, points: 0, frozen_points: 0 })
      setBalance(0)
    }

    // 加载交易记录
    const { data: txData } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    setTransactions(txData || [])
    setLoading(false)
  }

  useEffect(() => {
    loadWallet()
  }, [user])

  const handleTransfer = async () => {
    const amount = parseFloat(transferAmount)
    if (!amount || amount <= 0) {
      toast.error('请输入有效金额')
      return
    }

    if (amount > balance) {
      toast.error('余额不足')
      return
    }

    if (!recipientEmail) {
      toast.error('请输入接收方邮箱')
      return
    }

    if (recipientEmail === user?.email) {
      toast.error('不能给自己转账')
      return
    }

    // 查找接收方
    const { data: recipient, error: findError } = await supabase
      .from('users')
      .select('id')
      .eq('email', recipientEmail)
      .single()

    if (findError || !recipient) {
      toast.error('接收方不存在')
      return
    }

    // 扣减发送方余额
    const { error: deductError } = await supabase
      .from('wallets')
      .update({ points: balance - amount })
      .eq('user_id', user?.id)

    if (deductError) {
      toast.error('转账失败: ' + deductError.message)
      return
    }

    // 增加接收方余额
    const { data: receiverWallet } = await supabase
      .from('wallets')
      .select('points')
      .eq('user_id', recipient.id)
      .single()

    await supabase
      .from('wallets')
      .update({ points: (receiverWallet?.points || 0) + amount })
      .eq('user_id', recipient.id)

    // 记录交易
    await supabase
      .from('transactions')
      .insert([
        {
          user_id: user?.id,
          type: 'transfer_out',
          amount: -amount,
          status: 'completed',
          description: `转账给 ${recipientEmail}`
        },
        {
          user_id: recipient.id,
          type: 'transfer_in',
          amount: amount,
          status: 'completed',
          description: `来自 ${user?.email} 的转账`
        }
      ])

    toast.success(`✅ 转账成功！${amount} 积分已转给 ${recipientEmail}`)
    setShowTransfer(false)
    setRecipientEmail('')
    setTransferAmount('')
    setTransferNote('')
    loadWallet()
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
      <div className="p-6 bg-[#f0f2f5] min-h-screen flex items-center justify-center">
        <div className="text-gray-400">加载中...</div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-[#f0f2f5] min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <WalletIcon className="text-yellow-500" />
              我的钱包
            </h1>
            <p className="text-gray-500 text-sm">管理账户余额和交易</p>
          </div>
          <Button variant="outline" onClick={loadWallet}>
            <RefreshCw size={16} className="mr-2" /> 刷新
          </Button>
        </div>

        <Card className="bg-gradient-to-r from-yellow-400 to-yellow-500 border-0">
          <div className="p-6">
            <p className="text-white/80 text-sm">当前余额</p>
            <p className="text-4xl font-bold text-white mt-1">{balance.toFixed(2)} 积分</p>
            <div className="flex gap-3 mt-4">
              <Button variant="primary" onClick={() => navigate('/recharge')}>
                <CreditCard size={16} className="mr-2" /> 充值
              </Button>
              <Button variant="secondary" onClick={() => setShowTransfer(true)}>
                <Send size={16} className="mr-2" /> 转账
              </Button>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-gray-900 font-semibold">交易记录</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">类型</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">金额</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">说明</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">时间</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id} className="border-t border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-900 text-sm">{typeLabels[tx.type] || tx.type}</td>
                    <td className={`px-4 py-3 text-sm font-medium ${tx.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusColors[tx.status] || 'default'}>
                        {statusLabels[tx.status] || tx.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-sm">{tx.description || '-'}</td>
                    <td className="px-4 py-3 text-gray-400 text-sm">
                      {new Date(tx.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-400">暂无交易记录</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {showTransfer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">转账</h2>
              <button onClick={() => setShowTransfer(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-gray-700 text-sm font-medium block mb-1">接收方邮箱</label>
                <Input
                  value={recipientEmail}
                  onChange={(e: any) => setRecipientEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="bg-gray-50 border-gray-200 text-gray-900"
                />
              </div>
              <div>
                <label className="text-gray-700 text-sm font-medium block mb-1">金额 (积分)</label>
                <Input
                  type="number"
                  value={transferAmount}
                  onChange={(e: any) => setTransferAmount(e.target.value)}
                  placeholder={`当前余额: ${balance.toFixed(2)}`}
                  className="bg-gray-50 border-gray-200 text-gray-900"
                />
              </div>
              <div>
                <label className="text-gray-700 text-sm font-medium block mb-1">备注</label>
                <Input
                  value={transferNote}
                  onChange={(e: any) => setTransferNote(e.target.value)}
                  placeholder="可选"
                  className="bg-gray-50 border-gray-200 text-gray-900"
                />
              </div>
              <Button className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500" onClick={handleTransfer}>
                确认转账
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
