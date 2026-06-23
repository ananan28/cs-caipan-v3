import { useState } from 'react'
import { Card } from '@/components/Common/Card'
import { Badge } from '@/components/Common/Badge'
import { Button } from '@/components/Common/Button'
import { GitBranch, Calendar, CheckCircle, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

const changes = [
  { version: 'V3.0.0', date: '2025-06-23', type: 'major', items: ['全新UI设计', '科技感主题', '客服系统上线', '智能充值监控'] },
  { version: 'V2.9.0', date: '2025-06-20', type: 'minor', items: ['优化任务中心', '修复转账Bug', '增加导出功能'] },
  { version: 'V2.8.0', date: '2025-06-15', type: 'patch', items: ['修复登录问题', '优化移动端适配'] },
]

export const Changelog = () => {
  const [showAll, setShowAll] = useState(false)

  const handleCheckUpdate = () => {
    toast.loading('检查更新...')
    setTimeout(() => {
      toast.dismiss()
      toast.success('✅ 当前已是最新版本 V3.0.0')
    }, 1500)
  }

  const displayed = showAll ? changes : changes.slice(0, 3)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">📋 更新日志</h1>
          <p className="text-muted text-sm">系统版本更新记录</p>
        </div>
        <Button variant="primary" onClick={handleCheckUpdate}>
          <RefreshCw size={18} className="mr-2" />检查更新
        </Button>
      </div>

      <div className="space-y-4">
        {displayed.map((change, i) => (
          <Card key={i} className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <GitBranch size={20} className="text-sky" />
                <h3 className="text-xl font-bold text-white">{change.version}</h3>
                <Badge variant={change.type === 'major' ? 'purple' : change.type === 'minor' ? 'blue' : 'green'}>
                  {change.type === 'major' ? '重大更新' : change.type === 'minor' ? '功能更新' : '修复'}
                </Badge>
              </div>
              <span className="text-sm text-muted flex items-center gap-1">
                <Calendar size={14} /> {change.date}
              </span>
            </div>
            <ul className="space-y-2">
              {change.items.map((item, j) => (
                <li key={j} className="flex items-center gap-2 text-muted">
                  <CheckCircle size={14} className="text-green" />
                  {item}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>

      {changes.length > 3 && (
        <Button variant="ghost" className="w-full" onClick={() => setShowAll(!showAll)}>
          {showAll ? '收起' : '查看更多'}
        </Button>
      )}

      <Card title="💡 提示">
        <p className="text-sm text-muted">新版本发布时，系统会自动提示更新</p>
      </Card>
    </div>
  )
}
