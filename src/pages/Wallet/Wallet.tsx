import { useState, useEffect } from 'react'
import { Card } from '@/components/Common/Card'
import { Button } from '@/components/Common/Button'
import { Input } from '@/components/Forms/Input'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { Wallet, ArrowUpRight, ArrowDownLeft, RefreshCw, Copy } from 'lucide-react'
import toast from 'react-hot-toast'

export const WalletPage = () => {
  const { user } = useAuthStore()
  const [balance, setBalance] = useState(0)
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [transferAmount, setTransferAmount] = useState('')
  const [transferTo, setTransferTo] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showTransfer, setShowTransfer] = useState(false)

  const loadBalance = async () => {
    if (!user) return
    try {
      const { data } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', user.id)
        .single()
      if (data) {
        setBalance(data.balance || 0)
      }
    } catch (error) {
      console.error('加载余额失败:', error)
    }
  }

  const loadTransactions = async () => {
    if (!user) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) {
        toast.error('加载交易记录失败: ' + error.message)
      } else {
        setTransactions(data || [])
      }
    } catch (error: any) {
      toast.error('加载交易记录失败: ' + error.message)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadBalance()
    loadTransactions()
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
    if (!transferTo) {
      toast.error('请输入接收方账号')
      return
    }

    setSubmitting(true)
    try {
      // 查找接收方
      const { data: receiver } = await supabase
        .from('users')
        .select('id')
        .eq('username', transferTo)
        .maybeSingle()

      if (!receiver) {
        toast.error('未找到该用户')
        setSubmitting(false)
        return
      }

      if (receiver.id === user?.id) {
        toast.error('不能给自己转账')
        setSubmitting(false)
        return
      }

      // 扣除发送方余额
      const { error: deductError } = await supabase.rpc('deduct_balance', {
        p_user_id: user?.id,
        p_amount: amount
      })

      if (deductError) {
        toast.error('转账失败: ' + deductError.message)
        setSubmitting(false)
        return
      }

      // 增加接收方余额
      const { error: addError } = await supabase.rpc('add_balance', {
        p_user_id: receiver.id,
        p_amount: amount
      })

      if (addError) {
        // 回滚
        await supabase.rpc('add_balance', {
          p_user_id: user?.id,
          p_amount: amount
        })
        toast.error('转账失败: ' + addError.message)
        setSubmitting(false)
        return
      }

      // 记录交易
      await supabase.from('wallet_transactions').insert([
        {
          user_id: user?.id,
          type: 'transfer_out',
          amount: -amount,
          description: `转账给 ${transferTo}`,
          created_at: new Date().toISOString()
        },
        {
          user_id: receiver.id,
          type: 'transfer_in',
          amount: amount,
          description: `收到来自 ${user?.username} 的转账`,
          created_at: new Date().toISOString()
        }
      ])

      toast.success(`✅ 已转出 ${amount} 积分`)
      setTransferAmount('')
      setTransferTo('')
      setShowTransfer(false)
      loadBalance()
      loadTransactions()
    } catch (error: any) {
      toast.error('转账失败: ' + error.message)
    }
    setSubmitting(false)
  }

  const copyAddress = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('已复制')
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Wallet className="w-6 h-6 text-yellow-400" />
          钱包
        </h1>
        <button
          onClick={() => { loadBalance(); loadTransactions(); }}
          className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
        >
          <RefreshCw className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* 余额卡片 */}
      <Card className="bg-gradient-to-r from-yellow-400/10 to-yellow-600/10 border-yellow-500/30 p-6 mb-6">
        <p className="text-gray-400 text-sm">可用余额</p>
        <p className="text-4xl font-bold text-white">{balance.toFixed(2)} 积分</p>
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setShowTransfer(true)}
            className="px-4 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-300 transition flex items-center gap-2"
          >
            <ArrowUpRight className="w-4 h-4" />
            转账
          </button>
          <button
            onClick={() => copyAddress(user?.id || '')}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition flex items-center gap-2"
          >
            <Copy className="w-4 h-4" />
            复制ID
          </button>
        </div>
      </Card>

      {/* 转账弹窗 */}
      {showTransfer && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl p-6 w-full max-w-md border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">转账</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-300 block mb-1">接收方用户名</label>
                <Input
                  value={transferTo}
                  onChange={(e) => setTransferTo(e.target.value)}
                  placeholder="输入对方用户名"
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-sm text-gray-300 block mb-1">金额</label>
                <Input
                  type="number"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  placeholder="输入金额"
                  className="w-full"
                />
                <p className="text-xs text-gray-400 mt-1">可用余额: {balance.toFixed(2)} 积分</p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleTransfer}
                  disabled={submitting}
                  className="flex-1 py-2 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-300 transition disabled:opacity-50"
                >
                  {submitting ? '处理中...' : '确认转账'}
                </Button>
                <Button
                  onClick={() => setShowTransfer(false)}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
                >
                  取消
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 交易记录 */}
      <Card className="bg-gray-800/50 border-gray-700 p-6">
        <h2 className="text-white font-medium mb-4">交易记录</h2>
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-yellow-400"></div>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>暂无交易记录</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {tx.amount > 0 ? (
                    <ArrowDownLeft className="w-4 h-4 text-green-400" />
                  ) : (
                    <ArrowUpRight className="w-4 h-4 text-red-400" />
                  )}
                  <div>
                    <p className="text-white text-sm">{tx.description || tx.type}</p>
                    <p className="text-xs text-gray-400">
                      {tx.created_at ? new Date(tx.created_at).toLocaleString() : '-'}
                    </p>
                  </div>
                </div>
                <p className={`font-medium ${tx.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {tx.amount > 0 ? '+' : ''}{tx.amount}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
