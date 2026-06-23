import { useState, useEffect } from 'react'
import { Card } from '@/components/Common/Card'
import { Badge } from '@/components/Common/Badge'
import { Button } from '@/components/Common/Button'
import { Input } from '@/components/Forms/Input'
import { supabase } from '@/lib/supabase'
import {
  Server, Search, RefreshCw, Plus, Edit2, Trash2,
  CheckCircle, XCircle, Clock, Copy, Key, X
} from 'lucide-react'
import toast from 'react-hot-toast'

interface ApiKey {
  id: string
  name: string
  key: string
  permissions: string[]
  status: string
  expires_at: string
  created_at: string
}

export const ApiCenter = () => {
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newPermissions, setNewPermissions] = useState('')

  const loadKeys = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      toast.error('加载API密钥失败: ' + error.message)
    } else {
      setKeys(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    loadKeys()
  }, [])

  const generateKey = () => {
    return 'sk_' + Array.from({ length: 32 }, () => 
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 62)]
    ).join('')
  }

  const handleCreate = async () => {
    if (!newName) {
      toast.error('请输入名称')
      return
    }

    const newKey = generateKey()
    const { error } = await supabase
      .from('api_keys')
      .insert({
        name: newName,
        key: newKey,
        permissions: newPermissions.split(',').map(p => p.trim()).filter(Boolean),
        status: 'active',
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      })

    if (error) {
      toast.error('创建失败: ' + error.message)
    } else {
      toast.success('API密钥创建成功')
      setShowCreate(false)
      setNewName('')
      setNewPermissions('')
      loadKeys()
    }
  }

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
    const { error } = await supabase
      .from('api_keys')
      .update({ status: newStatus })
      .eq('id', id)

    if (error) {
      toast.error('更新失败: ' + error.message)
    } else {
      toast.success(`密钥已${newStatus === 'active' ? '启用' : '停用'}`)
      loadKeys()
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`确定要删除密钥 ${name} 吗？`)) return

    const { error } = await supabase
      .from('api_keys')
      .delete()
      .eq('id', id)

    if (error) {
      toast.error('删除失败: ' + error.message)
    } else {
      toast.success('密钥已删除')
      loadKeys()
    }
  }

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key)
    toast.success('已复制')
  }

  const filtered = keys.filter(k => k.name.includes(search) || k.key.includes(search))

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
            <h1 className="text-2xl font-bold text-white">接口中心</h1>
            <p className="text-gray-400 text-sm">管理API密钥和接口权限</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadKeys}>
              <RefreshCw size={16} className="mr-2" /> 刷新
            </Button>
            <Button variant="primary" onClick={() => setShowCreate(true)}>
              <Plus size={16} className="mr-2" /> 创建密钥
            </Button>
          </div>
        </div>

        <Card>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="搜索密钥..."
                value={search}
                onChange={(e: any) => setSearch(e.target.value)}
                className="bg-[#1a1f35] border-gray-700 text-white"
                prefix={<Search size={16} className="text-gray-400" />}
              />
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          {filtered.map((key) => (
            <Card key={key.id} className="hover:border-blue-500/30 transition-colors">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <Server className="text-blue-400" size={20} />
                    <h3 className="text-white font-semibold">{key.name}</h3>
                    <Badge variant={key.status === 'active' ? 'success' : 'default'}>
                      {key.status === 'active' ? '启用' : '停用'}
                    </Badge>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <code className="text-gray-400 text-sm bg-[#1a1f35] px-3 py-1 rounded">
                      {key.key.slice(0, 20)}...{key.key.slice(-8)}
                    </code>
                    <button
                      onClick={() => copyKey(key.key)}
                      className="p-1 hover:text-white text-gray-400"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {key.permissions?.map((p: string) => (
                      <Badge key={p} variant="info">{p}</Badge>
                    ))}
                    {(!key.permissions || key.permissions.length === 0) && (
                      <span className="text-gray-500 text-xs">无权限限制</span>
                    )}
                  </div>
                  <div className="mt-2 text-gray-500 text-xs">
                    过期: {key.expires_at ? new Date(key.expires_at).toLocaleDateString() : '永不过期'}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleStatus(key.id, key.status)}
                    className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(key.id, key.name)}
                    className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </Card>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">暂无API密钥</div>
          )}
        </div>

        {showCreate && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-[#12182b] border border-gray-800 rounded-2xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">创建API密钥</h2>
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
                    placeholder="我的应用"
                    className="w-full px-4 py-2 bg-[#1a1f35] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-white text-sm font-medium block mb-1">权限 (逗号分隔)</label>
                  <input
                    type="text"
                    value={newPermissions}
                    onChange={(e) => setNewPermissions(e.target.value)}
                    placeholder="read,write,admin"
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
