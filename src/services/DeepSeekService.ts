import { supabase } from '@/lib/supabase'

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export class DeepSeekService {
  private apiKey: string | null = null
  private apiUrl = 'https://integrate.api.nvidia.com/v1/chat/completions'

  private async loadApiKey(): Promise<string | null> {
    if (this.apiKey) return this.apiKey

    try {
      const { data } = await supabase
        .from('system_configs')
        .select('value')
        .eq('key', 'nvidia_api_key')
        .single()

      if (data) {
        this.apiKey = data.value
        return this.apiKey
      }
    } catch (error) {
      console.error('加载NVIDIA API Key失败:', error)
    }
    return null
  }

  async chat(
    messages: ChatMessage[],
    options?: { temperature?: number; max_tokens?: number }
  ): Promise<string> {
    const apiKey = await this.loadApiKey()

    if (!apiKey) {
      return '⚠️ API未配置，请联系管理员。'
    }

    try {
      const systemMessage: ChatMessage = {
        role: 'system',
        content: `你是「财盛集团」的智能客服助手。自动识别用户输入的语言，用相同语言回复。

职责：
1. 回答用户关于平台功能的问题（充值、号码筛选、订单查询、钱包、邀请系统等）
2. 引导用户完成操作
3. 提供友好、专业的服务

回复要求：简洁、清晰、专业。`
      }

      const fullMessages = [systemMessage, ...messages]

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'deepseek-ai/deepseek-r1',
          messages: fullMessages,
          temperature: options?.temperature || 0.7,
          max_tokens: options?.max_tokens || 500
        })
      })

      if (!response.ok) {
        console.error('NVIDIA API 错误:', response.status)
        return this.getFallbackResponse(messages)
      }

      const data = await response.json()
      const reply = data.choices?.[0]?.message?.content

      if (reply) {
        return reply
      }

      return this.getFallbackResponse(messages)
    } catch (error) {
      console.error('NVIDIA API 调用失败:', error)
      return this.getFallbackResponse(messages)
    }
  }

  private getFallbackResponse(messages: ChatMessage[]): string {
    const last = messages[messages.length - 1]?.content || ''
    if (last.includes('充值')) return '💳 充值支持 USDT-TRC20，30分钟内有效。'
    if (last.includes('号码')) return '📱 号码筛选支持运营商识别、虚拟号码检测、性别年龄分析。'
    if (last.includes('订单')) return '📋 请在订单中心查看。'
    return '您好，我是「财盛集团」的智能客服助手。请问有什么可以帮助您的？'
  }
}

export const deepseekService = new DeepSeekService()
