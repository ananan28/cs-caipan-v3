import { useState, useEffect } from 'react'
import { Card } from '@/components/Common/Card'
import { Button } from '@/components/Common/Button'
import { Input } from '@/components/Forms/Input'
import { supabase } from '@/lib/supabase'
import {
  Settings as SettingsIcon, Save, RefreshCw, Globe,
  Shield, Bell, Database, Mail, Key, User, X,
  CheckCircle, AlertCircle
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Setting {
  id: string
  key: string
  value: any
  category: string
  description: string
  updated_at: string
}

export const Settings = () => {
  const [settings, setSettings] = useState<Setting[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  const loadSettings = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .order('category', { ascending: true })

    if (error) {
      toast.error('加载设置失败: ' + error.message)
      // 使用默认设置
      setSettings(getDefaultSettings())
    } else if (data && data.length > 0) {
      setSettings(data)
    } else {
      // 如果没有数据，创建默认设置
      const defaults = getDefaultSettings()
      for (const setting of defaults) {
        await supabase.from('settings').upsert(setting, { onConflict: 'key' })
      }
      setSettings(defaults)
    }
    setLoading(false)
  }

  const getDefaultSettings = (): Setting[] => [
    { id: '1', key: 'site_name', value: '财盛集团', category: 'general', description: '网站名称', updated_at: new Date().toISOString() },
    { id: '2', key: 'site_description', value: 'CS财盛集团V3管理平台', category: 'general', description: '网站描述', updated_at: new Date().toISOString() },
    { id: '3', key: 'default_language', value: 'zh-CN', category: 'general', description: '默认语言', updated_at: new Date().toISOString() },
    { id: '4', key: 'timezone', value: 'Asia/Shanghai', category: 'general', description: '时区', updated_at: new Date().toISOString() },
    { id: '5', key: 'enable_registration', value: true, category: 'security', description: '允许用户注册', updated_at: new Date().toISOString() },
    { id: '6', key: 'enable_2fa', value: false, category: 'security', description: '启用双因素认证', updated_at: new Date().toISOString() },
    { id: '7', key: 'session_timeout', value: 3600, category: 'security', description: '会话超时(秒)', updated_at: new Date().toISOString() },
    { id: '8', key: 'max_login_attempts', value: 5, category: 'security', description: '最大登录尝试次数', updated_at: new Date().toISOString() },
    { id: '9', key: 'currency', value: 'USDT', category: 'finance', description: '默认货币', updated_at: new Date().toISOString() },
    { id: '10', key: 'min_recharge', value: 10, category: 'finance', description: '最低充值金额', updated_at: new Date().toISOString() },
    { id: '11', key: 'max_recharge', value: 10000, category: 'finance', description: '最高充值金额', updated_at: new Date().toISOString() },
    { id: '12', key: 'transfer_fee', value: 0.5, category: 'finance', description: '转账费率(%)', updated_at: new Date().toISOString() },
    { id: '13', key: 'enable_notifications', value: true, category: 'notifications', description: '启用通知', updated_at: new Date().toISOString() },
    { id: '14', key: 'email_notifications', value: true, category: 'notifications', description: '邮件通知', updated_at: new Date().toISOString() },
    { id: '15', key: 'maintenance_mode', value: false, category: 'system', description: '维护模式', updated_at: new Date().toISOString() },
  ]

  useEffect(() => {
    loadSettings()
  }, [])

  const handleUpdate = async (id: string) => {
    const { error } = await supabase
      .from('settings')
      .update({
        value: editValue,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) {
      toast.error('更新失败: ' + error.message)
    } else {
      toast.success('设置已更新')
      setEditing(null)
      loadSettings()
    }
  }

  const groupedSettings = settings.reduce((acc, s) => {
    if (!acc[s.category]) acc[s.category] = []
    acc[s.category].push(s)
    return acc
  }, {} as Record<string, Setting[]>)

  const categoryLabels: Record<string, string> = {
    general: '通用设置',
    security: '安全设置',
    finance: '财务设置',
    notifications: '通知设置',
    system: '系统设置'
  }

  const categoryIcons: Record<string, any> = {
    general: Globe,
    security: Shield,
    finance: Database,
    notifications: Bell,
    system: SettingsIcon
  }

  if (loading) {
    return (
      <div className="p-6 bg-[#0a0f1f] min-h-screen flex items-center justify-center">
        <div className="text-gray-400">加载中...</div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-[#0a0f1f] min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">系统设置</h1>
            <p className="text-gray-400 text-sm">管理系统所有配置</p>
          </div>
          <Button variant="outline" onClick={loadSettings}>
            <RefreshCw size={16} className="mr-2" /> 刷新
          </Button>
        </div>

        {Object.entries(groupedSettings).map(([category, items]) => {
          const Icon = categoryIcons[category] || SettingsIcon
          return (
            <Card key={category}>
              <div className="p-4 border-b border-gray-800 flex items-center gap-3">
                <Icon className="text-blue-400" size={20} />
                <h2 className="text-lg font-semibold text-white">{categoryLabels[category] || category}</h2>
              </div>
              <div className="divide-y divide-gray-800">
                {items.map((setting) => (
                  <div key={setting.id} className="flex flex-wrap items-center justify-between gap-4 p-4 hover:bg-[#1a1f35]/30">
                    <div className="flex-1 min-w-[150px]">
                      <p className="text-white font-medium">{setting.key}</p>
                      <p className="text-gray-400 text-sm">{setting.description}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {editing === setting.id ? (
                        <>
                          <Input
                            value={editValue}
                            onChange={(e: any) => setEditValue(e.target.value)}
                            className="w-48 bg-[#1a1f35] border-gray-700 text-white"
                            autoFocus
                          />
                          <button
                            onClick={() => handleUpdate(setting.id)}
                            className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30"
                          >
                            <CheckCircle size={18} />
                          </button>
                          <button
                            onClick={() => setEditing(null)}
                            className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30"
                          >
                            <X size={18} />
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="text-white font-mono">
                            {typeof setting.value === 'boolean' 
                              ? (setting.value ? '✅ 启用' : '❌ 禁用')
                              : setting.value
                            }
                          </span>
                          <button
                            onClick={() => {
                              setEditing(setting.id)
                              setEditValue(String(setting.value))
                            }}
                            className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30"
                          >
                            <Save size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
