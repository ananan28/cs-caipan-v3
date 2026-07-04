import { supabase } from '../lib/supabase'

export interface CheckNumberTask {
  taskId: string
  status: 'pending' | 'processing' | 'exported' | 'failed'
  resultUrl?: string
  total?: number
  processed?: number
}

export interface CheckNumberResult {
  phone: string
  registered: boolean
  has_avatar?: boolean
  avatar_analysis?: {
    gender?: string
    age?: number
    race?: string
    type?: string
  }
  last_active?: string
  carrier?: string
  line_type?: string
  error?: string
}

export class CheckNumberService {
  private baseUrl = 'https://api.checknumber.ai'
  private apiKey: string | null = null

  private async getApiKey(): Promise<string> {
    if (this.apiKey) return this.apiKey

    const { data } = await supabase
      .from('system_configs')
      .select('value')
      .eq('key', 'checknumber_api_key')
      .single()

    if (!data?.value) {
      throw new Error('CheckNumber API Key 未配置')
    }

    this.apiKey = data.value
    return this.apiKey
  }

  // 提交检测任务
  async submitTask(phones: string[], taskType: string): Promise<string> {
    const apiKey = await this.getApiKey()
    const formData = new FormData()

    // 将号码列表转为文件内容（每行一个号码）
    const fileContent = phones.join('\n')
    const file = new Blob([fileContent], { type: 'text/plain' })
    formData.append('file', file, 'numbers.txt')
    formData.append('task_type', taskType)

    const response = await fetch(`${this.baseUrl}/v1/tasks`, {
      method: 'POST',
      headers: {
        'X-API-Key': apiKey
      },
      body: formData
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`提交任务失败: ${response.status} - ${error}`)
    }

    const data = await response.json()
    return data.task_id
  }

  // 查询任务状态
  async getTaskStatus(taskId: string): Promise<CheckNumberTask> {
    const apiKey = await this.getApiKey()

    const response = await fetch(`${this.baseUrl}/v1/gettasks`, {
      method: 'POST',
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `task_id=${taskId}`
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`查询任务失败: ${response.status} - ${error}`)
    }

    const data = await response.json()
    return {
      taskId: data.task_id,
      status: data.status,
      resultUrl: data.result_url,
      total: data.total,
      processed: data.processed
    }
  }

  // 获取结果文件
  async getResults(resultUrl: string): Promise<CheckNumberResult[]> {
    const response = await fetch(resultUrl)

    if (!response.ok) {
      throw new Error(`获取结果失败: ${response.status}`)
    }

    const text = await response.text()
    const lines = text.split('\n').filter(line => line.trim())

    // 解析CSV格式（假设第一行是表头）
    const headers = lines[0].split(',').map(h => h.trim())
    const results: CheckNumberResult[] = []

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim())
      const record: any = {}

      headers.forEach((header, index) => {
        record[header] = values[index] || ''
      })

      results.push({
        phone: record.phone || record.number || '',
        registered: record.registered === 'true' || record.registered === '1',
        has_avatar: record.has_avatar === 'true' || record.has_avatar === '1',
        avatar_analysis: {
          gender: record.gender || undefined,
          age: parseInt(record.age) || undefined,
          race: record.race || undefined,
          type: record.avatar_type || undefined
        },
        last_active: record.last_active || undefined,
        carrier: record.carrier || undefined,
        line_type: record.line_type || undefined
      })
    }

    return results
  }

  // 完整的检测流程：提交 → 轮询 → 获取结果
  async detectBatch(phones: string[], taskType: string, maxWaitTime: number = 300000): Promise<CheckNumberResult[]> {
    // 1. 提交任务
    const taskId = await this.submitTask(phones, taskType)
    console.log(`📤 任务已提交: ${taskId}`)

    // 2. 轮询状态
    const startTime = Date.now()
    const pollInterval = 3000 // 3秒

    while (Date.now() - startTime < maxWaitTime) {
      await this.sleep(pollInterval)

      const status = await this.getTaskStatus(taskId)
      console.log(`📊 任务状态: ${status.status} (${status.processed || 0}/${status.total || '?'})`)

      if (status.status === 'exported') {
        // 3. 获取结果
        const results = await this.getResults(status.resultUrl!)
        console.log(`✅ 检测完成: ${results.length} 个号码`)
        return results
      }

      if (status.status === 'failed') {
        throw new Error('任务处理失败')
      }
    }

    throw new Error('检测超时')
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // 查询余额
  async getBalance(): Promise<number> {
    const apiKey = await this.getApiKey()

    const response = await fetch(`${this.baseUrl}/v1/balance`, {
      method: 'GET',
      headers: {
        'X-API-Key': apiKey
      }
    })

    if (!response.ok) {
      throw new Error(`查询余额失败: ${response.status}`)
    }

    const data = await response.json()
    return data.balance || 0
  }
}
