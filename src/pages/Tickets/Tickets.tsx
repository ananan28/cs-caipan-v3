import { useState } from 'react'
import { Card } from '@/components/Common/Card'
import { Badge } from '@/components/Common/Badge'
import { Button } from '@/components/Common/Button'
import { Input } from '@/components/Forms/Input'
import { Ticket, Plus, MessageSquare, CheckCircle, Clock, AlertCircle, Search, Eye, Reply, Check, X, User, Calendar, Trash2, Edit, Save } from 'lucide-react'
import toast from 'react-hot-toast'

export const Tickets = () => {
  const [activeTab, setActiveTab] = useState('list')
  const [showCreate, setShowCreate] = useState(false)
  const [showReply, setShowReply] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<any>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('general')
  const [replyContent, setReplyContent] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  const [tickets, setTickets] = useState([
    { id: 'TCK-001', title: '登录问题', category: 'technical', status: 'pending', priority: 'high', user: 'user@example.com', time: '2025-06-22 14:30', content: '无法登录账号，提示密码错误' },
    { id: 'TCK-002', title: '充值未到账', category: 'finance', status: 'processing', priority: 'high', user: 'admin@cs.com', time: '2025-06-22 13:20', content: '充值了100元但积分没有增加' },
    { id: 'TCK-003', title: '功能建议', category: 'feature', status: 'resolved', priority: 'medium', user: 'agent@cs.com', time: '2025-06-21 16:45', content: '建议增加批量检测功能' },
    { id: 'TCK-004', title: '账号问题', category: 'general', status: 'closed', priority: 'low', user: 'user@cs.com', time: '2025-06-20 10:00', content: '账号被冻结了，请解冻' },
  ])

  const [replies, setReplies] = useState<Record<string, any[]>>({
    'TCK-001': [{ id: 1, from: '客服', content: '请提供您的账号，我们帮您重置密码', time: '2025-06-22 15:00' }],
    'TCK-002': [{ id: 1, from: '客服', content: '正在查询中，请稍等', time: '2025-06-22 14:00' }],
  })

  const categoryColors: any = { technical: 'blue', finance: 'orange', general: 'green', feature: 'purple' }
  const statusColors: any = { pending: 'orange', processing: 'blue', resolved: 'green', closed: 'gray' }

  const handleCreate = () => {
    if (!title || !content) { toast.error('请填写标题和内容'); return }
    setTickets([{ id: `TCK-${String(Date.now()).slice(-6)}`, title, content, category, status: 'pending', priority: 'medium', user: 'user@cs.com', time: new Date().toISOString().slice(0, 16).replace('T', ' ') }, ...tickets])
    toast.success('✅ 工单已创建')
    setShowCreate(false)
    setTitle('')
    setContent('')
  }

  const handleReply = (ticket: any) => {
    if (!replyContent.trim()) { toast.error('请输入回复内容'); return }
    const newReply = { id: Date.now(), from: '客服', content: replyContent, time: new Date().toISOString().slice(0, 16).replace('T', ' ') }
    setReplies({ ...replies, [ticket.id]: [...(replies[ticket.id] || []), newReply] })
    toast.success('✅ 回复已发送')
    setReplyContent('')
    setShowReply(false)
  }

  const handleStatusChange = (id: string, status: string) => {
    setTickets(tickets.map(t => t.id === id ? { ...t, status } : t))
    toast.success(`✅ 状态已更新为 ${status}`)
  }

  const handleDelete = (id: string) => {
    if (confirm('确定删除此工单吗？')) {
      setTickets(tickets.filter(t => t.id !== id))
      toast.success('✅ 工单已删除')
    }
  }

  const filteredTickets = tickets.filter(t => 
    t.id.includes(searchTerm) || t.title.includes(searchTerm) || t.user.includes(searchTerm)
  ).filter(t => filterStatus ? t.status === filterStatus : true)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white">工单系统</h1><p className="text-muted text-sm">提交和跟踪工单</p></div>
        <Button variant="primary" onClick={() => setShowCreate(true)}><Plus size={18} className="mr-2" />创建工单</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><div className="flex items-center justify-between"><div><p className="text-sm text-muted">总工单</p><p className="text-2xl font-bold text-white mt-1">{tickets.length}</p></div><div className="p-3 rounded-xl bg-blue/10 text-blue"><Ticket size={24} /></div></div></Card>
        <Card><div className="flex items-center justify-between"><div><p className="text-sm text-muted">待处理</p><p className="text-2xl font-bold text-orange mt-1">{tickets.filter(t => t.status === 'pending').length}</p></div><div className="p-3 rounded-xl bg-orange/10 text-orange"><Clock size={24} /></div></div></Card>
        <Card><div className="flex items-center justify-between"><div><p className="text-sm text-muted">处理中</p><p className="text-2xl font-bold text-blue mt-1">{tickets.filter(t => t.status === 'processing').length}</p></div><div className="p-3 rounded-xl bg-blue/10 text-blue"><MessageSquare size={24} /></div></div></Card>
        <Card><div className="flex items-center justify-between"><div><p className="text-sm text-muted">已解决</p><p className="text-2xl font-bold text-green mt-1">{tickets.filter(t => t.status === 'resolved').length}</p></div><div className="p-3 rounded-xl bg-green/10 text-green"><CheckCircle size={24} /></div></div></Card>
      </div>

      <Card>
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex-1 min-w-[200px]"><Input placeholder="搜索工单..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
          <select className="w-auto min-w-[120px] bg-panel/50 border border-border rounded-xl text-white px-4 py-2.5 outline-none" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">全部状态</option><option value="pending">待处理</option><option value="processing">处理中</option><option value="resolved">已解决</option><option value="closed">已关闭</option>
          </select>
          <Button variant="ghost" onClick={() => { setSearchTerm(''); setFilterStatus('') }}>重置</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-border">
              <th className="text-left text-xs font-bold text-muted uppercase py-3 px-4">工单号</th>
              <th className="text-left text-xs font-bold text-muted uppercase py-3 px-4">标题</th>
              <th className="text-left text-xs font-bold text-muted uppercase py-3 px-4">分类</th>
              <th className="text-left text-xs font-bold text-muted uppercase py-3 px-4">状态</th>
              <th className="text-left text-xs font-bold text-muted uppercase py-3 px-4">优先级</th>
              <th className="text-left text-xs font-bold text-muted uppercase py-3 px-4">时间</th>
              <th className="text-left text-xs font-bold text-muted uppercase py-3 px-4">操作</th>
            </tr></thead>
            <tbody>
              {filteredTickets.map(t => (
                <tr key={t.id} className="border-b border-border/50 hover:bg-panel/50">
                  <td className="py-3 px-4 text-white font-mono text-sm">{t.id}</td>
                  <td className="py-3 px-4 text-white">{t.title}</td>
                  <td className="py-3 px-4"><Badge variant={categoryColors[t.category]}>{t.category}</Badge></td>
                  <td className="py-3 px-4"><Badge variant={statusColors[t.status]}>{t.status}</Badge></td>
                  <td className="py-3 px-4"><Badge variant={t.priority === 'high' ? 'red' : t.priority === 'medium' ? 'orange' : 'blue'}>{t.priority}</Badge></td>
                  <td className="py-3 px-4 text-sm text-muted">{t.time}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1">
                      <button onClick={() => { setSelectedTicket(t); setShowReply(true) }} className="p-1.5 rounded-lg hover:bg-blue/10 text-blue"><Reply size={16} /></button>
                      <button className="p-1.5 rounded-lg hover:bg-green/10 text-green"><Eye size={16} /></button>
                      <button onClick={() => handleDelete(t.id)} className="p-1.5 rounded-lg hover:bg-red/10 text-red"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 创建弹窗 */}
      {showCreate && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-panel border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4"><h2 className="text-xl font-bold text-white">创建工单</h2><button onClick={() => setShowCreate(false)} className="text-muted hover:text-white"><X size={20} /></button></div>
            <div className="space-y-4">
              <Input label="标题" value={title} onChange={(e) => setTitle(e.target.value)} />
              <div><label className="text-sm font-bold text-muted block mb-1.5">分类</label>
                <select className="w-full bg-panel/50 border border-border rounded-xl text-white px-4 py-2.5 outline-none" value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="technical">技术问题</option><option value="finance">财务问题</option><option value="general">一般咨询</option><option value="feature">功能建议</option>
                </select>
              </div>
              <div><label className="text-sm font-bold text-muted block mb-1.5">内容</label>
                <textarea className="w-full min-h-[120px] bg-panel/50 border border-border rounded-xl text-white outline-none p-4 focus:border-sky/50" value={content} onChange={(e) => setContent(e.target.value)} />
              </div>
              <div className="flex gap-3"><Button variant="primary" className="flex-1" onClick={handleCreate}>提交</Button><Button variant="ghost" className="flex-1" onClick={() => setShowCreate(false)}>取消</Button></div>
            </div>
          </div>
        </div>
      )}

      {/* 回复弹窗 */}
      {showReply && selectedTicket && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-panel border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4"><h2 className="text-xl font-bold text-white">回复工单 #{selectedTicket.id}</h2><button onClick={() => { setShowReply(false); setSelectedTicket(null) }} className="text-muted hover:text-white"><X size={20} /></button></div>
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-panel/50 border border-border">
                <p className="text-sm font-bold text-white">{selectedTicket.title}</p>
                <p className="text-sm text-muted mt-1">{selectedTicket.content}</p>
              </div>
              {replies[selectedTicket.id]?.map((r, i) => (
                <div key={i} className="p-3 rounded-xl bg-blue/10 border border-blue/30">
                  <div className="flex items-center gap-2 text-xs text-muted"><span className="font-bold text-white">{r.from}</span><span>{r.time}</span></div>
                  <p className="text-sm text-white mt-1">{r.content}</p>
                </div>
              ))}
              <div><label className="text-sm font-bold text-muted block mb-1.5">回复内容</label>
                <textarea className="w-full min-h-[80px] bg-panel/50 border border-border rounded-xl text-white outline-none p-4 focus:border-sky/50" value={replyContent} onChange={(e) => setReplyContent(e.target.value)} placeholder="输入回复..." />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="primary" className="flex-1" onClick={() => handleReply(selectedTicket)}><Reply size={16} className="mr-1" />回复</Button>
                <Button variant="green" size="sm" onClick={() => handleStatusChange(selectedTicket.id, 'resolved')}>✅ 解决</Button>
                <Button variant="orange" size="sm" onClick={() => handleStatusChange(selectedTicket.id, 'processing')}>🔄 处理中</Button>
                <Button variant="ghost" size="sm" onClick={() => handleStatusChange(selectedTicket.id, 'closed')}>📁 关闭</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
