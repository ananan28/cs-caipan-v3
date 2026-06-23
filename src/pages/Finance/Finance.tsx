import { useState } from 'react'
import { Card } from '@/components/Common/Card'
import { Badge } from '@/components/Common/Badge'
import { Button } from '@/components/Common/Button'
import { Input } from '@/components/Forms/Input'
import { 
  TrendingUp, TrendingDown, DollarSign, PieChart, Download, 
  CheckCircle, XCircle, Clock, Users, Search, RefreshCw,
  Eye, Check, X, AlertTriangle, FileText, Wallet, Plus,
  CreditCard, Smartphone, Banknote, Save, Edit, Trash2,
  Copy, QrCode, Building, Landmark, Image
} from 'lucide-react'
import toast from 'react-hot-toast'

export const Finance = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [showAddChannel, setShowAddChannel] = useState(false)
  const [showAccountDetail, setShowAccountDetail] = useState(false)
  const [selectedChannel, setSelectedChannel] = useState<any>(null)

  const [channels, setChannels] = useState([
    { 
      id: 1, 
      name: 'USDT (TRC20)', 
      type: '加密货币', 
      fee: 1, 
      min: 10, 
      max: 10000, 
      enabled: true,
      account: 'TXYZ1234567890ABCDEF',
      accountName: '财盛集团',
      bank: 'TRC20网络',
      qrCode: ''
    },
    { 
      id: 2, 
      name: '支付宝', 
      type: '第三方支付', 
      fee: 0.5, 
      min: 1, 
      max: 5000, 
      enabled: true,
      account: '13800138000',
      accountName: '财盛集团',
      bank: '支付宝',
      qrCode: ''
    },
    { 
      id: 3, 
      name: '微信支付', 
      type: '第三方支付', 
      fee: 0.5, 
      min: 1, 
      max: 5000, 
      enabled: true,
      account: 'wxid_123456789',
      accountName: '财盛集团',
      bank: '微信支付',
      qrCode: ''
    },
  ])

  const [newChannel, setNewChannel] = useState({
    name: '', type: '', fee: '', min: '', max: '', enabled: true,
    account: '', accountName: '', bank: '', qrCode: ''
  })

  const [pendingRecharges, setPendingRecharges] = useState([
    { id: 1, user: 'user@example.com', amount: 100, method: 'USDT (TRC20)', time: '2025-06-22 14:30', status: 'pending', note: 'USDT转账', txid: '0xabc123...' },
    { id: 2, user: 'admin@cs.com', amount: 500, method: '支付宝', time: '2025-06-22 13:20', status: 'pending', note: '支付宝转账', txid: '202506221320001' },
  ])

  const [rechargeHistory, setRechargeHistory] = useState([
    { id: 3, user: 'user@example.com', amount: 300, method: 'USDT (TRC20)', time: '2025-06-21 16:30', status: 'approved' },
  ])

  // ✅ 导出功能 - 直接下载CSV
  const handleExport = () => {
    try {
      // 准备数据
      const data = [
        ['时间', '用户', '类型', '金额', '方式', '状态'],
        ...pendingRecharges.map(r => [
          r.time,
          r.user,
          '充值',
          r.amount,
          r.method,
          r.status
        ]),
        ...rechargeHistory.map(r => [
          r.time,
          r.user,
          '充值',
          r.amount,
          r.method,
          r.status
        ])
      ]

      // 生成CSV内容
      let csv = ''
      data.forEach(row => {
        csv += row.join(',') + '\n'
      })

      // 创建下载
      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `财务数据_${new Date().toISOString().slice(0, 10)}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      toast.success('✅ 财务报表已导出')
    } catch (error) {
      toast.error('导出失败，请重试')
    }
  }

  const handleAddChannel = () => {
    if (!newChannel.name || !newChannel.type || !newChannel.fee || !newChannel.account) {
      toast.error('请填写完整信息')
      return
    }
    setChannels([...channels, {
      id: Date.now(),
      name: newChannel.name,
      type: newChannel.type,
      fee: Number(newChannel.fee),
      min: Number(newChannel.min) || 0,
      max: Number(newChannel.max) || 99999,
      enabled: newChannel.enabled,
      account: newChannel.account,
      accountName: newChannel.accountName || '财盛集团',
      bank: newChannel.bank || newChannel.type,
      qrCode: newChannel.qrCode || '',
    }])
    toast.success(`✅ 充值渠道 ${newChannel.name} 已添加`)
    setShowAddChannel(false)
    setNewChannel({ name: '', type: '', fee: '', min: '', max: '', enabled: true, account: '', accountName: '', bank: '', qrCode: '' })
  }

  const handleToggleChannel = (id: number) => {
    setChannels(channels.map(c => 
      c.id === id ? { ...c, enabled: !c.enabled } : c
    ))
    const channel = channels.find(c => c.id === id)
    toast.success(`✅ ${channel?.name} 已${channel?.enabled ? '停用' : '启用'}`)
  }

  const handleDeleteChannel = (id: number, name: string) => {
    if (confirm(`⚠️ 确定要删除充值渠道 "${name}" 吗？`)) {
      setChannels(channels.filter(c => c.id !== id))
      toast.success(`✅ 充值渠道 "${name}" 已删除`)
    }
  }

  const handleViewAccount = (channel: any) => {
    setSelectedChannel(channel)
    setShowAccountDetail(true)
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('已复制到剪贴板')
  }

  const handleApprove = (id: number) => {
    const item = pendingRecharges.find(r => r.id === id)
    if (!item) return
    setPendingRecharges(prev => prev.filter(r => r.id !== id))
    setRechargeHistory(prev => [{ ...item, status: 'approved', time: new Date().toISOString().slice(0, 16).replace('T', ' ') }, ...prev])
    toast.success(`✅ 充值 ¥${item.amount} 已通过`)
  }

  const handleReject = (id: number) => {
    const item = pendingRecharges.find(r => r.id === id)
    if (!item) return
    setPendingRecharges(prev => prev.filter(r => r.id !== id))
    setRechargeHistory(prev => [{ ...item, status: 'rejected', time: new Date().toISOString().slice(0, 16).replace('T', ' ') }, ...prev])
    toast.error(`❌ 充值 ¥${item.amount} 已拒绝`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white">财务管理</h1><p className="text-muted text-sm">充值审核、渠道管理、收款账户</p></div>
        <Button variant="ghost" onClick={handleExport}>
          <Download size={18} className="mr-2" />导出报表
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setActiveTab('overview')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'overview' ? 'bg-blue text-white' : 'bg-panel/50 text-muted hover:text-white'}`}>📊 总览</button>
        <button onClick={() => setActiveTab('channels')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'channels' ? 'bg-blue text-white' : 'bg-panel/50 text-muted hover:text-white'}`}>🏦 充值渠道</button>
        <button onClick={() => setActiveTab('recharge')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'recharge' ? 'bg-blue text-white' : 'bg-panel/50 text-muted hover:text-white'}`}>💰 充值审核 <Badge variant="red" className="ml-1">{pendingRecharges.length}</Badge></button>
        <button onClick={() => setActiveTab('history')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-blue text-white' : 'bg-panel/50 text-muted hover:text-white'}`}>📋 审核记录</button>
      </div>

      {/* 总览 */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card title="今日财务概况">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-panel/50"><span className="text-muted">今日充值</span><span className="text-green font-bold">¥1,200</span></div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-panel/50"><span className="text-muted">今日消耗</span><span className="text-orange font-bold">¥680</span></div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-panel/50"><span className="text-muted">平台收入</span><span className="text-purple font-bold">¥520</span></div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-panel/50 border-t border-border pt-3"><span className="text-sm font-bold text-white">待审核</span><span className="text-blue font-bold">{pendingRecharges.length} 笔</span></div>
            </div>
          </Card>
          <Card title="充值渠道">
            <div className="space-y-2">
              {channels.filter(c => c.enabled).map(c => (
                <div key={c.id} className="flex items-center justify-between p-2 rounded-xl bg-panel/50">
                  <span className="text-white text-sm">{c.name}</span>
                  <span className="text-xs text-muted">费率 {c.fee}%</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* 充值渠道 */}
      {activeTab === 'channels' && (
        <div className="space-y-4">
          <Card title="充值渠道管理" subtitle="管理充值方式和收款账户">
            <div className="flex justify-end mb-4">
              <Button variant="primary" size="sm" onClick={() => setShowAddChannel(true)}><Plus size={16} className="mr-1" />添加渠道</Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-border">
                  <th className="text-left text-xs font-bold text-muted uppercase py-3 px-4">渠道名称</th>
                  <th className="text-left text-xs font-bold text-muted uppercase py-3 px-4">收款账户</th>
                  <th className="text-left text-xs font-bold text-muted uppercase py-3 px-4">费率</th>
                  <th className="text-left text-xs font-bold text-muted uppercase py-3 px-4">限额</th>
                  <th className="text-left text-xs font-bold text-muted uppercase py-3 px-4">状态</th>
                  <th className="text-left text-xs font-bold text-muted uppercase py-3 px-4">操作</th>
                </tr></thead>
                <tbody>
                  {channels.map(c => (
                    <tr key={c.id} className="border-b border-border/50 hover:bg-panel/50">
                      <td className="py-3 px-4 text-white font-medium">{c.name}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted font-mono">{c.account}</span>
                          <button onClick={() => handleCopy(c.account)} className="p-1 rounded hover:bg-panel/50"><Copy size={14} className="text-muted" /></button>
                          <button onClick={() => handleViewAccount(c)} className="p-1 rounded hover:bg-blue/10"><Eye size={14} className="text-blue" /></button>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-white">{c.fee}%</td>
                      <td className="py-3 px-4 text-sm text-muted">¥{c.min} - ¥{c.max}</td>
                      <td className="py-3 px-4"><Badge variant={c.enabled ? 'green' : 'red'}>{c.enabled ? '启用' : '停用'}</Badge></td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleToggleChannel(c.id)} className={`p-1.5 rounded-lg transition-all ${c.enabled ? 'hover:bg-orange/10 text-orange' : 'hover:bg-green/10 text-green'}`}>
                            {c.enabled ? <X size={16} /> : <Check size={16} />}
                          </button>
                          <button onClick={() => handleDeleteChannel(c.id, c.name)} className="p-1.5 rounded-lg hover:bg-red/10 text-red">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card title="📋 用户充值流程">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div className="p-4 rounded-xl bg-panel/50">
                <div className="text-2xl font-bold text-blue mb-2">1</div>
                <p className="text-white font-bold">选择渠道</p>
                <p className="text-xs text-muted">选择支持的充值方式</p>
              </div>
              <div className="p-4 rounded-xl bg-panel/50">
                <div className="text-2xl font-bold text-blue mb-2">2</div>
                <p className="text-white font-bold">转账到指定账户</p>
                <p className="text-xs text-muted">按收款账户信息转账</p>
              </div>
              <div className="p-4 rounded-xl bg-panel/50">
                <div className="text-2xl font-bold text-blue mb-2">3</div>
                <p className="text-white font-bold">提交充值申请</p>
                <p className="text-xs text-muted">填写金额和交易凭证</p>
              </div>
              <div className="p-4 rounded-xl bg-panel/50">
                <div className="text-2xl font-bold text-blue mb-2">4</div>
                <p className="text-white font-bold">等待审核</p>
                <p className="text-xs text-muted">审核通过后积分到账</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* 充值审核 */}
      {activeTab === 'recharge' && (
        <Card title="待审核充值" subtitle={`共 ${pendingRecharges.length} 笔待审核`}>
          {pendingRecharges.length === 0 ? (
            <div className="text-center py-8"><CheckCircle size={48} className="mx-auto text-green mb-3" /><p className="text-white font-bold">暂无待审核充值</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-border">
                  <th className="text-left text-xs font-bold text-muted uppercase py-3 px-4">用户</th>
                  <th className="text-left text-xs font-bold text-muted uppercase py-3 px-4">金额</th>
                  <th className="text-left text-xs font-bold text-muted uppercase py-3 px-4">方式</th>
                  <th className="text-left text-xs font-bold text-muted uppercase py-3 px-4">交易ID</th>
                  <th className="text-left text-xs font-bold text-muted uppercase py-3 px-4">时间</th>
                  <th className="text-left text-xs font-bold text-muted uppercase py-3 px-4">操作</th>
                </tr></thead>
                <tbody>
                  {pendingRecharges.map(r => (
                    <tr key={r.id} className="border-b border-border/50 hover:bg-panel/50">
                      <td className="py-3 px-4 text-white">{r.user}</td>
                      <td className="py-3 px-4 text-green font-bold">¥{r.amount}</td>
                      <td className="py-3 px-4"><Badge variant="blue">{r.method}</Badge></td>
                      <td className="py-3 px-4 text-sm font-mono text-muted">{r.txid}</td>
                      <td className="py-3 px-4 text-sm text-muted">{r.time}</td>
                      <td className="py-3 px-4"><div className="flex gap-2">
                        <button onClick={() => handleApprove(r.id)} className="px-3 py-1.5 rounded-lg bg-green/20 text-green text-sm font-bold hover:bg-green/30">通过</button>
                        <button onClick={() => handleReject(r.id)} className="px-3 py-1.5 rounded-lg bg-red/20 text-red text-sm font-bold hover:bg-red/30">拒绝</button>
                      </div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* 审核记录 */}
      {activeTab === 'history' && (
        <Card title="审核记录">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-border">
                <th className="text-left text-xs font-bold text-muted uppercase py-3 px-4">用户</th>
                <th className="text-left text-xs font-bold text-muted uppercase py-3 px-4">金额</th>
                <th className="text-left text-xs font-bold text-muted uppercase py-3 px-4">方式</th>
                <th className="text-left text-xs font-bold text-muted uppercase py-3 px-4">状态</th>
                <th className="text-left text-xs font-bold text-muted uppercase py-3 px-4">时间</th>
              </tr></thead>
              <tbody>
                {rechargeHistory.map(r => (
                  <tr key={r.id} className="border-b border-border/50 hover:bg-panel/50">
                    <td className="py-3 px-4 text-white">{r.user}</td>
                    <td className="py-3 px-4 font-bold text-white">¥{r.amount}</td>
                    <td className="py-3 px-4"><Badge variant="blue">{r.method}</Badge></td>
                    <td className="py-3 px-4"><Badge variant={r.status === 'approved' ? 'green' : 'red'}>{r.status === 'approved' ? '✅ 已通过' : '❌ 已拒绝'}</Badge></td>
                    <td className="py-3 px-4 text-sm text-muted">{r.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* 添加渠道弹窗 */}
      {showAddChannel && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur flex items-center justify-center p-4 overflow-y-auto" onClick={() => setShowAddChannel(false)}>
          <div className="w-full max-w-lg bg-panel border border-border rounded-2xl p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-white mb-4">添加充值渠道</h2>
            <div className="space-y-4">
              <Input label="渠道名称" placeholder="如 USDT (TRC20)" value={newChannel.name} onChange={(e) => setNewChannel({...newChannel, name: e.target.value})} />
              <Input label="类型" placeholder="如 加密货币 / 支付宝" value={newChannel.type} onChange={(e) => setNewChannel({...newChannel, type: e.target.value})} />
              
              <div className="border-t border-border pt-4">
                <p className="text-sm font-bold text-white mb-3">💰 收款账户信息</p>
                <Input label="收款账号/地址" placeholder="输入收款账号或钱包地址" value={newChannel.account} onChange={(e) => setNewChannel({...newChannel, account: e.target.value})} />
                <Input label="收款户名" placeholder="如 财盛集团" value={newChannel.accountName} onChange={(e) => setNewChannel({...newChannel, accountName: e.target.value})} />
                <Input label="银行/网络" placeholder="如 TRC20 / 支付宝" value={newChannel.bank} onChange={(e) => setNewChannel({...newChannel, bank: e.target.value})} />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Input label="手续费率 (%)" type="number" placeholder="1" value={newChannel.fee} onChange={(e) => setNewChannel({...newChannel, fee: e.target.value})} />
                <Input label="最低限额" type="number" placeholder="10" value={newChannel.min} onChange={(e) => setNewChannel({...newChannel, min: e.target.value})} />
                <Input label="最高限额" type="number" placeholder="10000" value={newChannel.max} onChange={(e) => setNewChannel({...newChannel, max: e.target.value})} />
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
                  <input type="checkbox" checked={newChannel.enabled} onChange={(e) => setNewChannel({...newChannel, enabled: e.target.checked})} className="w-4 h-4 accent-blue" />
                  立即启用
                </label>
              </div>

              <div className="flex gap-3">
                <Button variant="primary" className="flex-1" onClick={handleAddChannel}><Save size={16} className="mr-1" />添加</Button>
                <Button variant="ghost" className="flex-1" onClick={() => setShowAddChannel(false)}>取消</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 收款账户详情弹窗 */}
      {showAccountDetail && selectedChannel && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur flex items-center justify-center p-4" onClick={() => setShowAccountDetail(false)}>
          <div className="w-full max-w-md bg-panel border border-border rounded-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-white mb-4">收款账户详情</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-panel/50">
                <span className="text-muted">渠道</span>
                <span className="text-white font-bold">{selectedChannel.name}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-panel/50">
                <span className="text-muted">收款账户</span>
                <span className="text-white font-mono text-sm">{selectedChannel.account}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-panel/50">
                <span className="text-muted">户名</span>
                <span className="text-white">{selectedChannel.accountName || '财盛集团'}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-panel/50">
                <span className="text-muted">银行/网络</span>
                <span className="text-white">{selectedChannel.bank || selectedChannel.type}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-panel/50">
                <span className="text-muted">费率</span>
                <span className="text-white">{selectedChannel.fee}%</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-panel/50">
                <span className="text-muted">限额</span>
                <span className="text-white">¥{selectedChannel.min} - ¥{selectedChannel.max}</span>
              </div>
              <div className="flex gap-2 mt-2">
                <Button variant="primary" className="flex-1" onClick={() => handleCopy(selectedChannel.account)}><Copy size={16} className="mr-1" />复制账户</Button>
                <Button variant="ghost" className="flex-1" onClick={() => setShowAccountDetail(false)}>关闭</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
