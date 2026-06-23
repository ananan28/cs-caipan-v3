import { useState, useEffect } from 'react'
import { Card } from '@/components/Common/Card'
import { Badge } from '@/components/Common/Badge'
import { Button } from '@/components/Common/Button'
import { supabase } from '@/lib/supabase'
import {
  Zap, Shield, Users, Wallet, CheckSquare, MessageSquare,
  Bell, Settings, BarChart3, Clock, Database, Cloud,
  RefreshCw, Plus, Edit2, Trash2, X
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Feature {
  id: string
  name: string
  icon: string
  description: string
  status: string
  created_at: string
}

export const Features = () => {
  const [features, setFeatures] = useState<Feature[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newIcon, setNewIcon] = useState('')
  const [newDescription, setNewDescription] = useState('')

  const loadFeatures = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('features')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) {
      toast.error('加载功能列表失败: ' + error.message)
    } else {
      setFeatures(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    loadFeatures()
  }, [])

  const handleCreate = async () => {
    if (!newName) {
      toast.error('请输入功能名称')
      return
    }

    const { error } = await supabase
      .from('features')
      .insert({
        name: newName,
        icon: newIcon || 'Zap',
        description: newDescription || '',
        status: 'active'
      })

    if (error) {
      toast.error('创建失败: ' + error.message)
    } else {
      toast.success('功能创建成功')
      setShowCreate(false)
      setNewName('')
      setNewIcon('')
      setNewDescription('')
      loadFeatures()
    }
  }

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
    const { error } = await supabase
      .from('features')
      .update({ status: newStatus })
      .eq('id', id)

    if (error) {
      toast.error('更新失败: ' + error.message)
    } else {
      toast.success(`功能已${newStatus === 'active' ? '启用' : '停用'}`)
      loadFeatures()
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`确定要删除功能 ${name} 吗？`)) return

    const { error } = await supabase
      .from('features')
      .delete()
      .eq('id', id)

    if (error) {
      toast.error('删除失败: ' + error.message)
    } else {
      toast.success('功能已删除')
      loadFeatures()
    }
  }

  const iconMap: Record<string, any> = {
    Zap, Shield, Users, Wallet, CheckSquare, MessageSquare,
    Bell, Settings, BarChart3, Clock, Database, Cloud
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
            <h1 className="text-2xl font-bold text-white">功能中心</h1>
            <p className="text-gray-400 text-sm">管理平台所有功能模块</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadFeatures}>
              <RefreshCw size={16} className="mr-2" /> 刷新
            </Button>
            <Button variant="primary" onClick={() => setShowCreate(true)}>
              <Plus size={16} className="mr-2" /> 添加功能
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature) => {
            const IconComponent = iconMap[feature.icon] || Zap
            return (
              <Card key={feature.id} className="hover:border-blue-500/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <IconComponent className="text-blue-400" size={24} />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">{feature.name}</h3>
                      <p className="text-gray-400 text-sm">{feature.description}</p>
                      <div className="mt-2">
                        <Badge variant={feature.status === 'active' ? 'success' : 'default'}>
                          {feature.status === 'active' ? '已启用' : '已停用'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggleStatus(feature.id, feature.status)}
                      className="p-1.5 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(feature.id, feature.name)}
                      className="p-1.5 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </Card>
            )
          })}
          {features.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-400">
              暂无功能模块
            </div>
          )}
        </div>

        {showCreate && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-[#12182b] border border-gray-800 rounded-2xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">添加功能</h2>
                <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-white">
                  <X size={24} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-white text-sm font-medium block mb-1">名称</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-4 py-2 bg-[#1a1f35] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-white text-sm font-medium block mb-1">图标 (组件名)</label>
                  <input
                    type="text"
                    value={newIcon}
                    onChange={(e) => setNewIcon(e.target.value)}
                    placeholder="Zap, Shield, Users..."
                    className="w-full px-4 py-2 bg-[#1a1f35] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-white text-sm font-medium block mb-1">描述</label>
                  <input
                    type="text"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="w-full px-4 py-2 bg-[#1a1f35] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <Button className="w-full" onClick={handleCreate}>创建</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
