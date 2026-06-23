import { useState, useEffect } from 'react'
import { Card } from '@/components/Common/Card'
import { Badge } from '@/components/Common/Badge'
import { Button } from '@/components/Common/Button'
import { Input } from '@/components/Forms/Input'
import { supabase } from '@/lib/supabase'
import { Search, RefreshCw, Save, RotateCcw, Edit2, Check, X } from 'lucide-react'
import toast from 'react-hot-toast'

interface PriceConfig {
  id: string
  name: string
  category: string
  value: number
  unit: string
  status: string
  description: string
  updated_at: string
}

export const PriceControl = () => {
  const [configs, setConfigs] = useState<PriceConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState<number>(0)

  const loadConfigs = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('price_configs')
      .select('*')
      .order('category', { ascending: true })

    if (error) {
      toast.error('加载价格配置失败: ' + error.message)
    } else {
      setConfigs(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    loadConfigs()
  }, [])

  const handleUpdate = async (id: string) => {
    const { error } = await supabase
      .from('price_configs')
      .update({
        value: editValue,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) {
      toast.error('更新失败: ' + error.message)
    } else {
      toast.success('价格已更新')
      setEditingId(null)
      loadConfigs()
    }
  }

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
    const { error } = await supabase
      .from('price_configs')
      .update({ status: newStatus })
      .eq('id', id)

    if (error) {
      toast.error('更新状态失败: ' + error.message)
    } else {
      toast.success(`已${newStatus === 'active' ? '启用' : '停用'}`)
      loadConfigs()
    }
  }

  const resetToDefault = async () => {
    if (!confirm('确定要重置所有价格为默认值吗？')) return

    const defaultPrices = [
      { name: 'USDT 转账手续费', category: '转账费率', value: 0.5, unit: '%', description: 'USDT TRC20 转账手续费率' },
      { name: '最低手续费', category: '转账费率', value: 1, unit: 'USDT', description: '单笔转账最低手续费' },
      { name: 'USDT 充值手续费', category: '充值费率', value: 0, unit: '%', description: '用户充值手续费率' },
      { name: '最低充值金额', category: '充值费率', value: 10, unit: 'USDT', description: '单笔最低充值金额' },
      { name: 'USD/CNY 汇率', category: '汇率', value: 7.25, unit: 'CNY', description: '美元兑人民币汇率' },
      { name: 'USDT/USD 汇率', category: '汇率', value: 1, unit: 'USD', description: 'USDT 兑美元汇率' },
      { name: '一级邀请奖励', category: '邀请奖励', value: 5, unit: 'USDT', description: '直接邀请用户注册奖励' },
      { name: '二级邀请奖励', category: '邀请奖励', value: 2, unit: 'USDT', description: '间接邀请用户注册奖励' },
      { name: 'Twitter 检测', category: '平台检测价格', value: 0.5, unit: 'USDT', description: 'Twitter 账号检测费用' },
      { name: 'TikTok 检测', category: '平台检测价格', value: 0.5, unit: 'USDT', description: 'TikTok 账号检测费用' },
    ]

    let successCount = 0
    for (const item of defaultPrices) {
      const { error } = await supabase
        .from('price_configs')
        .upsert({
          ...item,
          status: 'active',
          updated_at: new Date().toISOString()
        }, { onConflict: 'name' })

      if (!error) successCount++
    }

    if (successCount > 0) {
      toast.success(`已重置 ${successCount} 项价格配置`)
      loadConfigs()
    } else {
      toast.error('重置失败')
    }
  }

  const categories = ['all', ...new Set(configs.map(c => c.category))]

  const filtered = configs.filter(c => {
    const matchSearch = c.name.includes(search) || c.description?.includes(search)
    const matchCategory = filterCategory === 'all' || !filterCategory || c.category === filterCategory
    return matchSearch && matchCategory
  })

  const grouped = filtered.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, PriceConfig[]>)

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
        {/* 头部 */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">价格控制台</h1>
            <p className="text-gray-400 text-sm">统一管理平台所有费率、汇率和价格配置</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadConfigs}>
              <RefreshCw size={16} className="mr-2" /> 刷新
            </Button>
            <Button variant="danger" onClick={resetToDefault}>
              <RotateCcw size={16} className="mr-2" /> 恢复默认
            </Button>
          </div>
        </div>

        {/* 搜索和筛选 */}
        <Card>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="搜索价格配置..."
                value={search}
                onChange={(e: any) => setSearch(e.target.value)}
                className="bg-[#1a1f35] border-gray-700 text-white"
                prefix={<Search size={16} className="text-gray-400" />}
              />
            </div>
            <select
              className="px-4 py-2 bg-[#1a1f35] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? '全部分类' : cat}
                </option>
              ))}
            </select>
            <Button variant="ghost" onClick={() => { setSearch(''); setFilterCategory('all') }}>
              重置
            </Button>
          </div>
        </Card>

        {/* 统计 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#12182b] border border-gray-800 rounded-lg p-4">
            <div className="text-gray-400 text-sm">总配置项</div>
            <div className="text-white text-2xl font-bold">{configs.length}</div>
          </div>
          <div className="bg-[#12182b] border border-gray-800 rounded-lg p-4">
            <div className="text-gray-400 text-sm">已启用</div>
            <div className="text-green-400 text-2xl font-bold">
              {configs.filter(c => c.status === 'active').length}
            </div>
          </div>
          <div className="bg-[#12182b] border border-gray-800 rounded-lg p-4">
            <div className="text-gray-400 text-sm">已停用</div>
            <div className="text-red-400 text-2xl font-bold">
              {configs.filter(c => c.status === 'inactive').length}
            </div>
          </div>
          <div className="bg-[#12182b] border border-gray-800 rounded-lg p-4">
            <div className="text-gray-400 text-sm">分类数</div>
            <div className="text-blue-400 text-2xl font-bold">
              {new Set(configs.map(c => c.category)).size}
            </div>
          </div>
        </div>

        {/* 价格列表 */}
        {Object.entries(grouped).map(([category, items]) => (
          <Card key={category}>
            <div className="p-4 border-b border-gray-800">
              <h2 className="text-lg font-semibold text-blue-400">{category}</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#1a1f35]">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">配置项</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">当前值</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">单位</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">状态</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-t border-gray-800 hover:bg-[#1a1f35]/50">
                      <td className="px-4 py-3 text-white text-sm">
                        {item.name}
                        <p className="text-gray-500 text-xs">{item.description}</p>
                      </td>
                      <td className="px-4 py-3">
                        {editingId === item.id ? (
                          <input
                            type="number"
                            step="0.01"
                            value={editValue}
                            onChange={(e) => setEditValue(parseFloat(e.target.value) || 0)}
                            className="w-24 px-2 py-1 bg-[#0a0f1f] border border-blue-500 rounded text-white focus:outline-none"
                            autoFocus
                          />
                        ) : (
                          <span className="text-white font-mono text-lg">{item.value}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-sm">{item.unit}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggleStatus(item.id, item.status)}
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            item.status === 'active'
                              ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                              : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                          }`}
                        >
                          {item.status === 'active' ? '✓ 启用' : '✗ 停用'}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        {editingId === item.id ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleUpdate(item.id)}
                              className="p-1.5 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="p-1.5 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingId(item.id)
                              setEditValue(item.value)
                            }}
                            className="p-1.5 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30"
                          >
                            <Edit2 size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            没有找到匹配的价格配置
          </div>
        )}
      </div>
    </div>
  )
}
