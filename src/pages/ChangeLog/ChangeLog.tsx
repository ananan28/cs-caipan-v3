import { useState, useEffect } from 'react'
import { Card } from '@/components/Common/Card'
import { Badge } from '@/components/Common/Badge'
import { Button } from '@/components/Common/Button'
import { supabase } from '@/lib/supabase'
import { GitBranch, RefreshCw, Calendar, CheckCircle, X } from 'lucide-react'
import toast from 'react-hot-toast'

interface ChangelogEntry {
  id: string
  version: string
  title: string
  content: string
  type: string
  date: string
  created_at: string
}

export const ChangeLog = () => {
  const [entries, setEntries] = useState<ChangelogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [showDetail, setShowDetail] = useState<ChangelogEntry | null>(null)

  const loadChangelog = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('changelog')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      toast.error('加载更新日志失败: ' + error.message)
    } else {
      setEntries(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    loadChangelog()
  }, [])

  if (loading) {
    return (
      <div className="p-6 bg-[#0a0f1f] min-h-screen flex items-center justify-center">
        <div className="text-gray-400">加载中...</div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-[#0a0f1f] min-h-screen">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">更新日志</h1>
            <p className="text-gray-400 text-sm">查看系统更新历史</p>
          </div>
          <Button variant="outline" onClick={loadChangelog}>
            <RefreshCw size={16} className="mr-2" /> 刷新
          </Button>
        </div>

        <div className="relative pl-8 space-y-6">
          <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-gray-800" />

          {entries.map((entry) => (
            <div key={entry.id} className="relative">
              <div className="absolute -left-8 w-4 h-4 rounded-full bg-blue-500 border-2 border-[#0a0f1f]" />
              <Card className="cursor-pointer hover:border-blue-500/30 transition-colors" onClick={() => setShowDetail(entry)}>
                <div className="flex flex-wrap items-start gap-3">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-white font-semibold">{entry.title}</h3>
                      <Badge variant="info">{entry.type}</Badge>
                      <span className="text-gray-500 text-xs font-mono">v{entry.version}</span>
                      <span className="text-gray-500 text-xs flex items-center gap-1">
                        <Calendar size={12} /> {entry.date || new Date(entry.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mt-1 line-clamp-2">{entry.content}</p>
                  </div>
                  <Button variant="ghost" size="sm">查看详情</Button>
                </div>
              </Card>
            </div>
          ))}
          {entries.length === 0 && (
            <div className="text-center py-12 text-gray-400">暂无更新日志</div>
          )}
        </div>

        {showDetail && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-[#12182b] border border-gray-800 rounded-2xl p-6 w-full max-w-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-white">{showDetail.title}</h2>
                  <Badge variant="info">v{showDetail.version}</Badge>
                </div>
                <button onClick={() => setShowDetail(null)} className="text-gray-400 hover:text-white">
                  <X size={24} />
                </button>
              </div>
              <div className="space-y-4">
                <div className="bg-[#1a1f35] rounded-lg p-4">
                  <p className="text-gray-300 whitespace-pre-wrap">{showDetail.content}</p>
                </div>
                <Button className="w-full" onClick={() => setShowDetail(null)}>关闭</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ChangeLog
