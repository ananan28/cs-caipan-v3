import { useState, useEffect, useRef } from 'react'
import { Card } from '@/components/Common/Card'
import { Badge } from '@/components/Common/Badge'
import { Button } from '@/components/Common/Button'
import { Input } from '@/components/Forms/Input'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import {
  MessageSquare, Send, User, RefreshCw, Search,
  Phone, Video, Smile, Paperclip, X, Users as UsersIcon,
  Image, File, Upload, Loader
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
  file_url?: string
  file_name?: string
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

const emojis = [
  '😀', '😁', '😂', '🤣', '😃', '😄', '😅', '😆', '😉', '😊', '😋', '😎',
  '😍', '🥰', '😘', '😗', '😙', '😚', '🥲', '😜', '😝', '😛', '🤑', '🤗',
  '🤩', '🤪', '🤫', '🤭', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯',
  '👍', '👎', '👊', '✊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏',
  '✌️', '🤟', '🤘', '👌', '🤌', '🤞', '🖐️', '✋', '👋', '🤚', '🖖'
]

export const Chat = () => {
  const { user } = useAuthStore()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [users, setUsers] = useState<Record<string, string>>({})
  const [allUsers, setAllUsers] = useState<any[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedConv, setSelectedConv] = useState<string | null>(null)
  const [inputMessage, setInputMessage] = useState('')
  const [search, setSearch] = useState('')
  const [showEmoji, setShowEmoji] = useState(false)
  const [showUserSelector, setShowUserSelector] = useState(false)
  const [userSearch, setUserSearch] = useState('')
  const [uploading, setUploading] = useState(false)
  const [showFileMenu, setShowFileMenu] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const emojiRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  const isAdmin = user?.role === 'SuperAdmin' || user?.role === 'Admin'

  const loadUsers = async () => {
    const { data } = await supabase.from('users').select('id, email, username, role')
    if (data) {
      const map: Record<string, string> = {}
      data.forEach(u => {
        map[u.id] = u.username || u.email || u.id.slice(0, 8)
      })
      setUsers(map)
      setAllUsers(data.filter(u => u.id !== user?.id))
    }
  }

  const loadConversations = async () => {
    setLoading(true)
    let query = supabase
      .from('conversations')
      .select('*')
      .order('created_at', { ascending: false })

    if (!isAdmin) {
      query = query.eq('user_id', user?.id)
    }

    const { data, error } = await query

    if (error) {
      toast.error('加载会话失败: ' + error.message)
    } else {
      setConversations(data || [])
      if (data && data.length > 0 && !selectedConv) {
        setSelectedConv(data[0].id)
      }
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
    loadUsers()
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

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
        setShowEmoji(false)
      }
      if (fileMenuRef.current && !fileMenuRef.current.contains(e.target as Node)) {
        setShowFileMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fileMenuRef = useRef<HTMLDivElement>(null)

  const handleSendMessage = async (content: string, type: string = 'text', fileUrl?: string, fileName?: string) => {
    if (!selectedConv) {
      toast.error('请先选择会话')
      return
    }

    const { error } = await supabase
      .from('messages')
      .insert({
        conversation_id: selectedConv,
        sender_id: user?.id,
        content: content || (type === 'image' ? '📷 图片' : '📎 文件'),
        type: type,
        status: 'sent',
        file_url: fileUrl || null,
        file_name: fileName || null
      })

    if (error) {
      toast.error('发送失败: ' + error.message)
      return false
    }

    await supabase
      .from('conversations')
      .update({ last_message: content || (type === 'image' ? '📷 图片' : '📎 文件') })
      .eq('id', selectedConv)
    loadMessages(selectedConv)
    return true
  }

  const handleSend = async () => {
    if (!inputMessage.trim()) return
    await handleSendMessage(inputMessage, 'text')
    setInputMessage('')
  }

  // 上传文件到 Supabase Storage
  const uploadFile = async (file: File, type: 'image' | 'file') => {
    if (!selectedConv) {
      toast.error('请先选择会话')
      return
    }

    setUploading(true)
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `chat/${selectedConv}/${fileName}`

    try {
      const { data, error } = await supabase.storage
        .from('chat-files')
        .upload(filePath, file)

      if (error) {
        toast.error('上传失败: ' + error.message)
        setUploading(false)
        return
      }

      const { data: urlData } = supabase.storage
        .from('chat-files')
        .getPublicUrl(filePath)

      await handleSendMessage(
        type === 'image' ? '📷 图片' : `📎 ${file.name}`,
        type === 'image' ? 'image' : 'file',
        urlData.publicUrl,
        file.name
      )

      toast.success('文件已发送')
    } catch (error) {
      toast.error('上传失败')
    }

    setUploading(false)
    setShowFileMenu(false)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      uploadFile(file, 'file')
    }
    e.target.value = ''
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      uploadFile(file, 'image')
    }
    e.target.value = ''
  }

  const handleCreateConversation = async (targetUserId: string) => {
    if (!targetUserId) {
      toast.error('请选择用户')
      return
    }

    const { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .eq('user_id', targetUserId)
      .limit(1)

    if (existing && existing.length > 0) {
      setSelectedConv(existing[0].id)
      setShowUserSelector(false)
      toast.info('已进入会话')
      return
    }

    const { data, error } = await supabase
      .from('conversations')
      .insert({
        user_id: targetUserId,
        status: 'active'
      })
      .select()

    if (error) {
      toast.error('创建会话失败: ' + error.message)
    } else if (data) {
      setSelectedConv(data[0].id)
      setShowUserSelector(false)
      loadConversations()
      toast.success('会话已创建')
    }
  }

  const insertEmoji = (emoji: string) => {
    setInputMessage(prev => prev + emoji)
    setShowEmoji(false)
  }

  const getUserName = (id: string) => {
    return users[id] || id.slice(0, 8)
  }

  const filteredConversations = conversations.filter(c => {
    const name = getUserName(c.user_id)
    return name.includes(search) || c.id.includes(search)
  })

  const filteredUsers = allUsers.filter(u => {
    const name = u.username || u.email || ''
    return name.includes(userSearch) || u.email.includes(userSearch)
  })

  const renderMessageContent = (msg: Message) => {
    if (msg.type === 'image' && msg.file_url) {
      return (
        <div>
          <img 
            src={msg.file_url} 
            alt={msg.file_name || '图片'} 
            className="max-w-[200px] max-h-[200px] rounded-lg object-cover cursor-pointer"
            onClick={() => window.open(msg.file_url, '_blank')}
          />
          <p className="text-xs opacity-70 mt-1">{msg.file_name}</p>
        </div>
      )
    }
    if (msg.type === 'file' && msg.file_url) {
      return (
        <div>
          <div className="flex items-center gap-2 bg-white/10 rounded-lg p-2">
            <File size={20} />
            <a 
              href={msg.file_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm underline hover:text-blue-300"
            >
              {msg.file_name || '下载文件'}
            </a>
          </div>
        </div>
      )
    }
    return <p className="text-sm">{msg.content}</p>
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
              {isAdmin && (
                <Button className="w-full mt-2" size="sm" onClick={() => setShowUserSelector(true)}>
                  <UsersIcon size={14} className="mr-2" /> 新会话
                </Button>
              )}
              {!isAdmin && (
                <Button className="w-full mt-2" size="sm" onClick={() => handleCreateConversation(user?.id || '')}>
                  <MessageSquare size={14} className="mr-2" /> 联系客服
                </Button>
              )}
            </div>
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`p-3 border-b border-gray-800 cursor-pointer hover:bg-[#1a1f35] transition-colors ${selectedConv === conv.id ? 'bg-[#1a1f35]' : ''}`}
                  onClick={() => setSelectedConv(conv.id)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-white text-sm font-medium">{getUserName(conv.user_id)}</p>
                      <p className="text-gray-400 text-xs truncate max-w-[120px]">{conv.last_message || '暂无消息'}</p>
                    </div>
                    <Badge variant={conv.status === 'active' ? 'success' : 'default'}>
                      {conv.status}
                    </Badge>
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
                      <p className="text-white font-medium">
                        {getUserName(conversations.find(c => c.id === selectedConv)?.user_id || '')}
                      </p>
                      <p className="text-gray-400 text-xs">在线</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-[#1a1f35] rounded-lg">
                      <Phone size={16} className="text-gray-400" />
                    </button>
                    <button className="p-2 hover:bg-[#1a1f35] rounded-lg">
                      <Video size={16} className="text-gray-400" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] p-3 rounded-lg ${msg.sender_id === user?.id ? 'bg-blue-500 text-white' : 'bg-[#1a1f35] text-white'}`}>
                        {renderMessageContent(msg)}
                        <p className="text-xs opacity-70 mt-1">{new Date(msg.created_at).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                <div className="p-4 border-t border-gray-800">
                  <div className="flex gap-2 relative">
                    <button
                      className="p-2 hover:bg-[#1a1f35] rounded-lg"
                      onClick={() => setShowEmoji(!showEmoji)}
                    >
                      <Smile size={18} className="text-gray-400" />
                    </button>

                    {showEmoji && (
                      <div ref={emojiRef} className="absolute bottom-14 left-0 bg-[#1a1f35] border border-gray-700 rounded-xl p-3 w-72 max-h-48 overflow-y-auto grid grid-cols-8 gap-1 z-50">
                        {emojis.map((emoji) => (
                          <button key={emoji} onClick={() => insertEmoji(emoji)} className="text-2xl hover:bg-white/10 rounded p-1 transition-colors">
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="relative">
                      <button
                        className="p-2 hover:bg-[#1a1f35] rounded-lg"
                        onClick={() => setShowFileMenu(!showFileMenu)}
                      >
                        <Paperclip size={18} className="text-gray-400" />
                      </button>

                      {showFileMenu && (
                        <div ref={fileMenuRef} className="absolute bottom-14 left-0 bg-[#1a1f35] border border-gray-700 rounded-xl p-2 min-w-[160px] z-50">
                          <button
                            onClick={() => imageInputRef.current?.click()}
                            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/10 rounded-lg text-white text-sm"
                          >
                            <Image size={16} /> 图片
                          </button>
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/10 rounded-lg text-white text-sm"
                          >
                            <File size={16} /> 文件
                          </button>
                        </div>
                      )}
                    </div>

                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileSelect}
                      className="hidden"
                    />

                    <Input
                      value={inputMessage}
                      onChange={(e: any) => setInputMessage(e.target.value)}
                      onKeyDown={(e: any) => e.key === 'Enter' && handleSend()}
                      placeholder="输入消息..."
                      className="flex-1 bg-[#1a1f35] border-gray-700 text-white"
                      disabled={uploading}
                    />
                    <button
                      onClick={handleSend}
                      disabled={uploading}
                      className="p-2 bg-blue-500 rounded-lg hover:bg-blue-600 disabled:opacity-50"
                    >
                      {uploading ? <Loader size={18} className="animate-spin text-white" /> : <Send size={18} className="text-white" />}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center flex-col gap-4">
                <MessageSquare size={48} className="text-gray-600" />
                <p className="text-gray-400">选择一个会话开始聊天</p>
                {isAdmin && (
                  <Button variant="primary" size="sm" onClick={() => setShowUserSelector(true)}>
                    <UsersIcon size={14} className="mr-2" /> 创建新会话
                  </Button>
                )}
                {!isAdmin && (
                  <Button variant="primary" size="sm" onClick={() => handleCreateConversation(user?.id || '')}>
                    联系客服
                  </Button>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>

      {showUserSelector && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100]">
          <div className="bg-[#12182b] border border-gray-700 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">选择用户</h2>
              <button onClick={() => setShowUserSelector(false)} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <div className="mb-4">
              <Input
                placeholder="搜索用户..."
                value={userSearch}
                onChange={(e: any) => setUserSearch(e.target.value)}
                className="bg-[#1a1f35] border-gray-700 text-white"
                prefix={<Search size={16} className="text-gray-400" />}
              />
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-8 text-gray-400">没有其他用户</div>
              ) : (
                filteredUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => handleCreateConversation(u.id)}
                    className="w-full flex items-center justify-between p-3 bg-[#1a1f35] hover:bg-[#1a1f35]/70 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <User className="text-blue-400" size={14} />
                      </div>
                      <div className="text-left">
                        <p className="text-white text-sm font-medium">{u.username || u.email}</p>
                        <p className="text-gray-400 text-xs">{u.email}</p>
                      </div>
                    </div>
                    <Badge variant="info">{u.role || 'User'}</Badge>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
