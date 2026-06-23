import { useState, useRef, useEffect } from 'react'
import { Card } from '@/components/Common/Card'
import { Badge } from '@/components/Common/Badge'
import { Button } from '@/components/Common/Button'
import { Input } from '@/components/Forms/Input'
import { 
  Bell, CheckCircle, XCircle, AlertCircle, Info, 
  Trash2, Check, Eye, EyeOff, BellOff, MessageSquare,
  Send, User, Clock, Reply, Archive, Flag, Star,
  Headphones, Phone, Mail, Search, Users, Coins,
  Wallet, TrendingUp, Activity, Database
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useUserStore } from '@/store/userStore'
import { useWalletStore } from '@/store/walletStore'
import { useNotificationStore } from '@/store/notificationStore'
import toast from 'react-hot-toast'

export const Notifications = () => {
  const { user } = useAuthStore()
  const { users } = useUserStore()
  const { points, transactions } = useWalletStore()
  const { notifications, unreadCount, markRead, markAllRead, deleteNotification, deleteAll, addNotification } = useNotificationStore()
  
  const [activeTab, setActiveTab] = useState('all')
  const [newMessage, setNewMessage] = useState('')
  const [showChat, setShowChat] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [searchUser, setSearchUser] = useState('')
  const [queryResult, setQueryResult] = useState<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  const [messages, setMessages] = useState([
    { id: 1, from: '客服-小美', content: '您好！我是客服小美，有什么可以帮您？', time: '2025-06-22 14:30', isMe: false, isRead: true },
    { id: 2, from: '客服-小美', content: '您可以输入：查询积分、查询余额、查询订单、查询用户等', time: '2025-06-22 14:28', isMe: false, isRead: true },
  ])

  const scrollToBottom = () => {
    setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
      }
    }, 100)
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (showChat) {
      scrollToBottom()
    }
  }, [showChat])

  const getAutoReply = (input: string): { reply: string; data?: any } => {
    const text = input.toLowerCase()
    
    if (text.includes('积分') || text.includes('points') || text.includes('多少积分')) {
      return {
        reply: `📊 您的当前积分为：**${points.toFixed(2)}** 积分\n\n💡 积分获取方式：\n• 充值获得\n• 购买套餐赠送\n• 邀请好友奖励`,
        data: { type: 'points', value: points }
      }
    }
    
    if (text.includes('余额') || text.includes('balance') || text.includes('多少钱')) {
      return {
        reply: `💰 您的当前余额为：**¥${(user as any)?.balance?.toFixed(2) || '0.00'}**\n\n📋 余额用途：\n• 购买积分套餐\n• 充值渠道支付`,
        data: { type: 'balance', value: (user as any)?.balance || 0 }
      }
    }
    
    if (text.includes('用户') || text.includes('账号') || text.includes('我的信息')) {
      return {
        reply: `👤 您的账户信息：\n\n• 用户名：${user?.name || '未设置'}\n• 邮箱：${user?.email || '未设置'}\n• 角色：${user?.role || '用户'}\n• 状态：${user?.status || '正常'}\n• 注册时间：${user?.created_at?.slice(0, 16).replace('T', ' ') || '未知'}`,
        data: { type: 'user', value: user }
      }
    }
    
    if (text.includes('交易') || text.includes('记录') || text.includes('流水') || text.includes('充值记录')) {
      const recent = transactions.slice(0, 5)
      let reply = `📋 最近 5 条交易记录：\n\n`
      if (recent.length === 0) {
        reply += '暂无交易记录'
      } else {
        recent.forEach((t, i) => {
          reply += `${i+1}. ${t.type}：${t.points > 0 ? '+' : ''}${t.points.toFixed(2)} 积分`
          if (t.description) reply += ` (${t.description})`
          reply += `\n`
        })
      }
      return { reply, data: { type: 'transactions', value: recent } }
    }
    
    if (text.includes('帮助') || text.includes('help') || text.includes('功能') || text.includes('能做什么')) {
      return {
        reply: `📋 **客服帮助菜单**\n\n您可以使用以下关键词查询：\n\n🔍 **查询类**\n• 查询积分 - 查看我的积分\n• 查询余额 - 查看我的余额\n• 查询用户 - 查看我的账户信息\n• 交易记录 - 查看最近交易\n\n💬 直接输入问题，我会尽力解答！`
      }
    }
    
    return {
      reply: `🤔 收到您的消息：${input}\n\n💡 您可以输入「帮助」查看我能做什么。`,
      data: { type: 'unknown' }
    }
  }

  const handleSendMessage = () => {
    if (!newMessage.trim()) {
      toast.error('请输入消息内容')
      return
    }

    const msgContent = newMessage.trim()
    const msg = {
      id: Date.now(),
      from: '我',
      content: msgContent,
      time: new Date().toISOString().slice(0, 16).replace('T', ' '),
      isMe: true,
      isRead: true
    }

    setMessages(prev => [...prev, msg])
    setNewMessage('')
    setIsTyping(true)
    
    setTimeout(() => {
      const result = getAutoReply(msgContent)
      setIsTyping(false)
      
      const reply = {
        id: Date.now() + 1,
        from: '客服-小美',
        content: result.reply,
        time: new Date().toISOString().slice(0, 16).replace('T', ' '),
        isMe: false,
        isRead: false
      }
      setMessages(prev => [...prev, reply])
      
      if (result.data) {
        setQueryResult(result.data)
      }
      
      toast.success('💬 客服已回复', { duration: 3000 })
    }, 1000)
  }

  const quickActions = [
    { label: '查询积分', emoji: '📊' },
    { label: '查询余额', emoji: '💰' },
    { label: '交易记录', emoji: '📋' },
    { label: '我的信息', emoji: '👤' },
    { label: '帮助', emoji: '📖' },
  ]

  const handleQuickAction = (text: string) => {
    setNewMessage(text)
    setTimeout(() => {
      handleSendMessage()
    }, 300)
  }

  // ✅ 使用 store 的方法
  const handleMarkRead = (id: number) => {
    markRead(id)
    toast.success('已标记为已读')
  }

  const handleMarkAllRead = () => {
    markAllRead()
    toast.success('全部已读')
  }

  const handleDelete = (id: number) => {
    deleteNotification(id)
    toast.success('已删除')
  }

  const handleDeleteAll = () => {
    if (confirm('确定要删除所有通知吗？')) {
      deleteAll()
      toast.success('已删除所有通知')
    }
  }

  const typeIcon = {
    success: <CheckCircle size={18} className="text-green" />,
    info: <Info size={18} className="text-blue" />,
    warning: <AlertCircle size={18} className="text-orange" />,
    error: <XCircle size={18} className="text-red" />,
  }

  const typeBg = {
    success: 'bg-green/10 border-green/30',
    info: 'bg-blue/10 border-blue/30',
    warning: 'bg-orange/10 border-orange/30',
    error: 'bg-red/10 border-red/30',
  }

  const filtered = notifications.filter(n => {
    if (activeTab === 'unread') return !n.read
    if (activeTab === 'read') return n.read
    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            消息中心
            {unreadCount > 0 && (
              <span className="ml-3 text-sm bg-red/20 text-red px-3 py-1 rounded-full">
                {unreadCount} 条未读
              </span>
            )}
          </h1>
          <p className="text-muted text-sm">系统通知和智能客服</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => setShowChat(!showChat)}>
            <Headphones size={16} className="mr-1" />
            {showChat ? '收起客服' : '联系客服'}
          </Button>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleMarkAllRead}>
              <Check size={16} className="mr-1" />全部已读
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={handleDeleteAll}>
            <Trash2 size={16} className="mr-1" />清空
          </Button>
        </div>
      </div>

      {unreadCount > 0 && (
        <div className="p-3 rounded-xl bg-blue/10 border border-blue/30 flex items-center justify-between">
          <span className="text-sm text-blue">🔔 您有 {unreadCount} 条未读消息</span>
          <button onClick={handleMarkAllRead} className="text-sm text-sky hover:text-white">全部标记已读</button>
        </div>
      )}

      {/* 智能客服 */}
      {showChat && (
        <Card title="💬 智能客服" subtitle="随时为您服务 · 24小时在线">
          <div className="space-y-3">
            <div className="flex items-center gap-4 p-2 rounded-xl bg-panel/50 border border-border text-xs text-muted">
              <span className="flex items-center gap-1"><User size={14} /> {user?.name || '用户'}</span>
              <span className="flex items-center gap-1"><Coins size={14} /> {points.toFixed(0)} 积分</span>
              {user?.role === 'SuperAdmin' && (
                <span className="flex items-center gap-1 text-purple"><Users size={14} /> 管理员</span>
              )}
            </div>

            <div className="h-64 overflow-y-auto space-y-2 p-3 bg-panel/30 rounded-xl">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-xl ${msg.isMe ? 'bg-blue/20 border border-blue/30' : 'bg-panel/50 border border-border'}`}>
                    <div className="flex items-center gap-2 text-xs text-muted">
                      <span className={`font-bold ${msg.isMe ? 'text-sky' : 'text-white'}`}>{msg.from}</span>
                      <span>{msg.time}</span>
                      {!msg.isMe && !msg.isRead && <Badge variant="blue" className="text-xs">新</Badge>}
                    </div>
                    <p className="text-white text-sm mt-1 whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-panel/50 border border-border p-3 rounded-xl">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted">客服正在输入</span>
                      <span className="flex gap-1">
                        <span className="w-2 h-2 bg-blue rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-blue rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                        <span className="w-2 h-2 bg-blue rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
                      </span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="flex flex-wrap gap-2">
              {quickActions.map(action => (
                <button
                  key={action.label}
                  onClick={() => handleQuickAction(action.label)}
                  className="px-3 py-1.5 rounded-lg bg-panel/50 border border-border text-xs text-muted hover:text-white hover:border-sky/30 transition-all"
                >
                  {action.emoji} {action.label}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <Input 
                placeholder="输入您的问题..." 
                value={newMessage} 
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1"
              />
              <Button variant="primary" onClick={handleSendMessage}>
                <Send size={16} />
              </Button>
            </div>
            <p className="text-xs text-muted text-center">💡 输入「帮助」查看所有功能，智能客服会实时回复</p>
          </div>
        </Card>
      )}

      {/* 通知列表 */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setActiveTab('all')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'all' ? 'bg-blue text-white' : 'bg-panel/50 text-muted hover:text-white'}`}>
          📋 全部 ({notifications.length})
        </button>
        <button onClick={() => setActiveTab('unread')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'unread' ? 'bg-blue text-white' : 'bg-panel/50 text-muted hover:text-white'}`}>
          🔴 未读 ({unreadCount})
        </button>
        <button onClick={() => setActiveTab('read')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'read' ? 'bg-blue text-white' : 'bg-panel/50 text-muted hover:text-white'}`}>
          ✅ 已读 ({notifications.filter(n => n.read).length})
        </button>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <BellOff size={48} className="mx-auto text-muted mb-4" />
            <p className="text-muted">
              {activeTab === 'unread' ? '🎉 没有未读消息' : 
               activeTab === 'read' ? '📭 暂无已读消息' : 
               '暂无通知'}
            </p>
          </div>
        ) : (
          filtered.map(n => (
            <Card key={n.id} className={`border-l-4 ${n.read ? 'border-border' : 'border-sky'} ${!n.read ? 'bg-panel/70' : ''}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className={`p-2 rounded-xl ${typeBg[n.type as keyof typeof typeBg]}`}>
                    {typeIcon[n.type as keyof typeof typeIcon]}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <h4 className={`font-bold ${!n.read ? 'text-white' : 'text-muted'}`}>{n.title}</h4>
                      {!n.read && <Badge variant="blue">新</Badge>}
                      <Badge variant="blue" className="text-xs">{n.from}</Badge>
                    </div>
                    <p className="text-sm text-muted mt-1">{n.content}</p>
                    <p className="text-xs text-muted mt-2">{n.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!n.read && (
                    <button onClick={() => handleMarkRead(n.id)} className="p-1.5 rounded-lg hover:bg-blue/10 text-blue">
                      <Eye size={16} />
                    </button>
                  )}
                  <button onClick={() => handleDelete(n.id)} className="p-1.5 rounded-lg hover:bg-red/10 text-red">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
