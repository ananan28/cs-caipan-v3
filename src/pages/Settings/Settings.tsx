import { useState } from 'react'
import { Card } from '@/components/Common/Card'
import { Badge } from '@/components/Common/Badge'
import { Button } from '@/components/Common/Button'
import { Input } from '@/components/Forms/Input'
import { useDetectionStore } from '@/store/detectionStore'
import { 
  Settings as SettingsIcon, Shield, DollarSign, RefreshCw, Save, 
  Users, Wallet, Zap, Globe, Lock, Bell, 
  Database, Server, Cloud, AlertTriangle, CheckCircle,
  UserCog, TrendingUp, PieChart, Sliders, Gift,
  Smartphone, Key, Mail, Phone, MapPin, CreditCard,
  Bitcoin, Landmark, Coins, Edit2, Check, X, ChevronDown, ChevronRight
} from 'lucide-react'
import toast from 'react-hot-toast'

export const Settings = () => {
  const { platforms, updatePlatformPrice, resetToDefault } = useDetectionStore()
  const [activeTab, setActiveTab] = useState('general')
  const [expandedPlatform, setExpandedPlatform] = useState<string | null>('WhatsApp')
  const [editingPrice, setEditingPrice] = useState<{ platformId: string; itemId: string } | null>(null)
  const [priceValue, setPriceValue] = useState('')

  const [systemName, setSystemName] = useState('财盛集团')
  const [systemVersion, setSystemVersion] = useState('V3.0.0')
  const [timezone, setTimezone] = useState('Asia/Shanghai')
  const [language, setLanguage] = useState('zh')

  const [transferRate, setTransferRate] = useState('1')
  const [minFee, setMinFee] = useState('0.5')
  const [maxFee, setMaxFee] = useState('50')
  const [dailyLimit, setDailyLimit] = useState('10000')
  const [singleLimit, setSingleLimit] = useState('1000')
  const [feePayer, setFeePayer] = useState('sender')

  const [rechargeFees, setRechargeFees] = useState({
    usdt: { rate: '1', min: '10', max: '10000' },
    alipay: { rate: '0.5', min: '1', max: '5000' },
    wechat: { rate: '0.5', min: '1', max: '5000' },
    bank: { rate: '0', min: '100', max: '50000' },
  })

  const [exchangeRates, setExchangeRates] = useState({
    usdt: '100',
    alipay: '1',
    wechat: '1',
    bank: '1',
  })

  const [invitePoints, setInvitePoints] = useState('100')
  const [inviteBonusPoints, setInviteBonusPoints] = useState('50')
  const [smtpHost, setSmtpHost] = useState('smtp.gmail.com')
  const [smtpPort, setSmtpPort] = useState('587')
  const [smtpUser, setSmtpUser] = useState('noreply@cs.com')

  const handleSave = (section: string) => {
    toast.success(`✅ ${section} 设置已保存`)
  }

  const handleRechargeFeeChange = (key: string, field: string, value: string) => {
    setRechargeFees(prev => ({
      ...prev,
      [key]: { ...prev[key as keyof typeof prev], [field]: value }
    }))
  }

  const handleRateChange = (key: string, value: string) => {
    setExchangeRates(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handlePriceEdit = (platformId: string, itemId: string, currentPrice: number) => {
    setEditingPrice({ platformId, itemId })
    setPriceValue(String(currentPrice))
  }

  const handlePriceSave = (platformId: string, itemId: string) => {
    const price = parseFloat(priceValue)
    if (isNaN(price) || price < 0) {
      toast.error('请输入有效价格')
      return
    }
    updatePlatformPrice(platformId, itemId, price)
    setEditingPrice(null)
    toast.success('✅ 价格已更新')
  }

  const handleResetPrices = () => {
    if (confirm('确定要重置所有平台价格为默认值吗？')) {
      resetToDefault()
      toast.success('✅ 已重置为默认价格')
    }
  }

  const togglePlatform = (platformId: string) => {
    setExpandedPlatform(expandedPlatform === platformId ? null : platformId)
  }

  const handleClearCache = () => {
    toast.loading('正在清除缓存...')
    setTimeout(() => { toast.dismiss(); toast.success('✅ 缓存已清除') }, 1500)
  }

  const handleRebuildIndex = () => {
    toast.loading('正在重建索引...')
    setTimeout(() => { toast.dismiss(); toast.success('✅ 索引已重建') }, 2000)
  }

  const handleBackup = () => {
    toast.loading('正在备份数据...')
    setTimeout(() => { toast.dismiss(); toast.success('✅ 数据备份完成') }, 3000)
  }

  const handleRestart = () => {
    if (confirm('⚠️ 确认要重启系统吗？')) {
      toast.loading('系统重启中...')
      setTimeout(() => { toast.dismiss(); toast.success('✅ 系统已重启') }, 3000)
    }
  }

  const platformIcons: Record<string, string> = {
    WhatsApp: '💬',
    Telegram: '✈️',
    Signal: '🔒',
    LINE: '💚',
    Viber: '📱',
    Zalo: '💛',
    Facebook: '👍',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">系统设置</h1>
          <p className="text-muted text-sm">全面管理系统配置</p>
        </div>
        <Button variant="primary" onClick={() => handleSave('全部')}>
          <Save size={18} className="mr-2" />保存全部
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setActiveTab('general')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'general' ? 'bg-blue text-white' : 'bg-panel/50 text-muted hover:text-white'}`}>⚙️ 通用</button>
        <button onClick={() => setActiveTab('transfer')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'transfer' ? 'bg-blue text-white' : 'bg-panel/50 text-muted hover:text-white'}`}>💸 转账</button>
        <button onClick={() => setActiveTab('recharge')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'recharge' ? 'bg-blue text-white' : 'bg-panel/50 text-muted hover:text-white'}`}>💳 充值手续费</button>
        <button onClick={() => setActiveTab('exchange')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'exchange' ? 'bg-blue text-white' : 'bg-panel/50 text-muted hover:text-white'}`}>💱 汇率</button>
        <button onClick={() => setActiveTab('invite')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'invite' ? 'bg-blue text-white' : 'bg-panel/50 text-muted hover:text-white'}`}>🎁 邀请</button>
        <button onClick={() => setActiveTab('prices')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'prices' ? 'bg-blue text-white' : 'bg-panel/50 text-muted hover:text-white'}`}>💰 平台价格</button>
        <button onClick={() => setActiveTab('email')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'email' ? 'bg-blue text-white' : 'bg-panel/50 text-muted hover:text-white'}`}>📧 邮件</button>
        <button onClick={() => setActiveTab('security')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'security' ? 'bg-blue text-white' : 'bg-panel/50 text-muted hover:text-white'}`}>🔐 安全</button>
        <button onClick={() => setActiveTab('system')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'system' ? 'bg-blue text-white' : 'bg-panel/50 text-muted hover:text-white'}`}>🖥️ 系统</button>
      </div>

      {activeTab === 'general' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card title="基本设置">
            <div className="space-y-4">
              <Input label="系统名称" value={systemName} onChange={(e) => setSystemName(e.target.value)} />
              <Input label="系统版本" value={systemVersion} disabled />
              <Input label="时区" value={timezone} onChange={(e) => setTimezone(e.target.value)} />
              <div><label className="text-sm font-bold text-muted block mb-1.5">语言</label>
                <select className="w-full bg-panel/50 border border-border rounded-xl text-white px-4 py-2.5 outline-none" value={language} onChange={(e) => setLanguage(e.target.value)}>
                  <option value="zh">简体中文</option><option value="en">English</option>
                </select>
              </div>
              <Button variant="primary" className="w-full" onClick={() => handleSave('通用')}>保存通用设置</Button>
            </div>
          </Card>
          <Card title="系统状态">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-panel/50"><span className="text-muted">运行状态</span><Badge variant="green">✅ 正常运行</Badge></div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-panel/50"><span className="text-muted">数据库</span><Badge variant="green">已连接</Badge></div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-panel/50"><span className="text-muted">缓存</span><Badge variant="green">正常</Badge></div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-panel/50"><span className="text-muted">最后更新</span><span className="text-white">2025-06-22 14:30</span></div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'transfer' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card title="转账手续费设置">
            <div className="space-y-4">
              <Input label="转账费率 (%)" type="number" value={transferRate} onChange={(e) => setTransferRate(e.target.value)} />
              <Input label="最低手续费" type="number" value={minFee} onChange={(e) => setMinFee(e.target.value)} />
              <Input label="最高手续费" type="number" value={maxFee} onChange={(e) => setMaxFee(e.target.value)} />
              <div><label className="text-sm font-bold text-muted block mb-1.5">手续费承担方</label>
                <select className="w-full bg-panel/50 border border-border rounded-xl text-white px-4 py-2.5 outline-none" value={feePayer} onChange={(e) => setFeePayer(e.target.value)}>
                  <option value="sender">发送方承担</option><option value="receiver">接收方承担</option>
                  <option value="shared">双方分摊</option><option value="platform">平台承担</option>
                </select>
              </div>
              <Button variant="primary" className="w-full" onClick={() => handleSave('转账手续费')}>保存</Button>
            </div>
          </Card>
          <Card title="转账限额设置">
            <div className="space-y-4">
              <Input label="单笔限额 (¥)" type="number" value={singleLimit} onChange={(e) => setSingleLimit(e.target.value)} />
              <Input label="每日限额 (¥)" type="number" value={dailyLimit} onChange={(e) => setDailyLimit(e.target.value)} />
              <div className="p-3 rounded-xl bg-panel/50 border border-border">
                <p className="text-sm text-muted">💡 当前设置</p>
                <p className="text-xs text-muted mt-1">单笔最高：¥{singleLimit}</p>
                <p className="text-xs text-muted">每日最高：¥{dailyLimit}</p>
              </div>
              <Button variant="primary" className="w-full" onClick={() => handleSave('转账限额')}>保存</Button>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'recharge' && (
        <Card title="充值手续费配置">
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-panel/50 border border-border">
              <div className="flex items-center gap-2 mb-3"><Bitcoin size={20} className="text-orange" /><span className="font-bold text-white">USDT (TRC20)</span></div>
              <div className="grid grid-cols-3 gap-3">
                <Input label="费率 (%)" type="number" value={rechargeFees.usdt.rate} onChange={(e) => handleRechargeFeeChange('usdt', 'rate', e.target.value)} />
                <Input label="最低限额" type="number" value={rechargeFees.usdt.min} onChange={(e) => handleRechargeFeeChange('usdt', 'min', e.target.value)} />
                <Input label="最高限额" type="number" value={rechargeFees.usdt.max} onChange={(e) => handleRechargeFeeChange('usdt', 'max', e.target.value)} />
              </div>
            </div>
            <div className="p-4 rounded-xl bg-panel/50 border border-border">
              <div className="flex items-center gap-2 mb-3"><Smartphone size={20} className="text-blue" /><span className="font-bold text-white">支付宝</span></div>
              <div className="grid grid-cols-3 gap-3">
                <Input label="费率 (%)" type="number" value={rechargeFees.alipay.rate} onChange={(e) => handleRechargeFeeChange('alipay', 'rate', e.target.value)} />
                <Input label="最低限额" type="number" value={rechargeFees.alipay.min} onChange={(e) => handleRechargeFeeChange('alipay', 'min', e.target.value)} />
                <Input label="最高限额" type="number" value={rechargeFees.alipay.max} onChange={(e) => handleRechargeFeeChange('alipay', 'max', e.target.value)} />
              </div>
            </div>
            <div className="p-4 rounded-xl bg-panel/50 border border-border">
              <div className="flex items-center gap-2 mb-3"><Smartphone size={20} className="text-green" /><span className="font-bold text-white">微信支付</span></div>
              <div className="grid grid-cols-3 gap-3">
                <Input label="费率 (%)" type="number" value={rechargeFees.wechat.rate} onChange={(e) => handleRechargeFeeChange('wechat', 'rate', e.target.value)} />
                <Input label="最低限额" type="number" value={rechargeFees.wechat.min} onChange={(e) => handleRechargeFeeChange('wechat', 'min', e.target.value)} />
                <Input label="最高限额" type="number" value={rechargeFees.wechat.max} onChange={(e) => handleRechargeFeeChange('wechat', 'max', e.target.value)} />
              </div>
            </div>
            <div className="p-4 rounded-xl bg-panel/50 border border-border">
              <div className="flex items-center gap-2 mb-3"><Landmark size={20} className="text-purple" /><span className="font-bold text-white">银行卡转账</span></div>
              <div className="grid grid-cols-3 gap-3">
                <Input label="费率 (%)" type="number" value={rechargeFees.bank.rate} onChange={(e) => handleRechargeFeeChange('bank', 'rate', e.target.value)} />
                <Input label="最低限额" type="number" value={rechargeFees.bank.min} onChange={(e) => handleRechargeFeeChange('bank', 'min', e.target.value)} />
                <Input label="最高限额" type="number" value={rechargeFees.bank.max} onChange={(e) => handleRechargeFeeChange('bank', 'max', e.target.value)} />
              </div>
            </div>
            <Button variant="primary" className="w-full" onClick={() => handleSave('充值手续费')}>保存所有充值费率</Button>
          </div>
        </Card>
      )}

      {activeTab === 'exchange' && (
        <Card title="汇率配置">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-panel/50 border border-border">
                <div className="flex items-center gap-2 mb-2"><Bitcoin size={20} className="text-orange" /><span className="font-bold text-white">USDT → 积分</span></div>
                <Input label="1 USDT = ? 积分" type="number" value={exchangeRates.usdt} onChange={(e) => handleRateChange('usdt', e.target.value)} />
              </div>
              <div className="p-4 rounded-xl bg-panel/50 border border-border">
                <div className="flex items-center gap-2 mb-2"><Smartphone size={20} className="text-blue" /><span className="font-bold text-white">支付宝 → 积分</span></div>
                <Input label="1 元 = ? 积分" type="number" value={exchangeRates.alipay} onChange={(e) => handleRateChange('alipay', e.target.value)} />
              </div>
              <div className="p-4 rounded-xl bg-panel/50 border border-border">
                <div className="flex items-center gap-2 mb-2"><Smartphone size={20} className="text-green" /><span className="font-bold text-white">微信支付 → 积分</span></div>
                <Input label="1 元 = ? 积分" type="number" value={exchangeRates.wechat} onChange={(e) => handleRateChange('wechat', e.target.value)} />
              </div>
              <div className="p-4 rounded-xl bg-panel/50 border border-border">
                <div className="flex items-center gap-2 mb-2"><Landmark size={20} className="text-purple" /><span className="font-bold text-white">银行卡 → 积分</span></div>
                <Input label="1 元 = ? 积分" type="number" value={exchangeRates.bank} onChange={(e) => handleRateChange('bank', e.target.value)} />
              </div>
            </div>
            <Button variant="primary" className="w-full" onClick={() => handleSave('汇率')}>保存所有汇率</Button>
          </div>
        </Card>
      )}

      {activeTab === 'invite' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card title="邀请奖励设置">
            <div className="space-y-4">
              <Input label="邀请人获得积分" type="number" value={invitePoints} onChange={(e) => setInvitePoints(e.target.value)} />
              <Input label="被邀请人获得积分" type="number" value={inviteBonusPoints} onChange={(e) => setInviteBonusPoints(e.target.value)} />
              <div className="p-3 rounded-xl bg-panel/50 border border-border">
                <p className="text-sm text-muted">📋 当前设置</p>
                <p className="text-sm text-white mt-1">邀请人获得：{invitePoints} 积分</p>
                <p className="text-sm text-white">被邀请人获得：{inviteBonusPoints} 积分</p>
              </div>
              <Button variant="primary" className="w-full" onClick={() => handleSave('邀请')}>保存邀请设置</Button>
            </div>
          </Card>
          <Card title="邀请统计">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-panel/50"><span className="text-muted">总邀请</span><span className="text-white font-bold">24 人</span></div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-panel/50"><span className="text-muted">已注册</span><span className="text-green font-bold">18 人</span></div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-panel/50"><span className="text-muted">已发放积分</span><span className="text-blue font-bold">1,800</span></div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'prices' && (
        <Card title="💰 各平台检测价格" subtitle="每个平台独立配置检测项价格">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted">展开平台查看详细价格配置</div>
              <Button variant="ghost" size="sm" onClick={handleResetPrices}>
                <RefreshCw size={14} className="mr-1" />重置默认
              </Button>
            </div>

            {platforms.map((platform) => (
              <div key={platform.platformId} className="border border-border rounded-xl overflow-hidden">
                <button
                  onClick={() => togglePlatform(platform.platformId)}
                  className="w-full flex items-center justify-between p-4 bg-panel/50 hover:bg-panel/70 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{platformIcons[platform.platformId] || '📱'}</span>
                    <span className="font-bold text-white">{platform.platformName}</span>
                    <Badge variant="blue" className="text-xs">基础 ¥{platform.basePrice.toFixed(3)}/条</Badge>
                  </div>
                  {expandedPlatform === platform.platformId ? (
                    <ChevronDown size={20} className="text-muted" />
                  ) : (
                    <ChevronRight size={20} className="text-muted" />
                  )}
                </button>

                {expandedPlatform === platform.platformId && (
                  <div className="p-4 space-y-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {platform.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-panel/30 border border-border/50">
                          <div>
                            <div className="text-sm text-white">{item.label}</div>
                            <div className="text-xs text-muted">{item.desc}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            {editingPrice?.platformId === platform.platformId && editingPrice?.itemId === item.id ? (
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  step="0.001"
                                  min="0"
                                  value={priceValue}
                                  onChange={(e) => setPriceValue(e.target.value)}
                                  className="w-20 bg-panel/50 border border-border rounded-lg text-white px-2 py-1 text-sm outline-none focus:border-sky/50"
                                />
                                <button onClick={() => handlePriceSave(platform.platformId, item.id)} className="p-1 rounded hover:bg-green/10 text-green"><Check size={14} /></button>
                                <button onClick={() => setEditingPrice(null)} className="p-1 rounded hover:bg-red/10 text-red"><X size={14} /></button>
                              </div>
                            ) : (
                              <span className="text-white font-mono text-sm">¥{item.price.toFixed(3)}</span>
                            )}
                            <button
                              onClick={() => handlePriceEdit(platform.platformId, item.id, item.price)}
                              className="p-1 rounded-lg hover:bg-blue/10 text-blue"
                            >
                              <Edit2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 p-2 rounded-lg bg-blue/10 border border-blue/30 text-xs text-blue">
                      💡 修改后新建任务生效，已有任务不受影响
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeTab === 'email' && (
        <Card title="邮件服务器配置">
          <div className="space-y-4">
            <Input label="SMTP 主机" value={smtpHost} onChange={(e) => setSmtpHost(e.target.value)} />
            <Input label="SMTP 端口" value={smtpPort} onChange={(e) => setSmtpPort(e.target.value)} />
            <Input label="发件人邮箱" value={smtpUser} onChange={(e) => setSmtpUser(e.target.value)} />
            <Input label="SMTP 密码" type="password" placeholder="请输入密码" />
            <Button variant="primary" className="w-full" onClick={() => handleSave('邮件')}>测试连接</Button>
          </div>
        </Card>
      )}

      {activeTab === 'security' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card title="登录安全">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-panel/50">
                <span className="text-white">双因素认证 (2FA)</span>
                <button className="px-4 py-1.5 rounded-lg bg-blue text-white text-sm font-bold" onClick={() => toast.success('2FA 已启用')}>启用</button>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-panel/50">
                <span className="text-white">登录失败锁定</span>
                <span className="text-muted text-sm">5 次 / 30 分钟</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-panel/50">
                <span className="text-white">会话超时</span>
                <select className="bg-panel/50 border border-border rounded-lg text-white px-3 py-1 text-sm outline-none">
                  <option value="30">30 分钟</option><option value="60" selected>60 分钟</option><option value="120">2 小时</option>
                </select>
              </div>
              <Button variant="primary" className="w-full" onClick={() => handleSave('安全')}>保存安全设置</Button>
            </div>
          </Card>
          <Card title="密码策略">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-panel/50"><span className="text-muted">最小密码长度</span><span className="text-white">8 位</span></div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-panel/50"><span className="text-muted">密码复杂度</span><span className="text-white">字母 + 数字</span></div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-panel/50"><span className="text-muted">密码过期</span><span className="text-white">90 天</span></div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'system' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card title="系统信息">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-panel/50"><span className="text-muted">系统版本</span><span className="text-white font-bold">V3.0.0</span></div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-panel/50"><span className="text-muted">构建时间</span><span className="text-white">2025-06-22 14:30</span></div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-panel/50"><span className="text-muted">运行环境</span><span className="text-white">Production</span></div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-panel/50"><span className="text-muted">数据库</span><span className="text-white">Supabase</span></div>
            </div>
          </Card>
          <Card title="维护操作">
            <div className="space-y-3">
              <Button variant="ghost" className="w-full justify-center" onClick={handleClearCache}>🔄 清除缓存</Button>
              <Button variant="ghost" className="w-full justify-center" onClick={handleRebuildIndex}>📊 重建索引</Button>
              <Button variant="ghost" className="w-full justify-center" onClick={handleBackup}>📦 备份数据</Button>
              <Button variant="red" className="w-full justify-center" onClick={handleRestart}>⚠️ 重启系统</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
