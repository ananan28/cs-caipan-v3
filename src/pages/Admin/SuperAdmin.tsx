import { useState, useEffect } from 'react'
import { Card } from '@/components/Common/Card'
import { Badge } from '@/components/Common/Badge'
import { Button } from '@/components/Common/Button'
import { Input } from '@/components/Forms/Input'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import {
  Settings, Users, Wallet, TrendingUp, Shield,
  RefreshCw, Save, Edit2, X, CheckCircle,
  DollarSign, Percent, Gift, Zap, Award,
  Lock, Unlock, ToggleLeft, ToggleRight,
  Power, Trash2, AlertTriangle, Clock, Server
} from 'lucide-react'
import toast from 'react-hot-toast'

export const SuperAdmin = () => {
  const { user } = useAuthStore()
  const [configs, setConfigs] = useState<any[]>([])
  const [permissions, setPermissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('configs')
  const [maintenance, setMaintenance] = useState(false)

  if (user?.role !== 'SuperAdmin') {
    return (
      <div className="p-6 bg-[#f0f2f5] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="text-red-500 mx-auto mb-4" size={48} />
          <h2 className="text-xl font-bold text-gray-900">无权限访问</h2>
          <p className="text-gray-500">只有超级管理员可以访问此页面</p>
        </div>
      </div>
    )
  }

  const loadAll = async () => {
    setLoading(true)
    await loadConfigs()
    await loadPermissions()
    await loadMaintenanceStatus()
    setLoading(false)
  }

  const loadConfigs = async () => {
    const { data, error } = await supabase
      .from('system_configs')
      .select('*')
      .order('category', { ascending: true })

    if (error) {
      toast.error('加载配置失败: ' + error.message)
    } else {
      setConfigs(data || [])
    }
  }

  const loadPermissions = async () => {
    const { data, error } = await supabase
      .from('permission_configs')
      .select('*')
      .order('category', { ascending: true })

    if (error) {
      toast.error('加载权限失败: ' + error.message)
    } else {
      setPermissions(data || [])
    }
  }

  const loadMaintenanceStatus = async () => {
    const { data } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'maintenance_mode')
      .single()
    if (data) {
      setMaintenance(data.value === 'true')
    }
  }

  useEffect(() => {
    loadAll()
  }, [])

  const handleUpdate = async (id: string, value: string) => {
    setSaving(true)
    const { error } = await supabase
      .from('system_configs')
      .update({ value, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      toast.error('更新失败: ' + error.message)
    } else {
      toast.success('✅ 配置已更新')
      setEditing(null)
      loadConfigs()
    }
    setSaving(false)
  }

  const handleTogglePermission = async (id: string, current: boolean) => {
    const { error } = await supabase
      .from('permission_configs')
      .update({ enabled: !current })
      .eq('id', id)

    if (error) {
      toast.error('更新失败: ' + error.message)
    } else {
      toast.success(`✅ 权限已${!current ? '开启' : '关闭'}`)
      loadPermissions()
    }
  }

  const handleToggleMaintenance = async () => {
    const newStatus = !maintenance
    const { error } = await supabase
      .from('settings')
      .update({ value: String(newStatus) })
      .eq('key', 'maintenance_mode')

    if (error) {
      toast.error('操作失败: ' + error.message)
    } else {
      setMaintenance(newStatus)
      toast.success(newStatus ? '🔧 网站已进入维护模式' : '✅ 网站已恢复正常')
    }
  }

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      price: '💰 价格控制',
      recharge: '💳 充值控制',
      invite: '🎯 邀请奖励控制',
      points: '⭐ 积分控制',
      detection: '🔍 检测服务费用'
    }
    return labels[category] || category
  }

  const groupedConfigs = configs.reduce((acc, config) => {
    if (!acc[config.category]) acc[config.category] = []
    acc[config.category].push(config)
    return acc
  }, {} as Record<string, any[]>)

  const groupedPermissions = permissions.reduce((acc, perm) => {
    if (!acc[perm.category]) acc[perm.category] = []
    acc[perm.category].push(perm)
    return acc
  }, {} as Record<string, any[]>)

  if (loading) {
    return (
      <div className="p-6 bg-[#f0f2f5] min-h-screen flex items-center justify-center">
        <div className="text-gray-400">加载中...</div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-[#f0f2f5] min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3">
              <Shield className="text-yellow-500" size={28} />
              <h1 className="text-2xl font-bold text-gray-900">超级管理面板</h1>
            </div>
            <p className="text-gray-500 text-sm">统一管理所有系统参数、权限、价格</p>
          </div>
          <Button variant="outline" onClick={loadAll}>
            <RefreshCw size={16} className="mr-2" /> 刷新
          </Button>
        </div>

        {/* 快速操作 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border border-gray-200">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${maintenance ? 'bg-green-100' : 'bg-gray-100'}`}>
                  {maintenance ? <Lock className="text-green-500" size={20} /> : <Unlock className="text-gray-500" size={20} />}
                </div>
                <div>
                  <p className="text-gray-900 font-medium">维护模式</p>
                  <p className="text-gray-400 text-sm">{maintenance ? '已开启' : '已关闭'}</p>
                </div>
              </div>
              <Button variant={maintenance ? 'success' : 'outline'} size="sm" onClick={handleToggleMaintenance}>
                {maintenance ? '关闭' : '开启'}
              </Button>
            </div>
          </Card>

          <Card className="border border-gray-200">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <Power className="text-blue-500" size={20} />
                </div>
                <div>
                  <p className="text-gray-900 font-medium">服务器状态</p>
                  <p className="text-green-500 text-sm">● 运行中</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => toast.info('重启功能开发中')}>
                重启
              </Button>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('configs')}
            className={`px-4 py-2.5 text-sm font-medium transition-all rounded-t-lg ${
              activeTab === 'configs'
                ? 'text-yellow-600 border-b-2 border-yellow-500 bg-yellow-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Settings size={16} className="inline mr-2" /> 系统配置
          </button>
          <button
            onClick={() => setActiveTab('permissions')}
            className={`px-4 py-2.5 text-sm font-medium transition-all rounded-t-lg ${
              activeTab === 'permissions'
                ? 'text-yellow-600 border-b-2 border-yellow-500 bg-yellow-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Shield size={16} className="inline mr-2" /> 权限管理
          </button>
        </div>

        {activeTab === 'configs' && (
          <div className="space-y-6">
            {Object.entries(groupedConfigs).map(([category, items]) => (
              <Card key={category} className="border border-gray-200">
                <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-xl">
                  <h2 className="text-lg font-semibold text-gray-900">{getCategoryLabel(category)}</h2>
                </div>
                <div className="divide-y divide-gray-200">
                  {items.map((config) => {
                    const isEditing = editing === config.id
                    return (
                      <div key={config.id} className="flex flex-wrap items-center justify-between gap-4 p-4 hover:bg-gray-50">
                        <div className="flex-1 min-w-[150px]">
                          <p className="text-gray-900 font-medium">{config.key.replace(/_/g, ' ')}</p>
                          <p className="text-gray-500 text-sm">{config.description}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          {isEditing ? (
                            <>
                              <Input
                                type="number"
                                step="0.01"
                                value={editValue}
                                onChange={(e: any) => setEditValue(e.target.value)}
                                className="w-32 bg-white border-gray-300 text-gray-900"
                                autoFocus
                              />
                              <button onClick={() => handleUpdate(config.id, editValue)} disabled={saving} className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
                                <CheckCircle size={18} />
                              </button>
                              <button onClick={() => setEditing(null)} className="p-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400">
                                <X size={18} />
                              </button>
                            </>
                          ) : (
                            <>
                              <span className="text-gray-900 font-mono font-bold">
                                {config.value}{config.key.includes('rate') ? '%' : ''}
                              </span>
                              <button onClick={() => { setEditing(config.id); setEditValue(config.value) }} className="p-2 bg-yellow-500/20 text-yellow-600 rounded-lg hover:bg-yellow-500/30">
                                <Edit2 size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'permissions' && (
          <div className="space-y-6">
            {Object.entries(groupedPermissions).map(([category, items]) => (
              <Card key={category} className="border border-gray-200">
                <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-xl">
                  <h2 className="text-lg font-semibold text-gray-900">{category}</h2>
                </div>
                <div className="divide-y divide-gray-200">
                  {items.map((perm) => (
                    <div key={perm.id} className="flex flex-wrap items-center justify-between gap-4 p-4 hover:bg-gray-50">
                      <div className="flex-1 min-w-[150px]">
                        <p className="text-gray-900 font-medium">{perm.name}</p>
                        <p className="text-gray-500 text-sm">{perm.description}</p>
                      </div>
                      <button
                        onClick={() => handleTogglePermission(perm.id, perm.enabled)}
                        className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
                      >
                        {perm.enabled ? (
                          <ToggleRight size={28} className="text-green-500" />
                        ) : (
                          <ToggleLeft size={28} className="text-gray-400" />
                        )}
                        <span className="text-sm">{perm.enabled ? '启用' : '禁用'}</span>
                      </button>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
