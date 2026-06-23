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
    const item = detectionItems.find(i => i.id === id)
    return item ? item.price : detectionItemsConfig.find(i => i.id === id)?.price || 0
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
    if (selectedItems.length === 0) {
      toast.error('请至少选择一个检测项')
      return
    }

    setTaskStatus('processing')
    toast.loading('任务创建中...')

    setTimeout(() => {
      const newTask = {
        id: `TASK-${String(Date.now()).slice(-6)}`,
        platform: selectedPlatform,
        numbers: numberList.length,
        status: 'completed',
        time: new Date().toISOString().slice(0, 16).replace('T', ' '),
        result: `已检测 ${numberList.length} 个，有效 ${Math.floor(numberList.length * 0.7)} 个`,
        progress: 100,
        cost: totalCost,
        items: activeItems.map(i => i.label).join(', '),
      }
      setTasks([newTask, ...tasks])
      setTaskStatus('done')
      setNumbers('')
      setUploadedFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      toast.dismiss()
      toast.success(`✅ 任务 ${newTask.id} 创建成功！`)
      setActiveTab('list')
    }, 1500)
  }

  const handleDownload = (task: any) => {
    setSelectedTask(task)
    setShowDownloadOptions(true)
  }

  const executeDownload = () => {
    if (!selectedTask) return
    const numbers = Array.from({ length: Math.min(selectedTask.numbers, 100) }, (_, i) => {
      const base = '86131000000000'
      const suffix = String(i).padStart(4, '0')
      let num = base.slice(0, -4) + suffix
      if (includeCountryCode && countryCode && !num.startsWith(countryCode)) num = countryCode + num
      if (!includeCountryCode && num.startsWith(countryCode)) num = num.slice(countryCode.length)
      if (includePlus) num = '+' + num
      return num
    })
    
    const content = numbers.join('\n')
    const filename = `${selectedTask.id}_${selectedTask.platform}`
    let blob: Blob, extension: string

    switch (downloadFormat) {
      case 'csv': extension = 'csv'; blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8' }); break
      case 'json': extension = 'json'; blob = new Blob([JSON.stringify(numbers, null, 2)], { type: 'application/json' }); break
      case 'xlsx': extension = 'xls'; blob = new Blob([`<html><head><meta charset="UTF-8"><style>td{mso-number-format:"@"}</style></head><body><table>${numbers.map(n => `<tr><td>${n}</td></tr>`).join('')}</table></body></html>`], { type: 'application/vnd.ms-excel' }); break
      default: extension = 'txt'; blob = new Blob(['\uFEFF' + content], { type: 'text/plain;charset=utf-8' })
    }

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename}.${extension}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success(`📥 ${selectedTask.id} 已下载`)
    setShowDownloadOptions(false)
    setSelectedTask(null)
  }

  const handleDelete = (id: string) => {
    if (confirm('确定要删除此任务吗？')) {
      setTasks(tasks.filter(t => t.id !== id))
      toast.success('✅ 任务已删除')
    }
  }

  const handleViewDetail = (task: any) => {
    setSelectedTask(task)
    setShowTaskDetail(true)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadedFile(file)
    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      if (text) {
        const lines = text.split('\n').filter(line => line.trim())
        setNumbers(lines.join('\n'))
        toast.success(`已读取 ${lines.length} 个号码`)
      }
    }
    reader.readAsText(file)
  }

  const handleImportTemplate = () => {
    const template = '86131000000000\n86131000000001\n86131000000002\n86131000000003\n86131000000004'
    setNumbers(template)
    toast.success('✅ 已导入 5 个模板号码')
  }

  const handleBatchDetect = () => {
    const numberList = numbers.split('\n').filter(n => n.trim())
    if (numberList.length === 0) {
      toast.error('请先输入号码或上传文件')
      return
    }
    toast.loading('正在执行批量检测...')
    setTimeout(() => {
      toast.dismiss()
      toast.success(`✅ 批量检测完成！共检测 ${numberList.length} 个号码，有效 ${Math.floor(numberList.length * 0.7)} 个`)
    }, 2000)
  }

  const filteredTasks = tasks
    .filter(t => t.id.includes(searchTask) || t.platform.includes(searchTask))
    .filter(t => filterStatus ? t.status === filterStatus : true)
    .filter(t => filterPlatform ? t.platform === filterPlatform : true)

  const taskStats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    processing: tasks.filter(t => t.status === 'processing').length,
    pending: tasks.filter(t => t.status === 'pending').length,
    failed: tasks.filter(t => t.status === 'failed').length,
    totalCost: tasks.reduce((sum, t) => sum + (t.cost || 0), 0),
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">任务中心</h1>
          <p className="text-muted text-sm">创建和管理检测任务</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={handleRefresh}><RefreshCw size={18} className="mr-1" />刷新</Button>
          <Button variant="primary" onClick={() => setActiveTab('platforms')}><Zap size={18} className="mr-2" />新建任务</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="text-center"><p className="text-xs text-muted">总任务</p><p className="text-2xl font-bold text-white">{taskStats.total}</p></Card>
        <Card className="text-center"><p className="text-xs text-muted">已完成</p><p className="text-2xl font-bold text-green">{taskStats.completed}</p></Card>
        <Card className="text-center"><p className="text-xs text-muted">处理中</p><p className="text-2xl font-bold text-blue">{taskStats.processing}</p></Card>
        <Card className="text-center"><p className="text-xs text-muted">待处理</p><p className="text-2xl font-bold text-orange">{taskStats.pending}</p></Card>
        <Card className="text-center"><p className="text-xs text-muted">消耗积分</p><p className="text-2xl font-bold text-purple">{taskStats.totalCost.toFixed(0)}</p></Card>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setActiveTab('platforms')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'platforms' ? 'bg-blue text-white' : 'bg-panel/50 text-muted hover:text-white'}`}>🎯 选择平台</button>
        <button onClick={() => setActiveTab('create')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'create' ? 'bg-blue text-white' : 'bg-panel/50 text-muted hover:text-white'}`}>📝 创建任务</button>
        <button onClick={() => setActiveTab('list')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'list' ? 'bg-blue text-white' : 'bg-panel/50 text-muted hover:text-white'}`}>📋 任务列表</button>
        <button onClick={() => setActiveTab('stats')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'stats' ? 'bg-blue text-white' : 'bg-panel/50 text-muted hover:text-white'}`}>📊 任务统计</button>
      </div>

      {activeTab === 'platforms' && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {platformCards.map(p => (
            <button
              key={p.id}
              onClick={() => { setSelectedPlatform(p.id); setActiveTab('create') }}
              className={`p-4 rounded-xl border transition-all text-left ${selectedPlatform === p.id ? 'border-sky/50 bg-blue/10' : 'border-border bg-panel/50 hover:border-sky/20'}`}
            >
              <div className={`text-3xl mb-2 bg-gradient-to-r ${p.color} bg-clip-text text-transparent`}>{p.icon}</div>
              <div className="font-bold text-white flex items-center gap-2">
                {p.label}
                {p.popular && <Star size={12} className="text-yellow-400 fill-yellow-400" />}
              </div>
              <p className="text-xs text-muted mt-1">{p.desc}</p>
              <Badge variant="blue" className="mt-2 text-xs">基础 ¥0.02/条</Badge>
            </button>
          ))}
        </div>
      )}

      {activeTab === 'create' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2">
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-blue/10 border border-blue/30">
                <div className="text-2xl">{platformCards.find(p => p.id === selectedPlatform)?.icon}</div>
                <div>
                  <div className="font-bold text-white">{selectedPlatform}</div>
                  <div className="text-xs text-muted">基础单价 ¥0.02/条</div>
                </div>
                <div className="flex-1" />
                <Badge variant="blue">已选</Badge>
              </div>

              <div>
                <label className="text-sm font-bold text-muted block mb-2">🔍 选择检测项</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {detectionItemsConfig.map(item => {
                    const price = getItemPrice(item.id)
                    return (
                      <button
                        key={item.id}
                        onClick={() => toggleDetectionItem(item.id)}
                        className={`flex items-center gap-2 p-3 rounded-xl border transition-all text-left ${
                          selectedItems.includes(item.id) 
                            ? 'border-sky/50 bg-blue/10' 
                            : 'border-border bg-panel/50 hover:border-sky/20'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 ${
                          selectedItems.includes(item.id) 
                            ? 'bg-blue border-blue text-white' 
                            : 'border-border'
                        }`}>
                          {selectedItems.includes(item.id) && <CheckCircle size={12} />}
                        </div>
                        <div>
                          <div className="text-sm text-white">{item.label}</div>
                          <div className="text-xs text-muted">¥{price.toFixed(3)}/条</div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="text-sm font-bold text-muted block mb-2">号码列表</label>
                <textarea
                  className="w-full min-h-[120px] bg-panel/50 border border-border rounded-xl text-white outline-none p-4 focus:border-sky/50 resize-y font-mono text-sm"
                  placeholder="每行一个号码"
                  value={numbers}
                  onChange={(e) => setNumbers(e.target.value)}
                />
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-3">
                    <input ref={fileInputRef} type="file" accept=".txt,.csv" onChange={handleFileUpload} className="hidden" id="fileUpload" />
                    <label htmlFor="fileUpload" className="px-4 py-2 rounded-xl bg-panel/50 border border-border text-sm text-muted hover:text-white hover:border-sky/30 cursor-pointer transition-all flex items-center gap-2">
                      <Upload size={16} /> 上传文件
                    </label>
                    {uploadedFile && <span className="text-xs text-green">{uploadedFile.name}</span>}
                  </div>
                  <span className="text-xs text-muted">已输入：{numberCount} 个号码</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-panel/50 border border-border space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">检测项 ({activeItems.length}项)</span>
                  <span className="text-white">{activeItems.map(i => i.label).join(', ')}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">单价</span>
                  <span className="text-white">¥{basePrice.toFixed(3)}/条</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">号码数量</span>
                  <span className="text-white">{numberCount} 个</span>
                </div>
                <div className="flex items-center justify-between text-lg font-bold border-t border-border pt-2">
                  <span className="text-muted">预估费用</span>
                  <span className="text-sky">¥{totalCost.toFixed(2)}</span>
                </div>
              </div>

              <Button variant="primary" className="w-full" onClick={handleCreateTask} disabled={taskStatus === 'processing' || selectedItems.length === 0}>
                {taskStatus === 'processing' ? <><Loader size={18} className="mr-2 animate-spin" />创建中...</> : <><Play size={18} className="mr-2" />创建任务</>}
              </Button>
              {selectedItems.length === 0 && (
                <p className="text-xs text-orange text-center">⚠️ 请至少选择一个检测项</p>
              )}
            </div>
          </Card>

          <div className="space-y-4">
            <Card title="📋 已选检测项">
              <div className="space-y-2">
                {activeItems.length === 0 ? (
                  <p className="text-sm text-muted">请选择检测项</p>
                ) : (
                  activeItems.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-2 rounded-lg bg-panel/50">
                      <span className="text-sm text-white">{item.label}</span>
                      <span className="text-xs text-muted">¥{getItemPrice(item.id).toFixed(3)}</span>
                    </div>
                  ))
                )}
                {activeItems.length > 0 && (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-blue/10 border border-blue/30 mt-2">
                    <span className="text-sm text-white font-bold">合计</span>
                    <span className="text-sm text-sky font-bold">¥{basePrice.toFixed(3)}/条</span>
                  </div>
                )}
              </div>
            </Card>

            <Card title="⚡ 快速操作">
              <div className="space-y-2">
                <Button variant="ghost" className="w-full justify-start text-sm" onClick={handleImportTemplate}>
                  <FileText size={14} className="mr-2" />导入号码模板
                </Button>
                <Button variant="ghost" className="w-full justify-start text-sm" onClick={handleBatchDetect}>
                  <Database size={14} className="mr-2" />批量检测
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'list' && (
        <Card>
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex-1 min-w-[200px]"><Input placeholder="搜索任务..." value={searchTask} onChange={(e) => setSearchTask(e.target.value)} /></div>
            <select className="w-auto min-w-[120px] bg-panel/50 border border-border rounded-xl text-white px-4 py-2.5 outline-none" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="">全部状态</option><option value="completed">已完成</option><option value="processing">处理中</option><option value="pending">待处理</option><option value="failed">失败</option>
            </select>
            <select className="w-auto min-w-[120px] bg-panel/50 border border-border rounded-xl text-white px-4 py-2.5 outline-none" value={filterPlatform} onChange={(e) => setFilterPlatform(e.target.value)}>
              <option value="">全部平台</option>{platformCards.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
            </select>
            <Button variant="ghost" onClick={() => { setSearchTask(''); setFilterStatus(''); setFilterPlatform('') }}>重置</Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-border">
                <th className="text-left text-xs font-bold text-muted uppercase py-3 px-4">任务ID</th>
                <th className="text-left text-xs font-bold text-muted uppercase py-3 px-4">平台</th>
                <th className="text-left text-xs font-bold text-muted uppercase py-3 px-4">数量</th>
                <th className="text-left text-xs font-bold text-muted uppercase py-3 px-4">检测项</th>
                <th className="text-left text-xs font-bold text-muted uppercase py-3 px-4">进度</th>
                <th className="text-left text-xs font-bold text-muted uppercase py-3 px-4">状态</th>
                <th className="text-left text-xs font-bold text-muted uppercase py-3 px-4">消耗</th>
                <th className="text-left text-xs font-bold text-muted uppercase py-3 px-4">操作</th>
              </tr></thead>
              <tbody>
                {filteredTasks.map(task => (
                  <tr key={task.id} className="border-b border-border/50 hover:bg-panel/50">
                    <td className="py-3 px-4 text-white font-mono text-sm">{task.id}</td>
                    <td className="py-3 px-4"><Badge variant="blue">{task.platform}</Badge></td>
                    <td className="py-3 px-4 text-white">{task.numbers}</td>
                    <td className="py-3 px-4 text-xs text-muted">{task.items || '全部'}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-panel/50 rounded-full overflow-hidden">
                          <div className="h-full bg-blue rounded-full transition-all" style={{ width: `${task.progress || 0}%` }} />
                        </div>
                        <span className="text-xs text-muted">{task.progress || 0}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={statusColors[task.status]}>
                        <span className="flex items-center gap-1">{statusIcons[task.status]} {task.status}</span>
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted">¥{(task.cost || 0).toFixed(2)}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1">
                        <button onClick={() => handleViewDetail(task)} className="p-1.5 rounded-lg hover:bg-blue/10 text-blue"><Eye size={16} /></button>
                        <button onClick={() => handleDownload(task)} className="p-1.5 rounded-lg hover:bg-green/10 text-green"><Download size={16} /></button>
                        <button onClick={() => handleDelete(task.id)} className="p-1.5 rounded-lg hover:bg-red/10 text-red"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'stats' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card title="平台任务分布">
            <div className="space-y-3">
              {platformCards.map(p => {
                const count = tasks.filter(t => t.platform === p.id).length
                return (
                  <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-panel/50">
                    <span className="text-sm text-white">{p.icon} {p.label}</span>
                    <span className="text-blue font-bold">{count} 个</span>
                  </div>
                )
              })}
            </div>
          </Card>
          <Card title="任务状态统计">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-panel/50">
                <span className="text-sm text-white">✅ 已完成</span>
                <span className="text-green font-bold">{taskStats.completed}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-panel/50">
                <span className="text-sm text-white">🔄 处理中</span>
                <span className="text-blue font-bold">{taskStats.processing}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-panel/50">
                <span className="text-sm text-white">⏳ 待处理</span>
                <span className="text-orange font-bold">{taskStats.pending}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-panel/50">
                <span className="text-sm text-white">❌ 失败</span>
                <span className="text-red font-bold">{taskStats.failed}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-panel/50 border-t border-border pt-3">
                <span className="text-sm text-white font-bold">💰 总消耗</span>
                <span className="text-purple font-bold">¥{taskStats.totalCost.toFixed(2)}</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {showDownloadOptions && selectedTask && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-panel border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">📥 下载选项</h2>
              <button onClick={() => { setShowDownloadOptions(false); setSelectedTask(null) }} className="text-muted hover:text-white"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-panel/50 border border-border">
                <p className="text-sm text-muted">任务</p>
                <p className="text-white font-bold">{selectedTask.id} - {selectedTask.platform}</p>
                <p className="text-xs text-muted">共 {selectedTask.numbers} 个号码</p>
              </div>
              <div><label className="text-sm font-bold text-muted block mb-2">格式</label>
                <div className="grid grid-cols-5 gap-2">
                  {['txt','csv','json','xlsx','zip'].map(f => <button key={f} onClick={() => setDownloadFormat(f)} className={`p-2 rounded-xl text-sm font-bold transition-all ${downloadFormat === f ? 'bg-blue text-white' : 'bg-panel/50 text-muted hover:text-white'}`}>{f.toUpperCase()}</button>)}
                </div>
              </div>
              <div className="space-y-2 p-3 rounded-xl bg-panel/50 border border-border">
                <label className="flex items-center justify-between text-sm text-white cursor-pointer"><span>带 + 号</span><input type="checkbox" checked={includePlus} onChange={(e) => setIncludePlus(e.target.checked)} className="w-4 h-4 accent-blue" /></label>
                <label className="flex items-center justify-between text-sm text-white cursor-pointer"><span>带国家区号</span><input type="checkbox" checked={includeCountryCode} onChange={(e) => setIncludeCountryCode(e.target.checked)} className="w-4 h-4 accent-blue" /></label>
                {includeCountryCode && <Input label="区号" type="text" value={countryCode} onChange={(e) => setCountryCode(e.target.value.replace(/[^0-9]/g, ''))} />}
              </div>
              <div className="p-3 rounded-xl bg-panel/50 border border-border">
                <p className="text-xs text-muted">预览</p>
                <p className="text-sm text-white font-mono">{includePlus ? '+' : ''}{includeCountryCode ? countryCode : ''}86131000000000</p>
              </div>
              <Button variant="primary" className="w-full" onClick={executeDownload}><Download size={18} className="mr-2" />下载 {selectedTask.numbers} 个号码</Button>
            </div>
          </div>
        </div>
      )}

      {showTaskDetail && selectedTask && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-panel border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">📋 任务详情</h2>
              <button onClick={() => { setShowTaskDetail(false); setSelectedTask(null) }} className="text-muted hover:text-white"><X size={20} /></button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-panel/50"><span className="text-muted">任务ID</span><span className="text-white font-mono">{selectedTask.id}</span></div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-panel/50"><span className="text-muted">平台</span><Badge variant="blue">{selectedTask.platform}</Badge></div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-panel/50"><span className="text-muted">检测项</span><span className="text-white text-sm">{selectedTask.items || '全部'}</span></div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-panel/50"><span className="text-muted">号码数量</span><span className="text-white">{selectedTask.numbers}</span></div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-panel/50"><span className="text-muted">状态</span><Badge variant={statusColors[selectedTask.status]}>{selectedTask.status}</Badge></div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-panel/50"><span className="text-muted">进度</span><div className="flex items-center gap-2"><div className="w-32 h-2 bg-panel/50 rounded-full overflow-hidden"><div className="h-full bg-blue rounded-full transition-all" style={{ width: `${selectedTask.progress || 0}%` }} /></div><span className="text-xs text-muted">{selectedTask.progress || 0}%</span></div></div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-panel/50"><span className="text-muted">消耗积分</span><span className="text-purple font-bold">¥{(selectedTask.cost || 0).toFixed(2)}</span></div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-panel/50"><span className="text-muted">结果</span><span className="text-white text-sm">{selectedTask.result}</span></div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-panel/50"><span className="text-muted">时间</span><span className="text-sm text-muted">{selectedTask.time}</span></div>
            </div>
            <div className="flex gap-3 mt-4">
              <Button variant="primary" className="flex-1" onClick={() => { setShowTaskDetail(false); setSelectedTask(null) }}>关闭</Button>
              <Button variant="green" className="flex-1" onClick={() => { handleDownload(selectedTask); setShowTaskDetail(false) }}><Download size={16} className="mr-1" />导出</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
