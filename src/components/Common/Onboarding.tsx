import { useState, useEffect } from 'react'
import { X, ChevronRight, ChevronLeft, Check, Zap, Users, Wallet, Settings, Shield, TrendingUp } from 'lucide-react'
import { Button } from './Button'

const steps = [
  { icon: Zap, title: '欢迎来到财盛集团', desc: '企业级数据管理平台 V3.0' },
  { icon: Users, title: '用户管理', desc: '管理所有用户、角色和权限' },
  { icon: Wallet, title: '积分钱包', desc: '充值、转账、积分管理' },
  { icon: TrendingUp, title: '财务管理', desc: '充值审核、财务统计' },
  { icon: Settings, title: '系统设置', desc: '配置汇率、手续费、邀请奖励' },
  { icon: Shield, title: '权限管理', desc: '控制每个角色的访问权限' },
]

export const Onboarding = () => {
  const [step, setStep] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const shown = localStorage.getItem('onboarding_shown')
    if (!shown) {
      setVisible(true)
    }
  }, [])

  const handleFinish = () => {
    localStorage.setItem('onboarding_shown', 'true')
    setVisible(false)
  }

  if (!visible) return null

  const current = steps[step]
  const Icon = current.icon

  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-panel border border-border rounded-2xl p-8 shadow-2xl">
        <div className="text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue to-sky flex items-center justify-center mx-auto mb-4">
            <Icon size={32} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">{current.title}</h2>
          <p className="text-muted mt-2">{current.desc}</p>
        </div>

        <div className="flex items-center justify-center gap-2 mt-6">
          {steps.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all ${i === step ? 'w-8 bg-blue' : 'w-2 bg-panel/50'}`} />
          ))}
        </div>

        <div className="flex gap-3 mt-6">
          {step > 0 && (
            <Button variant="ghost" className="flex-1" onClick={() => setStep(step - 1)}>
              <ChevronLeft size={16} className="mr-1" /> 上一步
            </Button>
          )}
          {step < steps.length - 1 ? (
            <Button variant="primary" className="flex-1" onClick={() => setStep(step + 1)}>
              下一步 <ChevronRight size={16} className="ml-1" />
            </Button>
          ) : (
            <Button variant="primary" className="flex-1" onClick={handleFinish}>
              <Check size={16} className="mr-1" /> 开始使用
            </Button>
          )}
        </div>

        <button onClick={handleFinish} className="absolute top-4 right-4 text-muted hover:text-white">
          <X size={20} />
        </button>
      </div>
    </div>
  )
}
