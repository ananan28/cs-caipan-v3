import { useState, useEffect, useRef } from 'react'
import { MessageSquare, X, Send, Minimize2, Maximize2 } from 'lucide-react'
import { useChatStore } from '@/store/chatStore'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

export const FloatingChat = () => {
  const { user } = useAuthStore()
  const { messages, addMessage } = useChatStore()
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [input, setInput] = useState('')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const initSession = async () => {
      if (!user?.id) return
      const { data } = await supabase
        .from('conversations')
        .select('id')
        .eq('user_id', user.id)
        .limit(1)
      
      if (data && data.length > 0) {
        setSessionId(data[0].id)
      } else {
        const { data: newSession } = await supabase
          .from('conversations')
          .insert({ user_id: user.id, status: 'active' })
          .select()
        if (newSession) setSessionId(newSession[0].id)
      }
    }
    initSession()
  }, [user])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || !sessionId) return

    const { error } = await supabase
      .from('messages')
      .insert({
        conversation_id: sessionId,
        sender_id: user?.id,
        content: input,
        type: 'text',
        status: 'sent'
      })

    if (error) {
      toast.error('发送失败')
    } else {
      addMessage({ 
        id: Date.now().toString(), 
        content: input, 
        sender_id: user?.id || '', 
        created_at: new Date().toISOString() 
      })
      setInput('')
    }
  }

  const toggleOpen = () => setIsOpen(!isOpen)
  const toggleMinimize = () => setIsMinimized(!isMinimized)

  if (!user) return null

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className={`bg-[#12182b] border border-gray-700 rounded-2xl shadow-2xl transition-all duration-300 ${isMinimized ? 'w-72 h-14' : 'w-80 h-[480px]'} flex flex-col`}>
          <div className="flex items-center justify-between p-3 border-b border-gray-700">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-white font-medium text-sm">客服中心</span>
              <span className="text-green-400 text-xs">在线</span>
            </div>
            <div className="flex gap-1">
              <button onClick={toggleMinimize} className="text-gray-400 hover:text-white p-1">
                {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
              </button>
              <button onClick={toggleOpen} className="text-gray-400 hover:text-white p-1">
                <X size={14} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {messages.map((msg: any) => (
                  <div key={msg.id} className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-2 rounded-lg text-sm ${msg.sender_id === user?.id ? 'bg-blue-500 text-white' : 'bg-[#1a1f35] text-white'}`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-3 border-t border-gray-700 flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="输入消息..."
                  className="flex-1 bg-[#1a1f35] border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                />
                <button onClick={sendMessage} className="p-2 bg-blue-500 rounded-lg hover:bg-blue-600">
                  <Send size={16} className="text-white" />
                </button>
              </div>
            </>
          )}
        </div>
      ) : (
        <button
          onClick={toggleOpen}
          className="bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition-all hover:scale-105 relative"
        >
          <MessageSquare size={24} />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">1</span>
        </button>
      )}
    </div>
  )
}
