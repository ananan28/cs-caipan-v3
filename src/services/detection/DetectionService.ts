import { supabase } from '@/lib/supabase'

// 检测结果类型
export interface DetectionResult {
  phone: string
  operator?: string | null
  is_virtual?: boolean
  is_landline?: boolean
  gender?: string | null
  age?: number | null
  whatsapp?: {
    registered: boolean
    has_avatar: boolean
    avatar_analysis?: any
  }
  telegram?: {
    registered: boolean
    has_avatar: boolean
    avatar_analysis?: any
  }
  signal?: {
    registered: boolean
  }
  line?: {
    registered: boolean
  }
  imessage?: {
    active: boolean
  }
  facebook?: {
    registered: boolean
    has_avatar: boolean
    active: boolean
  }
  instagram?: {
    registered: boolean
    has_avatar: boolean
    is_public: boolean
  }
  twitter?: {
    registered: boolean
    has_avatar: boolean
    verified: boolean
  }
  viber?: {
    registered: boolean
  }
  zalo?: {
    registered: boolean
  }
  rcs?: {
    active: boolean
  }
  source: string
  checked_at: string
}

// 检测服务类
export class DetectionService {
  
  // 批量检测
  async detectBatch(phones: string[], items: string[]): Promise<DetectionResult[]> {
    const results: DetectionResult[] = []
    
    for (const phone of phones) {
      const result = await this.detectSingle(phone, items)
      results.push(result)
    }
    
    return results
  }

  // 单个号码检测
  async detectSingle(phone: string, items: string[]): Promise<DetectionResult> {
    const cleaned = phone.replace(/\D/g, '')
    
    // 先从缓存获取
    const cached = await this.getCachedResult(cleaned)
    if (cached) {
      // 只返回客户需要的检测项
      return this.filterResult(cached, items)
    }

    // 调用API检测
    const result = await this.callAPIs(cleaned, items)
    
    // 存入缓存
    await this.saveToCache(result)
    
    return result
  }

  // 调用所有需要的API
  private async callAPIs(phone: string, items: string[]): Promise<DetectionResult> {
    const result: DetectionResult = {
      phone,
      source: 'api',
      checked_at: new Date().toISOString()
    }

    // 并行调用API
    const promises: Promise<void>[] = []

    // 运营商检测
    if (items.includes('operator') || items.includes('virtual')) {
      promises.push(this.detectOperator(phone, result))
    }

    // WhatsApp检测
    if (items.some(i => i.startsWith('whatsapp'))) {
      promises.push(this.detectWhatsApp(phone, result))
    }

    // Telegram检测
    if (items.some(i => i.startsWith('telegram'))) {
      promises.push(this.detectTelegram(phone, result))
    }

    // Signal检测
    if (items.includes('signal_registered')) {
      promises.push(this.detectSignal(phone, result))
    }

    // Line检测
    if (items.includes('line_registered')) {
      promises.push(this.detectLine(phone, result))
    }

    // iMessage检测
    if (items.includes('imessage_registered')) {
      promises.push(this.detectIMessage(phone, result))
    }

    // Facebook检测
    if (items.some(i => i.startsWith('facebook'))) {
      promises.push(this.detectFacebook(phone, result))
    }

    // Instagram检测
    if (items.some(i => i.startsWith('instagram'))) {
      promises.push(this.detectInstagram(phone, result))
    }

    // Twitter检测
    if (items.some(i => i.startsWith('twitter'))) {
      promises.push(this.detectTwitter(phone, result))
    }

    // Viber检测
    if (items.includes('viber_registered')) {
      promises.push(this.detectViber(phone, result))
    }

    // Zalo检测
    if (items.includes('zalo_registered')) {
      promises.push(this.detectZalo(phone, result))
    }

    // RCS检测
    if (items.includes('rcs_registered')) {
      promises.push(this.detectRCS(phone, result))
    }

    await Promise.all(promises)
    return result
  }

  // ===== 各平台检测方法 =====

