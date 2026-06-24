// 直接硬编码 API Key（临时方案，确保能用）
const API_KEY = 'sk-c671a8125f4d4284bd69f9b98dfe226b'
const API_URL = 'https://api.deepseek.com/v1/chat/completions'

export interface AIMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

const SYSTEM_PROMPT = `你是财盛集团的AI客服助手。你的职责是：
1. 回答用户关于平台功能的问题
2. 帮助用户解决充值、任务、积分等问题
3. 提供友好、专业的服务态度
4. 如果遇到无法解决的问题，引导用户联系人工客服

平台信息：
- 名称：财盛集团
- 业务：USDT充值、检测任务、积分系统
- 客服工作时间：7x24小时`

export const sendAIMessage = async (messages: AIMessage[]): Promise<string> => {
  try {
    console.log('发送AI请求...', messages)
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    })

    console.log('AI响应状态:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('AI错误响应:', errorText)
      return '❌ AI服务暂时不可用，请稍后重试或联系人工客服。'
    }

    const data = await response.json()
    console.log('AI回复:', data)
    return data.choices?.[0]?.message?.content || '抱歉，没有获取到回复。'
    
  } catch (error) {
    console.error('AI请求失败:', error)
    return '❌ 网络异常，请检查网络连接后重试。'
  }
}
