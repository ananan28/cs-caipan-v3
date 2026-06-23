import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface DetectionItem {
  id: string
  label: string
  price: number
  default: boolean
  desc: string
  enabled: boolean
}

export interface PlatformPrice {
  platformId: string
  platformName: string
  basePrice: number  // 基础检测费（是否注册）
  items: DetectionItem[]  // 每个平台的检测项价格
}

interface DetectionState {
  platforms: PlatformPrice[]
  updatePlatformPrice: (platformId: string, itemId: string, price: number) => void
  getPlatformPrices: (platformId: string) => PlatformPrice | undefined
  resetToDefault: () => void
}

// 默认配置：每个平台独立价格
const defaultPlatforms: PlatformPrice[] = [
  {
    platformId: 'WhatsApp',
    platformName: 'WhatsApp',
    basePrice: 0.03,
    items: [
      { id: 'registered', label: '是否注册', price: 0.03, default: true, desc: '检测号码是否注册', enabled: true },
      { id: 'avatar', label: '是否有头像', price: 0.02, default: true, desc: '检测用户是否有头像', enabled: true },
      { id: 'gender', label: '头像性别识别', price: 0.035, default: false, desc: 'AI识别头像性别', enabled: true },
      { id: 'carrier', label: '运营商检测', price: 0.025, default: false, desc: '检测号码所属运营商', enabled: true },
      { id: 'location', label: '号码归属地', price: 0.02, default: false, desc: '检测号码归属国家/城市', enabled: true },
      { id: 'virtual', label: '虚拟号码识别', price: 0.04, default: false, desc: '识别是否为虚拟号码', enabled: true },
    ]
  },
  {
    platformId: 'Telegram',
    platformName: 'Telegram',
    basePrice: 0.035,
    items: [
      { id: 'registered', label: '是否注册', price: 0.035, default: true, desc: '检测号码是否注册', enabled: true },
      { id: 'avatar', label: '是否有头像', price: 0.025, default: true, desc: '检测用户是否有头像', enabled: true },
      { id: 'gender', label: '头像性别识别', price: 0.04, default: false, desc: 'AI识别头像性别', enabled: true },
      { id: 'carrier', label: '运营商检测', price: 0.025, default: false, desc: '检测号码所属运营商', enabled: true },
      { id: 'location', label: '号码归属地', price: 0.02, default: false, desc: '检测号码归属国家/城市', enabled: true },
      { id: 'virtual', label: '虚拟号码识别', price: 0.04, default: false, desc: '识别是否为虚拟号码', enabled: true },
    ]
  },
  {
    platformId: 'Signal',
    platformName: 'Signal',
    basePrice: 0.04,
    items: [
      { id: 'registered', label: '是否注册', price: 0.04, default: true, desc: '检测号码是否注册', enabled: true },
      { id: 'avatar', label: '是否有头像', price: 0.025, default: true, desc: '检测用户是否有头像', enabled: true },
      { id: 'gender', label: '头像性别识别', price: 0.045, default: false, desc: 'AI识别头像性别', enabled: true },
      { id: 'carrier', label: '运营商检测', price: 0.03, default: false, desc: '检测号码所属运营商', enabled: true },
      { id: 'location', label: '号码归属地', price: 0.025, default: false, desc: '检测号码归属国家/城市', enabled: true },
      { id: 'virtual', label: '虚拟号码识别', price: 0.045, default: false, desc: '识别是否为虚拟号码', enabled: true },
    ]
  },
  {
    platformId: 'LINE',
    platformName: 'LINE',
    basePrice: 0.03,
    items: [
      { id: 'registered', label: '是否注册', price: 0.03, default: true, desc: '检测号码是否注册', enabled: true },
      { id: 'avatar', label: '是否有头像', price: 0.02, default: true, desc: '检测用户是否有头像', enabled: true },
      { id: 'gender', label: '头像性别识别', price: 0.035, default: false, desc: 'AI识别头像性别', enabled: true },
      { id: 'carrier', label: '运营商检测', price: 0.025, default: false, desc: '检测号码所属运营商', enabled: true },
      { id: 'location', label: '号码归属地', price: 0.02, default: false, desc: '检测号码归属国家/城市', enabled: true },
      { id: 'virtual', label: '虚拟号码识别', price: 0.04, default: false, desc: '识别是否为虚拟号码', enabled: true },
    ]
  },
  {
    platformId: 'Viber',
    platformName: 'Viber',
    basePrice: 0.035,
    items: [
      { id: 'registered', label: '是否注册', price: 0.035, default: true, desc: '检测号码是否注册', enabled: true },
      { id: 'avatar', label: '是否有头像', price: 0.025, default: true, desc: '检测用户是否有头像', enabled: true },
      { id: 'gender', label: '头像性别识别', price: 0.04, default: false, desc: 'AI识别头像性别', enabled: true },
      { id: 'carrier', label: '运营商检测', price: 0.025, default: false, desc: '检测号码所属运营商', enabled: true },
      { id: 'location', label: '号码归属地', price: 0.02, default: false, desc: '检测号码归属国家/城市', enabled: true },
      { id: 'virtual', label: '虚拟号码识别', price: 0.04, default: false, desc: '识别是否为虚拟号码', enabled: true },
    ]
  },
  {
    platformId: 'Zalo',
    platformName: 'Zalo',
    basePrice: 0.025,
    items: [
      { id: 'registered', label: '是否注册', price: 0.025, default: true, desc: '检测号码是否注册', enabled: true },
      { id: 'avatar', label: '是否有头像', price: 0.02, default: true, desc: '检测用户是否有头像', enabled: true },
      { id: 'gender', label: '头像性别识别', price: 0.03, default: false, desc: 'AI识别头像性别', enabled: true },
      { id: 'carrier', label: '运营商检测', price: 0.02, default: false, desc: '检测号码所属运营商', enabled: true },
      { id: 'location', label: '号码归属地', price: 0.015, default: false, desc: '检测号码归属国家/城市', enabled: true },
      { id: 'virtual', label: '虚拟号码识别', price: 0.035, default: false, desc: '识别是否为虚拟号码', enabled: true },
    ]
  },
  {
    platformId: 'Facebook',
    platformName: 'Facebook',
    basePrice: 0.025,
    items: [
      { id: 'registered', label: '是否注册', price: 0.025, default: true, desc: '检测号码是否注册', enabled: true },
      { id: 'avatar', label: '是否有头像', price: 0.02, default: true, desc: '检测用户是否有头像', enabled: true },
      { id: 'gender', label: '头像性别识别', price: 0.03, default: false, desc: 'AI识别头像性别', enabled: true },
      { id: 'carrier', label: '运营商检测', price: 0.02, default: false, desc: '检测号码所属运营商', enabled: true },
      { id: 'location', label: '号码归属地', price: 0.015, default: false, desc: '检测号码归属国家/城市', enabled: true },
      { id: 'virtual', label: '虚拟号码识别', price: 0.035, default: false, desc: '识别是否为虚拟号码', enabled: true },
    ]
  },
]

export const useDetectionStore = create<DetectionState>()(
  persist(
    (set, get) => ({
      platforms: defaultPlatforms,

      updatePlatformPrice: (platformId: string, itemId: string, price: number) => {
        set((state) => ({
          platforms: state.platforms.map((platform) =>
            platform.platformId === platformId
              ? {
                  ...platform,
                  items: platform.items.map((item) =>
                    item.id === itemId ? { ...item, price: Math.max(0, price) } : item
                  ),
                }
              : platform
          ),
        }))
      },

      getPlatformPrices: (platformId: string) => {
        return get().platforms.find((p) => p.platformId === platformId)
      },

      resetToDefault: () => {
        set({ platforms: defaultPlatforms })
      },
    }),
    {
      name: 'detection-storage',
    }
  )
)
