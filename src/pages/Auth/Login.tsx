import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

export const Login = () => {
  const navigate = useNavigate()
  const { login, refreshUser } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.email || !form.password) {
      toast.error('请输入邮箱和密码')
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password
      })

      if (error) {
        toast.error('登录失败: ' + error.message)
        setLoading(false)
        return
      }

      if (data.user) {
        const metadata = data.user.user_metadata || {}
        const userName = metadata.name || data.user.email?.split('@')[0] || 'user'
        const userData = {
          id: data.user.id,
          email: data.user.email || '',
          name: userName,
          username: userName,
          role: metadata.role || 'User'
        }

        // 同步用户到 users 表（包含 name 字段）
        const { error: upsertError } = await supabase
          .from('users')
          .upsert({
            id: data.user.id,
            email: data.user.email,
            name: userName,
            username: userName,
            role: metadata.role || 'User',
            status: 'Active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, { onConflict: 'id' })

        if (upsertError) {
          console.error('同步用户失败:', upsertError)
          toast.error('用户数据同步失败: ' + upsertError.message)
        }

        login(userData, data.session?.access_token || '')
        await refreshUser()
        toast.success('登录成功')
        navigate('/dashboard')
      }
    } catch (error: any) {
      toast.error('登录失败: ' + error.message)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <div className="bg-gray-800/50 rounded-xl p-8 w-full max-w-md border border-gray-700/50">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-yellow-400">财盛集团</h1>
          <p className="text-gray-300 mt-1">登录您的账号</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">邮箱</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="请输入邮箱"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-400"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">密码</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="请输入密码"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-300 transition disabled:opacity-50"
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </form>

        <p className="text-center text-gray-300 text-sm mt-4">
          还没有账号？{' '}
          <Link to="/register" className="text-yellow-400 hover:underline">
            立即注册
          </Link>
        </p>
      </div>
    </div>
  )
}
