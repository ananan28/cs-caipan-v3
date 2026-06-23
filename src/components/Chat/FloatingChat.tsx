import { useState, useEffect, useRef } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useChatStore } from '@/store/chatStore'
import { useChatSettingsStore } from '@/store/chatSettingsStore'
import { useWalletStore } from '@/store/walletStore'
import { 
  MessageCircle, X, Minus, Maximize2, Send, 
  User, Clock, CheckCircle, Headphones, Zap,
  Coins, Wallet, TrendingUp, Activity, Users,
  Bell, AlertCircle, ChevronDown, ChevronUp,
  Shield, UserCheck
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export const FloatingChat = () => {
  const { user } = useAuthStore()
  const { points } = useWalletStore()
  const { settings } = useChatSettingsStore()
  const { sessions, addMessage, markRead, unreadTotal } = useChatStore()
  
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isClosed, setIsClosed] = useState(false)
  const [messageInput, setMessageInput] = useState('')
  const [isHumanMode, setIsHumanMode] = useState(false)
  const [isTransferring, setIsTransferring] = useState(false)
  const [messages, setMessages] = useState<any[]>([
    { id: 1, from: 'system', content: '您好！欢迎来到财盛集团客服中心，请问有什么可以帮助您的？', time: new Date().toISOString().slice(0, 16).replace('T', ' '), isMe: false },
  ])
  const [isTyping, setIsTyping] = useState(false)
  const [hasUnread, setHasUnread] = useState(false)
  const [adminOnline, setAdminOnline] = useState(true)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const closed = localStorage.getItem('chat_closed')
    if (closed === 'true') {
      setIsClosed(true)
    }
  }, [])

  const handleClose = () => {
    setIsClosed(true)
    localStorage.setItem('chat_closed', 'true')
  }

  useEffect(() => {
    setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
      }
    }, 100)
  }, [messages, isOpen])

  useEffect(() => {
    if (unreadTotal > 0 && !isOpen) {
      setHasUnread(true)
    }
  }, [unreadTotal, isOpen])

  const getUserQuickInfo = () => {
    return {
      name: user?.name || '用户',
      email: user?.email || '',
      points: points || 0,
      role: user?.role || 'User',
    }
  }

  // 检查是否有人工客服在线（模拟：根据角色判断）
  const checkAdminOnline = () => {
    // 模拟：假设有管理员在线
    return true
  }

  // ===== 核心：人工客服接入 =====
  const handleHumanService = () => {
    if (isHumanMode) {
      toast.info('已有人在为您服务')
      return
    }

    setIsTransferring(true)
    
    // 检查管理员是否在线
    const hasAdmin = checkAdminOnline()
    
    if (!hasAdmin) {
      toast.warning('⚠️ 当前没有客服在线，请稍后再试或留言')
      setIsTransferring(false)
      return
    }

    // 添加转接消息
    const transferMsg = {
      id: Date.now(),
      from: 'system',
      content: '🔁 正在为您转接人工客服，请稍等...',
      time: new Date().toISOString().slice(0, 16).replace('T', ' '),
      isMe: false
    }
    setMessages(prev => [...prev, transferMsg])
    
    // 模拟转接过程
    setTimeout(() => {
      setIsTransferring(false)
      setIsHumanMode(true)
      
      // 通知管理员（模拟）
      const adminNotify = {
        id: Date.now() + 1,
        from: 'system',
        content: '👤 已为您接入人工客服，管理员正在查看您的消息',
        time: new Date().toISOString().slice(0, 16).replace('T', ' '),
        isMe: false
      }
      setMessages(prev => [...prev, adminNotify])
      
      // 添加客服欢迎语
      setTimeout(() => {
        const welcome = {
          id: Date.now() + 2,
          from: 'admin',
          content: '您好！我是客服小美，请问有什么可以帮您？',
          time: new Date().toISOString().slice(0, 16).replace('T', ' '),
          isMe: false
        }
        setMessages(prev => [...prev, welcome])
        
        // 发送系统通知给所有在线管理员
        toast.success('📩 用户请求人工客服，请前往客服中心处理', {
          duration: 8000,
          icon: '🔔'
        })
        
        // 浏览器通知
        if (Notification.permission === 'granted') {
          new Notification('📩 新的人工客服请求', {
            body: `${user?.name || '用户'} 请求人工客服帮助`,
            icon: '/favicon.ico'
          })
        }
        
      }, 1000)
      
    }, 2000)
  }

  // 发送消息
  const handleSendMessage = () => {
    if (!messageInput.trim()) return

    const msgContent = messageInput.trim()
    const msg = {
      id: Date.now(),
      from: 'user',
      content: msgContent,
      time: new Date().toISOString().slice(0, 16).replace('T', ' '),
      isMe: true
    }

    setMessages(prev => [...prev, msg])
    setMessageInput('')
    
    // 检测是否请求人工客服
    if (msgContent.includes('人工') || msgContent.includes('真人') || msgContent.includes('转接')) {
      handleHumanService()
      return
    }

    // 如果已经是人工模式，直接回复人工
    if (isHumanMode) {
      setIsTyping(true)
      setTimeout(() => {
        setIsTyping(false)
        const reply = {
          id: Date.now() + 1,
          from: 'admin',
          content: '好的，已收到您的消息，我会尽快处理。请问还有其他需要帮助的吗？',
          time: new Date().toISOString().slice(0, 16).replace('T', ' '),
          isMe: false
        }
        setMessages(prev => [...prev, reply])
      }, 1000)
      return
    }

    // 智能回复
    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      
      const text = msgContent.toLowerCase()
      let replyContent = settings.autoReply || '您好，感谢您的咨询！客服正在处理，请稍等。'
      
      if (text.includes('积分') || text.includes('points')) {
        replyContent = `📊 您的当前积分为：${points.toFixed(0)} 积分。\n\n💡 积分获取方式：\n• 充值获得\n• 购买套餐赠送\n• 邀请好友奖励`
      } else if (text.includes('充值') || text.includes('recharge')) {
        replyContent = '💰 充值问题请提供您的订单号或交易ID，我们会为您查询处理。\n\n💡 如需人工帮助，请输入"人工客服"'
      } else if (text.includes('任务') || text.includes('task')) {
        replyContent = '📋 任务问题请提供任务ID，我们会帮您排查原因。'
      } else if (text.includes('帮助') || text.includes('help')) {
        replyContent = `📖 **帮助菜单**\n\n• 输入 "查询积分" - 查看当前积分\n• 输入 "充值问题" - 充值相关\n• 输入 "任务问题" - 任务相关\n• 输入 "人工客服" - 转接真人客服`
      } else {
        replyContent = `收到您的消息：${msgContent}\n\n💡 如需人工帮助，请输入 "人工客服" 转接真人客服。`
      }

      const reply = {
        id: Date.now() + 1,
        from: 'system',
        content: replyContent,
        time: new Date().toISOString().slice(0, 16).replace('T', ' '),
        isMe: false
      }
      setMessages(prev => [...prev, reply])
      setHasUnread(true)
      
    }, 1000 + Math.random() * 500)
  }

  // 判断是否有人在服务
  const isBeingServed = isHumanMode

  if (isClosed) {
    return (
      <button
        onClick={() => {
          setIsClosed(false)
          localStorage.setItem('chat_closed', 'false')
        }}
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-gradient-to-r from-blue to-sky text-white shadow-lg hover:opacity-90 transition-all animate-bounce"
      >
        <MessageCircle size={24} />
      </button>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-2rem)]">
      {isMinimized ? (
        <button
          onClick={() => setIsMinimized(false)}
          className="w-full p-4 rounded-2xl bg-gradient-to-r from-blue to-sky text-white shadow-lg flex items-center justify-between hover:opacity-90 transition-all"
        >
          <div className="flex items-center gap-3">
            <Headphones size={20} />
            <span className="font-bold">
              {isBeingServed ? '👤 人工客服' : '在线客服'}
            </span>
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">7x24h</span>
          </div>
          <div className="flex items-center gap-2">
            {hasUnread && <span className="w-2 h-2 rounded-full bg-red animate-pulse" />}
            <ChevronUp size={18} />
          </div>
        </button>
      ) : (
        <div className="bg-panel border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[550px]">
          {/* 头部 */}
          <div className={`p-4 flex items-center justify-between ${isBeingServed ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-blue to-sky'}`}>
            <div className="flex items-center gap-3">
              {isBeingServed ? <UserCheck size={20} className="text-white" /> : <Headphones size={20} className="text-white" />}
              <div>
                <span className="font-bold text-white">
                  {isBeingServed ? '👤 人工客服' : '在线客服'}
                </span>
                <div className="flex items-center gap-2 text-xs text-white/80">
                  <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" />
                  <span>
                    {isBeingServed ? '正在为您服务' : '7x24小时在线'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {!isBeingServed && (
                <button 
                  onClick={handleHumanService}
                  disabled={isTransferring}
                  className="px-2 py-1 rounded-lg bg-white/20 text-white text-xs hover:bg-white/30 transition-all disabled:opacity-50"
                >
                  {isTransferring ? '转接中...' : '人工'}
                </button>
              )}
              <button 
                onClick={() => setIsMinimized(true)}
                className="p-1 rounded-lg hover:bg-white/20 text-white"
              >
                <Minus size={18} />
              </button>
              <button 
                onClick={handleClose}
                className="p-1 rounded-lg hover:bg-white/20 text-white"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* 状态提示 */}
          {isBeingServed && (
            <div className="px-4 py-1.5 bg-green/10 border-b border-green/30 flex items-center justify-between text-xs">
              <span className="text-green">🟢 人工客服在线</span>
              <span className="text-muted">客服小美</span>
            </div>
          )}

          {/* 用户信息快捷显示 */}
          <div className="px-4 py-2 bg-panel/50 border-b border-border flex items-center gap-4 text-xs text-muted">
            <span className="flex items-center gap-1"><User size={12} /> {getUserQuickInfo().name}</span>
            <span className="flex items-center gap-1"><Coins size={12} /> {getUserQuickInfo().points} 积分</span>
            {hasUnread && (
              <span className="text-red flex items-center gap-1 animate-pulse">
                <Bell size={12} /> 新消息
              </span>
            )}
          </div>

          {/* 消息区域 */}
          <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-2 max-h-[280px] min-h-[200px]">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-xl ${msg.isMe ? 'bg-blue/20 border border-blue/30' : msg.from === 'admin' ? 'bg-green/20 border border-green/30' : 'bg-panel/50 border border-border'}`}>
                  <div className="flex items-center gap-2 text-xs text-muted">
                    <span className={`font-bold ${msg.isMe ? 'text-sky' : msg.from === 'admin' ? 'text-green' : 'text-white'}`}>
                      {msg.isMe ? '我' : msg.from === 'admin' ? '客服小美' : '客服'}
                    </span>
                    <span>{msg.time}</span>
                  </div>
                  <p className="text-white text-sm mt-1 whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-panel/50 border border-border p-3 rounded-xl">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted">
                      {isBeingServed ? '客服正在输入' : '智能客服正在输入'}
                    </span>
                    <span className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-blue rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-blue rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                      <span className="w-1.5 h-1.5 bg-blue rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
                    </span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* 快捷回复提示 */}
          <div className="px-4 py-1 bg-panel/30 border-t border-border flex gap-2 overflow-x-auto">
            {isBeingServed ? (
              <>
                <button onClick={() => setMessageInput('好的，谢谢！')} className="px-2 py-0.5 rounded-lg bg-panel/50 border border-border text-xs text-muted hover:text-white whitespace-nowrap">好的，谢谢</button>
                <button onClick={() => setMessageInput('稍等一下')} className="px-2 py-0.5 rounded-lg bg-panel/50 border border-border text-xs text-muted hover:text-white whitespace-nowrap">稍等一下</button>
                <button onClick={() => setMessageInput('明白了')} className="px-2 py-0.5 rounded-lg bg-panel/50 border border-border text-xs text-muted hover:text-white whitespace-nowrap">明白了</button>
              </>
            ) : (
              <>
                <button onClick={() => setMessageInput('查询积分')} className="px-2 py-0.5 rounded-lg bg-panel/50 border border-border text-xs text-muted hover:text-white whitespace-nowrap">查询积分</button>
                <button onClick={() => setMessageInput('充值问题')} className="px-2 py-0.5 rounded-lg bg-panel/50 border border-border text-xs text-muted hover:text-white whitespace-nowrap">充值问题</button>
                <button onClick={() => setMessageInput('任务问题')} className="px-2 py-0.5 rounded-lg bg-panel/50 border border-border text-xs text-muted hover:text-white whitespace-nowrap">任务问题</button>
                <button onClick={() => setMessageInput('人工客服')} className="px-2 py-0.5 rounded-lg bg-panel/50 border border-border text-xs text-red hover:text-white whitespace-nowrap">人工客服</button>
              </>
            )}
          </div>

          {/* 输入区域 */}
          <div className="p-3 border-t border-border flex gap-2">
            <input
              type="text"
              placeholder={isBeingServed ? "输入消息..." : "输入您的问题..."}
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1 bg-panel/50 border border-border rounded-xl text-white px-4 py-2 outline-none focus:border-sky/50 text-sm"
            />
            <button
              onClick={handleSendMessage}
              disabled={!messageInput.trim()}
              className={`p-2 rounded-xl text-white disabled:opacity-50 hover:opacity-90 transition-all ${isBeingServed ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-blue to-sky'}`}
            >
              <Send size={18} />
            </button>
          </div>

          {/* 底部提示 */}
          <div className="px-4 py-1 bg-panel/30 border-t border-border text-center text-xs text-muted">
            {isBeingServed ? '💬 人工客服为您服务' : '💡 输入 "人工客服" 转接真人客服'}
          </div>
        </div>
      )}
    </div>
  )
}
