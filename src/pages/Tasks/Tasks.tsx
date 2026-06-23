import { useState, useRef } from 'react'
import { Card } from '@/components/Common/Card'
import { Badge } from '@/components/Common/Badge'
import { Button } from '@/components/Common/Button'
import { Input } from '@/components/Forms/Input'
import { useDetectionStore } from '@/store/detectionStore'
import { 
  CheckSquare, Upload, Download, Play, Clock, CheckCircle, XCircle, 
  Search, Eye, Trash2, RefreshCw, Zap, FileText, Loader,
  FileSpreadsheet, FileJson, FileArchive, X, Plus,
  Filter, AlertCircle, Copy, Edit, Save, BarChart3,
  Activity, TrendingUp, Users, Calendar, Database,
  Server, Cloud, Shield, Award, Star, Flame
} from 'lucide-react'
import toast from 'react-hot-toast'

const detectionItemsConfig = [
  { id: 'registered', label: '是否注册', price: 0.02, default: true, desc: '检测号码是否注册该平台' },
  { id: 'avatar', label: '是否有头像', price: 0.015, default: true, desc: '检测用户是否有头像' },
  { id: 'gender', label: '头像性别识别', price: 0.025, default: false, desc: 'AI识别头像性别' },
  { id: 'carrier', label: '运营商检测', price: 0.02, default: false, desc: '检测号码所属运营商' },
  { id: 'location', label: '号码归属地', price: 0.015, default: false, desc: '检测号码归属国家/城市' },
  { id: 'virtual', label: '虚拟号码识别', price: 0.03, default: false, desc: '识别是否为虚拟号码' },
]

const platformCards = [
  { id: 'WhatsApp', icon: '💬', label: 'WhatsApp', color: 'from-green-500 to-emerald-500', desc: '全球即时通讯', popular: true },
  { id: 'Telegram', icon: '✈️', label: 'Telegram', color: 'from-blue-500 to-cyan-500', desc: '加密即时通讯', popular: true },
  { id: 'Signal', icon: '🔒', label: 'Signal', color: 'from-purple-500 to-pink-500', desc: '安全加密通讯', popular: false },
  { id: 'LINE', icon: '💚', label: 'LINE', color: 'from-green-400 to-green-600', desc: '日本/台湾/泰国', popular: false },
  { id: 'Viber', icon: '📱', label: 'Viber', color: 'from-purple-400 to-purple-600', desc: '全球即时通讯', popular: false },
  { id: 'Zalo', icon: '💛', label: 'Zalo', color: 'from-yellow-400 to-orange-500', desc: '越南市场', popular: false },
  { id: 'Facebook', icon: '👍', label: 'Facebook', color: 'from-blue-600 to-blue-800', desc: '全球社交平台', popular: false },
]

