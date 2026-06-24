import { useState, useEffect } from 'react'
import { Card } from '@/components/Common/Card'
import { Badge } from '@/components/Common/Badge'
import { Button } from '@/components/Common/Button'
import { Input } from '@/components/Forms/Input'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import {
  Ticket, Search, RefreshCw, Plus, CheckCircle,
  XCircle, Clock, User, X
} from 'lucide-react'
import toast from 'react-hot-toast'

export const Tickets = () => {
  const { user } = useAuthStore()
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')
  const [newCategory, setNewCategory] = useState('general')

  const isAdmin = user?.role === 'SuperAdmin' || user?.role === 'Admin'

  const loadTickets = async () => {
    setLoading(true)
    let query = supabase
      .from('tickets')
      .select('*')
      .order('created_at', { ascending: false })

    if (!isAdmin) {
      query = query.eq('user_id', user?.id)
    }

    const { data, error } = await query

    if (error) {
      toast.error('加载工单失败: ' + error.message)
    } else {
      setTickets(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    loadTickets()
  }, [user])

  const handleCreate = async () => {
    if (!newTitle || !newContent) {
      toast.error('请填写完整信息')
      return
    }

    const { error } = await supabase
      .from('tickets')
      .insert({
        user_id: user?.id,
        title: newTitle,
        content: newContent,
        category: newCategory,
        priority: 'medium',
        status: 'open'
      })

    if (error) {
      toast.error('创建失败: ' + error.message)
    } else {
      toast.success('工单已创建')
      setShowCreate(false)
      setNewTitle('')
      setNewContent('')
      loadTickets()
    }
  }

  const handleUpdateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from('tickets')
      .update({ status })
      .eq('id', id)

    if (error) {
      toast.error('更新失败: ' + error.message)
    } else {
      toast.success(`工单已${status === 'closed' ? '关闭' : '处理中'}`)
      loadTickets()
    }
  }

  const statusColors: Record<string, string> = {
    open: 'warning',
    processing: 'info',
    resolved: 'success',
    closed: 'default'
  }

  const statusLabels: Record<string, string> = {
    open: '待处理',
    processing: '处理中',
    resolved: '已解决',
    closed: '已关闭'
  }

  const priorityColors: Record<string, string> = {
    low: 'default',
    medium: 'info',
    high: 'warning',
    urgent: 'danger'
  }

  const filtered = tickets.filter(t => {
    const matchSearch = t.title.includes(search)
    const matchStatus = !filterStatus || t.status === filterStatus
    return matchSearch && matchStatus
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
            <h1 className="text-2xl font-bold text-gray-900">工单系统</h1>
            <p className="text-gray-500 text-sm">管理所有工单</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadTickets}>
              <RefreshCw size={16} className="mr-2" /> 刷新
            </Button>
            <Button variant="primary" onClick={() => setShowCreate(true)}>
              <Plus size={16} className="mr-2" /> 创建工单
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-gray-500 text-sm">总工单</div>
            <div className="text-gray-900 text-2xl font-bold">{tickets.length}</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-gray-500 text-sm">待处理</div>
            <div className="text-yellow-500 text-2xl font-bold">
              {tickets.filter(t => t.status === 'open').length}
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-gray-500 text-sm">处理中</div>
            <div className="text-blue-500 text-2xl font-bold">
              {tickets.filter(t => t.status === 'processing').length}
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-gray-500 text-sm">已解决</div>
            <div className="text-green-500 text-2xl font-bold">
              {tickets.filter(t => t.status === 'resolved').length}
            </div>
          </div>
        </div>

        <Card>
          <div className="flex flex-wrap gap-4 p-4">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="搜索工单..."
                value={search}
                onChange={(e: any) => setSearch(e.target.value)}
                className="bg-gray-50 border-gray-200 text-gray-900"
                prefix={<Search size={16} className="text-gray-400" />}
              />
            </div>
            <select
              className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-yellow-400"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">全部状态</option>
              <option value="open">待处理</option>
              <option value="processing">处理中</option>
              <option value="resolved">已解决</option>
              <option value="closed">已关闭</option>
            </select>
            <Button variant="ghost" onClick={() => { setSearch(''); setFilterStatus('') }}>
              重置
            </Button>
          </div>
        </Card>

        <Card>
          <div className="divide-y divide-gray-200">
            {filtered.map((ticket) => (
              <div key={ticket.id} className="p-4 hover:bg-gray-50">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-gray-900 font-semibold">{ticket.title}</h3>
                      <Badge variant={statusColors[ticket.status] || 'default'}>
                        {statusLabels[ticket.status] || ticket.status}
                      </Badge>
                      <Badge variant={priorityColors[ticket.priority] || 'default'}>
                        {ticket.priority}
                      </Badge>
                      <Badge variant="info">{ticket.category}</Badge>
                    </div>
                    <p className="text-gray-600 text-sm mt-1">{ticket.content}</p>
                    <div className="flex items-center gap-4 mt-2 text-gray-400 text-xs">
                      <span>用户: {ticket.user_id?.slice(0, 8) || '未知'}</span>
                      <span>{new Date(ticket.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                  {isAdmin && ticket.status !== 'closed' && (
                    <div className="flex gap-2">
                      {ticket.status === 'open' && (
                        <Button size="sm" onClick={() => handleUpdateStatus(ticket.id, 'processing')}>
                          处理中
                        </Button>
                      )}
                      {ticket.status === 'processing' && (
                        <Button size="sm" variant="success" onClick={() => handleUpdateStatus(ticket.id, 'resolved')}>
                          解决
                        </Button>
                      )}
                      <Button size="sm" variant="danger" onClick={() => handleUpdateStatus(ticket.id, 'closed')}>
                        关闭
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-8 text-gray-400">暂无工单</div>
            )}
          </div>
        </Card>

        {showCreate && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">创建工单</h2>
                <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-gray-700 text-sm font-medium block mb-1">标题</label>
                  <Input
                    value={newTitle}
                    onChange={(e: any) => setNewTitle(e.target.value)}
                    className="bg-gray-50 border-gray-200 text-gray-900"
                  />
                </div>
                <div>
                  <label className="text-gray-700 text-sm font-medium block mb-1">内容</label>
                  <textarea
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-yellow-400"
                  />
                </div>
                <div>
                  <label className="text-gray-700 text-sm font-medium block mb-1">分类</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-yellow-400"
                  >
                    <option value="general">通用</option>
                    <option value="technical">技术</option>
                    <option value="financial">财务</option>
                    <option value="other">其他</option>
                  </select>
                </div>
                <Button className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500" onClick={handleCreate}>
                  提交
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
