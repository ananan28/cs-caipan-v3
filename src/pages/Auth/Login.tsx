import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'
import { Zap, Loader, Mail, Lock, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'

export const Login = () => {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [email, setEmail] = useState('admin@cs.com')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const wallpaper = 'https://fuqhvyqxibepmbauohmh.supabase.co/storage/v1/object/public/wallpapers/messageImage_1781061135170.jpg'

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
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${wallpaper})` }}
      />
      <div className="absolute inset-0 bg-black/50" />

      <div className="relative z-10 w-full max-w-md ml-auto mr-8">
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl shadow-black/30">
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-full bg-black border-2 border-yellow-400 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-yellow-500/20">
              <span className="text-3xl font-bold text-yellow-400">財</span>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight drop-shadow-lg">财盛集团</h1>
            <p className="text-blue-200/80 text-sm mt-1 flex items-center justify-center gap-2">
              <Sparkles size={14} className="text-yellow-400" />
              博亿研发中心 · V3.0
              <Sparkles size={14} className="text-yellow-400" />
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300/60" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="邮箱地址"
                className="w-full pl-12 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all"
                required
              />
            </div>

            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300/60" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="密码"
                className="w-full pl-12 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-yellow-400 to-yellow-500 text-white font-bold text-lg hover:scale-[1.02] hover:shadow-xl hover:shadow-yellow-400/30 transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100"
            >
              {loading ? <Loader size={24} className="animate-spin" /> : <><Zap size={20} className="fill-white/20" /> 登录</>}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-white/30">© 2025 财盛集团 · 博亿研发中心</p>
          </div>
        </div>
      </div>
    </div>
  )
}
