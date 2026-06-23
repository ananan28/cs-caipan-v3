import { useState, useRef } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useWalletStore } from '@/store/walletStore'
import { Card } from '@/components/Common/Card'
import { Badge } from '@/components/Common/Badge'
import { Button } from '@/components/Common/Button'
import { Input } from '@/components/Forms/Input'
import { 
  Coins, RefreshCw, Send, CreditCard, X, Copy, 
  CheckCircle, Clock, Zap, Upload, Image, RefreshCcw,
  QrCode, Smartphone, Landmark, Wallet as WalletIcon,
  AlertCircle
} from 'lucide-react'
import toast from 'react-hot-toast'

export const Wallet = () => {
  const { user } = useAuthStore()
  const { points, transactions, addPoints, addTransaction } = useWalletStore()
  const [showRecharge, setShowRecharge] = useState(false)
  const [showTransfer, setShowTransfer] = useState(false)
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [recipient, setRecipient] = useState('')
  const [selectedChannel, setSelectedChannel] = useState<any>(null)
  const [rechargeMode, setRechargeMode] = useState<'manual' | 'auto'>('auto')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [txnId, setTxnId] = useState('')
  const [orderId, setOrderId] = useState('')
  const [finalAmount, setFinalAmount] = useState<number | null>(null)
  const [showAmountStep, setShowAmountStep] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const channels = [
    { id: 'alipay', name: '支付宝', icon: '💳', account: '13800138000', accountName: '财盛集团', min: 1, max: 5000, hasQr: true },
    { id: 'wechat', name: '微信支付', icon: '📱', account: 'wxid_123456789', accountName: '财盛集团', min: 1, max: 5000, hasQr: true },
    { id: 'usdt', name: 'USDT (TRC20)', icon: '🪙', account: 'TXYZ1234567890ABCDEF', accountName: '财盛集团', min: 10, max: 10000, hasQr: false },
    { id: 'bank', name: '银行卡转账', icon: '🏦', account: '6222 0200 **** 8888', accountName: '财盛集团', min: 100, max: 50000, hasQr: false },
  ]

  // 模拟二维码生成
  const generateQrDataUrl = (channel: string, amount: number, order: string) => {
    const canvas = document.createElement('canvas')
    canvas.width = 200
    canvas.height = 200
    const ctx = canvas.getContext('2d')
    if (!ctx) return ''
    
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, 200, 200)
    ctx.strokeStyle = '#2563eb'
    ctx.lineWidth = 2
    ctx.strokeRect(4, 4, 192, 192)
    
    const colors = ['#1a1a2e', '#16213e', '#0f3460', '#533483', '#e94560']
    for (let i = 0; i < 30; i++) {
      const x = 10 + Math.random() * 180
      const y = 10 + Math.random() * 180
      const size = 4 + Math.random() * 12
      ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)]
      ctx.fillRect(x, y, size, size)
    }
    
    ctx.fillStyle = '#2563eb'
    ctx.font = 'bold 28px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('CS', 100, 95)
    
    ctx.fillStyle = '#64748b'
    ctx.font = '10px sans-serif'
    ctx.fillText(channel, 100, 130)
    
    ctx.fillStyle = '#22c55e'
    ctx.font = 'bold 12px sans-serif'
    ctx.fillText('¥' + amount.toFixed(2), 100, 155)
    
    return canvas.toDataURL('image/png')
  }

  const generateRandomAmount = (baseAmount: number) => {
    const random = Math.floor(Math.random() * 10) + 1
    return baseAmount + random / 100
  }

  const generateOrderId = () => {
    const timestamp = Date.now().toString().slice(-6)
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    return `CS${timestamp}${random}`
  }

  const regenerateAmount = () => {
    if (amount && Number(amount) > 0) {
      const newAmount = generateRandomAmount(Number(amount))
      setFinalAmount(newAmount)
      setOrderId(generateOrderId())
      toast.success(`已生成新金额: ¥${newAmount.toFixed(2)}`)
    }
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('已复制')
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'application/pdf']
    if (!validTypes.includes(file.type)) {
      toast.error('请上传 PNG, JPG, JPEG, WEBP 或 PDF 格式')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('文件大小不能超过 5MB')
      return
    }
    setUploadedFile(file)
    const reader = new FileReader()
    reader.onload = (event) => {
      setPreviewUrl(event.target?.result as string)
    }
    reader.readAsDataURL(file)
    toast.success('凭证已上传')
  }

  const handleConfirmAmount = () => {
    if (!amount || Number(amount) <= 0) {
      toast.error('请输入有效的充值金额')
      return
    }
    if (!selectedChannel) {
      toast.error('请选择充值渠道')
      return
    }
    if (Number(amount) < selectedChannel.min) {
      toast.error(`最低充值金额为 ¥${selectedChannel.min}`)
      return
    }
    if (Number(amount) > selectedChannel.max) {
      toast.error(`最高充值金额为 ¥${selectedChannel.max}`)
      return
    }
    const randomAmt = generateRandomAmount(Number(amount))
    setFinalAmount(randomAmt)
    setOrderId(generateOrderId())
    setShowAmountStep(true)
  }

  const handleSubmit = () => {
    if (!finalAmount) return
    if (!uploadedFile && !txnId.trim()) {
      toast.error('请上传转账凭证 或 填写交易流水号')
      return
    }

    // ✅ 立即关闭窗口，不等待任何状态
    setShowRecharge(false)
    setIsProcessing(true)

    const modeText = rechargeMode === 'auto' ? '🔍 自动监控中' : '📋 待审核'
    const descParts = [
      `${rechargeMode === 'auto' ? '自动' : '人工'}充值：${selectedChannel?.name}`,
      `¥${finalAmount.toFixed(2)}`,
      `订单:${orderId}`
    ]
    if (uploadedFile) descParts.push('凭证已上传')
    if (txnId.trim()) descParts.push(`流水:${txnId}`)

    addTransaction({
      id: Date.now().toString(),
      user_id: user?.id || '',
      type: 'recharge',
      points: finalAmount,
      fee: 0,
      points_before: points,
      points_after: points,
      description: descParts.join(' - ') + ` - ${modeText}`,
      status: 'pending',
      created_at: new Date().toISOString()
    })

    if (rechargeMode === 'auto') {
      toast.success('🤖 自动监控已启动！到账后秒到积分')
      toast.info(`💰 ¥${finalAmount.toFixed(2)}，到账积分: ${finalAmount.toFixed(2)}`)
      // 模拟自动到账（2秒后）
      setTimeout(() => {
        const pointsToAdd = finalAmount || 0
        addPoints(pointsToAdd)
        addTransaction({
          id: Date.now().toString(),
          user_id: user?.id || '',
          type: 'recharge',
          points: pointsToAdd,
          fee: 0,
          points_before: points,
          points_after: points + pointsToAdd,
          description: `✅ 自动到账：${selectedChannel?.name} - ¥${finalAmount.toFixed(2)} (订单:${orderId})`,
          status: 'completed',
          created_at: new Date().toISOString()
        })
        toast.success(`✅ ¥${finalAmount.toFixed(2)} 已到账！`)
        toast.success(`🎉 获得 ${pointsToAdd.toFixed(2)} 积分`)
      }, 2000)
    } else {
      toast.success('📋 充值申请已提交！')
      toast.info(`💰 ¥${finalAmount.toFixed(2)}，等待管理员审核`)
    }

    // ✅ 重置表单
    resetForm()
    setIsProcessing(false)
  }

  const resetForm = () => {
    setAmount('')
    setSelectedChannel(null)
    setUploadedFile(null)
    setPreviewUrl(null)
    setTxnId('')
    setFinalAmount(null)
    setShowAmountStep(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const canSubmit = () => {
    return uploadedFile !== null || txnId.trim() !== ''
  }

  const getQrCode = () => {
    if (!selectedChannel || !finalAmount) return ''
    return generateQrDataUrl(selectedChannel.name, finalAmount, orderId)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">积分钱包</h1>
          <p className="text-muted text-sm">积分管理和充值</p>
        </div>
        <div className="flex gap-2">
          <Button variant="green" size="sm" onClick={() => { resetForm(); setShowRecharge(true) }}>
            <CreditCard size={16} className="mr-2" />充值
          </Button>
          <Button variant="primary" size="sm" onClick={() => setShowTransfer(true)}>
            <Send size={16} className="mr-2" />转账
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-muted">总积分</p><p className="text-3xl font-bold text-blue">{points.toFixed(2)}</p></div>
            <div className="p-3 rounded-xl bg-blue/10 text-blue"><Coins size={28} /></div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-muted">交易次数</p><p className="text-3xl font-bold text-purple">{transactions.length}</p></div>
            <div className="p-3 rounded-xl bg-purple/10 text-purple"><RefreshCw size={28} /></div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-muted">可用积分</p><p className="text-3xl font-bold text-green">{points.toFixed(2)}</p></div>
            <div className="p-3 rounded-xl bg-green/10 text-green"><Coins size={28} /></div>
          </div>
        </Card>
      </div>

      <Card title="交易记录">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-border">
              <th className="text-left text-xs font-bold text-muted uppercase py-3 px-4">时间</th>
              <th className="text-left text-xs font-bold text-muted uppercase py-3 px-4">类型</th>
              <th className="text-left text-xs font-bold text-muted uppercase py-3 px-4">积分</th>
              <th className="text-left text-xs font-bold text-muted uppercase py-3 px-4">状态</th>
              <th className="text-left text-xs font-bold text-muted uppercase py-3 px-4">说明</th>
            </tr></thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-muted">暂无交易</td></tr>
              ) : (
                transactions.slice(0, 10).map((t, i) => (
                  <tr key={i} className="border-b border-border/50 hover:bg-panel/50">
                    <td className="py-3 px-4 text-sm text-muted">{t.created_at?.slice(0, 16).replace('T', ' ') || '-'}</td>
                    <td className="py-3 px-4">
                      <Badge variant={
                        t.type === 'recharge' ? 'green' : 
                        t.type === 'transfer_out' ? 'orange' : 'blue'
                      }>
                        {t.type === 'recharge' && t.status === 'pending' && t.description?.includes('自动') ? '⏳ 监控中' : 
                         t.type === 'recharge' && t.status === 'pending' ? '📋 待审核' : 
                         t.type === 'recharge' && t.status === 'completed' ? '✅ 充值' : t.type}
                      </Badge>
                    </td>
                    <td className={`py-3 px-4 font-medium ${t.points > 0 ? 'text-green' : 'text-red'}`}>
                      {t.points > 0 ? '+' : ''}{t.points.toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={t.status === 'completed' ? 'green' : t.status === 'pending' ? 'orange' : 'red'}>
                        {t.status === 'completed' ? '✅ 已完成' : t.status === 'pending' ? '⏳ 处理中' : '❌ 失败'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted">{t.description || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ===== 充值弹窗 ===== */}
      {showRecharge && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur flex items-center justify-center p-4 overflow-y-auto" onClick={() => { setShowRecharge(false); resetForm(); }}>
          <div className="w-full max-w-lg bg-panel border border-border rounded-2xl p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">
                {showAmountStep ? '确认支付' : '充值积分'}
              </h2>
              <button 
                onClick={() => { setShowRecharge(false); resetForm(); }} 
                className="text-muted hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {!showAmountStep ? (
              <div className="space-y-4">
                <div className="flex gap-2 p-1 rounded-xl bg-panel/50 border border-border">
                  <button
                    onClick={() => setRechargeMode('auto')}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                      rechargeMode === 'auto' ? 'bg-blue text-white' : 'text-muted hover:text-white'
                    }`}
                  >
                    <Zap size={16} /> 自动到账
                  </button>
                  <button
                    onClick={() => setRechargeMode('manual')}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                      rechargeMode === 'manual' ? 'bg-orange text-white' : 'text-muted hover:text-white'
                    }`}
                  >
                    <Clock size={16} /> 人工审核
                  </button>
                </div>

                <div className={`p-2 rounded-lg text-xs ${rechargeMode === 'auto' ? 'bg-green/10 text-green' : 'bg-orange/10 text-orange'}`}>
                  {rechargeMode === 'auto' 
                    ? '🤖 自动到账：提交后自动监控，到账秒到积分' 
                    : '📋 人工审核：提交凭证，由管理员审核到账'}
                </div>

                <div>
                  <label className="text-sm font-bold text-muted block mb-2">选择充值渠道</label>
                  <div className="space-y-2">
                    {channels.map(c => (
                      <button
                        key={c.id}
                        onClick={() => setSelectedChannel(c)}
                        className={`w-full text-left p-3 rounded-xl border transition-all ${
                          selectedChannel?.id === c.id 
                            ? 'border-sky/50 bg-blue/20' 
                            : 'border-border bg-panel/50 hover:border-sky/30'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-bold text-white">{c.icon} {c.name}</div>
                            <div className="text-xs text-muted">限额 ¥{c.min} - ¥{c.max}</div>
                            {c.hasQr && <span className="text-xs text-green">📱 支持扫码</span>}
                          </div>
                          {selectedChannel?.id === c.id && <CheckCircle size={20} className="text-sky" />}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <Input 
                  label="充值金额 (¥)" 
                  type="number" 
                  placeholder="请输入要充值的金额" 
                  value={amount} 
                  onChange={(e) => setAmount(e.target.value)} 
                />
                <p className="text-xs text-muted -mt-2">💡 系统将自动生成 0.01~0.10 的零头</p>

                <Button 
                  variant="primary" 
                  className="w-full" 
                  onClick={handleConfirmAmount}
                  disabled={!selectedChannel || !amount || Number(amount) <= 0}
                >
                  生成支付订单
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* 二维码 + 收款信息 */}
                <div className="p-4 rounded-xl bg-blue/10 border border-sky/30">
                  <p className="text-sm font-bold text-sky mb-3 text-center">📱 扫码或转账支付</p>
                  
                  <div className="flex justify-center mb-3">
                    <div className="p-2 bg-white rounded-xl shadow-lg">
                      {selectedChannel?.hasQr ? (
                        <img 
                          src={getQrCode()} 
                          alt="收款二维码" 
                          className="w-40 h-40 object-contain"
                        />
                      ) : (
                        <div className="w-40 h-40 flex flex-col items-center justify-center bg-gray-100 rounded-lg">
                          <QrCode size={48} className="text-gray-400" />
                          <p className="text-xs text-gray-400 mt-2">转账支付</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted">渠道</span>
                      <span className="text-white font-bold">{selectedChannel?.icon} {selectedChannel?.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted">收款账户</span>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-mono text-xs">{selectedChannel?.account}</span>
                        <button onClick={() => handleCopy(selectedChannel?.account || '')} className="text-muted hover:text-white"><Copy size={14} /></button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted">户名</span>
                      <span className="text-white">{selectedChannel?.accountName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted">金额</span>
                      <span className="text-green font-bold">¥{finalAmount?.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted">备注</span>
                      <span className="text-white text-xs font-mono">{orderId}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted">到账积分</span>
                      <span className="text-blue font-bold">+{finalAmount?.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted">模式</span>
                      <Badge variant={rechargeMode === 'auto' ? 'green' : 'orange'}>
                        {rechargeMode === 'auto' ? '🤖 自动到账' : '📋 人工审核'}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* 上传凭证 */}
                <div className="p-4 rounded-xl bg-panel/50 border border-border">
                  <p className="text-sm font-bold text-muted mb-2">📎 上传凭证 或 填写流水号（二选一）</p>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp,application/pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="receiptUpload"
                  />
                  <label 
                    htmlFor="receiptUpload" 
                    className={`flex items-center justify-center gap-2 w-full px-4 py-2 rounded-xl border border-dashed cursor-pointer transition-all ${
                      uploadedFile ? 'border-green/30 bg-green/10' : 'border-border bg-panel/70 hover:border-sky/30'
                    }`}
                  >
                    <Upload size={16} className={uploadedFile ? 'text-green' : 'text-muted'} />
                    <span className={`text-sm ${uploadedFile ? 'text-green' : 'text-muted'}`}>
                      {uploadedFile ? uploadedFile.name : '点击上传凭证'}
                    </span>
                  </label>
                  
                  {previewUrl && (
                    <div className="mt-2 p-2 rounded-lg bg-panel/50 border border-border">
                      <img src={previewUrl} alt="凭证预览" className="max-h-32 rounded-lg object-contain mx-auto" />
                    </div>
                  )}

                  <div className="flex items-center gap-2 my-2">
                    <div className="flex-1 border-t border-border" />
                    <span className="text-xs text-muted">或</span>
                    <div className="flex-1 border-t border-border" />
                  </div>

                  <Input 
                    label="交易流水号" 
                    placeholder="请输入转账流水号" 
                    value={txnId} 
                    onChange={(e) => setTxnId(e.target.value)} 
                  />

                  <div className={`mt-2 p-2 rounded-lg text-xs ${canSubmit() ? 'bg-green/10 text-green' : 'bg-orange/10 text-orange'}`}>
                    {canSubmit() 
                      ? '✅ 凭证或流水号已填写，可以提交' 
                      : '⚠️ 请上传凭证 或 填写流水号'}
                  </div>
                </div>

                <Button 
                  variant="primary" 
                  className="w-full" 
                  onClick={handleSubmit}
                  disabled={!canSubmit()}
                >
                  {rechargeMode === 'auto' ? '🤖 提交并自动监控' : '📋 提交审核'}
                </Button>
                <p className="text-xs text-muted text-center">
                  {rechargeMode === 'auto' 
                    ? '提交后自动监控，到账秒到积分' 
                    : '提交后等待管理员审核'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== 转账弹窗 ===== */}
      {showTransfer && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur flex items-center justify-center p-4" onClick={() => setShowTransfer(false)}>
          <div className="w-full max-w-md bg-panel border border-border rounded-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">转账积分</h2>
              <button onClick={() => setShowTransfer(false)} className="text-muted hover:text-white"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <Input label="收款人" placeholder="输入用户名或邮箱" value={recipient} onChange={(e) => setRecipient(e.target.value)} />
              <Input label="积分数量" type="number" placeholder="请输入数量" value={amount} onChange={(e) => setAmount(e.target.value)} />
              <Input label="备注" placeholder="可选备注" value={note} onChange={(e) => setNote(e.target.value)} />
              <div className="p-3 rounded-xl bg-panel/50 border border-border">
                <div className="flex justify-between"><span className="text-sm text-muted">当前积分</span><span className="text-white font-bold">{points.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-sm text-muted">手续费</span><span className="text-orange">0</span></div>
                <div className="flex justify-between border-t border-border pt-2"><span className="text-sm text-muted">转出后</span><span className="text-white font-bold">{(points - (Number(amount) || 0)).toFixed(2)}</span></div>
              </div>
              <div className="flex gap-3">
                <Button variant="primary" className="flex-1" onClick={() => {
                  if (!recipient || !amount || Number(amount) <= 0) {
                    toast.error('请填写完整信息')
                    return
                  }
                  if (Number(amount) > points) {
                    toast.error('积分不足')
                    return
                  }
                  addPoints(-Number(amount))
                  addTransaction({
                    id: Date.now().toString(),
                    user_id: user?.id || '',
                    type: 'transfer_out',
                    points: Number(amount),
                    fee: 0,
                    points_before: points,
                    points_after: points - Number(amount),
                    description: `转账给 ${recipient}${note ? ' - ' + note : ''}`,
                    status: 'completed',
                    created_at: new Date().toISOString()
                  })
                  toast.success(`✅ 转账成功：${amount} 积分 → ${recipient}`)
                  setShowTransfer(false)
                  setAmount('')
                  setRecipient('')
                  setNote('')
                }}>确认转账</Button>
                <Button variant="ghost" className="flex-1" onClick={() => setShowTransfer(false)}>取消</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
