import { useState } from 'react'
import { Card } from '@/components/Common/Card'
import { Badge } from '@/components/Common/Badge'
import { Button } from '@/components/Common/Button'
import { Input } from '@/components/Forms/Input'
import { Megaphone, Plus, Bell, AlertCircle, Info, CheckCircle, Eye, Edit, Trash2, Calendar, Users, Clock, X, Save, Pin } from 'lucide-react'
import toast from 'react-hot-toast'

export const Announcements = () => {
  const [activeTab, setActiveTab] = useState('list')
  const [showCreate, setShowCreate] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [editingAnn, setEditingAnn] = useState<any>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [type, setType] = useState('normal')
  const [isPopup, setIsPopup] = useState(false)

  const [announcements, setAnnouncements] = useState([
    { id: 1, title: '系统升级通知', content: '系统将于今晚 22:00 进行升级维护', type: 'emergency', isPopup: true, readCount: 156, time: '2025-06-22 14:30', status: 'published' },
    { id: 2, title: '新功能上线', content: '新增 Telegram 检测功能，欢迎体验', type: 'important', isPopup: false, readCount: 89, time: '2025-06-21 10:00', status: 'published' },
    { id: 3, title: '维护通知', content: '服务器将于 6月25日 进行维护', type: 'normal', isPopup: false, readCount: 234, time: '2025-06-20 16:45', status: 'published' },
  ])

  const typeColors: any = { normal: 'green', important: 'orange', emergency: 'red' }
  const typeIcons: any = { normal: <Info size={16} />, important: <AlertCircle size={16} />, emergency: <Bell size={16} /> }

  const handleCreate = () => {
    if (!title || !content) { toast.error('请填写标题和内容'); return }
    setAnnouncements([{ id: Date.now(), title, content, type, isPopup, readCount: 0, time: new Date().toISOString().slice(0, 16).replace('T', ' '), status: 'published' }, ...announcements])
    toast.success('✅ 公告已发布')
    setShowCreate(false); setTitle(''); setContent('')
  }

  const handleEdit = (ann: any) => { setEditingAnn(ann); setShowEdit(true) }
  const handleSaveEdit = () => {
    setAnnouncements(announcements.map(a => a.id === editingAnn.id ? { ...a, title: editingAnn.title, content: editingAnn.content, type: editingAnn.type, isPopup: editingAnn.isPopup } : a))
    toast.success('✅ 公告已更新'); setShowEdit(false); setEditingAnn(null)
  }
  const handleDelete = (id: number) => { if (confirm('确定删除？')) { setAnnouncements(announcements.filter(a => a.id !== id)); toast.success('✅ 已删除') } }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white">公告系统</h1><p className="text-muted text-sm">发布和管理系统公告</p></div>
        <Button variant="primary" onClick={() => setShowCreate(true)}><Plus size={18} className="mr-2" />发布公告</Button>
      </div>
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setActiveTab('list')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'list' ? 'bg-blue text-white' : 'bg-panel/50 text-muted hover:text-white'}`}>📋 列表</button>
        <button onClick={() => setActiveTab('important')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'important' ? 'bg-blue text-white' : 'bg-panel/50 text-muted hover:text-white'}`}>⭐ 重要</button>
      </div>
      <div className="space-y-4">
        {(activeTab === 'list' ? announcements : announcements.filter(a => a.type === 'important' || a.type === 'emergency')).map(ann => (
          <Card key={ann.id} className={`border-l-4 ${typeColors[ann.type] === 'red' ? 'border-red' : typeColors[ann.type] === 'orange' ? 'border-orange' : 'border-green'}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`text-${typeColors[ann.type]}`}>{typeIcons[ann.type]}</span>
                  <h3 className="font-bold text-white">{ann.title}</h3>
                  <Badge variant={typeColors[ann.type]}>{ann.type}</Badge>
                  {ann.isPopup && <Badge variant="purple">📌 弹窗</Badge>}
                </div>
                <p className="text-sm text-muted mt-2">{ann.content}</p>
                <div className="flex items-center gap-4 mt-3 text-xs text-muted">
                  <span><Calendar size={12} className="inline mr-1" />{ann.time}</span>
                  <span><Eye size={12} className="inline mr-1" />{ann.readCount} 阅读</span>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <button onClick={() => handleEdit(ann)} className="p-1.5 rounded-lg hover:bg-blue/10 text-blue"><Edit size={16} /></button>
                <button onClick={() => handleDelete(ann.id)} className="p-1.5 rounded-lg hover:bg-red/10 text-red"><Trash2 size={16} /></button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {showCreate && (<div className="fixed inset-0 z-50 bg-black/70 backdrop-blur flex items-center justify-center p-4"><div className="w-full max-w-lg bg-panel border border-border rounded-2xl p-6"><h2 className="text-xl font-bold text-white mb-4">发布公告</h2><div className="space-y-4"><Input label="标题" value={title} onChange={(e) => setTitle(e.target.value)} /><div><label className="text-sm font-bold text-muted block mb-1.5">类型</label><select className="w-full bg-panel/50 border border-border rounded-xl text-white px-4 py-2.5 outline-none" value={type} onChange={(e) => setType(e.target.value)}><option value="normal">普通</option><option value="important">重要</option><option value="emergency">紧急</option></select></div><div><label className="text-sm font-bold text-muted block mb-1.5">内容</label><textarea className="w-full min-h-[120px] bg-panel/50 border border-border rounded-xl text-white outline-none p-4 focus:border-sky/50" value={content} onChange={(e) => setContent(e.target.value)} /></div><div className="flex items-center gap-3"><label className="flex items-center gap-2 text-sm text-white cursor-pointer"><input type="checkbox" checked={isPopup} onChange={(e) => setIsPopup(e.target.checked)} className="w-4 h-4 accent-blue" />弹窗显示</label></div><div className="flex gap-3"><Button variant="primary" className="flex-1" onClick={handleCreate}>发布</Button><Button variant="ghost" className="flex-1" onClick={() => setShowCreate(false)}>取消</Button></div></div></div></div>)}
      {showEdit && editingAnn && (<div className="fixed inset-0 z-50 bg-black/70 backdrop-blur flex items-center justify-center p-4"><div className="w-full max-w-lg bg-panel border border-border rounded-2xl p-6"><h2 className="text-xl font-bold text-white mb-4">编辑公告</h2><div className="space-y-4"><Input label="标题" value={editingAnn.title} onChange={(e) => setEditingAnn({...editingAnn, title: e.target.value})} /><div><label className="text-sm font-bold text-muted block mb-1.5">类型</label><select className="w-full bg-panel/50 border border-border rounded-xl text-white px-4 py-2.5 outline-none" value={editingAnn.type} onChange={(e) => setEditingAnn({...editingAnn, type: e.target.value})}><option value="normal">普通</option><option value="important">重要</option><option value="emergency">紧急</option></select></div><div><label className="text-sm font-bold text-muted block mb-1.5">内容</label><textarea className="w-full min-h-[120px] bg-panel/50 border border-border rounded-xl text-white outline-none p-4 focus:border-sky/50" value={editingAnn.content} onChange={(e) => setEditingAnn({...editingAnn, content: e.target.value})} /></div><div className="flex items-center gap-3"><label className="flex items-center gap-2 text-sm text-white cursor-pointer"><input type="checkbox" checked={editingAnn.isPopup} onChange={(e) => setEditingAnn({...editingAnn, isPopup: e.target.checked})} className="w-4 h-4 accent-blue" />弹窗</label></div><div className="flex gap-3"><Button variant="primary" className="flex-1" onClick={handleSaveEdit}><Save size={16} className="mr-1" />保存</Button><Button variant="ghost" className="flex-1" onClick={() => setShowEdit(false)}>取消</Button></div></div></div></div>)}
    </div>
  )
}
