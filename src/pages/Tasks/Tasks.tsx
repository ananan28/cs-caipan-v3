import { useState, useEffect } from 'react'
import { Card } from '@/components/Common/Card'
import { Badge } from '@/components/Common/Badge'
import { Button } from '@/components/Common/Button'
import { Input } from '@/components/Forms/Input'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { useDetectionStore } from '@/store/detectionStore'
import { DetectionItems } from './components/DetectionItems'
import toast from 'react-hot-toast'
import {
  CheckSquare, Play, Clock, CheckCircle, XCircle,
  Search, Trash2, RefreshCw, Loader, X,
  Settings, ListChecks
} from 'lucide-react'

interface Task {
  id: string
  user_id: string
  platform: string
  items: any[]
  total_price: number
  status: string
  created_at: string
}

const detectionItemsConfig = [
  { id: 'registered', label: '是否注册', price: 0.02, default: true },
  { id: 'avatar', label: '是否有头像', price: 0.015, default: true },
  { id: 'gender', label: '头像性别识别', price: 0.025, default: false },
  { id: 'carrier', label: '运营商检测', price: 0.02, default: false },
  { id: 'location', label: '号码归属地', price: 0.015, default: false },
  { id: 'virtual', label: '虚拟号码识别', price: 0.03, default: false },
]

const platformCards = [
  { id: 'WhatsApp', icon: '💬', label: 'WhatsApp', color: 'from-green-500 to-emerald-500' },
  { id: 'Telegram', icon: '✈️', label: 'Telegram', color: 'from-blue-500 to-cyan-500' },
  { id: 'Signal', icon: '🔒', label: 'Signal', color: 'from-purple-500 to-pink-500' },
  { id: 'LINE', icon: '💚', label: 'LINE', color: 'from-green-400 to-green-600' },
]

