export interface DetectionItem {
  id: string
  key: string
  label: string
  category: string
  inputType: 'phone' | 'username' | 'both'
  price: number
  group: string
  parent?: string
}

// 所有检测项配置
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
    group: 'carrier'
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

  // ===== WhatsApp（手机号） =====
  {
    id: 'whatsapp_registered',
    key: 'whatsapp_registered',
    label: '注册检测',
    category: 'whatsapp',
    inputType: 'phone',
    price: 0.02,
    group: 'whatsapp',
    parent: 'whatsapp'
  },
  {
    id: 'whatsapp_avatar',
    key: 'whatsapp_avatar',
    label: '头像检测',
    category: 'whatsapp',
    inputType: 'phone',
    price: 0.015,
    group: 'whatsapp',
    parent: 'whatsapp'
  },
  {
    id: 'whatsapp_avatar_analysis',
    key: 'whatsapp_avatar_analysis',
    label: '头像分析（性别/年龄/人种）',
    category: 'whatsapp',
    inputType: 'phone',
    price: 0.025,
    group: 'whatsapp',
    parent: 'whatsapp'
  },

  // ===== Signal（手机号） =====
  {
    id: 'signal_registered',
    key: 'signal_registered',
    label: '注册检测',
    category: 'signal',
    inputType: 'phone',
    price: 0.02,
    group: 'signal',
    parent: 'signal'
  },
  {
    id: 'signal_avatar',
    key: 'signal_avatar',
    label: '头像检测',
    category: 'signal',
    inputType: 'phone',
    price: 0.015,
    group: 'signal',
    parent: 'signal'
  },
  {
    id: 'signal_avatar_analysis',
    key: 'signal_avatar_analysis',
    label: '头像分析（性别/年龄/人种）',
    category: 'signal',
    inputType: 'phone',
    price: 0.025,
    group: 'signal',
    parent: 'signal'
  },

  // ===== Line（手机号） =====
  {
    id: 'line_registered',
    key: 'line_registered',
    label: '注册检测',
    category: 'line',
    inputType: 'phone',
    price: 0.02,
    group: 'line',
    parent: 'line'
  },
  {
    id: 'line_avatar',
    key: 'line_avatar',
    label: '头像检测',
    category: 'line',
    inputType: 'phone',
    price: 0.015,
    group: 'line',
    parent: 'line'
  },
  {
    id: 'line_avatar_analysis',
    key: 'line_avatar_analysis',
    label: '头像分析（性别/年龄/人种）',
    category: 'line',
    inputType: 'phone',
    price: 0.025,
    group: 'line',
    parent: 'line'
  },

  // ===== iMessage（手机号） =====
  {
    id: 'imessage_registered',
    key: 'imessage_registered',
    label: 'iMessage蓝号检测',
    category: 'imessage',
    inputType: 'phone',
    price: 0.04,
    group: 'imessage'
  },

  // ===== Viber（手机号） =====
  {
    id: 'viber_registered',
    key: 'viber_registered',
    label: '注册检测',
    category: 'viber',
    inputType: 'phone',
    price: 0.02,
    group: 'viber',
    parent: 'viber'
  },
  {
    id: 'viber_avatar',
    key: 'viber_avatar',
    label: '头像检测',
    category: 'viber',
    inputType: 'phone',
    price: 0.015,
    group: 'viber',
    parent: 'viber'
  },
  {
    id: 'viber_avatar_analysis',
    key: 'viber_avatar_analysis',
    label: '头像分析（性别/年龄/人种）',
    category: 'viber',
    inputType: 'phone',
    price: 0.025,
    group: 'viber',
    parent: 'viber'
  },

  // ===== Zalo（手机号） =====
  {
    id: 'zalo_registered',
    key: 'zalo_registered',
    label: '注册检测',
    category: 'zalo',
    inputType: 'phone',
    price: 0.02,
    group: 'zalo',
    parent: 'zalo'
  },
  {
    id: 'zalo_avatar',
    key: 'zalo_avatar',
    label: '头像检测',
    category: 'zalo',
    inputType: 'phone',
    price: 0.015,
    group: 'zalo',
    parent: 'zalo'
  },
  {
    id: 'zalo_avatar_analysis',
    key: 'zalo_avatar_analysis',
    label: '头像分析（性别/年龄/人种）',
    category: 'zalo',
    inputType: 'phone',
    price: 0.025,
    group: 'zalo',
    parent: 'zalo'
  },

  // ===== RCS（手机号） =====
  {
    id: 'rcs_registered',
    key: 'rcs_registered',
    label: 'RCS开通检测',
    category: 'rcs',
    inputType: 'phone',
    price: 0.03,
    group: 'rcs'
  },

  // ===== Telegram（用户名） =====
  {
    id: 'telegram_username',
    key: 'telegram_username',
    label: '注册检测',
    category: 'telegram',
    inputType: 'username',
    price: 0.02,
    group: 'telegram',
    parent: 'telegram'
  },
  {
    id: 'telegram_avatar',
    key: 'telegram_avatar',
    label: '头像检测',
    category: 'telegram',
    inputType: 'username',
    price: 0.015,
    group: 'telegram',
    parent: 'telegram'
  },
  {
    id: 'telegram_avatar_analysis',
    key: 'telegram_avatar_analysis',
    label: '头像分析（性别/年龄/人种）',
    category: 'telegram',
    inputType: 'username',
    price: 0.025,
    group: 'telegram',
    parent: 'telegram'
  },

  // ===== Facebook（用户名） =====
  {
    id: 'facebook_username',
    key: 'facebook_username',
    label: '注册检测',
    category: 'facebook',
    inputType: 'username',
    price: 0.02,
    group: 'facebook',
    parent: 'facebook'
  },
  {
    id: 'facebook_avatar',
    key: 'facebook_avatar',
    label: '头像检测',
    category: 'facebook',
    inputType: 'username',
    price: 0.015,
    group: 'facebook',
    parent: 'facebook'
  },
  {
    id: 'facebook_avatar_analysis',
    key: 'facebook_avatar_analysis',
    label: '头像分析（性别/年龄/人种）',
    category: 'facebook',
    inputType: 'username',
    price: 0.025,
    group: 'facebook',
    parent: 'facebook'
  },
  {
    id: 'facebook_active',
    key: 'facebook_active',
    label: '活跃度检测',
    category: 'facebook',
    inputType: 'username',
    price: 0.02,
    group: 'facebook',
    parent: 'facebook'
  },

  // ===== Instagram（用户名） =====
  {
    id: 'instagram_username',
    key: 'instagram_username',
    label: '注册检测',
    category: 'instagram',
    inputType: 'username',
    price: 0.02,
    group: 'instagram',
    parent: 'instagram'
  },
  {
    id: 'instagram_avatar',
    key: 'instagram_avatar',
    label: '头像检测',
    category: 'instagram',
    inputType: 'username',
    price: 0.015,
    group: 'instagram',
    parent: 'instagram'
  },
  {
    id: 'instagram_avatar_analysis',
    key: 'instagram_avatar_analysis',
    label: '头像分析（性别/年龄/人种）',
    category: 'instagram',
    inputType: 'username',
    price: 0.025,
    group: 'instagram',
    parent: 'instagram'
  },
  {
    id: 'instagram_type',
    key: 'instagram_type',
    label: '账号类型检测（公开/私密）',
    category: 'instagram',
    inputType: 'username',
    price: 0.02,
    group: 'instagram',
    parent: 'instagram'
  },

  // ===== Twitter（用户名） =====
  {
    id: 'twitter_username',
    key: 'twitter_username',
    label: '注册检测',
    category: 'twitter',
    inputType: 'username',
    price: 0.02,
    group: 'twitter',
    parent: 'twitter'
  },
  {
    id: 'twitter_avatar',
    key: 'twitter_avatar',
    label: '头像检测',
    category: 'twitter',
    inputType: 'username',
    price: 0.015,
    group: 'twitter',
    parent: 'twitter'
  },
  {
    id: 'twitter_avatar_analysis',
    key: 'twitter_avatar_analysis',
    label: '头像分析（性别/年龄/人种）',
    category: 'twitter',
    inputType: 'username',
    price: 0.025,
    group: 'twitter',
    parent: 'twitter'
  },
  {
    id: 'twitter_verified',
    key: 'twitter_verified',
    label: '蓝V认证检测',
    category: 'twitter',
    inputType: 'username',
    price: 0.02,
    group: 'twitter',
    parent: 'twitter'
  },
]

// 按分组获取
export const getItemsByInputType = (inputType: 'phone' | 'username') => {
  return detectionItems.filter(item => item.inputType === inputType || item.inputType === 'both')
}

// 获取所有分组
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

// 获取某个分组下的所有项目
export const getItemsByGroup = (inputType: 'phone' | 'username', group: string) => {
  return getItemsByInputType(inputType).filter(item => item.group === group)
}

// 获取主功能下的子项
export const getChildren = (inputType: 'phone' | 'username', parent: string) => {
  return getItemsByInputType(inputType).filter(item => item.parent === parent)
}

// 平台名称映射
export const groupLabels: Record<string, string> = {
  processing: '📋 号码处理',
  carrier: '📞 运营商检测',
  whatsapp: '💬 WhatsApp',
  signal: '🔵 Signal',
  line: '🟢 Line',
  imessage: '📶 iMessage',
  viber: '💜 Viber',
  zalo: '💚 Zalo',
  rcs: '📱 RCS',
  telegram: '📱 Telegram',
  facebook: '📘 Facebook',
  instagram: '📷 Instagram',
  twitter: '🐦 Twitter/X',
}
