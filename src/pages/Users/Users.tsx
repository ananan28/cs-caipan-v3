import { useState, useEffect } from 'react'
import { Card } from '@/components/Common/Card'
import { Badge } from '@/components/Common/Badge'
import { Button } from '@/components/Common/Button'
import { Input } from '@/components/Forms/Input'
import { supabase } from '@/lib/supabase'
import { Search, Plus, Edit, Trash2, Ban, CheckCircle, X } from 'lucide-react'
import toast from 'react-hot-toast'

interface User {
  id: string
  email: string
  username: string
  role: string
  status: string
  created_at: string
}

export const Users = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [newUsername, setNewUsername] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newRole, setNewRole] = useState('User')

  const roles = ['SuperAdmin', 'Admin', 'Finance', 'Agent', 'User']

  // 加载用户数据
  const loadUsers = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      toast.error('加载用户失败: ' + error.message)
    } else {
      setUsers(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    loadUsers()
  }, [])

  // 创建用户
  const handleCreateUser = async () => {
    if (!newUsername || !newEmail || !newPassword) {
      toast.error('请填写完整信息')
      return
    }

    // 先创建 auth 用户
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: newEmail,
      password: newPassword,
    })

    if (authError) {
      toast.error('创建用户失败: ' + authError.message)
      return
    }

    if (authData.user) {
      // 再创建用户记录
      const { error } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: newEmail,
          username: newUsername,
          role: newRole,
          status: 'active',
        })

      if (error) {
        toast.error('创建用户记录失败: ' + error.message)
      } else {
        toast.success('用户创建成功')
        setShowCreate(false)
        setNewUsername('')
        setNewEmail('')
        setNewPassword('')
        loadUsers()
      }
    }
  }

  // 切换状态
  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'frozen' : 'active'
    const { error } = await supabase
      .from('users')
      .update({ status: newStatus })
      .eq('id', id)

    if (error) {
      toast.error('更新状态失败: ' + error.message)
    } else {
      toast.success(`用户已${newStatus === 'active' ? '激活' : '冻结'}`)
      loadUsers()
    }
  }

  // 删除用户
  const handleDelete = async (id: string, username: string) => {
    if (!confirm(`确定要删除用户 ${username} 吗？`)) return

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id)

    if (error) {
      toast.error('删除失败: ' + error.message)
    } else {
      toast.success(`用户 ${username} 已删除`)
      loadUsers()
    }
  }

  const filtered = users.filter(u => {
    const matchSearch = u.username?.includes(search) || u.email?.includes(search)
    const matchRole = !filterRole || u.role === filterRole
    return matchSearch && matchRole
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
        {/* 头部 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">用户管理</h1>
            <p className="text-gray-400 text-sm">管理系统所有用户</p>
          </div>
          <Button variant="primary" onClick={() => setShowCreate(true)}>
            <Plus size={18} className="mr-2" /> 创建用户
          </Button>
        </div>

        {/* 搜索和筛选 */}
        <Card>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="搜索用户..."
                value={search}
                onChange={(e: any) => setSearch(e.target.value)}
                className="bg-[#1a1f35] border-gray-700 text-white"
                prefix={<Search size={16} className="text-gray-400" />}
              />
            </div>
            <select
              className="px-4 py-2 bg-[#1a1f35] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="">全部角色</option>
              {roles.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <Button variant="ghost" onClick={() => { setSearch(''); setFilterRole('') }}>
              重置
            </Button>
          </div>
        </Card>

        {/* 用户列表 */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#1a1f35]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">用户名</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">邮箱</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">角色</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">状态</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">创建时间</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">操作</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr key={user.id} className="border-t border-gray-800 hover:bg-[#1a1f35]/50">
                    <td className="px-4 py-3 text-white text-sm">{user.username}</td>
                    <td className="px-4 py-3 text-gray-300 text-sm">{user.email}</td>
                    <td className="px-4 py-3">
                      <Badge variant="info">{user.role}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={user.status === 'active' ? 'success' : 'warning'}>
                        {user.status === 'active' ? '正常' : '冻结'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-sm">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleStatus(user.id, user.status)}
                          className="p-1.5 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition-colors"
                          title={user.status === 'active' ? '冻结' : '激活'}
                        >
                          {user.status === 'active' ? <Ban size={14} /> : <CheckCircle size={14} />}
                        </button>
                        <button
                          onClick={() => handleDelete(user.id, user.username)}
                          className="p-1.5 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
                          title="删除"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-8 text-gray-400">暂无用户</div>
            )}
          </div>
        </Card>

        {/* 创建用户弹窗 */}
        {showCreate && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-[#12182b] border border-gray-800 rounded-2xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">创建用户</h2>
                <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-white">
                  <X size={24} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-white text-sm font-medium block mb-1">用户名</label>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="w-full px-4 py-2 bg-[#1a1f35] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-white text-sm font-medium block mb-1">邮箱</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full px-4 py-2 bg-[#1a1f35] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-white text-sm font-medium block mb-1">密码</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2 bg-[#1a1f35] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-white text-sm font-medium block mb-1">角色</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full px-4 py-2 bg-[#1a1f35] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    {roles.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <Button className="w-full" onClick={handleCreateUser}>
                  创建
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
