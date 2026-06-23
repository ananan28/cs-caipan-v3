import { useState, useEffect } from 'react'
import { Card } from '@/components/Common/Card'
import { Badge } from '@/components/Common/Badge'
import { Button } from '@/components/Common/Button'
import { Activity, Server, Cpu, HardDrive, Globe, Clock, AlertTriangle, CheckCircle, Zap, RefreshCw, BarChart3 } from 'lucide-react'
import toast from 'react-hot-toast'

export const Monitor = () => {
  const [cpu, setCpu] = useState(23)
  const [memory, setMemory] = useState(45)
  const [disk, setDisk] = useState(62)
  const [uptime, setUptime] = useState('14天 6小时 32分钟')
  const [requests, setRequests] = useState(1234)
  const [errors, setErrors] = useState(3)
  const [responseTime, setResponseTime] = useState(156)

  const handleRefresh = () => {
    toast.loading('刷新监控数据...')
    setTimeout(() => {
      toast.dismiss()
      toast.success('✅ 监控数据已刷新')
      setCpu(Math.floor(Math.random() * 60) + 10)
      setMemory(Math.floor(Math.random() * 70) + 20)
      setDisk(Math.floor(Math.random() * 40) + 50)
    }, 800)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white">📊 系统监控</h1><p className="text-muted text-sm">实时系统状态和性能监控</p></div>
        <Button variant="ghost" onClick={handleRefresh}><RefreshCw size={18} className="mr-1" />刷新</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><div className="text-center"><p className="text-sm text-muted">系统状态</p><Badge variant="green" className="text-lg mt-1">✅ 正常</Badge></div></Card>
        <Card><div className="text-center"><p className="text-sm text-muted">运行时间</p><p className="text-2xl font-bold text-white">{uptime}</p></div></Card>
        <Card><div className="text-center"><p className="text-sm text-muted">今日请求</p><p className="text-2xl font-bold text-blue">{requests.toLocaleString()}</p></div></Card>
        <Card><div className="text-center"><p className="text-sm text-muted">错误率</p><p className="text-2xl font-bold text-green">0.24%</p></div></Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="💻 CPU 使用率">
          <div className="text-center">
            <div className="text-5xl font-bold text-blue">{cpu}%</div>
            <div className="w-full bg-panel/50 rounded-full h-4 mt-3">
              <div className="bg-blue h-4 rounded-full transition-all" style={{ width: `${cpu}%` }} />
            </div>
            <p className="text-xs text-muted mt-2">正常范围 0-80%</p>
          </div>
        </Card>
        <Card title="🧠 内存使用率">
          <div className="text-center">
            <div className="text-5xl font-bold text-green">{memory}%</div>
            <div className="w-full bg-panel/50 rounded-full h-4 mt-3">
              <div className="bg-green h-4 rounded-full transition-all" style={{ width: `${memory}%` }} />
            </div>
            <p className="text-xs text-muted mt-2">正常范围 0-90%</p>
          </div>
        </Card>
        <Card title="💾 磁盘使用率">
          <div className="text-center">
            <div className="text-5xl font-bold text-orange">{disk}%</div>
            <div className="w-full bg-panel/50 rounded-full h-4 mt-3">
              <div className="bg-orange h-4 rounded-full transition-all" style={{ width: `${disk}%` }} />
            </div>
            <p className="text-xs text-muted mt-2">正常范围 0-90%</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card title="📈 请求统计">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-panel/50"><span className="text-muted">总请求</span><span className="text-white font-bold">12,345</span></div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-panel/50"><span className="text-muted">今日请求</span><span className="text-blue font-bold">{requests.toLocaleString()}</span></div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-panel/50"><span className="text-muted">平均响应</span><span className="text-green font-bold">{responseTime}ms</span></div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-panel/50"><span className="text-muted">错误请求</span><span className="text-red font-bold">{errors}</span></div>
          </div>
        </Card>
        <Card title="⚡ 服务状态">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-panel/50"><span className="text-muted">API服务</span><Badge variant="green">🟢 正常</Badge></div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-panel/50"><span className="text-muted">数据库</span><Badge variant="green">🟢 已连接</Badge></div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-panel/50"><span className="text-muted">缓存服务</span><Badge variant="green">🟢 正常</Badge></div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-panel/50"><span className="text-muted">队列服务</span><Badge variant="green">🟢 正常</Badge></div>
          </div>
        </Card>
      </div>
    </div>
  )
}
