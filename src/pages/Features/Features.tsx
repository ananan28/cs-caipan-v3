import { useState } from 'react'
import { Card } from '@/components/Common/Card'
import { Badge } from '@/components/Common/Badge'
import { Button } from '@/components/Common/Button'
import { Input } from '@/components/Forms/Input'
import { Grid, Plus, Edit, Trash2, Check, X, Star, Save } from 'lucide-react'
import toast from 'react-hot-toast'

export const Features = () => {
  const [showCreate, setShowCreate] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [editingFeature, setEditingFeature] = useState<any>(null)
  const [features, setFeatures] = useState([
    { id: 1, name: '数据去重检测', category: '数据处理', price: 0, desc: '去除重复号码', enabled: true, popular: true },
    { id: 2, name: 'WhatsApp检测', category: '号码检测', price: 0.05, desc: '注册/头像检测', enabled: true, popular: true },
    { id: 3, name: 'Telegram检测', category: '号码检测', price: 0.05, desc: '注册/用户名检测', enabled: true, popular: false },
    { id: 4, name: '运营商检测', category: '运营商', price: 0.03, desc: '号码类型检测', enabled: true, popular: false },
    { id: 5, name: 'Signal检测', category: '号码检测', price: 0.05, desc: 'Signal注册检测', enabled: false, popular: false },
    { id: 6, name: '空号检测', category: '号码检测', price: 0.02, desc: '空号/有效性检测', enabled: true, popular: false },
  ])

  const [newFeature, setNewFeature] = useState({ name: '', category: '', price: '', desc: '', enabled: true })
  const [editForm, setEditForm] = useState({ name: '', category: '', price: '', desc: '', enabled: true })

  const handleCreate = () => {
    if (!newFeature.name || !newFeature.category) {
      toast.error('请填写完整信息')
      return
    }
    setFeatures([...features, {
      id: Date.now(),
      name: newFeature.name,
      category: newFeature.category,
      price: Number(newFeature.price) || 0,
      desc: newFeature.desc || '暂无描述',
      enabled: newFeature.enabled,
      popular: false,
    }])
    toast.success(`功能 ${newFeature.name} 已创建`)
    setShowCreate(false)
    setNewFeature({ name: '', category: '', price: '', desc: '', enabled: true })
  }

  const handleEdit = (item: any) => {
    setEditingFeature(item)
    setEditForm({
      name: item.name,
      category: item.category,
      price: String(item.price),
      desc: item.desc || '',
      enabled: item.enabled,
    })
    setShowEdit(true)
  }

  const handleSaveEdit = () => {
    if (!editForm.name || !editForm.category) {
      toast.error('请填写完整信息')
      return
    }
    setFeatures(features.map(f => 
      f.id === editingFeature.id ? {
        ...f,
        name: editForm.name,
        category: editForm.category,
        price: Number(editForm.price) || 0,
        desc: editForm.desc || '暂无描述',
        enabled: editForm.enabled,
      } : f
    ))
    toast.success(`功能 ${editForm.name} 已更新`)
    setShowEdit(false)
    setEditingFeature(null)
  }

  const handleToggle = (id: number) => {
    setFeatures(features.map(f => f.id === id ? { ...f, enabled: !f.enabled } : f))
    toast.success('功能状态已更新')
  }

  const handleDelete = (id: number, name: string) => {
    if (confirm(`确定要删除功能 ${name} 吗？`)) {
      setFeatures(features.filter(f => f.id !== id))
      toast.success(`功能 ${name} 已删除`)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white">功能中心</h1><p className="text-muted text-sm">管理检测功能</p></div>
        <Button variant="primary" onClick={() => setShowCreate(true)}><Plus size={18} className="mr-2" />新增功能</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map(f => (
          <Card key={f.id} className="relative">
            {f.popular && <div className="absolute -top-2 right-4"><Badge variant="orange">🔥 热门</Badge></div>}
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white">{f.name}</h3>
              <Badge variant={f.enabled ? 'green' : 'red'}>{f.enabled ? '已上架' : '已下架'}</Badge>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="blue">{f.category}</Badge>
              <span className="text-sm text-muted">{f.price === 0 ? '免费' : `¥${f.price}/条`}</span>
            </div>
            <p className="text-sm text-muted mt-2">{f.desc}</p>
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
              <button onClick={() => handleEdit(f)} className="p-2 rounded-lg bg-panel/50 hover:bg-blue/10"><Edit size={16} className="text-blue" /></button>
              <button onClick={() => handleToggle(f.id)} className="p-2 rounded-lg bg-panel/50 hover:bg-panel/70">
                {f.enabled ? <X size={16} className="text-red" /> : <Check size={16} className="text-green" />}
              </button>
              <button onClick={() => handleDelete(f.id, f.name)} className="p-2 rounded-lg bg-panel/50 hover:bg-red/10"><Trash2 size={16} className="text-red" /></button>
            </div>
          </Card>
        ))}
      </div>

      {/* 编辑弹窗 */}
      {showEdit && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur flex items-center justify-center p-4" onClick={() => setShowEdit(false)}>
          <div className="w-full max-w-md bg-panel border border-border rounded-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-white mb-4">编辑功能</h2>
            <div className="space-y-4">
              <Input label="功能名称" value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} />
              <Input label="分类" value={editForm.category} onChange={(e) => setEditForm({...editForm, category: e.target.value})} />
              <Input label="单价 (¥/条)" type="number" step="0.001" value={editForm.price} onChange={(e) => setEditForm({...editForm, price: e.target.value})} />
              <Input label="描述" value={editForm.desc} onChange={(e) => setEditForm({...editForm, desc: e.target.value})} />
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
                  <input type="checkbox" checked={editForm.enabled} onChange={(e) => setEditForm({...editForm, enabled: e.target.checked})} className="w-4 h-4 accent-blue" />
                  上架
                </label>
              </div>
              <div className="flex gap-3">
                <Button variant="primary" className="flex-1" onClick={handleSaveEdit}><Save size={16} className="mr-1" />保存</Button>
                <Button variant="ghost" className="flex-1" onClick={() => setShowEdit(false)}>取消</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 创建弹窗 */}
      {showCreate && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur flex items-center justify-center p-4" onClick={() => setShowCreate(false)}>
          <div className="w-full max-w-md bg-panel border border-border rounded-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-white mb-4">新增功能</h2>
            <div className="space-y-4">
              <Input label="功能名称" value={newFeature.name} onChange={(e) => setNewFeature({...newFeature, name: e.target.value})} />
              <Input label="分类" value={newFeature.category} onChange={(e) => setNewFeature({...newFeature, category: e.target.value})} />
              <Input label="单价 (¥/条)" type="number" step="0.001" value={newFeature.price} onChange={(e) => setNewFeature({...newFeature, price: e.target.value})} />
              <Input label="描述" value={newFeature.desc} onChange={(e) => setNewFeature({...newFeature, desc: e.target.value})} />
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
                  <input type="checkbox" checked={newFeature.enabled} onChange={(e) => setNewFeature({...newFeature, enabled: e.target.checked})} className="w-4 h-4 accent-blue" />
                  立即上架
                </label>
              </div>
              <div className="flex gap-3">
                <Button variant="primary" className="flex-1" onClick={handleCreate}>创建</Button>
                <Button variant="ghost" className="flex-1" onClick={() => setShowCreate(false)}>取消</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
