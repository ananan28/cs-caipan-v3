import { useState, useEffect } from 'react'
import { Card } from '@/components/Common/Card'
import { Badge } from '@/components/Common/Badge'
import { Button } from '@/components/Common/Button'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import {
  Bell, CheckCircle, XCircle, Clock, RefreshCw,
  Info, AlertTriangle, AlertCircle, Trash2,
  CheckCheck, X, Filter, Search
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Notification {
  id: string
  user_id: string
  title: string
  content: string
  type: string
  priority: string
  read: boolean
  created_at: string
}

export const Notifications = () => {
  const { user } = useAuthStore()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState('')
  const [filterRead, setFilterRead] = useState('')

  const loadNotifications = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false })

    if (error) {
      toast.error('加载通知失败: ' + error.message)
    } else {
      setNotifications(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    loadNotifications()
  }, [user])

  const handleMarkRead = async (id: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id)

    if (error) {
      toast.error('操作失败: ' + error.message)
    } else {
      loadNotifications()
    }
  }

  const handleMarkAllRead = async () => {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user?.id)
      .eq('read', false)

    if (error) {
      toast.error('操作失败: ' + error.message)
    } else {
      toast.success('全部已读')
      loadNotifications()
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除此通知吗？')) return

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id)

    if (error) {
      toast.error('删除失败: ' + error.message)
    } else {
      toast.success('已删除')
      loadNotifications()
    }
  }

  const handleDeleteAll = async () => {
    if (!confirm('确定要删除所有通知吗？')) return

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', user?.id)

    if (error) {
      toast.error('操作失败: ' + error.message)
    } else {
      toast.success('已清空所有通知')
      loadNotifications()
    }
  }

  const typeIcons: Record<string, any> = {
    info: Info,
    success: CheckCircle,
    warning: AlertTriangle,
    error: AlertCircle
  }

  const typeColors: Record<string, string> = {
    info: 'blue',
    success: 'green',
    warning: 'yellow',
    error: 'red'
  }

  const typeLabels: Record<string, string> = {
    info: '信息',
    success: '成功',
    warning: '警告',
    error: '错误'
  }

  const filtered = notifications.filter(n => {
    const matchType = !filterType || n.type === filterType
    const matchRead = filterRead === '' || 
      (filterRead === 'read' && n.read) ||
      (filterRead === 'unread' && !n.read)
    return matchType && matchRead
  })

  const unreadCount = notifications.filter(n => !n.read).length

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
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Bell className="text-blue-400" />
              消息通知
            </h1>
            <p className="text-gray-400 text-sm">
              {unreadCount > 0 ? `有 ${unreadCount} 条未读消息` : '没有未读消息'}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {unreadCount > 0 && (
              <Button variant="primary" size="sm" onClick={handleMarkAllRead}>
                <CheckCheck size={16} className="mr-2" /> 全部已读
              </Button>
            )}
            {notifications.length > 0 && (
              <Button variant="danger" size="sm" onClick={handleDeleteAll}>
                <Trash2 size={16} className="mr-2" /> 清空
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={loadNotifications}>
              <RefreshCw size={16} className="mr-2" /> 刷新
            </Button>
          </div>
        </div>

        <Card>
          <div className="flex flex-wrap gap-4">
            <select
              className="px-4 py-2 bg-[#1a1f35] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="">全部类型</option>
              <option value="info">信息</option>
              <option value="success">成功</option>
              <option value="warning">警告</option>
              <option value="error">错误</option>
            </select>
            <select
              className="px-4 py-2 bg-[#1a1f35] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              value={filterRead}
              onChange={(e) => setFilterRead(e.target.value)}
            >
              <option value="">全部状态</option>
              <option value="unread">未读</option>
              <option value="read">已读</option>
            </select>
            <Button variant="ghost" size="sm" onClick={() => { setFilterType(''); setFilterRead('') }}>
              重置
            </Button>
          </div>
        </Card>

        <div className="space-y-3">
          {filtered.map((notif) => {
            const Icon = typeIcons[notif.type] || Info
            const color = typeColors[notif.type] || 'blue'
            return (
              <Card key={notif.id} className={`${!notif.read ? 'border-blue-500/30 bg-blue-500/5' : ''}`}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`p-2 bg-${color}-500/20 rounded-lg mt-1`}>
                      <Icon className={`text-${color}-400`} size={18} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-white font-medium">{notif.title}</h3>
                        <Badge variant={typeColors[notif.type] as any}>
                          {typeLabels[notif.type] || notif.type}
                        </Badge>
                        {!notif.read && (
                          <Badge variant="danger">未读</Badge>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm mt-1">{notif.content}</p>
                      <p className="text-gray-500 text-xs mt-2">
                        {new Date(notif.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!notif.read && (
                      <button
                        onClick={() => handleMarkRead(notif.id)}
                        className="p-1.5 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30"
                        title="标记已读"
                      >
                        <CheckCircle size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notif.id)}
                      className="p-1.5 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30"
                      title="删除"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              </Card>
            )
          })}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Bell size={48} className="mx-auto mb-4 text-gray-600" />
              <p>暂无通知</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
