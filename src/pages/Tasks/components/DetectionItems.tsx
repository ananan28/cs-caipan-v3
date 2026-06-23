import { useState, useEffect } from 'react'
import { Card } from '@/components/Common/Card'
import { Badge } from '@/components/Common/Badge'
import { Button } from '@/components/Common/Button'
import { supabase } from '@/lib/supabase'
import { 
  CheckCircle, XCircle, Edit2, Save, X, Plus, Trash2,
  Zap, Shield, AlertCircle, Info, RefreshCw
} from 'lucide-react'
import toast from 'react-hot-toast'

interface DetectionItem {
  id: string
  name: string
  platform: string
  price: number
  status: 'active' | 'inactive'
  description: string
  created_at: string
}

export const DetectionItems = () => {
  const [items, setItems] = useState<DetectionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editPrice, setEditPrice] = useState<number>(0)
  const [showAdd, setShowAdd] = useState(false)
  const [newItem, setNewItem] = useState({
    name: '',
    platform: '',
    price: 0,
    description: ''
  })

  const loadItems = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('detection_items')
      .select('*')
      .order('platform', { ascending: true })

    if (error) {
      toast.error('加载检测项失败: ' + error.message)
    } else {
      setItems(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    loadItems()
  }, [])

  const handleUpdate = async (id: string) => {
    const { error } = await supabase
      .from('detection_items')
      .update({ 
        price: editPrice,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) {
      toast.error('更新失败: ' + error.message)
    } else {
      toast.success('价格已更新')
      setEditingId(null)
      loadItems()
    }
  }

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
    const { error } = await supabase
      .from('detection_items')
      .update({ status: newStatus })
      .eq('id', id)

    if (error) {
      toast.error('更新失败: ' + error.message)
    } else {
      toast.success(`已${newStatus === 'active' ? '启用' : '停用'}`)
      loadItems()
    }
  }

  const handleAdd = async () => {
    if (!newItem.name || !newItem.platform) {
      toast.error('请填写完整信息')
      return
    }

    const { error } = await supabase
      .from('detection_items')
      .insert({
        name: newItem.name,
        platform: newItem.platform,
        price: newItem.price,
        description: newItem.description,
        status: 'active'
      })

    if (error) {
      toast.error('添加失败: ' + error.message)
    } else {
      toast.success('检测项已添加')
      setShowAdd(false)
      setNewItem({ name: '', platform: '', price: 0, description: '' })
      loadItems()
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`确定要删除 "${name}" 吗？`)) return

    const { error } = await supabase
      .from('detection_items')
      .delete()
      .eq('id', id)

    if (error) {
      toast.error('删除失败: ' + error.message)
    } else {
      toast.success('已删除')
      loadItems()
    }
  }

  const platforms = ['WhatsApp', 'Telegram', 'Signal', 'LINE', 'Facebook', 'Instagram', 'Twitter', 'TikTok']

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">加载检测项...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 头部操作栏 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">检测项配置</h2>
          <p className="text-gray-400 text-sm">管理所有平台的检测项目及价格</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadItems}>
            <RefreshCw size={14} className="mr-1" /> 刷新
          </Button>
          <Button variant="primary" size="sm" onClick={() => setShowAdd(true)}>
            <Plus size={14} className="mr-1" /> 添加检测项
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#12182b] border border-gray-800 rounded-lg p-4">
          <div className="text-gray-400 text-sm">总检测项</div>
          <div className="text-white text-xl font-bold">{items.length}</div>
        </div>
        <div className="bg-[#12182b] border border-gray-800 rounded-lg p-4">
          <div className="text-gray-400 text-sm">已启用</div>
          <div className="text-green-400 text-xl font-bold">
            {items.filter(i => i.status === 'active').length}
          </div>
        </div>
        <div className="bg-[#12182b] border border-gray-800 rounded-lg p-4">
          <div className="text-gray-400 text-sm">平台数</div>
          <div className="text-blue-400 text-xl font-bold">
            {new Set(items.map(i => i.platform)).size}
          </div>
        </div>
        <div className="bg-[#12182b] border border-gray-800 rounded-lg p-4">
          <div className="text-gray-400 text-sm">平均价格</div>
          <div className="text-yellow-400 text-xl font-bold">
            ${(items.reduce((sum, i) => sum + i.price, 0) / items.length || 0).toFixed(3)}
          </div>
        </div>
      </div>

      {/* 检测项列表 */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#1a1f35]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">检测项</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">平台</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">价格</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">状态</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">说明</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">操作</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t border-gray-800 hover:bg-[#1a1f35]/50 transition-colors">
                  <td className="px-4 py-3 text-white font-medium">{item.name}</td>
                  <td className="px-4 py-3">
                    <Badge variant="info">{item.platform}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    {editingId === item.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="0.001"
                          value={editPrice}
                          onChange={(e) => setEditPrice(parseFloat(e.target.value) || 0)}
                          className="w-20 px-2 py-1 bg-[#0a0f1f] border border-blue-500 rounded text-white text-sm focus:outline-none"
                          autoFocus
                        />
                        <button
                          onClick={() => handleUpdate(item.id)}
                          className="p-1 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30"
                        >
                          <Save size={14} />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <span className="text-white font-mono">${item.price.toFixed(3)}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleStatus(item.id, item.status)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors flex items-center gap-1 ${
                        item.status === 'active'
                          ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                          : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                      }`}
                    >
                      {item.status === 'active' ? <CheckCircle size={12} /> : <XCircle size={12} />}
                      {item.status === 'active' ? '启用' : '停用'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-sm">{item.description || '-'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          setEditingId(item.id)
                          setEditPrice(item.price)
                        }}
                        className="p-1.5 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30"
                        title="编辑"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.name)}
                        className="p-1.5 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30"
                        title="删除"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-400">
                    暂无检测项，点击"添加检测项"创建
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 添加弹窗 */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#12182b] border border-gray-800 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">添加检测项</h2>
              <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-white text-sm font-medium block mb-1">检测项名称</label>
                <input
                  type="text"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  placeholder="例如: 是否注册"
                  className="w-full px-4 py-2 bg-[#1a1f35] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-white text-sm font-medium block mb-1">平台</label>
                <select
                  value={newItem.platform}
                  onChange={(e) => setNewItem({ ...newItem, platform: e.target.value })}
                  className="w-full px-4 py-2 bg-[#1a1f35] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">选择平台</option>
                  {platforms.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-white text-sm font-medium block mb-1">价格 (USDT)</label>
                <input
                  type="number"
                  step="0.001"
                  value={newItem.price}
                  onChange={(e) => setNewItem({ ...newItem, price: parseFloat(e.target.value) || 0 })}
                  placeholder="0.020"
                  className="w-full px-4 py-2 bg-[#1a1f35] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-white text-sm font-medium block mb-1">描述</label>
                <input
                  type="text"
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  placeholder="检测说明"
                  className="w-full px-4 py-2 bg-[#1a1f35] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <Button className="w-full" onClick={handleAdd}>添加</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
