export interface DetectionItem {
  id: string
  key: string
  label: string
  category: string
  inputType: 'phone' | 'username' | 'both'
  price: number
  group: string
  parent?: string
  apiMapping?: {
    service: 'checknumber' | 'numverify' | 'none'
    taskType?: string
  }
}

export const detectionItems: DetectionItem[] = [
  // ===== 号码处理 =====
  {
    id: 'deduplicate',
    key: 'deduplicate',
    label: '号码去重',
    category: 'processing',
    inputType: 'both',
    price: 0.01,
    group: 'processing'
  },

  // ===== 运营商检测 =====
  {
    id: 'operator',
    key: 'operator',
    label: '运营商筛选',
    category: 'carrier',
    inputType: 'phone',
    price: 0.02,
    group: 'carrier',
    apiMapping: { service: 'numverify' }
  },
  {
    id: 'virtual',
    key: 'virtual',
    label: '虚拟号码识别',
    category: 'carrier',
    inputType: 'phone',
    price: 0.03,
    group: 'carrier'
  },

  // ===== WhatsApp 检测 =====
  {
    id: 'whatsapp_registered',
    key: 'whatsapp_registered',
    label: '注册检测',
    category: 'whatsapp',
    inputType: 'phone',
    price: 0.02,
    group: 'whatsapp',
    parent: 'whatsapp',
    apiMapping: { service: 'checknumber', taskType: 'ws' }
  },
  {
    id: 'whatsapp_avatar',
    key: 'whatsapp_avatar',
    label: '头像检测',
    category: 'whatsapp',
    inputType: 'phone',
    price: 0.025,
    group: 'whatsapp',
    parent: 'whatsapp',
    apiMapping: { service: 'checknumber', taskType: 'ws_avatar' }
  },
  {
    id: 'whatsapp_avatar_analysis',
    key: 'whatsapp_avatar_analysis',
    label: '头像分析（性别/年龄/人种）',
    category: 'whatsapp',
    inputType: 'phone',
    price: 0.03,
    group: 'whatsapp',
    parent: 'whatsapp',
    apiMapping: { service: 'checknumber', taskType: 'ws_senior' }
  },

  // ===== 其他社交平台 =====
  {
    id: 'telegram_registered',
    key: 'telegram_registered',
    label: '注册检测',
    category: 'telegram',
    inputType: 'username',
    price: 0.02,
    group: 'telegram',
    parent: 'telegram',
    apiMapping: { service: 'checknumber', taskType: 'tg' }
  },
  {
    id: 'signal_registered',
    key: 'signal_registered',
    label: '注册检测',
    category: 'signal',
    inputType: 'phone',
    price: 0.02,
    group: 'signal',
    apiMapping: { service: 'checknumber', taskType: 'signal' }
  },
  {
    id: 'line_registered',
    key: 'line_registered',
    label: '注册检测',
    category: 'line',
    inputType: 'phone',
    price: 0.02,
    group: 'line',
    apiMapping: { service: 'checknumber', taskType: 'line' }
  },
  {
    id: 'imessage_registered',
    key: 'imessage_registered',
    label: 'iMessage蓝号检测',
    category: 'imessage',
    inputType: 'phone',
    price: 0.04,
    group: 'imessage',
    apiMapping: { service: 'checknumber', taskType: 'imessage' }
  },
  {
    id: 'facebook_registered',
    key: 'facebook_registered',
    label: '注册检测',
    category: 'facebook',
    inputType: 'username',
    price: 0.02,
    group: 'facebook',
    parent: 'facebook',
    apiMapping: { service: 'checknumber', taskType: 'facebook' }
  },
  {
    id: 'instagram_registered',
    key: 'instagram_registered',
    label: '注册检测',
    category: 'instagram',
    inputType: 'username',
    price: 0.02,
    group: 'instagram',
    parent: 'instagram',
    apiMapping: { service: 'checknumber', taskType: 'instagram' }
  },
  {
    id: 'twitter_registered',
    key: 'twitter_registered',
    label: '注册检测',
    category: 'twitter',
    inputType: 'username',
    price: 0.02,
    group: 'twitter',
    parent: 'twitter',
    apiMapping: { service: 'checknumber', taskType: 'twitter' }
  },
  {
    id: 'viber_registered',
    key: 'viber_registered',
    label: '注册检测',
    category: 'viber',
    inputType: 'phone',
    price: 0.02,
    group: 'viber',
    parent: 'viber',
    apiMapping: { service: 'checknumber', taskType: 'viber' }
  },
  {
    id: 'zalo_registered',
    key: 'zalo_registered',
    label: '注册检测',
    category: 'zalo',
    inputType: 'phone',
    price: 0.02,
    group: 'zalo',
    parent: 'zalo',
    apiMapping: { service: 'checknumber', taskType: 'zalo' }
  },
  {
    id: 'rcs_registered',
    key: 'rcs_registered',
    label: 'RCS开通检测',
    category: 'rcs',
    inputType: 'phone',
    price: 0.03,
    group: 'rcs',
    apiMapping: { service: 'checknumber', taskType: 'rcs' }
  }
]

export const groupLabels: Record<string, string> = {
  processing: '📋 号码处理',
  carrier: '📞 运营商检测',
  whatsapp: '💬 WhatsApp',
  telegram: '📱 Telegram',
  signal: '🔵 Signal',
  line: '🟢 Line',
  imessage: '📶 iMessage',
  viber: '💜 Viber',
  zalo: '💚 Zalo',
  rcs: '📱 RCS',
  facebook: '📘 Facebook',
  instagram: '📷 Instagram',
  twitter: '🐦 Twitter/X',
}

export const getItemsByInputType = (inputType: 'phone' | 'username') => {
  return detectionItems.filter(item => item.inputType === inputType || item.inputType === 'both')
}

export const getGroups = (inputType: 'phone' | 'username') => {
  const items = getItemsByInputType(inputType)
  const groups: string[] = []
  items.forEach(item => {
    if (!groups.includes(item.group)) {
      groups.push(item.group)
    }
  })
  return groups
}

export const getItemsForGroup = (inputType: 'phone' | 'username', group: string) => {
  return getItemsByInputType(inputType).filter(item => item.group === group)
}

export const getChildren = (inputType: 'phone' | 'username', parent: string) => {
  return getItemsByInputType(inputType).filter(item => item.parent === parent)
}
