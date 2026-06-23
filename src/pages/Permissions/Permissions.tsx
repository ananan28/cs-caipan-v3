import { useState } from 'react'
import { Card } from '@/components/Common/Card'
import { Badge } from '@/components/Common/Badge'
import { Button } from '@/components/Common/Button'
import { Input } from '@/components/Forms/Input'
import { 
  Shield, Check, X, Edit, Users, UserCog, Save,
  Settings, Lock, Key, Eye, EyeOff, Search,
  CheckCircle, XCircle, AlertTriangle, Plus,
  Trash2, RefreshCw, Crown, Star, UserCheck
} from 'lucide-react'
import toast from 'react-hot-toast'

export const Permissions = () => {
  const [activeTab, setActiveTab] = useState('roles')
  const [selectedRole, setSelectedRole] = useState('SuperAdmin')
  const [searchUser, setSearchUser] = useState('')
  const [showEditRole, setShowEditRole] = useState(false)
  const [editingRole, setEditingRole] = useState<any>(null)

  const [roles, setRoles] = useState([
    { id: 'SuperAdmin', label: '平台拥有者', count: 15, color: 'purple', desc: '全部权限' },
    { id: 'Admin', label: '管理员', count: 12, color: 'blue', desc: '管理用户、任务、工单' },
    { id: 'Finance', label: '财务', count: 8, color: 'green', desc: '财务管理、充值审核' },
    { id: 'Agent', label: '代理', count: 10, color: 'orange', desc: '管理下线用户' },
    { id: 'User', label: '普通用户', count: 5, color: 'gray', desc: '个人功能' },
  ])

  // 权限列表 - 每个权限独立控制
  const [permissions, setPermissions] = useState([
    { id: 'canViewDashboard', label: '查看控制台', enabled: true, category: '基础' },
    { id: 'canViewUsers', label: '查看用户', enabled: true, category: '用户' },
    { id: 'canCreateUser', label: '创建用户', enabled: true, category: '用户' },
    { id: 'canEditUser', label: '编辑用户', enabled: true, category: '用户' },
    { id: 'canDeleteUser', label: '删除用户', enabled: false, category: '用户' },
    { id: 'canFreezeUser', label: '冻结用户', enabled: true, category: '用户' },
    { id: 'canViewPermissions', label: '查看权限', enabled: true, category: '权限' },
    { id: 'canEditPermissions', label: '修改权限', enabled: false, category: '权限' },
    { id: 'canViewFinance', label: '查看财务', enabled: true, category: '财务' },
    { id: 'canEditBalance', label: '修改余额', enabled: false, category: '财务' },
    { id: 'canEditPoints', label: '修改积分', enabled: false, category: '财务' },
    { id: 'canViewTasks', label: '查看任务', enabled: true, category: '任务' },
    { id: 'canCreateTask', label: '创建任务', enabled: true, category: '任务' },
    { id: 'canViewLogs', label: '查看日志', enabled: true, category: '系统' },
    { id: 'canViewSettings', label: '查看设置', enabled: true, category: '系统' },
    { id: 'canEditSettings', label: '修改设置', enabled: false, category: '系统' },
  ])

  const userPermissions = [
    { user: 'admin@cs.com', role: 'SuperAdmin', status: 'active' },
    { user: 'admin2@cs.com', role: 'Admin', status: 'active' },
    { user: 'finance@cs.com', role: 'Finance', status: 'active' },
    { user: 'agent@cs.com', role: 'Agent', status: 'active' },
    { user: 'user@cs.com', role: 'User', status: 'active' },
  ]

  // 切换权限 - 修复点击无效问题
  const togglePermission = (id: string) => {
    setPermissions(prev => 
      prev.map(p => 
        p.id === id ? { ...p, enabled: !p.enabled } : p
      )
    )
    // 显示反馈
    const perm = permissions.find(p => p.id === id)
    toast.success(`${perm?.label} 已${perm?.enabled ? '禁用' : '启用'}`)
  }

  const handleSavePermissions = () => {
    toast.success('✅ 所有权限配置已保存')
  }

  const handleEditRole = (role: any) => {
    setEditingRole(role)
    setShowEditRole(true)
  }

  const handleSaveRole = () => {
    if (!editingRole) return
    setRoles(roles.map(r => 
      r.id === editingRole.id ? { ...r, label: editingRole.label, desc: editingRole.desc } : r
    ))
    toast.success(`角色 ${editingRole.label} 已更新`)
    setShowEditRole(false)
    setEditingRole(null)
  }

  const filteredUsers = userPermissions.filter(u => 
    u.user.includes(searchUser) || u.role.includes(searchUser)
  )

  // 获取当前角色的权限
  const getRolePermissions = () => {
    // 模拟不同角色的权限配置
    if (selectedRole === 'SuperAdmin') return permissions
    if (selectedRole === 'Admin') return permissions.map(p => ({ ...p, enabled: p.category !== '权限' && p.category !== '财务' }))
    if (selectedRole === 'Finance') return permissions.map(p => ({ ...p, enabled: p.category === '财务' || p.category === '基础' }))
    if (selectedRole === 'Agent') return permissions.map(p => ({ ...p, enabled: p.category === '用户' || p.category === '任务' || p.category === '基础' }))
    return permissions.map(p => ({ ...p, enabled: p.category === '基础' || p.category === '任务' }))
  }

  const currentPerms = getRolePermissions()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">权限管理</h1>
          <p className="text-muted text-sm">角色权限配置 - 点击开关切换权限</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => toast.success('已刷新')}><RefreshCw size={18} /></Button>
          <Button variant="primary" onClick={handleSavePermissions}><Save size={18} className="mr-2" />保存全部</Button>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setActiveTab('roles')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'roles' ? 'bg-blue text-white' : 'bg-panel/50 text-muted hover:text-white'}`}>👥 角色管理</button>
        <button onClick={() => setActiveTab('permissions')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'permissions' ? 'bg-blue text-white' : 'bg-panel/50 text-muted hover:text-white'}`}>🔐 权限配置</button>
        <button onClick={() => setActiveTab('assign')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'assign' ? 'bg-blue text-white' : 'bg-panel/50 text-muted hover:text-white'}`}>📋 权限分配</button>
      </div>

      {/* 角色管理 */}
      {activeTab === 'roles' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles.map(role => (
            <Card key={role.id} className={`border-l-4 ${role.color === 'purple' ? 'border-purple' : role.color === 'blue' ? 'border-blue' : role.color === 'green' ? 'border-green' : role.color === 'orange' ? 'border-orange' : 'border-gray'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white">{role.label}</h3>
                  <p className="text-sm text-muted">{role.count} 项权限</p>
                  <p className="text-xs text-muted mt-1">{role.desc}</p>
                </div>
                <button onClick={() => handleEditRole(role)} className="p-2 rounded-lg hover:bg-blue/10 text-blue"><Edit size={18} /></button>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <Badge variant="green"><Check size={12} className="mr-1" /> 启用</Badge>
                <Badge variant="default"><X size={12} className="mr-1" /> 禁用</Badge>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* 权限配置 - 点击开关有效 */}
      {activeTab === 'permissions' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-1">
            <h3 className="font-bold text-white mb-3">选择角色</h3>
            <div className="space-y-2">
              {roles.map(role => (
                <button 
                  key={role.id} 
                  onClick={() => setSelectedRole(role.id)} 
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all ${selectedRole === role.id ? 'bg-blue/20 border border-sky/30 text-white' : 'bg-panel/50 text-muted hover:text-white'}`}
                >
                  <div className="flex items-center justify-between">
                    <span>{role.label}</span>
                    <Badge variant="blue">{role.count}</Badge>
                  </div>
                </button>
              ))}
            </div>
            <p className="text-xs text-muted mt-4">💡 点击权限开关切换启用/禁用</p>
          </Card>

          <Card className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-white">{roles.find(r => r.id === selectedRole)?.label}</h3>
                <p className="text-sm text-muted">点击开关切换权限</p>
              </div>
              <Button variant="primary" size="sm" onClick={handleSavePermissions}><Save size={16} className="mr-1" />保存</Button>
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto">
              {['基础', '用户', '权限', '财务', '任务', '系统'].map(category => {
                const items = currentPerms.filter(p => p.category === category)
                if (items.length === 0) return null
                return (
                  <div key={category}>
                    <p className="text-xs font-bold text-muted uppercase mb-2">{category}</p>
                    <div className="space-y-2">
                      {items.map(p => (
                        <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-panel/50 hover:bg-panel/70">
                          <span className="text-white text-sm">{p.label}</span>
                          <button 
                            onClick={() => togglePermission(p.id)} 
                            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                              p.enabled 
                                ? 'bg-green/20 text-green border border-green/30 hover:bg-green/30' 
                                : 'bg-red/20 text-red border border-red/30 hover:bg-red/30'
                            }`}
                          >
                            {p.enabled ? '✅ 启用' : '❌ 禁用'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>
      )}

      {/* 权限分配 */}
      {activeTab === 'assign' && (
        <Card>
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex-1 min-w-[200px]"><Input placeholder="搜索用户..." value={searchUser} onChange={(e) => setSearchUser(e.target.value)} /></div>
            <Button variant="ghost" onClick={() => setSearchUser('')}>重置</Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-border">
                <th className="text-left text-xs font-bold text-muted uppercase py-3 px-4">用户</th>
                <th className="text-left text-xs font-bold text-muted uppercase py-3 px-4">角色</th>
                <th className="text-left text-xs font-bold text-muted uppercase py-3 px-4">权限数</th>
                <th className="text-left text-xs font-bold text-muted uppercase py-3 px-4">状态</th>
                <th className="text-left text-xs font-bold text-muted uppercase py-3 px-4">操作</th>
              </tr></thead>
              <tbody>
                {filteredUsers.map(u => (
                  <tr key={u.user} className="border-b border-border/50 hover:bg-panel/50">
                    <td className="py-3 px-4 text-white">{u.user}</td>
                    <td className="py-3 px-4"><Badge variant="blue">{u.role}</Badge></td>
                    <td className="py-3 px-4 text-white">{permissions.filter(p => p.enabled).length}</td>
                    <td className="py-3 px-4"><Badge variant="green">{u.status}</Badge></td>
                    <td className="py-3 px-4">
                      <button 
                        onClick={() => {
                          setSelectedRole(u.role)
                          setActiveTab('permissions')
                          toast.success(`正在编辑 ${u.user} 的权限`)
                        }} 
                        className="px-3 py-1.5 rounded-lg bg-blue/20 text-blue text-sm font-bold hover:bg-blue/30"
                      >
                        编辑权限
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* 编辑角色弹窗 */}
      {showEditRole && editingRole && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur flex items-center justify-center p-4" onClick={() => setShowEditRole(false)}>
          <div className="w-full max-w-md bg-panel border border-border rounded-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-white mb-4">编辑角色</h2>
            <div className="space-y-4">
              <Input label="角色名称" value={editingRole.label} onChange={(e) => setEditingRole({...editingRole, label: e.target.value})} />
              <Input label="描述" value={editingRole.desc} onChange={(e) => setEditingRole({...editingRole, desc: e.target.value})} />
              <div className="flex gap-3">
                <Button variant="primary" className="flex-1" onClick={handleSaveRole}><Save size={16} className="mr-1" />保存</Button>
                <Button variant="ghost" className="flex-1" onClick={() => setShowEditRole(false)}>取消</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
