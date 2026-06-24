import { useState, useEffect } from 'react'
import { Card } from '@/components/Common/Card'
import { Badge } from '@/components/Common/Badge'
import { Button } from '@/components/Common/Button'
import { Input } from '@/components/Forms/Input'
import { supabase } from '@/lib/supabase'
import {
  Megaphone, Search, RefreshCw, Plus, Edit2, Trash2,
  X, Calendar, Pin, Bell, CheckCircle, XCircle
} from 'lucide-react'
import toast from 'react-hot-toast'

export const Announcements = () => {
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [editing, setEditing] = useState<any>(null)

  const loadAnnouncements = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('pinned', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) {
      toast.error('加载公告失败: ' + error.message)
    } else {
      setAnnouncements(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    loadAnnouncements()
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as any
    const title = form.title.value
    const content = form.content.value
    const type = form.type.value
    const priority = form.priority.value

    if (!title || !content) {
      toast.error('请填写完整信息')
      return
    }

    const { error } = await supabase
      .from('announcements')
      .insert({
        title,
        content,
        type,
        priority,
        status: 'active',
        pinned: false
      })

    if (error) {
      toast.error('创建失败: ' + error.message)
    } else {
      toast.success('公告已发布')
      setShowCreate(false)
      loadAnnouncements()
    }
  }

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
    const { error } = await supabase
      .from('announcements')
      .update({ status: newStatus })
      .eq('id', id)

    if (error) {
      toast.error('更新失败: ' + error.message)
    } else {
      toast.success(`公告已${newStatus === 'active' ? '发布' : '下架'}`)
      loadAnnouncements()
    }
  }

  const handleTogglePin = async (id: string, currentPinned: boolean) => {
    const { error } = await supabase
      .from('announcements')
      .update({ pinned: !currentPinned })
      .eq('id', id)

    if (error) {
      toast.error('更新失败: ' + error.message)
    } else {
      toast.success(currentPinned ? '已取消置顶' : '已置顶')
      loadAnnouncements()
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这条公告吗？')) return

    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', id)

    if (error) {
      toast.error('删除失败: ' + error.message)
    } else {
      toast.success('公告已删除')
      loadAnnouncements()
    }
  }

  const typeLabels: Record<string, string> = {
    general: '通用',
    update: '系统更新',
    maintenance: '维护通知',
    important: '重要通知'
  }

  const priorityColors: Record<string, string> = {
    low: 'default',
    medium: 'info',
    high: 'warning',
    urgent: 'danger'
  }

  const filtered = announcements.filter(a => {
    return a.title.includes(search) || a.content.includes(search)
  })

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
            <h1 className="text-2xl font-bold text-gray-900">公告系统</h1>
            <p className="text-gray-500 text-sm">发布和管理系统公告</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadAnnouncements}>
              <RefreshCw size={16} className="mr-2" /> 刷新
            </Button>
            <Button variant="primary" onClick={() => setShowCreate(true)}>
              <Plus size={16} className="mr-2" /> 发布公告
            </Button>
          </div>
        </div>

        <Card>
          <div className="flex gap-4 p-4">
            <div className="flex-1">
              <Input
                placeholder="搜索公告..."
                value={search}
                onChange={(e: any) => setSearch(e.target.value)}
                className="bg-gray-50 border-gray-200 text-gray-900"
                prefix={<Search size={16} className="text-gray-400" />}
              />
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          {filtered.map((ann) => (
            <Card key={ann.id} className={`border ${ann.pinned ? 'border-yellow-400' : 'border-gray-200'}`}>
              <div className="flex flex-wrap items-start justify-between gap-4 p-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    {ann.pinned && <Pin className="text-yellow-500" size={16} />}
                    <h3 className="text-gray-900 font-semibold">{ann.title}</h3>
                    <Badge variant={ann.status === 'active' ? 'success' : 'default'}>
                      {ann.status === 'active' ? '已发布' : '已下架'}
                    </Badge>
                    <Badge variant={priorityColors[ann.priority] || 'default'}>
                      {ann.priority}
                    </Badge>
                    <Badge variant="info">{typeLabels[ann.type] || ann.type}</Badge>
                  </div>
                  <p className="text-gray-600 text-sm mt-2">{ann.content}</p>
                  <div className="flex items-center gap-4 mt-2 text-gray-400 text-xs">
                    <span><Calendar size={12} className="inline mr-1" /> {new Date(ann.created_at).toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => handleTogglePin(ann.id, ann.pinned)}
                    className={`p-2 rounded-lg transition-colors ${ann.pinned ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                    title={ann.pinned ? '取消置顶' : '置顶'}
                  >
                    <Pin size={16} />
                  </button>
                  <button
                    onClick={() => handleToggleStatus(ann.id, ann.status)}
                    className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                    title={ann.status === 'active' ? '下架' : '发布'}
                  >
                    {ann.status === 'active' ? <XCircle size={16} /> : <CheckCircle size={16} />}
                  </button>
                  <button
                    onClick={() => handleDelete(ann.id)}
                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </Card>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">暂无公告</div>
          )}
        </div>

        {showCreate && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">发布公告</h2>
                <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="text-gray-700 text-sm font-medium block mb-1">标题</label>
                  <input name="title" type="text" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-yellow-400" />
                </div>
                <div>
                  <label className="text-gray-700 text-sm font-medium block mb-1">内容</label>
                  <textarea name="content" rows={4} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-yellow-400" />
                </div>
                <div>
                  <label className="text-gray-700 text-sm font-medium block mb-1">类型</label>
                  <select name="type" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-yellow-400">
                    <option value="general">通用</option>
                    <option value="update">系统更新</option>
                    <option value="maintenance">维护通知</option>
                    <option value="important">重要通知</option>
                  </select>
                </div>
                <div>
                  <label className="text-gray-700 text-sm font-medium block mb-1">优先级</label>
                  <select name="priority" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-yellow-400">
                    <option value="low">低</option>
                    <option value="medium">中</option>
                    <option value="high">高</option>
                    <option value="urgent">紧急</option>
                  </select>
                </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500">发布</Button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
