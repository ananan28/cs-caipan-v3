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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    e.stopPropagation()

    const email = form.email.trim()
    const username = form.username.trim()

    if (!email || !username || !form.password) {
      toast.error('请填写完整信息')
      return
    }

    if (!email.includes('@') || !email.includes('.')) {
      toast.error('请输入有效的邮箱地址')
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
        setLoading(false)
        return
      }

      if (data?.user) {
        toast.success('✅ 注册成功！请查看邮箱点击验证链接')
        setForm({
          email: '',
          username: '',
          password: '',
          confirmPassword: '',
          inviteCode: ''
        })
        setTimeout(() => {
          navigate('/login')
        }, 3000)
      } else {
        toast.error('注册失败，请稍后重试')
      }
    } catch (error: any) {
      toast.error('注册失败: ' + (error.message || '未知错误'))
    } finally {
      setLoading(false)
    }
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
              disabled={loading}
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
              disabled={loading}
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
              disabled={loading}
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
              disabled={loading}
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
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                注册中...
              </span>
            ) : (
              '立即注册'
            )}
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
