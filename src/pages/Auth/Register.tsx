import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { UserPlus, Mail, Lock, User, Sparkles, Zap, Loader } from 'lucide-react'
import { Captcha } from '../../components/Common/Captcha'
import toast from 'react-hot-toast'

export const Register = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [captchaValid, setCaptchaValid] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const ref = params.get('ref')
    if (ref) setInviteCode(ref)
  }, [])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!agreeTerms) {
      toast.error('请同意服务条款')
      return
    }

    if (!captchaValid) {
      toast.error('请完成验证码验证')
      return
    }

    if (password.length < 6) {
      toast.error('密码至少6位')
      return
    }

    setLoading(true)

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username }
      }
    })

    if (authError) {
      toast.error('注册失败: ' + authError.message)
      setLoading(false)
      return
    }

    if (authData.user) {
      await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: email,
          username: username,
          role: 'User',
          status: 'active'
        })

      if (inviteCode) {
        const { data: inviter } = await supabase
          .from('users')
          .select('id')
          .eq('id', inviteCode)
          .maybeSingle()

        if (inviter) {
          await supabase
            .from('invites')
            .insert({
              inviter_id: inviter.id,
              invitee_id: authData.user.id,
              invitee_email: email,
              level: 1,
              reward: 0,
              status: 'pending'
            })
        }
      }

      toast.success('注册成功！')
      navigate('/login')
    }

    setLoading(false)
  }

  const wallpaper = 'https://fuqhvyqxibepmbauohmh.supabase.co/storage/v1/object/public/wallpapers/messageImage_1781061135170.jpg'

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${wallpaper})` }} />
      <div className="absolute inset-0 bg-black/50" />

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl shadow-black/30">
          <div className="text-center mb-6">
            <div className="w-20 h-20 rounded-full bg-black border-2 border-yellow-400 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-yellow-500/20">
              <span className="text-3xl font-bold text-yellow-400">財</span>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">创建账号</h1>
            <p className="text-blue-200/80 text-sm mt-1">加入财盛集团</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="用户名"
              className="w-full px-4 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-yellow-400"
              required
            />

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="邮箱地址"
              className="w-full px-4 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-yellow-400"
              required
            />

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="密码（至少6位）"
              className="w-full px-4 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-yellow-400"
              required
              minLength={6}
            />

            <Captcha onVerify={setCaptchaValid} />

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="w-4 h-4 rounded border-white/20 bg-white/10 text-yellow-400"
                required
              />
              <span className="text-white/60 text-xs">
                我同意 <Link to="/terms" className="text-yellow-400 hover:underline">服务条款</Link>
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-yellow-400 to-yellow-500 text-white font-bold text-lg hover:scale-[1.02] transition-all disabled:opacity-50"
            >
              {loading ? <Loader size={24} className="animate-spin mx-auto" /> : '注册'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-white/40 text-sm">
              已有账号？ <Link to="/login" className="text-yellow-400 hover:underline">立即登录</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
