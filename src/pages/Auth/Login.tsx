import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Shield, Zap } from 'lucide-react'

export const Login = () => {
  const navigate = useNavigate()
  const { login } = useAuthStore()

  const handleLogin = () => {
    login({
      id: 'demo-001',
      name: '平台拥有者',
      email: 'admin@cs.com',
      phone: '',
      role: 'SuperAdmin',
      status: 'Active',
      balance: 99999,
      points: 99999,
      avatar: '',
      owner_id: '',
      owner_type: 'Platform',
      permissions: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, 'demo-token')
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-bg">
      <div className="w-full max-w-md bg-panel/90 backdrop-blur border border-border rounded-3xl p-8 shadow-glow">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue to-sky mb-4"><Shield className="text-white" size={32} /></div>
          <h1 className="text-3xl font-bold text-white">财盛集团</h1>
          <p className="text-muted text-sm mt-1">博亿研发中心 · V3.0</p>
        </div>
        <button onClick={handleLogin} className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-blue to-sky text-white font-bold text-lg hover:opacity-90 transition-opacity">
          <Zap size={24} /> 快速登录
        </button>
        <p className="text-xs text-muted text-center mt-4">点击进入系统（演示模式）</p>
        <div className="mt-4 p-3 rounded-xl bg-panel/50 border border-border text-center">
          <p className="text-xs text-muted">📋 演示账号</p>
          <p className="text-xs text-muted mt-1">角色：平台拥有者 (SuperAdmin)</p>
          <p className="text-xs text-muted">权限：全部权限</p>
        </div>
        <p className="text-xs text-muted text-center mt-6">© 2025 财盛集团</p>
      </div>
    </div>
  )
}
