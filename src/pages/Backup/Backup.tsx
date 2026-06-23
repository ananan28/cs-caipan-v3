import { useState } from 'react'
import { Card } from '@/components/Common/Card'
import { Badge } from '@/components/Common/Badge'
import { Button } from '@/components/Common/Button'
import { Database, Download, Upload, RefreshCw, Trash2, Clock, CheckCircle, AlertCircle, Save, HardDrive } from 'lucide-react'
import toast from 'react-hot-toast'

export const Backup = () => {
  const [backups, setBackups] = useState([
    { id: 1, name: 'full_backup_20250622.sql', size: '156 MB', date: '2025-06-22 03:00', status: 'completed', type: 'full' },
    { id: 2, name: 'full_backup_20250621.sql', size: '152 MB', date: '2025-06-21 03:00', status: 'completed', type: 'full' },
    { id: 3, name: 'incremental_20250622_12.sql', size: '23 MB', date: '2025-06-22 12:00', status: 'completed', type: 'incremental' },
    { id: 4, name: 'full_backup_20250620.sql', size: '148 MB', date: '2025-06-20 03:00', status: 'completed', type: 'full' },
  ])

  const [isBackingUp, setIsBackingUp] = useState(false)

  const handleBackup = () => {
    setIsBackingUp(true)
    toast.loading('正在备份数据...')
    setTimeout(() => {
      setIsBackingUp(false)
      toast.dismiss()
      toast.success('✅ 备份完成！')
      setBackups([{ id: Date.now(), name: `full_backup_${new Date().toISOString().slice(0,10)}.sql`, size: '158 MB', date: new Date().toISOString().slice(0, 16).replace('T', ' '), status: 'completed', type: 'full' }, ...backups])
    }, 3000)
  }

  const handleDownload = (name: string) => {
    toast.success(`📥 ${name} 下载中...`)
    setTimeout(() => toast.success('✅ 下载完成'), 1500)
  }

  const handleDelete = (id: number) => {
    if (confirm('确定删除此备份吗？')) {
      setBackups(backups.filter(b => b.id !== id))
      toast.success('✅ 已删除')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white">💾 数据备份</h1><p className="text-muted text-sm">管理和恢复数据备份</p></div>
        <Button variant="primary" onClick={handleBackup} disabled={isBackingUp}>
          <Database size={18} className="mr-2" />
          {isBackingUp ? '备份中...' : '立即备份'}
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><div className="text-center"><p className="text-sm text-muted">备份总数</p><p className="text-2xl font-bold text-white">{backups.length}</p></div></Card>
        <Card><div className="text-center"><p className="text-sm text-muted">总大小</p><p className="text-2xl font-bold text-blue">479 MB</p></div></Card>
        <Card><div className="text-center"><p className="text-sm text-muted">最近备份</p><p className="text-2xl font-bold text-green">今天 03:00</p></div></Card>
        <Card><div className="text-center"><p className="text-sm text-muted">存储位置</p><p className="text-2xl font-bold text-orange">本地</p></div></Card>
      </div>

      <Card title="备份列表">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-border">
              <th className="text-left text-xs font-bold text-muted uppercase py-3 px-4">文件名</th>
              <th className="text-left text-xs font-bold text-muted uppercase py-3 px-4">类型</th>
              <th className="text-left text-xs font-bold text-muted uppercase py-3 px-4">大小</th>
              <th className="text-left text-xs font-bold text-muted uppercase py-3 px-4">日期</th>
              <th className="text-left text-xs font-bold text-muted uppercase py-3 px-4">状态</th>
              <th className="text-left text-xs font-bold text-muted uppercase py-3 px-4">操作</th>
            </tr></thead>
            <tbody>
              {backups.map(b => (
                <tr key={b.id} className="border-b border-border/50 hover:bg-panel/50">
                  <td className="py-3 px-4 text-white font-mono text-sm">{b.name}</td>
                  <td className="py-3 px-4"><Badge variant={b.type === 'full' ? 'purple' : 'blue'}>{b.type}</Badge></td>
                  <td className="py-3 px-4 text-sm text-muted">{b.size}</td>
                  <td className="py-3 px-4 text-sm text-muted">{b.date}</td>
                  <td className="py-3 px-4"><Badge variant="green">✅ 完成</Badge></td>
                  <td className="py-3 px-4"><div className="flex gap-1">
                    <button onClick={() => handleDownload(b.name)} className="p-1.5 rounded-lg hover:bg-green/10 text-green"><Download size={16} /></button>
                    <button onClick={() => handleDelete(b.id)} className="p-1.5 rounded-lg hover:bg-red/10 text-red"><Trash2 size={16} /></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="⚙️ 备份设置">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-panel/50"><span className="text-muted">自动备份</span><Badge variant="green">已启用</Badge></div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-panel/50"><span className="text-muted">备份频率</span><span className="text-white">每日 03:00</span></div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-panel/50"><span className="text-muted">保留天数</span><span className="text-white">30 天</span></div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-panel/50"><span className="text-muted">存储位置</span><span className="text-white">本地磁盘</span></div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-panel/50"><span className="text-muted">备份大小</span><span className="text-white">479 MB</span></div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-panel/50"><span className="text-muted">最后备份</span><span className="text-white">2025-06-22 03:00</span></div>
          </div>
        </div>
        <Button variant="primary" className="w-full mt-4"><Save size={16} className="mr-2" />保存设置</Button>
      </Card>
    </div>
  )
}