  private async detectOperator(phone: string, result: DetectionResult): Promise<void> {
    try {
      // 调用 omkarcloud API
      const apiKey = await this.getConfig('omkarcloud_api_key')
      if (!apiKey) return

      const response = await fetch(
        `https://api.carrier-lookup.omkar.cloud/lookup?phone=${phone}&api_key=${apiKey}`,
        { signal: AbortSignal.timeout(5000) }
      )

      if (response.ok) {
        const data = await response.json()
        result.operator = data.carrier || null
        result.is_virtual = this.isVirtualNumber(data.carrier, data.line_type)
        result.is_landline = data.line_type === 'landline'
      }
    } catch (error) {
      console.error('运营商检测失败:', error)
    }
  }

  private async detectWhatsApp(phone: string, result: DetectionResult): Promise<void> {
    try {
      const apiKey = await this.getConfig('checknumber_api_key')
      if (!apiKey) return

      const response = await fetch(
        `https://api.checknumber.ai/v1/check?phone=${phone}&platforms=whatsapp`,
        {
          headers: { 'X-API-Key': apiKey },
          signal: AbortSignal.timeout(8000)
        }
      )

      if (response.ok) {
        const data = await response.json()
        result.whatsapp = {
          registered: data.whatsapp?.registered || false,
          has_avatar: data.whatsapp?.has_avatar || false,
          avatar_analysis: data.whatsapp?.avatar_analysis || null
        }
      }
    } catch (error) {
      console.error('WhatsApp检测失败:', error)
    }
  }

  private async detectTelegram(phone: string, result: DetectionResult): Promise<void> {
    try {
      const apiKey = await this.getConfig('checknumber_api_key')
      if (!apiKey) return

      const response = await fetch(
        `https://api.checknumber.ai/v1/check?phone=${phone}&platforms=telegram`,
        {
          headers: { 'X-API-Key': apiKey },
          signal: AbortSignal.timeout(8000)
        }
      )

      if (response.ok) {
        const data = await response.json()
        result.telegram = {
          registered: data.telegram?.registered || false,
          has_avatar: data.telegram?.has_avatar || false,
          avatar_analysis: data.telegram?.avatar_analysis || null
        }
      }
    } catch (error) {
      console.error('Telegram检测失败:', error)
    }
  }

  private async detectSignal(phone: string, result: DetectionResult): Promise<void> {
    // 待实现
    result.signal = { registered: false }
  }

  private async detectLine(phone: string, result: DetectionResult): Promise<void> {
    // 待实现
    result.line = { registered: false }
  }

  private async detectIMessage(phone: string, result: DetectionResult): Promise<void> {
    // 待实现
    result.imessage = { active: false }
  }

  private async detectFacebook(phone: string, result: DetectionResult): Promise<void> {
    // 待实现
    result.facebook = { registered: false, has_avatar: false, active: false }
  }

  private async detectInstagram(phone: string, result: DetectionResult): Promise<void> {
    // 待实现
    result.instagram = { registered: false, has_avatar: false, is_public: false }
  }

  private async detectTwitter(phone: string, result: DetectionResult): Promise<void> {
    // 待实现
    result.twitter = { registered: false, has_avatar: false, verified: false }
  }

  private async detectViber(phone: string, result: DetectionResult): Promise<void> {
    // 待实现
    result.viber = { registered: false }
  }

  private async detectZalo(phone: string, result: DetectionResult): Promise<void> {
    // 待实现
    result.zalo = { registered: false }
  }

  private async detectRCS(phone: string, result: DetectionResult): Promise<void> {
    // 待实现
    result.rcs = { active: false }
  }

  // ===== 辅助方法 =====

  private isVirtualNumber(carrier: string, lineType: string): boolean {
    const virtualCarriers = ['Bandwidth', 'Google Voice', 'TextNow', 'Twilio', 'Grasshopper', 'Vonage', 'RingCentral']
    if (carrier && virtualCarriers.some(v => carrier.includes(v))) return true
    if (lineType && lineType.toLowerCase().includes('voip')) return true
    return false
  }

