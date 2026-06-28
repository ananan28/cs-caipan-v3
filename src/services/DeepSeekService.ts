import { supabase } from '@/lib/supabase'

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export class DeepSeekService {
  private apiKey: string | null = null
  private apiUrl = 'https://api.deepseek.com/v1/chat/completions'

  private async loadApiKey(): Promise<string | null> {
    if (this.apiKey) return this.apiKey

    try {
      const { data } = await supabase
        .from('system_configs')
        .select('value')
        .eq('key', 'openai_api_key')
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

  async chat(
    messages: ChatMessage[],
    options?: { temperature?: number; max_tokens?: number }
  ): Promise<string> {
    const apiKey = await this.loadApiKey()

    // 如果没有 API Key，返回提示
    if (!apiKey) {
      return '⚠️ AI客服未配置，请联系管理员。'
    }

    try {
      // 构建系统提示词 - 定义 AI 的角色和知识范围
      const systemMessage: ChatMessage = {
        role: 'system',
        content: `你是「财盛集团」的智能客服助手。

你的职责：
1. 回答用户关于平台功能的问题（充值、号码筛选、订单查询、钱包、邀请系统等）
2. 引导用户完成操作
3. 提供友好、专业的服务

平台功能摘要：
- 充值：支持 USDT-TRC20 充值，金额自动添加随机尾数（0.01-0.30），30分钟内有效
- 号码筛选：支持全球号码运营商识别、虚拟号码识别、性别年龄检测
- 订单中心：查看充值订单状态
- 钱包：查看余额、转账
- 邀请系统：邀请好友获得返佣

回复要求：
- 简洁、清晰、专业
- 如果用户问的问题超出你的知识范围，引导用户联系人工客服
- 使用中文回复
- 不要编造虚假信息`
      }

      // 构建完整消息列表
      const fullMessages = [systemMessage, ...messages]

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: fullMessages,
          temperature: options?.temperature || 0.7,
          max_tokens: options?.max_tokens || 800,
          stream: false
        })
      })

      if (!response.ok) {
        console.error('DeepSeek API 错误:', response.status)
        return this.getFallbackResponse(messages)
      }

      const data = await response.json()
      const reply = data.choices?.[0]?.message?.content

      if (reply) {
        return reply
      }

      return this.getFallbackResponse(messages)
    } catch (error) {
      console.error('DeepSeek API 调用失败:', error)
      return this.getFallbackResponse(messages)
    }
  }

  // 降级回复（API 失败时使用）
  private getFallbackResponse(messages: ChatMessage[]): string {
    const lastMessage = messages[messages.length - 1]?.content || ''

    if (lastMessage.includes('充值') || lastMessage.includes('USDT')) {
      return '💳 充值功能支持 USDT-TRC20，充值后请等待系统确认。如有问题请联系人工客服。'
    }
    if (lastMessage.includes('订单') || lastMessage.includes('支付')) {
      return '📋 您可以在订单中心查看所有订单状态。'
    }
    if (lastMessage.includes('号码') || lastMessage.includes('筛选')) {
      return '📱 号码筛选功能支持运营商识别、虚拟号码检测、性别年龄分析等。'
    }
    if (lastMessage.includes('钱包') || lastMessage.includes('余额')) {
      return '💰 您可以在钱包页面查看余额和进行转账操作。'
    }
    if (lastMessage.includes('邀请') || lastMessage.includes('返佣')) {
      return '🤝 邀请好友注册可获得返佣奖励，详情请查看邀请系统。'
    }
    if (lastMessage.includes('客服') || lastMessage.includes('人工')) {
      return '👤 正在为您转接人工客服，请稍候...'
    }

    return '您好，我是「财盛集团」的智能客服助手。请问有什么可以帮助您的？您可以咨询充值、号码筛选、订单查询等问题。'
  }
}

// 导出单例
export const deepseekService = new DeepSeekService()
