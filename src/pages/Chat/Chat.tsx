import { useState, useEffect, useRef } from 'react'
import { Card } from '@/components/Common/Card'
import { Badge } from '@/components/Common/Badge'
import { Button } from '@/components/Common/Button'
import { Input } from '@/components/Forms/Input'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import {
  MessageSquare, Send, User, Clock, CheckCircle,
  RefreshCw, Search, X, Phone, Video, MoreHorizontal,
  Smile, Paperclip, Mic
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  type: string
  status: string
  created_at: string
}

interface Conversation {
  id: string
  user_id: string
  agent_id: string
  status: string
  created_at: string
  last_message?: string
  unread_count?: number
}

export const Chat = () => {
  const { user } = useAuthStore()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedConv, setSelectedConv] = useState<string | null>(null)
  const [inputMessage, setInputMessage] = useState('')
  const [search, setSearch] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const loadConversations = async () => {
    setLoading(true)
    let query = supabase
      .from('conversations')
      .select('*')
      .order('created_at', { ascending: false })

    if (user?.role !== 'SuperAdmin' && user?.role !== 'Admin') {
      query = query.eq('user_id', user?.id)
    }

    const { data, error } = await query

    if (error) {
      toast.error('加载会话失败: ' + error.message)
    } else {
      setConversations(data || [])
    }
    setLoading(false)
  }

  const loadMessages = async (convId: string) => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true })

    if (error) {
      toast.error('加载消息失败: ' + error.message)
    } else {
      setMessages(data || [])
    }
  }

  useEffect(() => {
    loadConversations()
  }, [user])

  useEffect(() => {
    if (selectedConv) {
      loadMessages(selectedConv)
    }
  }, [selectedConv])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!inputMessage.trim() || !selectedConv) return

    const { error } = await supabase
      .from('messages')
      .insert({
        conversation_id: selectedConv,
        sender_id: user?.id,
        content: inputMessage,
        type: 'text',
        status: 'sent'
      })

    if (error) {
      toast.error('发送失败: ' + error.message)
    } else {
      setInputMessage('')
      await supabase
        .from('conversations')
        .update({ last_message: inputMessage })
        .eq('id', selectedConv)
      loadMessages(selectedConv)
    }
  }

  const handleCreateConversation = async () => {
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        user_id: user?.id,
        status: 'active'
      })
      .select()

    if (error) {
      toast.error('创建会话失败: ' + error.message)
    } else if (data) {
      setSelectedConv(data[0].id)
      loadConversations()
    }
  }

  const filteredConversations = conversations.filter(c => {
    return c.id.includes(search)
  })

  if (loading) {
    return (
      <div className="p-6 bg-[#0a0f1f] min-h-screen flex items-center justify-center">
        <div className="text-gray-400">加载中...</div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-[#0a0f1f] min-h-screen">
      <div className="max-w-7xl mx-auto h-[calc(100vh-120px)]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
          <Card className="md:col-span-1 flex flex-col h-full">
            <div className="p-4 border-b border-gray-800">
              <div className="flex items-center justify-between">
                <h2 className="text-white font-semibold">会话</h2>
                <Button variant="ghost" size="sm" onClick={loadConversations}>
                  <RefreshCw size={14} />
                </Button>
              </div>
              <div className="mt-2">
                <Input
                  placeholder="搜索会话..."
                  value={search}
                  onChange={(e: any) => setSearch(e.target.value)}
                  className="bg-[#1a1f35] border-gray-700 text-white text-sm"
                  prefix={<Search size={14} className="text-gray-400" />}
                />
              </div>
              <Button className="w-full mt-2" size="sm" onClick={handleCreateConversation}>
                <MessageSquare size={14} className="mr-2" /> 新会话
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`p-3 border-b border-gray-800 cursor-pointer hover:bg-[#1a1f35] transition-colors ${
                    selectedConv === conv.id ? 'bg-[#1a1f35]' : ''
                  }`}
                  onClick={() => setSelectedConv(conv.id)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-white text-sm font-medium">
                        {conv.user_id === user?.id ? '我' : conv.user_id}
                      </p>
                      <p className="text-gray-400 text-xs truncate max-w-[120px]">
                        {conv.last_message || '暂无消息'}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant={conv.status === 'active' ? 'success' : 'default'}>
                        {conv.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
              {filteredConversations.length === 0 && (
                <div className="text-center py-8 text-gray-400">暂无会话</div>
              )}
            </div>
          </Card>

          <Card className="md:col-span-2 flex flex-col h-full">
            {selectedConv ? (
              <>
                <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <User className="text-blue-400" size={16} />
                    </div>
                    <div>
                      <p className="text-white font-medium">用户</p>
                      <p className="text-gray-400 text-xs">在线</p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] p-3 rounded-lg ${
                          msg.sender_id === user?.id
                            ? 'bg-blue-500 text-white'
                            : 'bg-[#1a1f35] text-white'
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {new Date(msg.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                <div className="p-4 border-t border-gray-800">
                  <div className="flex gap-2">
                    <Input
                      value={inputMessage}
                      onChange={(e: any) => setInputMessage(e.target.value)}
                      onKeyDown={(e: any) => e.key === 'Enter' && handleSend()}
                      placeholder="输入消息..."
                      className="flex-1 bg-[#1a1f35] border-gray-700 text-white"
                    />
                    <button
                      onClick={handleSend}
                      className="p-2 bg-blue-500 rounded-lg hover:bg-blue-600"
                    >
                      <Send size={18} className="text-white" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center flex-col gap-4">
                <MessageSquare size={48} className="text-gray-600" />
                <p className="text-gray-400">选择一个会话开始聊天</p>
                <Button variant="primary" size="sm" onClick={handleCreateConversation}>
                  创建新会话
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
