import { useState } from 'react'
import { Card } from '@/components/Common/Card'
import { Badge } from '@/components/Common/Badge'
import { Button } from '@/components/Common/Button'
import { Gift, Copy, Users, Calendar, CheckCircle, Clock, Share2, Send, Link2, QrCode } from 'lucide-react'
import toast from 'react-hot-toast'

export const Invites = () => {
  const [inviteCode, setInviteCode] = useState('INVITE-' + Math.random().toString(36).substring(2, 8).toUpperCase())

  const invites = [
    { id: 1, code: 'INVITE-ABC123', invited: 'user@example.com', status: 'registered', time: '2025-06-22 14:30' },
    { id: 2, code: 'INVITE-DEF456', invited: '---', status: 'pending', time: '2025-06-21 10:15' },
    { id: 3, code: 'INVITE-GHI789', invited: 'admin@cs.com', status: 'registered', time: '2025-06-20 16:45' },
    { id: 4, code: 'INVITE-JKL012', invited: '---', status: 'pending', time: '2025-06-19 09:00' },
  ]

  const stats = [
    { label: '邀请总数', value: invites.length, icon: Users, color: 'text-blue' },
    { label: '已注册', value: invites.filter(i => i.status === 'registered').length, icon: CheckCircle, color: 'text-green' },
    { label: '待注册', value: invites.filter(i => i.status === 'pending').length, icon: Clock, color: 'text-orange' },
    { label: '本月新增', value: '5', icon: Calendar, color: 'text-purple' },
  ]

  // 获取当前网站的域名
  const getBaseUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.origin
    }
    return 'https://cs.com'
  }

  // 生成邀请链接
  const getInviteLink = () => {
    const baseUrl = getBaseUrl()
    return `${baseUrl}/register?invite=${inviteCode}`
  }

  // ✅ 复制邀请链接
  const handleCopyLink = () => {
    const link = getInviteLink()
    navigator.clipboard.writeText(link).then(() => {
      toast.success('✅ 邀请链接已复制！')
      toast.info(`📋 ${link}`)
    }).catch(() => {
      // 如果剪贴板不支持，显示链接让用户手动复制
      toast.info(`📋 请复制链接: ${link}`)
    })
  }

  // ✅ 分享功能（使用 Web Share API）
  const handleShare = async () => {
    const link = getInviteLink()
    const shareData = {
      title: '邀请您加入财盛集团',
      text: `🎁 快来注册吧！使用我的邀请码 ${inviteCode} 注册，双方都可获得积分奖励！`,
      url: link
    }

    // 检测是否支持 Web Share API
    if (navigator.share) {
      try {
        await navigator.share(shareData)
        toast.success('✅ 分享成功！')
      } catch (error) {
        if ((error as any).name !== 'AbortError') {
          toast.error('分享取消或失败')
        }
      }
    } else {
      // 降级方案：复制链接
      await handleCopyLink()
      toast.info('💡 您也可以复制链接分享给朋友')
    }
  }

  // ✅ 生成新邀请码
  const handleGenerateNew = () => {
    const newCode = 'INVITE-' + Math.random().toString(36).substring(2, 8).toUpperCase()
    setInviteCode(newCode)
    toast.success(`✅ 已生成新邀请码: ${newCode}`)
  }

  // ✅ 复制邀请码
  const handleCopyCode = () => {
    navigator.clipboard.writeText(inviteCode).then(() => {
      toast.success('✅ 邀请码已复制！')
    }).catch(() => {
      toast.info(`📋 邀请码: ${inviteCode}`)
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">邀请系统</h1>
          <p className="text-muted text-sm">邀请好友，赚取积分</p>
        </div>
        <Button variant="primary" onClick={handleGenerateNew}>
          <Gift size={18} className="mr-2" />
          生成邀请码
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i}>
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-muted">{stat.label}</p><p className="text-2xl font-bold text-white mt-1">{stat.value}</p></div>
              <div className={`p-3 rounded-xl bg-${stat.color.split('-')[1]}/10 ${stat.color}`}><stat.icon size={24} /></div>
            </div>
          </Card>
        ))}
      </div>

      <Card title="我的邀请码" subtitle="分享给朋友注册">
        <div className="flex flex-wrap items-center gap-4 p-4 rounded-xl bg-panel/50">
          <code className="flex-1 text-lg font-mono text-sky">{inviteCode}</code>
          <div className="flex gap-2 flex-wrap">
            <Button variant="ghost" size="sm" onClick={handleCopyCode}>
              <Copy size={16} className="mr-1" />复制码
            </Button>
            <Button variant="ghost" size="sm" onClick={handleCopyLink}>
              <Link2 size={16} className="mr-1" />复制链接
            </Button>
            <Button variant="primary" size="sm" onClick={handleShare}>
              <Share2 size={16} className="mr-1" />分享
            </Button>
          </div>
        </div>
        <div className="mt-3 p-3 rounded-xl bg-panel/50 border border-border">
          <p className="text-sm text-muted">🔗 邀请链接</p>
          <p className="text-xs text-sky font-mono break-all">{getInviteLink()}</p>
        </div>
        <p className="text-xs text-muted mt-2">🎁 邀请好友注册，双方都可获得 100 积分奖励</p>
      </Card>

      <Card title="邀请记录">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs font-bold text-muted uppercase py-3 px-4">邀请码</th>
                <th className="text-left text-xs font-bold text-muted uppercase py-3 px-4">被邀请人</th>
                <th className="text-left text-xs font-bold text-muted uppercase py-3 px-4">状态</th>
                <th className="text-left text-xs font-bold text-muted uppercase py-3 px-4">时间</th>
                <th className="text-left text-xs font-bold text-muted uppercase py-3 px-4">操作</th>
              </tr>
            </thead>
            <tbody>
              {invites.map(inv => (
                <tr key={inv.id} className="border-b border-border/50 hover:bg-panel/50">
                  <td className="py-3 px-4 text-white font-mono text-sm">{inv.code}</td>
                  <td className="py-3 px-4 text-white">{inv.invited}</td>
                  <td className="py-3 px-4"><Badge variant={inv.status === 'registered' ? 'green' : 'orange'}>{inv.status === 'registered' ? '✅ 已注册' : '⏳ 待注册'}</Badge></td>
                  <td className="py-3 px-4 text-sm text-muted">{inv.time}</td>
                  <td className="py-3 px-4">
                    {inv.status === 'pending' && (
                      <button className="p-1.5 rounded-lg hover:bg-blue/10 text-blue">
                        <Send size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
