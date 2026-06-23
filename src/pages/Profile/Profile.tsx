import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { Card } from '@/components/Common/Card'
import { Badge } from '@/components/Common/Badge'
import { Button } from '@/components/Common/Button'
import { Input } from '@/components/Forms/Input'
import { 
  User, Mail, Phone, Lock, Camera, Shield,
  Award, Clock, CheckCircle, Edit, Save,
  Key, Fingerprint, Smartphone, Globe
} from 'lucide-react'

export const Profile = () => {
  const { user, updateUser } = useAuthStore()
  const [name, setName] = useState(user?.name || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [activeTab, setActiveTab] = useState('profile')

  const handleSaveProfile = () => {
    updateUser({ name, phone })
    alert('✅ 资料已保存！')
  }

  const handleChangePassword = () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      alert('请填写所有密码字段')
      return
    }
    if (newPassword !== confirmPassword) {
      alert('两次密码输入不一致')
      return
    }
    if (newPassword.length < 6) {
      alert('密码长度至少6位')
      return
    }
    alert('✅ 密码已修改！')
    setOldPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">个人中心</h1>
        <p className="text-muted text-sm">管理个人资料和密码</p>
      </div>

      {/* Tab 切换 */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setActiveTab('profile')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'profile' ? 'bg-blue text-white' : 'bg-panel/50 text-muted hover:text-white'}`}>👤 个人资料</button>
        <button onClick={() => setActiveTab('security')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'security' ? 'bg-blue text-white' : 'bg-panel/50 text-muted hover:text-white'}`}>🔐 安全设置</button>
        <button onClick={() => setActiveTab('activity')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'activity' ? 'bg-blue text-white' : 'bg-panel/50 text-muted hover:text-white'}`}>📊 活动记录</button>
      </div>

      {/* 个人资料 */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2">
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-panel/50">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue to-sky flex items-center justify-center text-3xl font-bold text-white">
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <div className="text-xl font-bold text-white">{user?.name}</div>
                  <div className="text-sm text-muted">{user?.role}</div>
                  <div className="text-sm text-muted">{user?.email}</div>
                </div>
                <button className="ml-auto p-2 rounded-xl bg-panel/50 border border-border hover:border-sky/30">
                  <Camera size={20} className="text-muted" />
                </button>
              </div>

              <Input label="用户名" value={name} onChange={(e) => setName(e.target.value)} icon={<User size={18} />} />
              <Input label="邮箱" value={user?.email || ''} disabled icon={<Mail size={18} />} />
              <Input label="手机号" value={phone} onChange={(e) => setPhone(e.target.value)} icon={<Phone size={18} />} />
              <Button variant="primary" className="w-full" onClick={handleSaveProfile}>
                <Save size={18} className="mr-2" />
                保存资料
              </Button>
            </div>
          </Card>

          <Card title="账户信息">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-panel/50"><span className="text-muted">用户ID</span><span className="text-white font-mono text-sm">{user?.id || 'N/A'}</span></div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-panel/50"><span className="text-muted">角色</span><Badge variant="blue">{user?.role}</Badge></div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-panel/50"><span className="text-muted">状态</span><Badge variant="green">{user?.status}</Badge></div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-panel/50"><span className="text-muted">注册时间</span><span className="text-sm text-muted">{user?.created_at?.slice(0, 16) || '2025-06-22'}</span></div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-panel/50"><span className="text-muted">最后登录</span><span className="text-sm text-muted">2025-06-22 14:30</span></div>
            </div>
          </Card>
        </div>
      )}

      {/* 安全设置 */}
      {activeTab === 'security' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card title="修改登录密码">
            <div className="space-y-4">
              <Input label="当前密码" type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} icon={<Lock size={18} />} />
              <Input label="新密码" type="password" placeholder="至少6位" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} icon={<Key size={18} />} />
              <Input label="确认新密码" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} icon={<Lock size={18} />} />
              <Button variant="primary" className="w-full" onClick={handleChangePassword}>修改密码</Button>
            </div>
          </Card>
          <Card title="安全状态">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-panel/50"><span className="text-muted">登录密码</span><Badge variant="green">已设置</Badge></div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-panel/50"><span className="text-muted">交易密码</span><Badge variant="orange">未设置</Badge></div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-panel/50"><span className="text-muted">双因素认证</span><Badge variant="orange">未启用</Badge></div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-panel/50"><span className="text-muted">登录设备</span><span className="text-sm text-muted">1 台</span></div>
            </div>
          </Card>
        </div>
      )}

      {/* 活动记录 */}
      {activeTab === 'activity' && (
        <Card>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-panel/50">
              <div><span className="text-white">登录成功</span><p className="text-xs text-muted">2025-06-22 14:30</p></div>
              <Badge variant="green">成功</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-panel/50">
              <div><span className="text-white">查看钱包</span><p className="text-xs text-muted">2025-06-22 14:25</p></div>
              <Badge variant="green">成功</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-panel/50">
              <div><span className="text-white">修改资料</span><p className="text-xs text-muted">2025-06-22 14:20</p></div>
              <Badge variant="green">成功</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-panel/50">
              <div><span className="text-white">登录失败</span><p className="text-xs text-muted">2025-06-22 14:10</p></div>
              <Badge variant="red">失败</Badge>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
