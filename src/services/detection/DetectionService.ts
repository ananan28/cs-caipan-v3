import { supabase } from '../../lib/supabase'

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

export class DetectionService {
  
  async detectBatch(phones: string[], items: string[]): Promise<DetectionResult[]> {
    const results: DetectionResult[] = []
    for (const phone of phones) {
      const result = await this.detectSingle(phone, items)
      results.push(result)
    }
    return results
  }

  async detectSingle(phone: string, items: string[]): Promise<DetectionResult> {
    const cleaned = phone.replace(/\D/g, '')
    const cached = await this.getCachedResult(cleaned)
    if (cached) {
      return this.filterResult(cached, items)
    }
    const result = await this.callAPIs(cleaned, items)
    await this.saveToCache(result)
    return result
  }

  private async callAPIs(phone: string, items: string[]): Promise<DetectionResult> {
    const result: DetectionResult = {
      phone,
      source: 'api',
      checked_at: new Date().toISOString()
    }

    if (items.includes('carrier') || items.includes('operator')) {
      await this.detectOperator(phone, result)
    }

    if (items.includes('whatsapp_registered') || items.includes('whatsapp_avatar') || items.includes('whatsapp_avatar_analysis')) {
      await this.detectWhatsApp(phone, result)
    }

    return result
  }


  private async detectWhatsApp(phone: string, result: DetectionResult): Promise<void> {
    try {
      const apiKey = await this.getConfig('checknumber_api_key')
      if (!apiKey) return

      const response = await fetch(
        `https://api.checknumber.ai/v1/check?phone=${phone}&platforms=whatsapp`,
        {
          headers: { 'X-API-Key': apiKey },
          signal: AbortSignal.timeout(10000)
        }
      )

      if (response.ok) {
        const data = await response.json()
        result.whatsapp = {
          registered: data.whatsapp?.registered || false,
          has_avatar: data.whatsapp?.has_avatar || false,
          avatar_analysis: data.whatsapp?.avatar_analysis || null
        }
        result.source = 'checknumber.ai'
      }
    } catch (error) {
      console.error('WhatsApp检测失败:', error)
    }
  }

  private isVirtualNumber(carrier: string, lineType: string): boolean {
    const virtualCarriers = ['Bandwidth', 'Google Voice', 'TextNow', 'Twilio', 'Grasshopper', 'Vonage', 'RingCentral']
    if (carrier && virtualCarriers.some(v => carrier.includes(v))) return true
    if (lineType && lineType.toLowerCase().includes('voip')) return true
    return false
  }

  private filterResult(result: DetectionResult, items: string[]): DetectionResult {
    const filtered: any = { phone: result.phone, source: result.source, checked_at: result.checked_at }
    const fieldMap: Record<string, string> = {
      'operator': 'operator',
      'virtual': 'is_virtual',
      'whatsapp_registered': 'whatsapp',
      'whatsapp_avatar': 'whatsapp',
      'whatsapp_avatar_analysis': 'whatsapp'
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

  private async detectOperator(phone: string, result: DetectionResult): Promise<void> {
    try {
      const apiKey = await this.getConfig('numverify_api_key')
      if (!apiKey) return

      const response = await fetch(
        `https://apilayer.net/api/validate?access_key=${apiKey}&number=${phone}&country_code=US&format=1`,
        { signal: AbortSignal.timeout(8000) }
      )

      if (response.ok) {
        const data = await response.json()
        result.operator = data.carrier || null
        result.is_virtual = this.isVirtualNumber(data.carrier, data.line_type)
        result.is_landline = data.line_type === 'landline'
        result.source = 'numverify'
      }
    } catch (error) {
      console.error('运营商检测失败:', error)
    }
  }
