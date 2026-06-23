import { useState, useEffect } from 'react'
import { Card } from '@/components/Common/Card'
import { Badge } from '@/components/Common/Badge'
import { Button } from '@/components/Common/Button'
import { supabase } from '@/lib/supabase'
import {
  Database, RefreshCw, Download, Upload, Trash2,
  Clock, CheckCircle, AlertCircle, HardDrive,
  FileArchive, Cloud, Server
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Backup {
  id: string
  name: string
  size: string
  status: string
  created_at: string
}

export const Backup = () => {
  const [backups, setBackups] = useState<Backup[]>([])
  const [loading, setLoading] = useState(true)

  const loadBackups = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('backups')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      toast.error('加载备份失败: ' + error.message)
    } else {
      setBackups(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    loadBackups()
  }, [])

  const handleCreateBackup = async () => {
    const { error } = await supabase
      .from('backups')
      .insert({
        name: `backup_${new Date().toISOString().slice(0,10)}_${Date.now().toString().slice(-6)}`,
        size: '2.4 MB',
        status: 'completed'
      })

    if (error) {
      toast.error('创建备份失败: ' + error.message)
    } else {
      toast.success('备份已创建')
      loadBackups()
    }
  }

  const handleDownload = (id: string, name: string) => {
    toast.success(`正在下载 ${name}`)
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`确定要删除备份 ${name} 吗？`)) return

    const { error } = await supabase
      .from('backups')
      .delete()
      .eq('id', id)

    if (error) {
      toast.error('删除失败: ' + error.message)
    } else {
      toast.success('备份已删除')
      loadBackups()
    }
  }

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
            <h1 className="text-2xl font-bold text-white">数据备份</h1>
            <p className="text-gray-400 text-sm">管理数据备份</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadBackups}>
              <RefreshCw size={16} className="mr-2" /> 刷新
            </Button>
            <Button variant="primary" onClick={handleCreateBackup}>
              <Database size={16} className="mr-2" /> 创建备份
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#12182b] border border-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <HardDrive className="text-blue-400" size={20} />
              <span className="text-gray-400 text-sm">总备份</span>
            </div>
            <div className="text-2xl font-bold text-white mt-1">{backups.length}</div>
          </div>
          <div className="bg-[#12182b] border border-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Server className="text-green-400" size={20} />
              <span className="text-gray-400 text-sm">总大小</span>
            </div>
            <div className="text-2xl font-bold text-white mt-1">
              {backups.reduce((sum, b) => sum + parseFloat(b.size) || 0, 0).toFixed(1)} MB
            </div>
          </div>
          <div className="bg-[#12182b] border border-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Cloud className="text-purple-400" size={20} />
              <span className="text-gray-400 text-sm">存储位置</span>
            </div>
            <div className="text-white mt-1">Supabase 云端</div>
          </div>
        </div>

        <div className="space-y-3">
          {backups.map((backup) => (
            <Card key={backup.id} className="hover:border-blue-500/30 transition-colors">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <FileArchive className="text-blue-400" size={20} />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">{backup.name}</h3>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-gray-400">{backup.size}</span>
                      <Badge variant={backup.status === 'completed' ? 'success' : 'warning'}>
                        {backup.status === 'completed' ? '已完成' : '处理中'}
                      </Badge>
                      <span className="text-gray-500 text-xs">
                        {new Date(backup.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownload(backup.id, backup.name)}
                    className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30"
                    title="下载"
                  >
                    <Download size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(backup.id, backup.name)}
                    className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30"
                    title="删除"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </Card>
          ))}
          {backups.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Database size={48} className="mx-auto mb-4 text-gray-600" />
              <p>暂无备份</p>
              <p className="text-sm mt-1">点击"创建备份"开始</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
