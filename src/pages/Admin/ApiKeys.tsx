import { useState, useEffect } from 'react'
import { Card } from '../../components/Common/Card'
import { Badge } from '../../components/Common/Badge'
import { Button } from '../../components/Common/Button'
import { Input } from '../../components/Forms/Input'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'
import { Key, Plus, RefreshCw, Copy, Trash2, Eye, EyeOff, X } from 'lucide-react'
import toast from 'react-hot-toast'

export const ApiKeys = () => {
  const { user } = useAuthStore()
  const [keys, setKeys] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

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
  }, [user])

  if (loading) {
    return <div className="p-6 text-center text-gray-400">加载中...</div>
  }

  return (
    <div className="p-6 bg-[#f0f2f5] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">API 管理</h1>
            <p className="text-gray-500 text-sm">管理 API 密钥和权限</p>
          </div>
          <Button variant="outline" onClick={loadKeys}>
            <RefreshCw size={16} className="mr-2" /> 刷新
          </Button>
        </div>

        <div className="mt-6 space-y-4">
          {keys.map((key) => (
            <Card key={key.id} className="border border-gray-200">
              <div className="flex items-center justify-between p-4">
                <div>
                  <div className="flex items-center gap-3">
                    <Key className="text-blue-500" size={20} />
                    <span className="text-gray-900 font-semibold">{key.name}</span>
                    <Badge variant={key.status === 'active' ? 'success' : 'default'}>
                      {key.status === 'active' ? '启用' : '停用'}
                    </Badge>
                  </div>
                  <code className="text-gray-600 text-sm bg-gray-100 px-3 py-1 rounded block mt-2">
                    {key.key?.slice(0, 16)}...{key.key?.slice(-8)}
                  </code>
                </div>
                <Button variant="danger" size="sm" onClick={() => {
                  if (confirm('确定要删除此密钥吗？')) {
                    supabase.from('api_keys').delete().eq('id', key.id).then(() => loadKeys())
                    toast.success('已删除')
                  }
                }}>
                  <Trash2 size={14} />
                </Button>
              </div>
            </Card>
          ))}
          {keys.length === 0 && (
            <div className="text-center py-12 text-gray-400">暂无 API 密钥</div>
          )}
        </div>
      </div>
    </div>
  )
}
