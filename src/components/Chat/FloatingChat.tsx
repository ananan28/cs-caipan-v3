import { useState, useEffect, useRef } from 'react'
import { MessageSquare, X, Send } from 'lucide-react'

export const FloatingChat = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<{id: string, content: string, sender: string}[]>([])
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = () => {
    if (!input.trim()) return
    setMessages([...messages, { id: Date.now().toString(), content: input, sender: 'user' }])
    setInput('')
    // 模拟回复
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        content: '收到，我会尽快处理！', 
        sender: 'bot' 
      }])
    }, 1000)
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="bg-[#12182b] border border-gray-700 rounded-2xl shadow-2xl w-80 h-[400px] flex flex-col">
          <div className="flex items-center justify-between p-3 border-b border-gray-700">
            <span className="text-white font-medium text-sm">客服中心</span>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
              <X size={18} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-2 rounded-lg text-sm ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-[#1a1f35] text-white'}`}>
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
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition-all hover:scale-105"
        >
          <MessageSquare size={24} />
        </button>
      )}
    </div>
  )
}
