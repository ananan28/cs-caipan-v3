import { useState, useEffect, useRef } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useUserStore } from '@/store/userStore'
import { useWalletStore } from '@/store/walletStore'
import { useChatStore } from '@/store/chatStore'
import { useChatSettingsStore } from '@/store/chatSettingsStore'
import { Card } from '@/components/Common/Card'
import { Badge } from '@/components/Common/Badge'
import { Button } from '@/components/Common/Button'
import { Input } from '@/components/Forms/Input'
import { 
  MessageSquare, Users, Send, User, Clock, 
  CheckCircle, XCircle, Reply, Phone, Mail,
  Search, Filter, Plus, Settings, Bell,
  UserCheck, UserX, AlertCircle, Info,
  Tag, Flag, Star, Archive, Trash2,
  Coins, Wallet, TrendingUp, Activity,
  Headphones, MessageCircle, Sparkles,
  Zap, AlertTriangle, RefreshCw
} from 'lucide-react'
import toast from 'react-hot-toast'

export const Chat = () => {
  const { user } = useAuthStore()
  const { users } = useUserStore()
  const { points } = useWalletStore()
  const { settings } = useChatSettingsStore()
  const { 
    sessions, 
    messages: allMessages, 
    unreadTotal,
    activeSessionId,
    addMessage,
    markRead,
    assignSession,
    updateStatus,
    setActiveSession
  } = useChatStore()
  
  const [activeTab, setActiveTab] = useState('sessions')
  const [selectedSession, setSelectedSession] = useState<any>(null)
  const [messageInput, setMessageInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showUserInfo, setShowUserInfo] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  // 检查权限
  const canReply = user?.role === 'SuperAdmin' || user?.role === 'Admin' || user?.role === 'Finance'

  // 获取当前会话的消息
  const currentMessages = selectedSession ? (allMessages[selectedSession.id] || []) : []

  // 选中会话
  useEffect(() => {
    if (activeSessionId) {
      const session = sessions.find(s => s.id === activeSessionId)
      if (session) {
        setSelectedSession(session)
        markRead(session.id)
      }
    }
  }, [activeSessionId, sessions, markRead])

  // 滚动到底部
  useEffect(() => {
    setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
      }
    }, 100)
  }, [currentMessages])

  // 获取用户信息
  const getUserInfo = (email: string) => {
    const u = users.find(u => u.email === email)
    if (!u) return null
    return { ...u, points: u.points || 0, balance: (u as any).balance || 0 }
  }

  // 发送消息
  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedSession) {
      toast.error('请选择会话并输入消息')
      return
    }

    const newMsg = {
      id: Date.now().toString(),
      sessionId: selectedSession.id,
      from: 'admin' as const,
      content: messageInput,
      time: new Date().toISOString().slice(0, 16).replace('T', ' '),
      isRead: true
    }

    addMessage(selectedSession.id, newMsg)
    toast.success('✅ 消息已发送')
    setMessageInput('')
    
    // 模拟用户回复
    setTimeout(() => {
      const userReply = {
        id: (Date.now() + 1).toString(),
        sessionId: selectedSession.id,
        from: 'user' as const,
        content: '好的，谢谢！我稍后查看。',
        time: new Date().toISOString().slice(0, 16).replace('T', ' '),
        isRead: false
      }
      addMessage(selectedSession.id, userReply)
      toast.success('💬 用户已回复', { duration: 3000 })
    }, 3000)
  }

  // 分配会话
  const handleAssign = (sessionId: string) => {
    assignSession(sessionId, user?.email || 'admin@cs.com')
    toast.success('✅ 已接入会话')
  }

  // 关闭会话
  const handleClose = (sessionId: string) => {
    if (confirm('确定要关闭此会话吗？')) {
      updateStatus(sessionId, 'closed')
      toast.success('✅ 会话已关闭')
      setSelectedSession(null)
    }
  }

  // 解决会话
  const handleResolve = (sessionId: string) => {
    updateStatus(sessionId, 'resolved')
    toast.success('✅ 已标记为已解决')
    setSelectedSession(null)
  }

  // 分类标签
  const categoryColors: any = {
    general: 'blue',
    technical: 'orange',
    finance: 'green',
    recharge: 'purple',
    task: 'red'
  }

  const categoryLabels: any = {
    general: '一般咨询',
    technical: '技术问题',
    finance: '财务问题',
    recharge: '充值问题',
    task: '任务问题'
  }

  // 统计
  const stats = [
    { label: '待处理', value: sessions.filter(s => s.status === 'waiting' || s.status === 'active').length, icon: Clock, color: 'text-orange' },
    { label: '处理中', value: sessions.filter(s => s.status === 'processing').length, icon: MessageSquare, color: 'text-blue' },
    { label: '已解决', value: sessions.filter(s => s.status === 'resolved' || s.status === 'closed').length, icon: CheckCircle, color: 'text-green' },
    { label: '未读', value: unreadTotal, icon: Bell, color: 'text-red' },
  ]

  // 筛选会话
  const filteredSessions = sessions.filter(s => {
    const matchSearch = s.userName.includes(searchQuery) || s.userEmail.includes(searchQuery)
    const matchStatus = filterStatus === 'all' || s.status === filterStatus
    return matchSearch && matchStatus
  })

  // 快速回复模板
  const quickReplies = [
    '您好，请问有什么可以帮助您的？',
    '正在处理，请稍等...',
    '已收到您的问题，我们会尽快处理。',
    '充值通常会在24小时内到账。',
    '请提供您的订单号或交易ID。',
    '已为您处理，请查看。',
  ]

  return (
    <div className="space-y-6">
      {/* 顶部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            👨‍💼 客服中心
            {unreadTotal > 0 && (
              <span className="ml-3 text-sm bg-red/20 text-red px-3 py-1 rounded-full animate-pulse">
                {unreadTotal} 条未读
              </span>
            )}
          </h1>
          <p className="text-muted text-sm">
            实时处理用户咨询
            {!canReply && ' (您没有回复权限，请联系管理员)'}
            {canReply && ' ✅ 您有回复权限'}
          </p>
        </div>
        <div className="flex gap-2">
          {canReply && unreadTotal > 0 && (
            <Badge variant="red" className="animate-pulse">
              🔴 {unreadTotal} 条待处理
            </Badge>
          )}
          <Badge variant={user?.role === 'SuperAdmin' ? 'purple' : 'blue'}>
            {user?.role === 'SuperAdmin' ? '👑 所有者' : user?.role === 'Admin' ? '👤 管理员' : user?.role === 'Finance' ? '💰 财务' : '👤 用户'}
          </Badge>
        </div>
      </div>

      {/* 实时状态提示 */}
      {unreadTotal > 0 && canReply && (
        <div className="p-3 rounded-xl bg-red/10 border border-red/30 flex items-center justify-between animate-pulse">
          <span className="text-sm text-red">🔴 有 {unreadTotal} 条未读客服消息，点击会话查看</span>
          <Button variant="ghost" size="sm" onClick={() => {
            const firstUnread = sessions.find(s => s.unreadCount > 0)
            if (firstUnread) {
              setSelectedSession(firstUnread)
              markRead(firstUnread.id)
            }
          }}>
            查看
          </Button>
        </div>
      )}

      {/* 统计 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted">{stat.label}</p>
                <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-xl bg-${stat.color.split('-')[1]}/10 ${stat.color}`}>
                <stat.icon size={24} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* 主体 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 会话列表 */}
        <Card className="lg:col-span-1">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-white">
              会话列表
              {filteredSessions.filter(s => s.unreadCount > 0).length > 0 && (
                <span className="ml-2 text-xs text-red">
                  ({filteredSessions.filter(s => s.unreadCount > 0).length} 未读)
                </span>
              )}
            </h3>
            <div className="flex gap-1">
              <select 
                className="bg-panel/50 border border-border rounded-lg text-white px-2 py-1 text-xs outline-none"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">全部</option>
                <option value="waiting">待处理</option>
                <option value="processing">处理中</option>
                <option value="resolved">已解决</option>
                <option value="closed">已关闭</option>
              </select>
            </div>
          </div>
          <div className="mb-2">
            <Input 
              placeholder="搜索用户..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search size={16} />}
              className="text-sm"
            />
          </div>
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {filteredSessions.map(s => (
              <button
                key={s.id}
                onClick={() => {
                  setSelectedSession(s)
                  markRead(s.id)
                  setShowUserInfo(true)
                }}
                className={`w-full text-left p-3 rounded-xl transition-all border ${selectedSession?.id === s.id ? 'bg-blue/20 border-sky/30' : s.unreadCount > 0 ? 'bg-red/5 border-red/30' : 'bg-panel/50 border-border hover:border-sky/20'}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold truncate ${s.unreadCount > 0 ? 'text-white' : 'text-muted'}`}>
                        {s.userName}
                        {s.unreadCount > 0 && ' 🔴'}
                      </span>
                      <Badge variant={categoryColors[s.category as keyof typeof categoryColors]}>
                        {categoryLabels[s.category as keyof typeof categoryLabels]}
                      </Badge>
                    </div>
                    <p className={`text-sm truncate ${s.unreadCount > 0 ? 'text-white' : 'text-muted'}`}>
                      {s.lastMessage}
                    </p>
                    <p className="text-xs text-muted mt-1">{s.lastMessageTime}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {s.unreadCount > 0 && (
                      <span className="bg-red text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                        {s.unreadCount}
                      </span>
                    )}
                    <Badge variant={
                      s.status === 'waiting' ? 'orange' : 
                      s.status === 'processing' ? 'blue' : 
                      s.status === 'resolved' ? 'green' : 'gray'
                    }>
                      {s.status === 'waiting' ? '⏳待处理' : 
                       s.status === 'processing' ? '🔄处理中' : 
                       s.status === 'resolved' ? '✅已解决' : '📁已关闭'}
                    </Badge>
                    {s.assignedTo && (
                      <span className="text-xs text-muted">👤 {s.assignedTo.split('@')[0]}</span>
                    )}
                  </div>
                </div>
              </button>
            ))}
            {filteredSessions.length === 0 && (
              <div className="text-center py-8 text-muted">暂无会话</div>
            )}
          </div>
        </Card>

        {/* 聊天区域 */}
        <Card className="lg:col-span-2">
          {selectedSession ? (
            <div className="flex flex-col h-[600px]">
              {/* 用户信息头 */}
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue to-sky flex items-center justify-center text-white font-bold text-sm">
                    {selectedSession.userName?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <div className="font-bold text-white">
                      {selectedSession.userName}
                      {selectedSession.unreadCount > 0 && (
                        <span className="ml-2 text-xs text-red">🔴 未读</span>
                      )}
                    </div>
                    <div className="text-xs text-muted">{selectedSession.userEmail}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {selectedSession.status === 'waiting' && canReply && (
                    <Button variant="primary" size="sm" onClick={() => handleAssign(selectedSession.id)}>
                      <UserCheck size={14} className="mr-1" />接入
                    </Button>
                  )}
                  {selectedSession.status === 'processing' && canReply && (
                    <Button variant="green" size="sm" onClick={() => handleResolve(selectedSession.id)}>
                      <CheckCircle size={14} className="mr-1" />解决
                    </Button>
                  )}
                  {selectedSession.status !== 'closed' && canReply && (
                    <Button variant="ghost" size="sm" onClick={() => handleClose(selectedSession.id)}>
                      <XCircle size={14} className="mr-1" />关闭
                    </Button>
                  )}
                  <button 
                    onClick={() => setShowUserInfo(!showUserInfo)}
                    className="p-2 rounded-lg hover:bg-panel/50 text-muted hover:text-white"
                  >
                    <Info size={18} />
                  </button>
                </div>
              </div>

              {/* 用户信息面板 */}
              {showUserInfo && (
                <div className="p-3 rounded-xl bg-panel/50 border border-border mb-3 text-sm">
                  <div className="grid grid-cols-3 gap-2">
                    <div><span className="text-muted">积分</span> <span className="text-blue font-bold">{points?.toFixed(0) || 0}</span></div>
                    <div><span className="text-muted">角色</span> <Badge variant="blue">User</Badge></div>
                    <div><span className="text-muted">状态</span> <Badge variant="green">正常</Badge></div>
                  </div>
                </div>
              )}

              {/* 消息列表 */}
              <div ref={chatContainerRef} className="flex-1 overflow-y-auto py-3 space-y-2">
                {currentMessages.map((msg: any) => (
                  <div key={msg.id} className={`flex ${msg.from === 'admin' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-xl ${msg.from === 'admin' ? 'bg-blue/20 border border-blue/30' : 'bg-panel/50 border border-border'}`}>
                      <div className="flex items-center gap-2 text-xs text-muted">
                        <span className={`font-bold ${msg.from === 'admin' ? 'text-sky' : 'text-white'}`}>
                          {msg.from === 'admin' ? '👤 客服' : selectedSession.userName}
                        </span>
                        <span>{msg.time}</span>
                        {msg.from === 'user' && !msg.isRead && (
                          <Badge variant="blue" className="text-xs">新</Badge>
                        )}
                      </div>
                      <p className="text-white text-sm mt-1">{msg.content}</p>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-panel/50 border border-border p-3 rounded-xl">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted">用户正在输入</span>
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

              {/* 快速回复 */}
              <div className="flex flex-wrap gap-2 py-2 border-t border-border">
                {quickReplies.map(text => (
                  <button
                    key={text}
                    onClick={() => setMessageInput(text)}
                    className="px-3 py-1 rounded-lg bg-panel/50 border border-border text-xs text-muted hover:text-white hover:border-sky/30 transition-all"
                  >
                    {text.length > 20 ? text.slice(0, 20) + '...' : text}
                  </button>
                ))}
              </div>

              {/* 输入框 */}
              <div className="flex gap-2 pt-2 border-t border-border">
                <Input 
                  placeholder={canReply ? "输入回复..." : "您没有回复权限"}
                  value={messageInput} 
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && canReply && handleSendMessage()}
                  className="flex-1"
                  disabled={!canReply}
                />
                <Button 
                  variant="primary" 
                  onClick={handleSendMessage}
                  disabled={!canReply || !selectedSession}
                >
                  <Send size={16} />
                </Button>
              </div>
              {!canReply && (
                <p className="text-xs text-orange text-center mt-1">⚠️ 您没有客服回复权限，请联系管理员</p>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[600px] text-muted">
              <MessageSquare size={48} className="mb-4 opacity-30" />
              <p className="text-lg">选择会话开始回复</p>
              <p className="text-sm">点击左侧会话列表查看消息</p>
              {unreadTotal > 0 && (
                <p className="text-sm text-red mt-2">🔴 有 {unreadTotal} 条未读消息</p>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