export const Tasks = () => {
  const { user } = useAuthStore()
  const { items: detectionItems } = useDetectionStore()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('platforms')
  const [selectedPlatform, setSelectedPlatform] = useState('WhatsApp')
  const [numbers, setNumbers] = useState('')
  const [selectedItems, setSelectedItems] = useState<string[]>(
    detectionItemsConfig.filter(item => item.default).map(item => item.id)
  )
  const [searchTask, setSearchTask] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterPlatform, setFilterPlatform] = useState('')
  const [creating, setCreating] = useState(false)

  const loadTasks = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false })

    if (error) {
      toast.error('加载任务失败: ' + error.message)
    } else {
      setTasks(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    loadTasks()
  }, [user])

  const getItemPrice = (id: string) => {
    const item = detectionItems?.find((i: any) => i.id === id)
    if (item) return item.price || 0
    return detectionItemsConfig.find(i => i.id === id)?.price || 0
  }

  const toggleDetectionItem = (id: string) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const getSelectedItemsDetail = () => {
    const items = detectionItemsConfig.filter(item => selectedItems.includes(item.id))
    const totalPrice = items.reduce((sum, item) => sum + getItemPrice(item.id), 0)
    return { items, totalPrice }
  }

  const { items: activeItems, totalPrice: basePrice } = getSelectedItemsDetail()
  const numberCount = numbers.split('\n').filter(n => n.trim()).length
  const totalCost = numberCount * basePrice

  const handleCreateTask = async () => {
    const numberList = numbers.split('\n').filter(n => n.trim())
    if (numberList.length === 0) {
      toast.error('请至少输入一个号码')
      return
    }

    setCreating(true)
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        user_id: user?.id,
        platform: selectedPlatform,
        items: activeItems,
        total_price: totalCost,
        status: 'pending'
      })
      .select()

    setCreating(false)

    if (error) {
      toast.error('创建任务失败: ' + error.message)
    } else {
      toast.success('✅ 任务创建成功！共 ' + numberList.length + ' 个号码，费用 $' + totalCost.toFixed(2))
      setNumbers('')
      loadTasks()
      setActiveTab('history')
    }
  }

  const handleDeleteTask = async (id: string) => {
    if (!confirm('确定要删除这个任务吗？')) return

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)

    if (error) {
      toast.error('删除失败: ' + error.message)
    } else {
      toast.success('任务已删除')
      loadTasks()
    }
  }

  const statusColors: any = {
    pending: 'warning',
    processing: 'info',
    completed: 'success',
    failed: 'danger'
  }

  const statusLabels: any = {
    pending: '待处理',
    processing: '处理中',
    completed: '已完成',
    failed: '失败'
  }

  const statusIcons: any = {
    pending: <Clock size={14} />,
    processing: <Loader size={14} className="animate-spin" />,
    completed: <CheckCircle size={14} />,
    failed: <XCircle size={14} />
  }

  const filteredTasks = tasks.filter(task => {
    if (searchTask && !task.id.includes(searchTask)) return false
    if (filterStatus && task.status !== filterStatus) return false
    if (filterPlatform && task.platform !== filterPlatform) return false
    return true
  })

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <CheckSquare className="text-blue-400" />
              任务中心
            </h1>
            <p className="text-gray-400 text-sm">创建和管理检测任务</p>
          </div>
          <Button variant="outline" onClick={loadTasks}>
            <RefreshCw size={16} className="mr-2" /> 刷新
          </Button>
        </div>

        <div className="flex gap-1 border-b border-gray-800">
          <button
            onClick={() => setActiveTab('platforms')}
            className={'px-4 py-2.5 text-sm font-medium transition-all rounded-t-lg flex items-center gap-2 ' + (activeTab === 'platforms' ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-500/5' : 'text-gray-400 hover:text-white hover:bg-white/5')}
          >
            <Play size={16} /> 创建任务
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={'px-4 py-2.5 text-sm font-medium transition-all rounded-t-lg flex items-center gap-2 ' + (activeTab === 'history' ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-500/5' : 'text-gray-400 hover:text-white hover:bg-white/5')}
          >
            <ListChecks size={16} /> 任务历史 ({tasks.length})
          </button>
          <button
            onClick={() => setActiveTab('items')}
            className={'px-4 py-2.5 text-sm font-medium transition-all rounded-t-lg flex items-center gap-2 ' + (activeTab === 'items' ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-500/5' : 'text-gray-400 hover:text-white hover:bg-white/5')}
          >
            <Settings size={16} /> 检测项管理
          </button>
        </div>

        {activeTab === 'items' && <DetectionItems />}

        {activeTab === 'platforms' && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {platformCards.map((platform) => {
                const isSelected = selectedPlatform === platform.id
                return (
                  <div
                    key={platform.id}
                    onClick={() => setSelectedPlatform(platform.id)}
                    className={'bg-[#12182b] border-2 rounded-xl p-6 text-center cursor-pointer transition-all hover:scale-105 ' + (isSelected ? 'border-blue-400 shadow-lg shadow-blue-500/20' : 'border-gray-700 hover:border-gray-500')}
                  >
                    <div className={'text-4xl mb-2 bg-gradient-to-r ' + platform.color + ' bg-clip-text text-transparent'}>
                      {platform.icon}
                    </div>
                    <h3 className="text-white font-semibold">{platform.label}</h3>
                    {isSelected && (
                      <div className="mt-2">
                        <Badge variant="success">已选</Badge>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
              <div className="lg:col-span-2 space-y-4">
                <Card>
                  <div className="space-y-4">
                    <div>
                      <label className="text-white text-sm font-medium block mb-2">
                        输入号码 <span className="text-gray-400">(每行一个)</span>
                      </label>
                      <textarea
                        value={numbers}
                        onChange={(e) => setNumbers(e.target.value)}
                        className="w-full h-40 bg-[#1a1f35] border border-gray-700 rounded-lg text-white p-3 focus:outline-none focus:border-blue-500"
                        placeholder="+8613800138000&#10;+8613800138001&#10;+8613800138002"
                      />
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-gray-400 text-sm">共 {numberCount} 个号码</span>
                        <Button variant="ghost" size="sm" onClick={() => setNumbers('')}>
                          <X size={14} className="mr-1" /> 清空
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card>
                  <div className="space-y-3">
                    <h3 className="text-white font-medium">检测项配置</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {detectionItemsConfig.map((item) => (
                        <label key={item.id} className="flex items-center gap-2 text-gray-300 text-sm cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(item.id)}
                            onChange={() => toggleDetectionItem(item.id)}
                            className="rounded border-gray-600 bg-[#1a1f35] text-blue-400 focus:ring-blue-400"
                          />
                          {item.label}
                          <span className="text-gray-500 text-xs">(${getItemPrice(item.id).toFixed(3)})</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </Card>
              </div>

              <div className="space-y-4">
                <Card>
                  <h3 className="text-white font-medium mb-4">任务汇总</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-gray-400 text-sm">
                      <span>平台</span>
                      <span className="text-white">{selectedPlatform}</span>
                    </div>
                    <div className="flex justify-between text-gray-400 text-sm">
                      <span>号码数量</span>
                      <span className="text-white">{numberCount}</span>
                    </div>
                    <div className="flex justify-between text-gray-400 text-sm">
                      <span>检测项</span>
                      <span className="text-white text-xs">{activeItems.map(i => i.label).join(', ')}</span>
                    </div>
                    <div className="flex justify-between text-gray-400 text-sm">
                      <span>单价</span>
                      <span className="text-white">${basePrice.toFixed(3)}</span>
                    </div>
                    <div className="flex justify-between text-gray-400 text-sm border-t border-gray-800 pt-3">
                      <span className="font-medium">总费用</span>
                      <span className="text-blue-400 font-bold text-lg">${totalCost.toFixed(2)}</span>
                    </div>
                    <Button
                      className="w-full"
                      onClick={handleCreateTask}
                      disabled={creating || numberCount === 0}
                    >
                      {creating ? <Loader size={16} className="animate-spin mr-2" /> : <Play size={16} className="mr-2" />}
                      {creating ? '创建中...' : '创建任务'}
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          </>
        )}

        {activeTab === 'history' && (
          <Card>
            <div className="flex flex-wrap gap-4 mb-4">
              <div className="flex-1 min-w-[200px]">
                <Input
                  placeholder="搜索任务ID..."
                  value={searchTask}
                  onChange={(e: any) => setSearchTask(e.target.value)}
                  className="bg-[#1a1f35] border-gray-700 text-white"
                  prefix={<Search size={16} className="text-gray-400" />}
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 bg-[#1a1f35] border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="">全部状态</option>
                <option value="pending">待处理</option>
                <option value="processing">处理中</option>
                <option value="completed">已完成</option>
                <option value="failed">失败</option>
              </select>
              <select
                value={filterPlatform}
                onChange={(e) => setFilterPlatform(e.target.value)}
                className="px-3 py-2 bg-[#1a1f35] border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="">全部平台</option>
                {platformCards.map(p => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
              <Button variant="ghost" onClick={() => { setSearchTask(''); setFilterStatus(''); setFilterPlatform('') }}>
                重置
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#1a1f35]">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">任务ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">平台</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">费用</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">状态</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">时间</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.map((task) => (
                    <tr key={task.id} className="border-t border-gray-800 hover:bg-[#1a1f35]/50">
                      <td className="px-4 py-3 text-white text-sm font-mono">{task.id.slice(0, 8)}</td>
                      <td className="px-4 py-3 text-white text-sm">{task.platform}</td>
                      <td className="px-4 py-3 text-white text-sm">${task.total_price.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <Badge variant={statusColors[task.status] || 'default'}>
                          {statusIcons[task.status]} {statusLabels[task.status] || task.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-sm">
                        {new Date(task.created_at).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-1.5 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredTasks.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-gray-400">暂无任务</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
