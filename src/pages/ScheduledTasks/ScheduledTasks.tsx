import { useState } from 'react'
import { Card } from '@/components/Common/Card'
import { Badge } from '@/components/Common/Badge'
import { Button } from '@/components/Common/Button'
import { Clock, Play, Pause, RefreshCw, Trash2, Edit, Plus, Calendar, Zap, Activity } from 'lucide-react'
import toast from 'react-hot-toast'

export const ScheduledTasks = () => {
  const [tasks, setTasks] = useState([
    { id: 1, name: '清理缓存', cron: '0 2 * * *', status: 'active', lastRun: '2025-06-22 02:00', nextRun: '2025-06-23 02:00', type: 'system' },
    { id: 2, name: '数据备份', cron: '0 3 * * *', status: 'active', lastRun: '2025-06-22 03:00', nextRun: '2025-06-23 03:00', type: 'system' },
    { id: 3, name: '每日统计', cron: '0 0 * * *', status: 'inactive', lastRun: '2025-06-21 00:00', nextRun: '2025-06-23 00:00', type: 'report' },
    { id: 4, name: '自动审核', cron: '*/10 * * * *', status: 'active', lastRun: '2025-06-22 14:30', nextRun: '2025-06-22 14:40', type: 'system' },
  ])

  const handleToggle = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status: t.status === 'active' ? 'inactive' : 'active' } : t))
    toast.success('✅ 任务状态已更新')
  }

  const handleRunNow = (id: number) => {
    toast.loading('正在执行...')
    setTimeout(() => { toast.dismiss(); toast.success('✅ 任务执行完成') }, 1500)
  }

  const handleDelete = (id: number) => {
    if (confirm('确定删除此定时任务吗？')) {
      setTasks(tasks.filter(t => t.id !== id))
      toast.success('✅ 已删除')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white">⏰ 定时任务</h1><p className="text-muted text-sm">管理系统自动任务</p></div>
        <Button variant="primary"><Plus size={18} className="mr-2" />新建任务</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><div className="text-center"><p className="text-sm text-muted">总任务</p><p className="text-2xl font-bold text-white">{tasks.length}</p></div></Card>
        <Card><div className="text-center"><p className="text-sm text-muted">运行中</p><p className="text-2xl font-bold text-green">{tasks.filter(t => t.status === 'active').length}</p></div></Card>
        <Card><div className="text-center"><p className="text-sm text-muted">已暂停</p><p className="text-2xl font-bold text-orange">{tasks.filter(t => t.status === 'inactive').length}</p></div></Card>
        <Card><div className="text-center"><p className="text-sm text-muted">今日执行</p><p className="text-2xl font-bold text-blue">12</p></div></Card>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-border">
              <th className="text-left text-xs font-bold text-muted uppercase py-3 px-4">任务名</th>
              <th className="text-left text-xs font-bold text-muted uppercase py-3 px-4">调度</th>
              <th className="text-left text-xs font-bold text-muted uppercase py-3 px-4">类型</th>
              <th className="text-left text-xs font-bold text-muted uppercase py-3 px-4">状态</th>
              <th className="text-left text-xs font-bold text-muted uppercase py-3 px-4">上次执行</th>
              <th className="text-left text-xs font-bold text-muted uppercase py-3 px-4">下次执行</th>
              <th className="text-left text-xs font-bold text-muted uppercase py-3 px-4">操作</th>
            </tr></thead>
            <tbody>
              {tasks.map(t => (
                <tr key={t.id} className="border-b border-border/50 hover:bg-panel/50">
                  <td className="py-3 px-4 text-white font-medium">{t.name}</td>
                  <td className="py-3 px-4 text-sm font-mono text-muted">{t.cron}</td>
                  <td className="py-3 px-4"><Badge variant={t.type === 'system' ? 'blue' : 'orange'}>{t.type}</Badge></td>
                  <td className="py-3 px-4"><Badge variant={t.status === 'active' ? 'green' : 'red'}>{t.status === 'active' ? '🟢 运行中' : '🔴 已暂停'}</Badge></td>
                  <td className="py-3 px-4 text-sm text-muted">{t.lastRun}</td>
                  <td className="py-3 px-4 text-sm text-muted">{t.nextRun}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1">
                      <button onClick={() => handleRunNow(t.id)} className="p-1.5 rounded-lg hover:bg-green/10 text-green"><Play size={16} /></button>
                      <button onClick={() => handleToggle(t.id)} className="p-1.5 rounded-lg hover:bg-orange/10 text-orange">{t.status === 'active' ? <Pause size={16} /> : <RefreshCw size={16} />}</button>
                      <button className="p-1.5 rounded-lg hover:bg-blue/10 text-blue"><Edit size={16} /></button>
                      <button onClick={() => handleDelete(t.id)} className="p-1.5 rounded-lg hover:bg-red/10 text-red"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
