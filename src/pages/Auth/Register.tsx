import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/Common/Button'
import { Input } from '@/components/Forms/Input'
import { toast } from 'react-hot-toast'

export const Register = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    inviteCode: '',
    verificationCode: ''
  })
  const [codeSent, setCodeSent] = useState(false)
  const [countdown, setCountdown] = useState(0)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  // 发送验证码
  const sendVerificationCode = async () => {
    // 清理邮箱（去除空格）
    const email = form.email.trim()
    if (!email) {
      toast.error('请先输入邮箱')
      return
    }

    // 简单邮箱格式验证
    if (!email.includes('@') || !email.includes('.')) {
      toast.error('请输入有效的邮箱地址')
      return
    }

    setLoading(true)
    try {
      // 检查邮箱是否已注册
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .maybeSingle()

      if (existing) {
        toast.error('该邮箱已注册，请直接登录')
        setLoading(false)
        return
      }

      // 使用 Supabase 的 OTP 发送验证码
      const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          shouldCreateUser: false,
          emailRedirectTo: window.location.origin + '/login'
        }
      })

      if (error) {
        console.error('发送验证码错误:', error)
        toast.error('验证码发送失败: ' + error.message)
      } else {
        setCodeSent(true)
        toast.success('验证码已发送到您的邮箱，请检查垃圾邮件箱')
        let time = 60
        setCountdown(time)
        const timer = setInterval(() => {
          time--
          setCountdown(time)
          if (time <= 0) clearInterval(timer)
        }, 1000)
      }
    } catch (error: any) {
      console.error('发送失败:', error)
      toast.error('发送失败: ' + (error.message || '未知错误'))
    }
    setLoading(false)
  }

  // 注册提交
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

    if (!form.verificationCode) {
      toast.error('请输入邮箱验证码')
      return
    }

    setLoading(true)

    try {
      // 验证验证码
      const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
        email: email,
        token: form.verificationCode,
        type: 'email'
      })

      if (verifyError) {
        toast.error('验证码错误或已过期: ' + verifyError.message)
        setLoading(false)
        return
      }

      // 注册用户
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: form.password,
        options: {
          data: {
            username: username,
            invite_code: form.inviteCode || null
          }
        }
      })

      if (error) {
        toast.error('注册失败: ' + error.message)
      } else {
        toast.success('注册成功！请登录')
        navigate('/login')
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
            <div className="flex gap-2">
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="请输入邮箱"
                className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-400"
              />
              <button
                type="button"
                onClick={sendVerificationCode}
                disabled={loading || countdown > 0}
                className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg whitespace-nowrap disabled:opacity-50"
              >
                {countdown > 0 ? `${countdown}s` : '获取验证码'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">邮箱验证码 *</label>
            <input
              name="verificationCode"
              value={form.verificationCode}
              onChange={handleChange}
              placeholder="请输入6位验证码"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-400"
            />
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
