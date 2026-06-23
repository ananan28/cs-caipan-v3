import { useState, useEffect } from 'react'
import { Card } from '@/components/Common/Card'
import { Badge } from '@/components/Common/Badge'
import { Button } from '@/components/Common/Button'
import { Input } from '@/components/Forms/Input'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import {
  User, Mail, Phone, Shield, Save, RefreshCw,
  Camera, Edit2, X, CheckCircle, Key, Wallet
} from 'lucide-react'
import toast from 'react-hot-toast'

export const Profile = () => {
  const { user, updateUser } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    role: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || ''
      })
    }
  }, [user])

  const handleUpdate = async () => {
    setLoading(true)
    const { error } = await supabase
      .from('users')
      .update({
        username: formData.username,
        phone: formData.phone
      })
      .eq('id', user?.id)

    if (error) {
      toast.error('更新失败: ' + error.message)
    } else {
      toast.success('个人信息已更新')
      updateUser({ 
        ...user, 
        username: formData.username,
        name: formData.username,
        phone: formData.phone 
      })
      setEditing(false)
    }
    setLoading(false)
  }

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('两次密码输入不一致')
      return
    }
    if (newPassword.length < 6) {
      toast.error('密码至少6位')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (error) {
      toast.error('修改密码失败: ' + error.message)
    } else {
      toast.success('密码已修改')
      setShowPassword(false)
      setNewPassword('')
      setConfirmPassword('')
    }
    setLoading(false)
  }

  if (!user) {
    return (
      <div className="p-6 bg-[#0a0f1f] min-h-screen flex items-center justify-center">
        <div className="text-gray-400">请先登录</div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-[#0a0f1f] min-h-screen">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">个人中心</h1>
            <p className="text-gray-400 text-sm">管理你的个人信息</p>
          </div>
          <Button variant="outline" onClick={() => setEditing(!editing)}>
            {editing ? <X size={16} className="mr-2" /> : <Edit2 size={16} className="mr-2" />}
            {editing ? '取消' : '编辑'}
          </Button>
        </div>

        {/* 头像和基本信息 */}
        <Card>
          <div className="flex flex-wrap items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold">
                {formData.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <button className="absolute bottom-0 right-0 p-1.5 bg-blue-500 rounded-full hover:bg-blue-600">
                <Camera size={14} className="text-white" />
              </button>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white">{formData.username || '未设置'}</h2>
              <p className="text-gray-400">{formData.email}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="info">{formData.role || 'User'}</Badge>
                <Badge variant="success">已认证</Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* 个人信息 */}
        <Card>
          <div className="p-4 border-b border-gray-800">
            <h3 className="text-white font-semibold">基本信息</h3>
          </div>
          <div className="divide-y divide-gray-800">
            <div className="flex flex-wrap items-center justify-between gap-4 p-4">
              <div className="flex items-center gap-3">
                <User className="text-gray-400" size={18} />
                <span className="text-gray-400 text-sm">用户名</span>
              </div>
              {editing ? (
                <Input
                  value={formData.username}
                  onChange={(e: any) => setFormData({ ...formData, username: e.target.value })}
                  className="w-64 bg-[#1a1f35] border-gray-700 text-white"
                />
              ) : (
                <span className="text-white">{formData.username}</span>
              )}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-4 p-4">
              <div className="flex items-center gap-3">
                <Mail className="text-gray-400" size={18} />
                <span className="text-gray-400 text-sm">邮箱</span>
              </div>
              <span className="text-white">{formData.email}</span>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-4 p-4">
              <div className="flex items-center gap-3">
                <Phone className="text-gray-400" size={18} />
                <span className="text-gray-400 text-sm">手机号</span>
              </div>
              {editing ? (
                <Input
                  value={formData.phone}
                  onChange={(e: any) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-64 bg-[#1a1f35] border-gray-700 text-white"
                />
              ) : (
                <span className="text-white">{formData.phone || '未设置'}</span>
              )}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-4 p-4">
              <div className="flex items-center gap-3">
                <Shield className="text-gray-400" size={18} />
                <span className="text-gray-400 text-sm">角色</span>
              </div>
              <Badge variant="info">{formData.role}</Badge>
            </div>
          </div>
          {editing && (
            <div className="p-4 border-t border-gray-800">
              <Button onClick={handleUpdate} disabled={loading} className="w-full">
                {loading ? '保存中...' : '保存修改'}
              </Button>
            </div>
          )}
        </Card>

        {/* 修改密码 */}
        <Card>
          <div className="p-4 border-b border-gray-800 flex items-center justify-between">
            <h3 className="text-white font-semibold">修改密码</h3>
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="text-blue-400 text-sm hover:underline"
            >
              {showPassword ? '取消' : '修改密码'}
            </button>
          </div>
          {showPassword && (
            <div className="p-4 space-y-4">
              <div>
                <label className="text-white text-sm font-medium block mb-1">新密码</label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e: any) => setNewPassword(e.target.value)}
                  className="bg-[#1a1f35] border-gray-700 text-white"
                />
              </div>
              <div>
                <label className="text-white text-sm font-medium block mb-1">确认密码</label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e: any) => setConfirmPassword(e.target.value)}
                  className="bg-[#1a1f35] border-gray-700 text-white"
                />
              </div>
              <Button onClick={handleChangePassword} disabled={loading} className="w-full">
                {loading ? '修改中...' : '确认修改密码'}
              </Button>
            </div>
          )}
        </Card>

        {/* 统计信息 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#12182b] border border-gray-800 rounded-lg p-4">
            <div className="text-gray-400 text-sm">用户ID</div>
            <div className="text-white text-sm font-mono mt-1">{user?.id?.slice(0, 16)}...</div>
          </div>
          <div className="bg-[#12182b] border border-gray-800 rounded-lg p-4">
            <div className="text-gray-400 text-sm">注册时间</div>
            <div className="text-white text-sm mt-1">
              {user?.created_at ? new Date(user.created_at).toLocaleString() : '-'}
            </div>
          </div>
          <div className="bg-[#12182b] border border-gray-800 rounded-lg p-4">
            <div className="text-gray-400 text-sm">状态</div>
            <div className="text-green-400 text-sm mt-1">✅ 正常</div>
          </div>
        </div>
      </div>
    </div>
  )
}
