import { useState, useEffect } from 'react'
import { Card } from '@/components/Common/Card'
import { Badge } from '@/components/Common/Badge'
import { Button } from '@/components/Common/Button'
import { supabase } from '@/lib/supabase'
import {
  Activity, Server, Cpu, HardDrive, Wifi, RefreshCw,
  CheckCircle, XCircle, AlertCircle, Clock, Zap,
  Database, Cloud, Shield, BarChart3
} from 'lucide-react'
import toast from 'react-hot-toast'

interface ServiceStatus {
  id: string
  name: string
  status: string
  uptime: string
  response_time: string
  last_check: string
}

interface SystemMetric {
  cpu: number
  memory: number
  disk: number
  network: number
}

export const Monitor = () => {
  const [services, setServices] = useState<ServiceStatus[]>([])
  const [metrics, setMetrics] = useState<SystemMetric>({
    cpu: 0,
    memory: 0,
    disk: 0,
    network: 0
  })
  const [loading, setLoading] = useState(true)

  const loadMonitor = async () => {
    setLoading(true)
    
    // 加载服务状态
    const { data: serviceData, error: serviceError } = await supabase
      .from('services')
      .select('*')
      .order('name', { ascending: true })

    if (serviceError) {
      toast.error('加载服务状态失败: ' + serviceError.message)
    } else {
      setServices(serviceData || [])
    }

    // 模拟系统指标
    setMetrics({
      cpu: Math.round(20 + Math.random() * 60),
      memory: Math.round(30 + Math.random() * 50),
      disk: Math.round(40 + Math.random() * 40),
      network: Math.round(10 + Math.random() * 30)
    })

    setLoading(false)
  }

  useEffect(() => {
    loadMonitor()
    const interval = setInterval(loadMonitor, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleRefresh = () => {
    loadMonitor()
    toast.success('已刷新')
  }

  const statusColors: Record<string, string> = {
    online: 'success',
    offline: 'danger',
    warning: 'warning',
    maintenance: 'default'
  }

  const statusLabels: Record<string, string> = {
    online: '在线',
    offline: '离线',
    warning: '警告',
    maintenance: '维护中'
  }

  const statusIcons: Record<string, any> = {
    online: CheckCircle,
    offline: XCircle,
    warning: AlertCircle,
    maintenance: Clock
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
            <h1 className="text-2xl font-bold text-white">系统监控</h1>
            <p className="text-gray-400 text-sm">实时监控系统状态</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCw size={16} className="mr-2" /> 刷新
            </Button>
          </div>
        </div>

        {/* 系统指标 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[#12182b] border border-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">CPU</span>
              <Cpu className="text-blue-400" size={18} />
            </div>
            <div className="text-2xl font-bold text-white mt-1">{metrics.cpu}%</div>
            <div className="w-full h-2 bg-[#1a1f35] rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-blue-400 rounded-full" style={{ width: `${metrics.cpu}%` }} />
            </div>
          </div>
          <div className="bg-[#12182b] border border-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">内存</span>
              <Server className="text-purple-400" size={18} />
            </div>
            <div className="text-2xl font-bold text-white mt-1">{metrics.memory}%</div>
            <div className="w-full h-2 bg-[#1a1f35] rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-purple-400 rounded-full" style={{ width: `${metrics.memory}%` }} />
            </div>
          </div>
          <div className="bg-[#12182b] border border-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">磁盘</span>
              <HardDrive className="text-green-400" size={18} />
            </div>
            <div className="text-2xl font-bold text-white mt-1">{metrics.disk}%</div>
            <div className="w-full h-2 bg-[#1a1f35] rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-green-400 rounded-full" style={{ width: `${metrics.disk}%` }} />
            </div>
          </div>
          <div className="bg-[#12182b] border border-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">网络</span>
              <Wifi className="text-yellow-400" size={18} />
            </div>
            <div className="text-2xl font-bold text-white mt-1">{metrics.network}%</div>
            <div className="w-full h-2 bg-[#1a1f35] rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${metrics.network}%` }} />
            </div>
          </div>
        </div>

        {/* 服务状态 */}
        <Card>
          <div className="p-4 border-b border-gray-800">
            <h3 className="text-white font-semibold">服务状态</h3>
          </div>
          <div className="divide-y divide-gray-800">
            {services.map((service) => {
              const Icon = statusIcons[service.status] || Activity
              const color = statusColors[service.status] || 'default'
              return (
                <div key={service.id} className="flex flex-wrap items-center justify-between gap-4 p-4 hover:bg-[#1a1f35]/30">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 bg-${color}-500/20 rounded-lg`}>
                      <Icon className={`text-${color}-400`} size={18} />
                    </div>
                    <div>
                      <p className="text-white font-medium">{service.name}</p>
                      <p className="text-gray-400 text-sm">{service.uptime || '运行中'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-gray-400 text-sm">响应: {service.response_time || '12ms'}</span>
                    <Badge variant={color as any}>
                      {statusLabels[service.status] || service.status}
                    </Badge>
                  </div>
                </div>
              )
            })}
            {services.length === 0 && (
              <div className="text-center py-8 text-gray-400">暂无服务监控数据</div>
            )}
          </div>
        </Card>

        {/* 快速状态 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#12182b] border border-gray-800 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="text-green-400" size={16} />
              <span className="text-gray-400 text-sm">在线服务</span>
            </div>
            <div className="text-white text-xl font-bold mt-1">
              {services.filter(s => s.status === 'online').length}
            </div>
          </div>
          <div className="bg-[#12182b] border border-gray-800 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <AlertCircle className="text-yellow-400" size={16} />
              <span className="text-gray-400 text-sm">警告</span>
            </div>
            <div className="text-white text-xl font-bold mt-1">
              {services.filter(s => s.status === 'warning').length}
            </div>
          </div>
          <div className="bg-[#12182b] border border-gray-800 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <XCircle className="text-red-400" size={16} />
              <span className="text-gray-400 text-sm">离线</span>
            </div>
            <div className="text-white text-xl font-bold mt-1">
              {services.filter(s => s.status === 'offline').length}
            </div>
          </div>
          <div className="bg-[#12182b] border border-gray-800 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <Zap className="text-blue-400" size={16} />
              <span className="text-gray-400 text-sm">总服务</span>
            </div>
            <div className="text-white text-xl font-bold mt-1">{services.length}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
