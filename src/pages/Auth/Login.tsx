import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { Shield, Zap, Loader } from 'lucide-react'
import toast from 'react-hot-toast'

export const Login = () => {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setLoading(false)

    if (error) {
      toast.error('登录失败: ' + error.message)
      return
    }

    if (data.user) {
      login({
        id: data.user.id,
        name: data.user.email?.split('@')[0] || '用户',
        email: data.user.email || '',
        phone: '',
        role: 'SuperAdmin',
        status: 'Active',
        balance: 99999,
        points: 99999,
        avatar: '',
        owner_id: '',
        owner_type: 'Platform',
        permissions: {},
        created_at: data.user.created_at,
        updated_at: data.user.updated_at || '',
      }, data.session?.access_token || '')
      
      toast.success('登录成功！')
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0a0f1f]">
      <div className="w-full max-w-md bg-[#12182b] backdrop-blur border border-gray-800 rounded-3xl p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-sky-400 mb-4">
            <Shield className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-white">财盛集团</h1>
          <p className="text-gray-400 text-sm mt-1">博亿研发中心 · V3.0</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-white text-sm font-medium block mb-1">邮箱</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@cs.com"
              className="w-full px-4 py-3 bg-[#1a1f35] border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="text-white text-sm font-medium block mb-1">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-[#1a1f35] border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-sky-400 text-white font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? <Loader size={24} className="animate-spin" /> : <Zap size={24} />}
            {loading ? '登录中...' : '登录'}
          </button>
        </form>

        <p className="text-xs text-gray-500 text-center mt-6">© 2025 财盛集团</p>
      </div>
    </div>
  )
}
