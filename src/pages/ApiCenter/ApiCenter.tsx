import { useState } from 'react'
import { Card } from '@/components/Common/Card'
import { Badge } from '@/components/Common/Badge'
import { Button } from '@/components/Common/Button'
import { Input } from '@/components/Forms/Input'
import { Plug, Plus, Edit, Trash2, Check, X, RefreshCw, Server, Database, Save } from 'lucide-react'
import toast from 'react-hot-toast'

export const ApiCenter = () => {
  const [showCreate, setShowCreate] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [editingApi, setEditingApi] = useState<any>(null)
  const [apis, setApis] = useState([
    { id: 1, name: 'WhatsApp接口', type: 'WhatsApp', cost: 0.03, status: 'enabled', remark: '注册检测、头像检测' },
    { id: 2, name: 'Telegram接口', type: 'Telegram', cost: 0.03, status: 'enabled', remark: '注册检测、用户名检测' },
    { id: 3, name: '运营商接口', type: 'Carrier', cost: 0.02, status: 'enabled', remark: '号码类型检测' },
    { id: 4, name: 'Signal接口', type: 'Signal', cost: 0.04, status: 'disabled', remark: 'Signal检测' },
  ])

  const [newApi, setNewApi] = useState({ name: '', type: '', cost: '', remark: '', status: 'enabled' })
  const [editForm, setEditForm] = useState({ name: '', type: '', cost: '', remark: '', status: 'enabled' })

  const handleCreate = () => {
    if (!newApi.name || !newApi.type || !newApi.cost) {
      toast.error('请填写完整信息')
      return
    }
    setApis([...apis, {
      id: Date.now(),
      name: newApi.name,
      type: newApi.type,
      cost: Number(newApi.cost),
      status: newApi.status as 'enabled' | 'disabled',
      remark: newApi.remark || '暂无备注',
    }])
    toast.success(`接口 ${newApi.name} 已创建`)
    setShowCreate(false)
    setNewApi({ name: '', type: '', cost: '', remark: '', status: 'enabled' })
  }

  const handleEdit = (item: any) => {
    setEditingApi(item)
    setEditForm({
      name: item.name,
      type: item.type,
      cost: String(item.cost),
      remark: item.remark || '',
      status: item.status,
    })
    setShowEdit(true)
  }

  const handleSaveEdit = () => {
    if (!editForm.name || !editForm.type || !editForm.cost) {
      toast.error('请填写完整信息')
      return
    }
    setApis(apis.map(a => 
      a.id === editingApi.id ? {
        ...a,
        name: editForm.name,
        type: editForm.type,
        cost: Number(editForm.cost),
        status: editForm.status as 'enabled' | 'disabled',
        remark: editForm.remark || '暂无备注',
      } : a
    ))
    toast.success(`接口 ${editForm.name} 已更新`)
    setShowEdit(false)
    setEditingApi(null)
  }

  const handleToggle = (id: number) => {
    setApis(apis.map(a => a.id === id ? { ...a, status: a.status === 'enabled' ? 'disabled' : 'enabled' } : a))
    toast.success('接口状态已更新')
  }

  const handleDelete = (id: number, name: string) => {
    if (confirm(`确定要删除接口 ${name} 吗？`)) {
      setApis(apis.filter(a => a.id !== id))
      toast.success(`接口 ${name} 已删除`)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white">接口中心</h1><p className="text-muted text-sm">管理接口提供商</p></div>
        <div className="flex gap-2">
          <Button variant="ghost"><RefreshCw size={18} /></Button>
          <Button variant="primary" onClick={() => setShowCreate(true)}><Plus size={18} className="mr-2" />新增接口</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {apis.map(api => (
          <Card key={api.id}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white">{api.name}</h3>
              <Badge variant={api.status === 'enabled' ? 'green' : 'red'}>{api.status === 'enabled' ? '🟢 启用' : '🔴 停用'}</Badge>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="blue">{api.type}</Badge>
              <span className="text-sm text-muted">成本: ¥{api.cost}/条</span>
            </div>
            <p className="text-sm text-muted mt-2">{api.remark}</p>
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
              <button onClick={() => handleEdit(api)} className="p-2 rounded-lg bg-panel/50 hover:bg-blue/10"><Edit size={16} className="text-blue" /></button>
              <button onClick={() => handleToggle(api.id)} className="p-2 rounded-lg bg-panel/50 hover:bg-panel/70">
                {api.status === 'enabled' ? <X size={16} className="text-red" /> : <Check size={16} className="text-green" />}
              </button>
              <button onClick={() => handleDelete(api.id, api.name)} className="p-2 rounded-lg bg-panel/50 hover:bg-red/10"><Trash2 size={16} className="text-red" /></button>
            </div>
          </Card>
        ))}
      </div>

      {/* 编辑弹窗 */}
      {showEdit && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur flex items-center justify-center p-4" onClick={() => setShowEdit(false)}>
          <div className="w-full max-w-md bg-panel border border-border rounded-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-white mb-4">编辑接口</h2>
            <div className="space-y-4">
              <Input label="接口名称" value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} />
              <Input label="接口类型" value={editForm.type} onChange={(e) => setEditForm({...editForm, type: e.target.value})} />
              <Input label="单价 (¥/条)" type="number" step="0.001" value={editForm.cost} onChange={(e) => setEditForm({...editForm, cost: e.target.value})} />
              <Input label="备注" value={editForm.remark} onChange={(e) => setEditForm({...editForm, remark: e.target.value})} />
              <div>
                <label className="text-sm font-bold text-muted block mb-1.5">状态</label>
                <select className="w-full bg-panel/50 border border-border rounded-xl text-white px-4 py-2.5 outline-none focus:border-sky/50" value={editForm.status} onChange={(e) => setEditForm({...editForm, status: e.target.value})}>
                  <option value="enabled">启用</option>
                  <option value="disabled">停用</option>
                </select>
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
            <h2 className="text-xl font-bold text-white mb-4">新增接口</h2>
            <div className="space-y-4">
              <Input label="接口名称" value={newApi.name} onChange={(e) => setNewApi({...newApi, name: e.target.value})} />
              <Input label="接口类型" value={newApi.type} onChange={(e) => setNewApi({...newApi, type: e.target.value})} />
              <Input label="单价 (¥/条)" type="number" step="0.001" value={newApi.cost} onChange={(e) => setNewApi({...newApi, cost: e.target.value})} />
              <Input label="备注" value={newApi.remark} onChange={(e) => setNewApi({...newApi, remark: e.target.value})} />
              <div>
                <label className="text-sm font-bold text-muted block mb-1.5">状态</label>
                <select className="w-full bg-panel/50 border border-border rounded-xl text-white px-4 py-2.5 outline-none focus:border-sky/50" value={newApi.status} onChange={(e) => setNewApi({...newApi, status: e.target.value})}>
                  <option value="enabled">启用</option>
                  <option value="disabled">停用</option>
                </select>
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
