import { useState, useEffect } from 'react'
import { Card } from '@/components/Common/Card'
import { Badge } from '@/components/Common/Badge'
import { Button } from '@/components/Common/Button'
import { Input } from '@/components/Forms/Input'
import { supabase } from '@/lib/supabase'
import {
  Clock, RefreshCw, Plus, Edit2, Trash2, Play,
  Pause, Search, X, Calendar, Timer, CheckCircle,
  AlertCircle, Zap
} from 'lucide-react'
import toast from 'react-hot-toast'

interface ScheduledTask {
  id: string
  name: string
  description: string
  cron: string
  command: string
  status: string
  last_run: string
  next_run: string
  created_at: string
}

export const ScheduledTasks = () => {
  const [tasks, setTasks] = useState<ScheduledTask[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [editing, setEditing] = useState<ScheduledTask | null>(null)

  const loadTasks = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('scheduled_tasks')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      toast.error('加载定时任务失败: ' + error.message)
    } else {
      setTasks(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    loadTasks()
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as any

    const { error } = await supabase
      .from('scheduled_tasks')
      .insert({
        name: form.name.value,
        description: form.description.value,
        cron: form.cron.value,
        command: form.command.value,
        status: 'active'
      })

    if (error) {
      toast.error('创建失败: ' + error.message)
    } else {
      toast.success('定时任务已创建')
      setShowCreate(false)
      loadTasks()
    }
  }

  const handleToggle = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active'
    const { error } = await supabase
      .from('scheduled_tasks')
      .update({ status: newStatus })
      .eq('id', id)

    if (error) {
      toast.error('操作失败: ' + error.message)
    } else {
      toast.success(`任务已${newStatus === 'active' ? '启用' : '暂停'}`)
      loadTasks()
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`确定要删除定时任务 ${name} 吗？`)) return

    const { error } = await supabase
      .from('scheduled_tasks')
      .delete()
      .eq('id', id)

    if (error) {
      toast.error('删除失败: ' + error.message)
    } else {
      toast.success('任务已删除')
      loadTasks()
    }
  }

  const handleRunNow = async (id: string) => {
    const { error } = await supabase
      .from('scheduled_tasks')
      .update({ last_run: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      toast.error('执行失败: ' + error.message)
    } else {
      toast.success('任务已执行')
      loadTasks()
    }
  }

  const filtered = tasks.filter(t => t.name.includes(search) || t.description.includes(search))

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
            <h1 className="text-2xl font-bold text-white">定时任务</h1>
            <p className="text-gray-400 text-sm">管理自动化定时任务</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadTasks}>
              <RefreshCw size={16} className="mr-2" /> 刷新
            </Button>
            <Button variant="primary" onClick={() => setShowCreate(true)}>
              <Plus size={16} className="mr-2" /> 添加任务
            </Button>
          </div>
        </div>

        <Card>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="搜索任务..."
                value={search}
                onChange={(e: any) => setSearch(e.target.value)}
                className="bg-[#1a1f35] border-gray-700 text-white"
                prefix={<Search size={16} className="text-gray-400" />}
              />
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((task) => (
            <Card key={task.id} className="hover:border-blue-500/30 transition-colors">
              <div className="flex flex-col h-full">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <Clock className="text-blue-400" size={20} />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">{task.name}</h3>
                      <p className="text-gray-400 text-sm">{task.description}</p>
                    </div>
                  </div>
                  <Badge variant={task.status === 'active' ? 'success' : 'default'}>
                    {task.status === 'active' ? '运行中' : '已暂停'}
                  </Badge>
                </div>

                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Timer size={14} />
                    <span>Cron: <code className="text-white font-mono">{task.cron}</code></span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <Zap size={14} />
                    <span>命令: <code className="text-white font-mono">{task.command}</code></span>
                  </div>
                  {task.last_run && (
                    <div className="flex items-center gap-2 text-gray-400">
                      <CheckCircle size={14} className="text-green-400" />
                      <span>上次执行: {new Date(task.last_run).toLocaleString()}</span>
                    </div>
                  )}
                  {task.next_run && (
                    <div className="flex items-center gap-2 text-gray-400">
                      <Calendar size={14} className="text-blue-400" />
                      <span>下次执行: {new Date(task.next_run).toLocaleString()}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-800">
                  <button
                    onClick={() => handleRunNow(task.id)}
                    className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30"
                    title="立即执行"
                  >
                    <Play size={16} />
                  </button>
                  <button
                    onClick={() => handleToggle(task.id, task.status)}
                    className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30"
                    title="切换状态"
                  >
                    {task.status === 'active' ? <Pause size={16} /> : <Play size={16} />}
                  </button>
                  <button
                    onClick={() => handleDelete(task.id, task.name)}
                    className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 ml-auto"
                    title="删除"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </Card>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-2 text-center py-12 text-gray-400">暂无定时任务</div>
          )}
        </div>

        {showCreate && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-[#12182b] border border-gray-800 rounded-2xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">创建定时任务</h2>
                <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-white">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="text-white text-sm font-medium block mb-1">名称</label>
                  <input name="name" type="text" className="w-full px-4 py-2 bg-[#1a1f35] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-white text-sm font-medium block mb-1">描述</label>
                  <input name="description" type="text" className="w-full px-4 py-2 bg-[#1a1f35] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-white text-sm font-medium block mb-1">Cron 表达式</label>
                  <input name="cron" type="text" placeholder="0 0 * * *" className="w-full px-4 py-2 bg-[#1a1f35] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-white text-sm font-medium block mb-1">命令</label>
                  <input name="command" type="text" placeholder="node task.js" className="w-full px-4 py-2 bg-[#1a1f35] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500" />
                </div>
                <Button type="submit" className="w-full">创建</Button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