export const Tasks = () => {
  const { items: detectionItems } = useDetectionStore()
  const [activeTab, setActiveTab] = useState('platforms')
  const [selectedPlatform, setSelectedPlatform] = useState('WhatsApp')
  const [numbers, setNumbers] = useState('')
  const [searchTask, setSearchTask] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterPlatform, setFilterPlatform] = useState('')
  const [taskStatus, setTaskStatus] = useState<'idle' | 'processing' | 'done'>('idle')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [showDownloadOptions, setShowDownloadOptions] = useState(false)
  const [selectedTask, setSelectedTask] = useState<any>(null)
  const [showTaskDetail, setShowTaskDetail] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getItemPrice = (id: string) => {
    const items = detectionItems || []
    const item = items.find((i: any) => i.id === id)
    if (item) return item.price || 0
    const configItem = detectionItemsConfig.find(i => i.id === id)
    return configItem?.price || 0
  }

  const [selectedItems, setSelectedItems] = useState<string[]>(
    detectionItemsConfig.filter(item => item.default).map(item => item.id)
  )

  const [downloadFormat, setDownloadFormat] = useState('txt')
  const [includePlus, setIncludePlus] = useState(true)
  const [includeCountryCode, setIncludeCountryCode] = useState(true)
  const [countryCode, setCountryCode] = useState('86')

  const [tasks, setTasks] = useState([
    { id: 'TASK-001', platform: 'WhatsApp', numbers: 1234, status: 'completed', time: '2025-06-22 14:30', result: '已检测 1234 个，有效 892 个', progress: 100, cost: 61.70, items: '是否注册, 是否有头像' },
    { id: 'TASK-002', platform: 'Telegram', numbers: 567, status: 'processing', time: '2025-06-22 13:20', result: '处理中...', progress: 45, cost: 28.35, items: '是否注册' },
    { id: 'TASK-003', platform: 'Signal', numbers: 89, status: 'pending', time: '2025-06-22 12:00', result: '等待处理', progress: 0, cost: 4.45, items: '是否注册' },
    { id: 'TASK-004', platform: 'LINE', numbers: 234, status: 'failed', time: '2025-06-21 16:45', result: '接口超时', progress: 0, cost: 11.70, items: '是否注册, 是否有头像' },
  ])

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

  const statusColors: any = { completed: 'green', processing: 'blue', pending: 'orange', failed: 'red' }
  const statusIcons: any = { completed: <CheckCircle size={14} />, processing: <Loader size={14} className="animate-spin" />, pending: <Clock size={14} />, failed: <XCircle size={14} /> }

  const handleRefresh = () => {
    toast.loading('刷新任务列表...')
    setTimeout(() => { toast.dismiss(); toast.success('✅ 任务列表已刷新') }, 800)
  }

  const handleCreateTask = () => {
    const numberList = numbers.split('\n').filter(n => n.trim())
    if (numberList.length === 0) {
      toast.error('请至少输入一个号码或上传文件')
      return
    }
    toast.success(`✅ 任务创建成功！共 ${numberList.length} 个号码，费用 $${totalCost.toFixed(2)}`)
  }

  const handleExport = () => {
    toast.success('✅ 导出成功')
    setShowDownloadOptions(false)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedFile(file)
      const reader = new FileReader()
      reader.onload = (event) => {
        const content = event.target?.result as string
        setNumbers(content)
        toast.success(`✅ 已加载文件: ${file.name}`)
      }
      reader.readAsText(file)
    }
  }

  const handleClearNumbers = () => {
    setNumbers('')
    setUploadedFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const filteredTasks = tasks.filter(task => {
    if (searchTask && !task.id.includes(searchTask)) return false
    if (filterStatus && task.status !== filterStatus) return false
    if (filterPlatform && task.platform !== filterPlatform) return false
    return true
  })

  return (
    <div className="p-6 bg-[#0a0f1f] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <CheckSquare className="text-blue-400" />
              任务中心
            </h1>
            <p className="text-gray-400 text-sm mt-1">创建和管理检测任务</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw size={14} className="mr-1" /> 刷新
            </Button>
          </div>
        </div>

        <div className="flex gap-2 mb-6 border-b border-gray-800">
          <button
            onClick={() => setActiveTab('platforms')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'platforms' 
                ? 'text-blue-400 border-b-2 border-blue-400' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            平台选择
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'create' 
                ? 'text-blue-400 border-b-2 border-blue-400' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            创建任务
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'history' 
                ? 'text-blue-400 border-b-2 border-blue-400' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            任务历史
          </button>
        </div>

        {activeTab === 'platforms' && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {platformCards.map((platform) => (
              <Card
                key={platform.id}
                className={`cursor-pointer transition-all hover:scale-105 ${
                  selectedPlatform === platform.id ? 'ring-2 ring-blue-400' : ''
                }`}
                onClick={() => setSelectedPlatform(platform.id)}
              >
                <div className={`text-3xl mb-2 bg-gradient-to-r ${platform.color} bg-clip-text text-transparent`}>
                  {platform.icon}
                </div>
                <h3 className="text-white font-semibold">{platform.label}</h3>
                <p className="text-gray-400 text-sm">{platform.desc}</p>
                {platform.popular && (
                  <Badge variant="success" className="mt-2">热门</Badge>
                )}
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'create' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                    <div className="flex items-center gap-3 mt-2">
                      <Button size="sm" onClick={() => fileInputRef.current?.click()}>
                        <Upload size={14} className="mr-1" /> 上传文件
                      </Button>
                      <input ref={fileInputRef} type="file" accept=".txt,.csv" className="hidden" onChange={handleFileUpload} />
                      {uploadedFile && (
                        <span className="text-gray-400 text-sm">{uploadedFile.name}</span>
                      )}
                      {numbers && (
                        <Button variant="ghost" size="sm" onClick={handleClearNumbers}>
                          <X size={14} className="mr-1" /> 清空
                        </Button>
                      )}
                      <span className="text-gray-400 text-sm ml-auto">共 {numberCount} 个号码</span>
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
                    <span className="text-white">{activeItems.map(i => i.label).join(', ')}</span>
                  </div>
                  <div className="flex justify-between text-gray-400 text-sm">
                    <span>单价</span>
                    <span className="text-white">${basePrice.toFixed(3)}</span>
                  </div>
                  <div className="flex justify-between text-gray-400 text-sm border-t border-gray-800 pt-3">
                    <span className="font-medium">总费用</span>
                    <span className="text-blue-400 font-bold text-lg">${totalCost.toFixed(2)}</span>
                  </div>
                  <Button className="w-full" onClick={handleCreateTask}>
                    <Play size={16} className="mr-2" /> 创建任务
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <Card>
            <div className="flex items-center gap-4 mb-4 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <Input
                  placeholder="搜索任务ID..."
                  value={searchTask}
                  onChange={(e) => setSearchTask(e.target.value)}
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
                <option value="completed">已完成</option>
                <option value="processing">处理中</option>
                <option value="pending">待处理</option>
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
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#1a1f35]">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">任务ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">平台</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">号码数</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">费用</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">状态</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">时间</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.map((task) => (
                    <tr key={task.id} className="border-t border-gray-800 hover:bg-[#1a1f35]/50">
                      <td className="px-4 py-3 text-white text-sm font-mono">{task.id}</td>
                      <td className="px-4 py-3 text-white text-sm">{task.platform}</td>
                      <td className="px-4 py-3 text-white text-sm">{task.numbers}</td>
                      <td className="px-4 py-3 text-white text-sm">${task.cost.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <Badge variant={statusColors[task.status]}>
                          {statusIcons[task.status]} {task.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-sm">{task.time}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => { setSelectedTask(task); setShowTaskDetail(true); }}>
                            <Eye size={14} />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download size={14} />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 size={14} className="text-red-400" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
