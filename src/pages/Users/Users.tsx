import { useState } from 'react'
import { useUserStore } from '@/store/userStore'
import { Card } from '@/components/Common/Card'
import { Badge } from '@/components/Common/Badge'
import { Button } from '@/components/Common/Button'
import { Input } from '@/components/Forms/Input'
import { Search, Plus, Edit, Trash2, Ban, CheckCircle, X } from 'lucide-react'
import toast from 'react-hot-toast'

export const Users = () => {
  const { users, addUser, updateUser, deleteUser } = useUserStore()
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newRole, setNewRole] = useState('User')

  const filtered = users.filter(u => {
    const matchSearch = u.name.includes(search) || u.email.includes(search)
    const matchRole = !filterRole || u.role === filterRole
    return matchSearch && matchRole
  })

  const roles = ['SuperAdmin', 'Admin', 'Finance', 'Agent', 'User']

  const handleCreateUser = () => {
    if (!newName || !newEmail) {
      toast.error('请填写用户名和邮箱')
      return
    }
    if (users.some(u => u.email === newEmail)) {
      toast.error('邮箱已存在')
      return
    }
    const newUser = {
      id: Date.now().toString(),
      name: newName,
      email: newEmail,
      phone: '',
      role: newRole as any,
      status: 'Active' as any,
      points: 0,
      avatar: '',
      owner_id: '',
      owner_type: 'Platform',
      permissions: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    addUser(newUser)
    toast.success(`用户 ${newName} 创建成功`)
    setShowCreate(false)
    setNewName('')
    setNewEmail('')
  }

  const handleToggleStatus = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Active' ? 'Frozen' : 'Active'
    updateUser(id, { status: newStatus as any })
    toast.success(`用户已${newStatus === 'Active' ? '激活' : '冻结'}`)
  }

  const handleDelete = (id: string, name: string) => {
    if (confirm(`确定要删除用户 ${name} 吗？`)) {
      deleteUser(id)
      toast.success(`用户 ${name} 已删除`)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">用户管理</h1>
          <p className="text-muted text-sm">管理系统所有用户</p>
        </div>
        <Button variant="primary" onClick={() => setShowCreate(true)}>
          <Plus size={18} className="mr-2" />创建用户
        </Button>
      </div>

      <Card>
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <Input placeholder="搜索用户..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select 
            className="w-auto min-w-[120px] bg-panel/50 border border-border rounded-xl text-white px-4 py-2.5 outline-none focus:border-sky/50" 
            value={filterRole} 
            onChange={(e) => setFilterRole(e.target.value)}
          >
            <option value="">全部角色</option>
            {roles.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <Button variant="ghost" onClick={() => { setSearch(''); setFilterRole('') }}>重置</Button>
        </div>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs font-bold text-muted uppercase py-3 px-4">用户</th>
                <th className="text-left text-xs font-bold text-muted uppercase py-3 px-4">邮箱</th>
                <th className="text-left text-xs font-bold text-muted uppercase py-3 px-4">角色</th>
                <th className="text-left text-xs font-bold text-muted uppercase py-3 px-4">状态</th>
                <th className="text-left text-xs font-bold text-muted uppercase py-3 px-4">积分</th>
                <th className="text-right text-xs font-bold text-muted uppercase py-3 px-4">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id} className="border-b border-border/50 hover:bg-panel/50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue to-sky flex items-center justify-center text-white font-bold text-sm">
                        {u.name?.[0] || 'U'}
                      </div>
                      <div>
                        <div className="font-medium text-white">{u.name}</div>
                        <div className="text-xs text-muted">ID: {u.id.slice(0, 8)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-muted">{u.email}</td>
                  <td className="py-3 px-4"><Badge variant="blue">{u.role}</Badge></td>
                  <td className="py-3 px-4">
                    <Badge variant={u.status === 'Active' ? 'green' : 'orange'}>{u.status}</Badge>
                  </td>
                  <td className="py-3 px-4 text-white">{u.points?.toFixed(0) || 0}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-1.5 rounded-lg hover:bg-blue/10 text-blue"><Edit size={16} /></button>
                      <button 
                        className="p-1.5 rounded-lg hover:bg-orange/10 text-orange" 
                        onClick={() => handleToggleStatus(u.id, u.status)}
                      >
                        {u.status === 'Active' ? <Ban size={16} /> : <CheckCircle size={16} />}
                      </button>
                      <button 
                        className="p-1.5 rounded-lg hover:bg-red/10 text-red" 
                        onClick={() => handleDelete(u.id, u.name)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-8 text-muted">没有找到匹配的用户</div>
          )}
        </div>
      </Card>

      {/* 创建用户弹窗 */}
      {showCreate && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur flex items-center justify-center p-4" onClick={() => setShowCreate(false)}>
          <div className="w-full max-w-md bg-panel border border-border rounded-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">创建用户</h2>
              <button onClick={() => setShowCreate(false)} className="text-muted hover:text-white"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <Input label="用户名" placeholder="请输入用户名" value={newName} onChange={(e) => setNewName(e.target.value)} />
              <Input label="邮箱" placeholder="请输入邮箱" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
              <div>
                <label className="text-sm font-bold text-muted block mb-1.5">角色</label>
                <select 
                  className="w-full bg-panel/50 border border-border rounded-xl text-white px-4 py-2.5 outline-none focus:border-sky/50" 
                  value={newRole} 
                  onChange={(e) => setNewRole(e.target.value)}
                >
                  <option value="User">用户</option>
                  <option value="Agent">代理</option>
                  <option value="Finance">财务</option>
                  <option value="Admin">管理员</option>
                </select>
              </div>
              <div className="flex gap-3">
                <Button variant="primary" className="flex-1" onClick={handleCreateUser}>创建</Button>
                <Button variant="ghost" className="flex-1" onClick={() => setShowCreate(false)}>取消</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
