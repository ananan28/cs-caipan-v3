import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'

export const Register = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    inviteCode: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const email = form.email.trim()
    const username = form.username.trim()

    if (!email || !username || !form.password) {
      toast.error('请填写完整信息')
      return
    }

    if (form.password.length < 6) {
      toast.error('密码至少6位')
      return
    }

    if (form.password !== form.confirmPassword) {
      toast.error('两次密码输入不一致')
      return
    }

    setLoading(true)

    try {
      // 直接注册，Supabase 会自动发送验证邮件
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: form.password,
        options: {
          data: {
            username: username,
            invite_code: form.inviteCode || null
          },
          emailRedirectTo: window.location.origin + '/login'
        }
      })

      if (error) {
        toast.error('注册失败: ' + error.message)
      } else if (data.user) {
        toast.success('注册成功！请查看邮箱点击验证链接完成注册')
        // 清空表单
        setForm({ email: '', username: '', password: '', confirmPassword: '', inviteCode: '' })
        // 跳转到登录页
        setTimeout(() => navigate('/login'), 3000)
      }
    } catch (error: any) {
      toast.error('注册失败: ' + error.message)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <div className="bg-gray-800/50 rounded-xl p-8 w-full max-w-md border border-gray-700/50">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-yellow-400">财盛集团</h1>
          <p className="text-gray-400 mt-1">创建新账号</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">用户名 *</label>
            <input
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="请输入用户名"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-400"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">邮箱 *</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="请输入邮箱"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-400"
            />
            <p className="text-xs text-gray-500 mt-1">注册后请查看邮箱点击验证链接激活账号</p>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">密码 *</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="至少6位密码"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-400"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">确认密码 *</label>
            <input
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="再次输入密码"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-400"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">邀请码（选填）</label>
            <input
              name="inviteCode"
              value={form.inviteCode}
              onChange={handleChange}
              placeholder="请输入邀请码"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-300 transition disabled:opacity-50"
          >
            {loading ? '注册中...' : '立即注册'}
          </button>
        </form>

        <p className="text-center text-gray-400 text-sm mt-4">
          已有账号？{' '}
          <Link to="/login" className="text-yellow-400 hover:underline">
            立即登录
          </Link>
        </p>
      </div>
    </div>
  )
}
