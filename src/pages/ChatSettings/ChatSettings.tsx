import { useState } from 'react'
import { Card } from '@/components/Common/Card'
import { Badge } from '@/components/Common/Badge'
import { Button } from '@/components/Common/Button'
import { Input } from '@/components/Forms/Input'
import { useChatSettingsStore } from '@/store/chatSettingsStore'
import { 
  Settings, MessageSquare, Clock, Zap, Plus, 
  Edit, Trash2, Save, X, Check, Copy,
  Tag, Filter, Search, RefreshCw,
  MessageCircle, Send, Reply, List,
  FolderOpen, FileText, Sparkles
} from 'lucide-react'
import toast from 'react-hot-toast'

export const ChatSettings = () => {
  const { settings, updateSettings, addQuickReply, updateQuickReply, deleteQuickReply } = useChatSettingsStore()
  
  const [activeTab, setActiveTab] = useState('general')
  const [showAddReply, setShowAddReply] = useState(false)
  const [editingReply, setEditingReply] = useState<any>(null)
  
  // 新回复表单
  const [newReply, setNewReply] = useState({
    title: '',
    content: '',
    category: 'general' as any,
  })

  const [editForm, setEditForm] = useState({
    title: '',
    content: '',
    category: 'general' as any,
  })

  // 在线时间设置
  const [onlineHours, setOnlineHours] = useState(settings.onlineHours)
  const [autoReply, setAutoReply] = useState(settings.autoReply)
  const [welcomeMessage, setWelcomeMessage] = useState(settings.welcomeMessage)

  // 分类标签
  const categories = [
    { value: 'general', label: '一般咨询', color: 'blue' },
    { value: 'technical', label: '技术问题', color: 'orange' },
    { value: 'finance', label: '财务问题', color: 'green' },
    { value: 'recharge', label: '充值问题', color: 'purple' },
    { value: 'task', label: '任务问题', color: 'red' },
  ]

  const categoryColors: any = {
    general: 'blue',
    technical: 'orange',
    finance: 'green',
    recharge: 'purple',
    task: 'red'
  }

  // 保存通用设置
  const handleSaveGeneral = () => {
    updateSettings({ onlineHours, autoReply, welcomeMessage })
    toast.success('✅ 客服设置已保存')
  }

  // 添加快捷回复
  const handleAddReply = () => {
    if (!newReply.title || !newReply.content) {
      toast.error('请填写标题和内容')
      return
    }
    addQuickReply({
      id: Date.now().toString(),
      title: newReply.title,
      content: newReply.content,
      category: newReply.category,
      sortOrder: settings.quickReplies.length + 1,
    })
    toast.success('✅ 快捷回复已添加')
    setNewReply({ title: '', content: '', category: 'general' })
    setShowAddReply(false)
  }

  // 编辑快捷回复
  const handleEditReply = (reply: any) => {
    setEditingReply(reply)
    setEditForm({
      title: reply.title,
      content: reply.content,
      category: reply.category,
    })
  }

  const handleSaveEdit = () => {
    if (!editForm.title || !editForm.content) {
      toast.error('请填写完整信息')
      return
    }
    updateQuickReply(editingReply.id, {
      title: editForm.title,
      content: editForm.content,
      category: editForm.category,
    })
    toast.success('✅ 快捷回复已更新')
    setEditingReply(null)
  }

  // 删除快捷回复
  const handleDeleteReply = (id: string) => {
    if (confirm('确定要删除此快捷回复吗？')) {
      deleteQuickReply(id)
      toast.success('✅ 已删除')
    }
  }

  // 复制回复内容
  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content)
    toast.success('✅ 已复制到剪贴板')
  }

  // 按分类筛选
  const [filterCategory, setFilterCategory] = useState('all')
  const filteredReplies = filterCategory === 'all' 
    ? settings.quickReplies 
    : settings.quickReplies.filter(r => r.category === filterCategory)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">⚙️ 客服设置</h1>
          <p className="text-muted text-sm">自定义回复话术、在线时间、快捷回复</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="green">🟢 7x24小时在线</Badge>
        </div>
      </div>

      {/* 7x24小时在线状态 */}
      <div className="p-4 rounded-xl bg-green/10 border border-green/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-green animate-pulse" />
          <span className="text-green font-bold">🟢 客服在线</span>
          <span className="text-sm text-muted">| {onlineHours}</span>
        </div>
        <span className="text-xs text-muted">💡 所有管理员可实时回复用户</span>
      </div>

      {/* Tab 切换 */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setActiveTab('general')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'general' ? 'bg-blue text-white' : 'bg-panel/50 text-muted hover:text-white'}`}>
          ⚙️ 通用设置
        </button>
        <button onClick={() => setActiveTab('replies')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'replies' ? 'bg-blue text-white' : 'bg-panel/50 text-muted hover:text-white'}`}>
          📋 快捷回复 ({settings.quickReplies.length})
        </button>
      </div>

      {/* 通用设置 */}
      {activeTab === 'general' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card title="客服基本设置">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-muted block mb-1.5">在线时间</label>
                <div className="flex items-center gap-2">
                  <Input 
                    value={onlineHours} 
                    onChange={(e) => setOnlineHours(e.target.value)}
                    placeholder="如: 7x24小时 或 9:00-21:00"
                  />
                  <Badge variant="green">实时</Badge>
                </div>
                <p className="text-xs text-muted mt-1">💡 可自定义在线时间显示</p>
              </div>

              <div>
                <label className="text-sm font-bold text-muted block mb-1.5">欢迎语</label>
                <textarea 
                  className="w-full min-h-[80px] bg-panel/50 border border-border rounded-xl text-white outline-none p-4 focus:border-sky/50"
                  value={welcomeMessage}
                  onChange={(e) => setWelcomeMessage(e.target.value)}
                  placeholder="用户进入客服时的欢迎语"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-muted block mb-1.5">自动回复</label>
                <textarea 
                  className="w-full min-h-[80px] bg-panel/50 border border-border rounded-xl text-white outline-none p-4 focus:border-sky/50"
                  value={autoReply}
                  onChange={(e) => setAutoReply(e.target.value)}
                  placeholder="用户发送消息后自动回复"
                />
              </div>

              <Button variant="primary" className="w-full" onClick={handleSaveGeneral}>
                <Save size={18} className="mr-2" />保存设置
              </Button>
            </div>
          </Card>

          <Card title="📊 客服统计">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-panel/50">
                <span className="text-muted">快捷回复总数</span>
                <span className="text-white font-bold">{settings.quickReplies.length}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-panel/50">
                <span className="text-muted">在线状态</span>
                <Badge variant="green">🟢 7x24小时</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-panel/50">
                <span className="text-muted">客服人员</span>
                <span className="text-white">所有者 / 管理员 / 财务</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-panel/50">
                <span className="text-muted">响应时间</span>
                <span className="text-green font-bold">实时</span>
              </div>
              <div className="p-3 rounded-xl bg-blue/10 border border-blue/30 text-center text-sm text-blue">
                💡 所有设置实时生效，无需重启
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* 快捷回复管理 */}
      {activeTab === 'replies' && (
        <Card title="📋 快捷回复管理" subtitle="自定义常用回复话术">
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex-1 min-w-[150px]">
              <select 
                className="w-full bg-panel/50 border border-border rounded-xl text-white px-4 py-2.5 outline-none focus:border-sky/50"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="all">全部分类</option>
                {categories.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <Button variant="primary" onClick={() => setShowAddReply(true)}>
              <Plus size={18} className="mr-2" />添加回复
            </Button>
          </div>

          <div className="space-y-3">
            {filteredReplies.length === 0 ? (
              <div className="text-center py-8 text-muted">暂无快捷回复，点击添加</div>
            ) : (
              filteredReplies.map((reply, index) => (
                <div key={reply.id} className="flex items-start justify-between p-4 rounded-xl bg-panel/50 border border-border hover:border-sky/20 transition-all">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted">#{index + 1}</span>
                      <span className="font-bold text-white">{reply.title}</span>
                      <Badge variant={categoryColors[reply.category]}>
                        {categories.find(c => c.value === reply.category)?.label}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted mt-1">{reply.content}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button 
                      onClick={() => handleCopy(reply.content)}
                      className="p-1.5 rounded-lg hover:bg-green/10 text-green"
                      title="复制"
                    >
                      <Copy size={16} />
                    </button>
                    <button 
                      onClick={() => handleEditReply(reply)}
                      className="p-1.5 rounded-lg hover:bg-blue/10 text-blue"
                      title="编辑"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      onClick={() => handleDeleteReply(reply.id)}
                      className="p-1.5 rounded-lg hover:bg-red/10 text-red"
                      title="删除"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {/* 添加快捷回复弹窗 */}
      {showAddReply && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur flex items-center justify-center p-4" onClick={() => setShowAddReply(false)}>
          <div className="w-full max-w-lg bg-panel border border-border rounded-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">添加快捷回复</h2>
              <button onClick={() => setShowAddReply(false)} className="text-muted hover:text-white"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <Input 
                label="标题" 
                placeholder="如: 充值问题" 
                value={newReply.title}
                onChange={(e) => setNewReply({...newReply, title: e.target.value})}
              />
              <div>
                <label className="text-sm font-bold text-muted block mb-1.5">分类</label>
                <select 
                  className="w-full bg-panel/50 border border-border rounded-xl text-white px-4 py-2.5 outline-none focus:border-sky/50"
                  value={newReply.category}
                  onChange={(e) => setNewReply({...newReply, category: e.target.value as any})}
                >
                  {categories.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-bold text-muted block mb-1.5">回复内容</label>
                <textarea 
                  className="w-full min-h-[100px] bg-panel/50 border border-border rounded-xl text-white outline-none p-4 focus:border-sky/50"
                  placeholder="输入回复内容..."
                  value={newReply.content}
                  onChange={(e) => setNewReply({...newReply, content: e.target.value})}
                />
              </div>
              <div className="flex gap-3">
                <Button variant="primary" className="flex-1" onClick={handleAddReply}>添加</Button>
                <Button variant="ghost" className="flex-1" onClick={() => setShowAddReply(false)}>取消</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 编辑快捷回复弹窗 */}
      {editingReply && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur flex items-center justify-center p-4" onClick={() => setEditingReply(null)}>
          <div className="w-full max-w-lg bg-panel border border-border rounded-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">编辑快捷回复</h2>
              <button onClick={() => setEditingReply(null)} className="text-muted hover:text-white"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <Input 
                label="标题" 
                value={editForm.title}
                onChange={(e) => setEditForm({...editForm, title: e.target.value})}
              />
              <div>
                <label className="text-sm font-bold text-muted block mb-1.5">分类</label>
                <select 
                  className="w-full bg-panel/50 border border-border rounded-xl text-white px-4 py-2.5 outline-none focus:border-sky/50"
                  value={editForm.category}
                  onChange={(e) => setEditForm({...editForm, category: e.target.value as any})}
                >
                  {categories.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-bold text-muted block mb-1.5">回复内容</label>
                <textarea 
                  className="w-full min-h-[100px] bg-panel/50 border border-border rounded-xl text-white outline-none p-4 focus:border-sky/50"
                  value={editForm.content}
                  onChange={(e) => setEditForm({...editForm, content: e.target.value})}
                />
              </div>
              <div className="flex gap-3">
                <Button variant="primary" className="flex-1" onClick={handleSaveEdit}>保存</Button>
                <Button variant="ghost" className="flex-1" onClick={() => setEditingReply(null)}>取消</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