  private filterResult(result: DetectionResult, items: string[]): DetectionResult {
    const filtered: any = { phone: result.phone, source: result.source, checked_at: result.checked_at }
    
    // 只保留客户需要的字段
    const fieldMap: Record<string, string> = {
      'operator': 'operator',
      'virtual': 'is_virtual',
      'whatsapp_registered': 'whatsapp',
      'whatsapp_avatar': 'whatsapp',
      'whatsapp_avatar_analysis': 'whatsapp',
      'telegram_registered': 'telegram',
      'telegram_avatar': 'telegram',
      'telegram_avatar_analysis': 'telegram',
      'signal_registered': 'signal',
      'line_registered': 'line',
      'imessage_registered': 'imessage',
      'facebook_registered': 'facebook',
      'facebook_avatar': 'facebook',
      'facebook_avatar_analysis': 'facebook',
      'facebook_active': 'facebook',
      'instagram_registered': 'instagram',
      'instagram_avatar': 'instagram',
      'instagram_avatar_analysis': 'instagram',
      'instagram_type': 'instagram',
      'twitter_registered': 'twitter',
      'twitter_avatar': 'twitter',
      'twitter_avatar_analysis': 'twitter',
      'twitter_verified': 'twitter',
      'viber_registered': 'viber',
      'zalo_registered': 'zalo',
      'rcs_registered': 'rcs'
    }

    for (const item of items) {
      const field = fieldMap[item]
      if (field && result[field as keyof DetectionResult] !== undefined) {
        filtered[field] = result[field as keyof DetectionResult]
      }
    }

    return filtered
  }

  private async getCachedResult(phone: string): Promise<DetectionResult | null> {
    const { data } = await supabase
      .from('cache_phone_main')
      .select('*')
      .eq('phone', phone)
      .maybeSingle()
    
    if (!data) return null
    
    return {
      phone: data.phone,
      operator: data.operator,
      is_virtual: data.is_virtual,
      is_landline: data.is_landline,
      gender: data.gender,
      age: data.age,
      source: data.data_source || 'cache',
      checked_at: data.last_checked
    }
  }

  private async saveToCache(result: DetectionResult): Promise<void> {
    await supabase
      .from('cache_phone_main')
      .upsert({
        phone: result.phone,
        operator: result.operator,
        is_virtual: result.is_virtual,
        is_landline: result.is_landline,
        gender: result.gender,
        age: result.age,
        data_source: result.source,
        last_checked: new Date().toISOString()
      }, { onConflict: 'phone' })
  }

  private async getConfig(key: string): Promise<string | null> {
    const { data } = await supabase
      .from('system_configs')
      .select('value')
      .eq('key', key)
      .single()
    return data?.value || null
  }
}

  // ========== 检测方法实现 ==========

  private async detectOperator(phone: string, result: DetectionResult): Promise<void> {
    try {
      const apiKey = await this.getConfig('omkarcloud_api_key')
      if (!apiKey) {
        console.warn('omkarcloud API Key 未配置')
        return
      }

      const response = await fetch(
        `https://api.carrier-lookup.omkar.cloud/lookup?phone=${phone}&api_key=${apiKey}`,
        { signal: AbortSignal.timeout(8000) }
      )

      if (!response.ok) {
        console.warn('omkarcloud API 返回错误:', response.status)
        return
      }

      const data = await response.json()
      console.log('omkarcloud 返回:', data)

      if (data.carrier) {
        result.operator = data.carrier
        result.is_virtual = this.isVirtualNumber(data.carrier, data.line_type)
        result.is_landline = data.line_type === 'landline'
        result.source = 'omkarcloud'
      }
    } catch (error) {
      console.error('运营商检测失败:', error)
    }
  }

  private async detectWhatsApp(phone: string, result: DetectionResult): Promise<void> {
    try {
      const apiKey = await this.getConfig('checknumber_api_key')
      if (!apiKey) {
        console.warn('CheckNumber.AI API Key 未配置')
        return
      }

      const response = await fetch(
        `https://api.checknumber.ai/v1/check?phone=${phone}&platforms=whatsapp`,
        {
          headers: { 'X-API-Key': apiKey },
          signal: AbortSignal.timeout(10000)
        }
      )

      if (!response.ok) {
        console.warn('CheckNumber.AI API 返回错误:', response.status)
        return
      }

      const data = await response.json()
      console.log('CheckNumber.AI 返回:', data)

      result.whatsapp = {
        registered: data.whatsapp?.registered || false,
        has_avatar: data.whatsapp?.has_avatar || false,
        avatar_analysis: data.whatsapp?.avatar_analysis || null
      }
    } catch (error) {
      console.error('WhatsApp检测失败:', error)
    }
  }
