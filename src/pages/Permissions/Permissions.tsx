import { useState, useEffect } from 'react'
import { Card } from '@/components/Common/Card'
import { Badge } from '@/components/Common/Badge'
import { Button } from '@/components/Common/Button'
import { Input } from '@/components/Forms/Input'
import { supabase } from '@/lib/supabase'
import {
  Shield, Search, RefreshCw, Plus, Edit2, Trash2,
  CheckCircle, XCircle, User, Users, X
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Permission {
  id: string
  role: string
  resource: string
  action: string
  created_at: string
}

interface UserRole {
  id: string
  email: string
  username: string
  role: string
}

export const Permissions = () => {
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [users, setUsers] = useState<UserRole[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [newRole, setNewRole] = useState('')
  const [newResource, setNewResource] = useState('')
  const [newAction, setNewAction] = useState('')

  const loadData = async () => {
    setLoading(true)
    
    // 加载权限
    const { data: permData, error: permError } = await supabase
      .from('permissions')
      .select('*')
      .order('role', { ascending: true })

    if (permError) {
      toast.error('加载权限失败: ' + permError.message)
    } else {
      setPermissions(permData || [])
    }

    // 加载用户
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, username, role')

    if (userError) {
      toast.error('加载用户失败: ' + userError.message)
    } else {
      setUsers(userData || [])
    }

    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleCreate = async () => {
    if (!newRole || !newResource || !newAction) {
      toast.error('请填写完整信息')
      return
    }

    const { error } = await supabase
      .from('permissions')
      .insert({
        role: newRole,
        resource: newResource,
        action: newAction
      })

    if (error) {
      toast.error('创建失败: ' + error.message)
    } else {
      toast.success('权限已创建')
      setShowCreate(false)
      setNewRole('')
      setNewResource('')
      setNewAction('')
      loadData()
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除此权限吗？')) return

    const { error } = await supabase
      .from('permissions')
      .delete()
      .eq('id', id)

    if (error) {
      toast.error('删除失败: ' + error.message)
    } else {
      toast.success('权限已删除')
      loadData()
    }
  }

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    const { error } = await supabase
      .from('users')
      .update({ role: newRole })
      .eq('id', userId)

    if (error) {
      toast.error('更新失败: ' + error.message)
    } else {
      toast.success('用户角色已更新')
      loadData()
    }
  }

  const roles = ['SuperAdmin', 'Admin', 'Finance', 'Agent', 'User']
  const actions = ['create', 'read', 'update', 'delete', 'manage']

  const filteredPermissions = permissions.filter(p => {
    return p.role.includes(search) || p.resource.includes(search)
  })

  const filteredUsers = users.filter(u => {
    return u.email.includes(search) || u.username.includes(search)
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
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">权限管理</h1>
            <p className="text-gray-400 text-sm">管理系统权限和用户角色</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadData}>
              <RefreshCw size={16} className="mr-2" /> 刷新
            </Button>
            <Button variant="primary" onClick={() => setShowCreate(true)}>
              <Plus size={16} className="mr-2" /> 添加权限
            </Button>
          </div>
        </div>

        <Card>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="搜索权限或用户..."
                value={search}
                onChange={(e: any) => setSearch(e.target.value)}
                className="bg-[#1a1f35] border-gray-700 text-white"
                prefix={<Search size={16} className="text-gray-400" />}
              />
            </div>
          </div>
        </Card>

        {/* 用户角色管理 */}
        <Card>
          <div className="p-4 border-b border-gray-800">
            <h2 className="text-lg font-semibold text-white">用户角色</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#1a1f35]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">用户</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">当前角色</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="border-t border-gray-800 hover:bg-[#1a1f35]/50">
                    <td className="px-4 py-3 text-white text-sm">{u.email}</td>
                    <td className="px-4 py-3">
                      <Badge variant="info">{u.role}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={u.role}
                        onChange={(e) => handleUpdateUserRole(u.id, e.target.value)}
                        className="px-3 py-1 bg-[#1a1f35] border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                      >
                        {roles.map(r => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* 权限列表 */}
        <Card>
          <div className="p-4 border-b border-gray-800">
            <h2 className="text-lg font-semibold text-white">权限列表</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#1a1f35]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">角色</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">资源</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">操作</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredPermissions.map((p) => (
                  <tr key={p.id} className="border-t border-gray-800 hover:bg-[#1a1f35]/50">
                    <td className="px-4 py-3">
                      <Badge variant="info">{p.role}</Badge>
                    </td>
                    <td className="px-4 py-3 text-white text-sm">{p.resource}</td>
                    <td className="px-4 py-3">
                      <Badge variant="success">{p.action}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-1.5 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredPermissions.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-gray-400">暂无权限</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {showCreate && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-[#12182b] border border-gray-800 rounded-2xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">添加权限</h2>
                <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-white">
                  <X size={24} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-white text-sm font-medium block mb-1">角色</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full px-4 py-2 bg-[#1a1f35] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">选择角色</option>
                    {roles.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-white text-sm font-medium block mb-1">资源</label>
                  <input
                    type="text"
                    value={newResource}
                    onChange={(e) => setNewResource(e.target.value)}
                    placeholder="例如: users, wallets, tasks"
                    className="w-full px-4 py-2 bg-[#1a1f35] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-white text-sm font-medium block mb-1">操作</label>
                  <select
                    value={newAction}
                    onChange={(e) => setNewAction(e.target.value)}
                    className="w-full px-4 py-2 bg-[#1a1f35] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">选择操作</option>
                    {actions.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <Button className="w-full" onClick={handleCreate}>创建</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
