import { supabase } from '@/lib/supabase'

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export class DeepSeekService {
  private apiKey: string | null = null
  private apiUrl = 'https://api.deepseek.com/v1/chat/completions'

  // 从数据库加载 API Key
  private async loadApiKey(): Promise<string | null> {
    if (this.apiKey) return this.apiKey

    try {
      const { data } = await supabase
        .from('system_configs')
        .select('value')
        .eq('key', 'deepseek_api_key')
        .single()

      if (data) {
        this.apiKey = data.value
        return this.apiKey
      }
    } catch (error) {
      console.error('加载DeepSeek API Key失败:', error)
    }
    return null
  }

  // 对话接口
  async chat(
    messages: ChatMessage[],
    options?: { temperature?: number; max_tokens?: number }
  ): Promise<string> {
    const apiKey = await this.loadApiKey()

    if (!apiKey) {
      return this.getFallbackResponse(messages)
    }

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: messages,
          temperature: options?.temperature || 0.7,
          max_tokens: options?.max_tokens || 1000
        })
      })

      if (!response.ok) {
        console.error('DeepSeek API 错误:', response.status)
        return this.getFallbackResponse(messages)
      }

      const data = await response.json()
      return data.choices?.[0]?.message?.content || '抱歉，我没有理解您的问题。'
    } catch (error) {
      console.error('DeepSeek API 调用失败:', error)
      return this.getFallbackResponse(messages)
    }
  }

  // 降级回答
  private getFallbackResponse(messages: ChatMessage[]): string {
    const lastMessage = messages[messages.length - 1]?.content || ''

    if (lastMessage.includes('充值') || lastMessage.includes('USDT')) {
      return '💰 充值问题请联系客服或查看钱包页面。'
    }
    if (lastMessage.includes('订单') || lastMessage.includes('支付')) {
      return '📋 请前往订单中心查看您的订单状态。'
    }
    if (lastMessage.includes('号码') || lastMessage.includes('检测')) {
      return '📱 号码检测功能请前往任务中心使用。'
    }
    if (lastMessage.includes('邮箱') || lastMessage.includes('注册')) {
      return '📧 邮箱相关问题请查看注册页面。'
    }

    return '您好，我是智能客服助手。有什么可以帮助您的吗？'
  }
}

// 导出单例
export const deepseekService = new DeepSeekService()
