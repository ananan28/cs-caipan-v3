import { useState, useEffect } from 'react'
import { Card } from '@/components/Common/Card'
import { Badge } from '@/components/Common/Badge'
import { Button } from '@/components/Common/Button'
import { Input } from '@/components/Forms/Input'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import {
  Users, Copy, Gift, RefreshCw, Search, CheckCircle,
  Award, Star, TrendingUp, Link, Share2, UserPlus
} from 'lucide-react'
import toast from 'react-hot-toast'

interface InviteRecord {
  id: string
  inviter_id: string
  invitee_id: string
  invitee_email: string
  level: number
  reward: number
  status: string
  created_at: string
}

export const Invites = () => {
  const { user } = useAuthStore()
  const [invites, setInvites] = useState<InviteRecord[]>([])
  const [stats, setStats] = useState({
    total: 0,
    level1: 0,
    level2: 0,
    totalReward: 0
  })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [inviteLink, setInviteLink] = useState('')

  const loadInvites = async () => {
    setLoading(true)

    // 直接查询 invites 表，不关联 users
    const { data, error } = await supabase
      .from('invites')
      .select('*')
      .eq('inviter_id', user?.id)
      .order('created_at', { ascending: false })

    if (error) {
      toast.error('加载邀请记录失败: ' + error.message)
      setInvites([])
    } else {
      setInvites(data || [])
      const level1 = data?.filter(i => i.level === 1).length || 0
      const level2 = data?.filter(i => i.level === 2).length || 0
      const totalReward = data?.reduce((sum, i) => sum + (i.reward || 0), 0) || 0
      setStats({
        total: data?.length || 0,
        level1,
        level2,
        totalReward
      })
    }
    setLoading(false)
  }

  useEffect(() => {
    loadInvites()
    if (user?.id) {
      setInviteLink(`${window.location.origin}/register?ref=${user.id}`)
    }
  }, [user])

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink)
    toast.success('邀请链接已复制')
  }

  const filtered = invites.filter(i => {
    return i.invitee_email?.includes(search) || i.id.includes(search)
  })

  if (loading) {
    return (
      <div className="p-6 bg-[#0a0f1f] min-h-screen flex items-center justify-center">
        <div className="text-gray-400">加载中...</div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-[#0a0f1f] min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <UserPlus className="text-blue-400" />
              邀请系统
            </h1>
            <p className="text-gray-400 text-sm">邀请好友，赚取奖励</p>
          </div>
          <Button variant="outline" onClick={loadInvites}>
            <RefreshCw size={16} className="mr-2" /> 刷新
          </Button>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-lg p-4">
            <div className="text-gray-400 text-sm">总邀请</div>
            <div className="text-white text-2xl font-bold">{stats.total}</div>
          </div>
          <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-lg p-4">
            <div className="text-gray-400 text-sm">一级邀请</div>
            <div className="text-green-400 text-2xl font-bold">{stats.level1}</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-lg p-4">
            <div className="text-gray-400 text-sm">二级邀请</div>
            <div className="text-purple-400 text-2xl font-bold">{stats.level2}</div>
          </div>
          <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border border-yellow-500/20 rounded-lg p-4">
            <div className="text-gray-400 text-sm">总奖励</div>
            <div className="text-yellow-400 text-2xl font-bold">${stats.totalReward.toFixed(2)}</div>
          </div>
        </div>

        {/* 邀请链接 */}
        <Card className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-blue-500/30">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <p className="text-white text-sm font-medium">邀请链接</p>
              <p className="text-gray-400 text-xs break-all font-mono">{inviteLink || '加载中...'}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="primary" onClick={copyInviteLink}>
                <Copy size={16} className="mr-2" /> 复制链接
              </Button>
              <Button variant="outline">
                <Share2 size={16} className="mr-2" /> 分享
              </Button>
            </div>
          </div>
        </Card>

        {/* 搜索 */}
        <Card>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="搜索邀请记录..."
                value={search}
                onChange={(e: any) => setSearch(e.target.value)}
                className="bg-[#1a1f35] border-gray-700 text-white"
                prefix={<Search size={16} className="text-gray-400" />}
              />
            </div>
          </div>
        </Card>

        {/* 邀请列表 */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#1a1f35]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">被邀请人</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">等级</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">奖励</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">状态</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">时间</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((invite) => (
                  <tr key={invite.id} className="border-t border-gray-800 hover:bg-[#1a1f35]/50">
                    <td className="px-4 py-3 text-white text-sm">
                      {invite.invitee_email || invite.invitee_id?.slice(0, 8) || '未知'}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={invite.level === 1 ? 'info' : 'purple'}>
                        {invite.level === 1 ? '一级' : '二级'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-green-400 text-sm font-medium">
                      ${(invite.reward || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={invite.status === 'completed' ? 'success' : 'warning'}>
                        {invite.status === 'completed' ? '已到账' : '待确认'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-sm">
                      {new Date(invite.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-400">
                      暂无邀请记录，快去邀请好友吧！
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}
