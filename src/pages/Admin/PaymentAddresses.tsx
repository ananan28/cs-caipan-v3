import { useState, useEffect } from 'react'
import { Card } from '@/components/Common/Card'
import { Badge } from '@/components/Common/Badge'
import { Button } from '@/components/Common/Button'
import { Input } from '@/components/Forms/Input'
import { supabase } from '@/lib/supabase'
import {
  Wallet, Copy, RefreshCw, Plus, Edit2, Trash2,
  CheckCircle, XCircle, Star, StarOff, X
} from 'lucide-react'
import toast from 'react-hot-toast'

interface PaymentAddress {
  id: string
  address: string
  network: string
  label: string
  is_default: boolean
  status: 'active' | 'inactive'
  created_at: string
}

export const PaymentAddresses = () => {
  const [addresses, setAddresses] = useState<PaymentAddress[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    address: '',
    network: 'TRC20',
    label: ''
  })

  const loadAddresses = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('payment_addresses')
      .select('*')
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) {
      toast.error('加载地址失败: ' + error.message)
    } else {
      setAddresses(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    loadAddresses()
  }, [])

  const handleAdd = async () => {
    if (!formData.address || !formData.network) {
      toast.error('请填写完整信息')
      return
    }

    // 如果设为默认，取消其他默认
    const isDefault = addresses.length === 0

    const { error } = await supabase
      .from('payment_addresses')
      .insert({
        address: formData.address,
        network: formData.network,
        label: formData.label || formData.network,
        is_default: isDefault,
        status: 'active'
      })

    if (error) {
      toast.error('添加失败: ' + error.message)
    } else {
      toast.success('地址已添加')
      setShowAdd(false)
      setFormData({ address: '', network: 'TRC20', label: '' })
      loadAddresses()
    }
  }

  const handleSetDefault = async (id: string) => {
    // 取消所有默认
    await supabase
      .from('payment_addresses')
      .update({ is_default: false })
      .neq('id', id)

    const { error } = await supabase
      .from('payment_addresses')
      .update({ is_default: true })
      .eq('id', id)

    if (error) {
      toast.error('设置失败: ' + error.message)
    } else {
      toast.success('已设为默认')
      loadAddresses()
    }
  }

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
    const { error } = await supabase
      .from('payment_addresses')
      .update({ status: newStatus })
      .eq('id', id)

    if (error) {
      toast.error('更新失败: ' + error.message)
    } else {
      toast.success(newStatus === 'active' ? '已启用' : '已停用')
      loadAddresses()
    }
  }

  const handleDelete = async (id: string, address: string) => {
    if (!confirm(`确定要删除地址 ${address.slice(0, 10)}... 吗？`)) return

    const { error } = await supabase
      .from('payment_addresses')
      .delete()
      .eq('id', id)

    if (error) {
      toast.error('删除失败: ' + error.message)
    } else {
      toast.success('地址已删除')
      loadAddresses()
    }
  }

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address)
    toast.success('已复制')
  }

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
              <Wallet className="text-blue-400" />
              收款地址管理
            </h1>
            <p className="text-gray-400 text-sm">管理USDT收款地址</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadAddresses}>
              <RefreshCw size={16} className="mr-2" /> 刷新
            </Button>
            <Button variant="primary" onClick={() => setShowAdd(true)}>
              <Plus size={16} className="mr-2" /> 添加地址
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#12182b] border border-gray-800 rounded-lg p-4">
            <div className="text-gray-400 text-sm">总地址</div>
            <div className="text-white text-xl font-bold">{addresses.length}</div>
          </div>
          <div className="bg-[#12182b] border border-gray-800 rounded-lg p-4">
            <div className="text-gray-400 text-sm">已启用</div>
            <div className="text-green-400 text-xl font-bold">
              {addresses.filter(a => a.status === 'active').length}
            </div>
          </div>
          <div className="bg-[#12182b] border border-gray-800 rounded-lg p-4">
            <div className="text-gray-400 text-sm">默认地址</div>
            <div className="text-yellow-400 text-xl font-bold">
              {addresses.filter(a => a.is_default).length}
            </div>
          </div>
        </div>

        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#1a1f35]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">地址</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">网络</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">标签</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">状态</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">默认</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">操作</th>
                </tr>
              </thead>
              <tbody>
                {addresses.map((item) => (
                  <tr key={item.id} className="border-t border-gray-800 hover:bg-[#1a1f35]/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-white text-xs font-mono">{item.address.slice(0, 16)}...</span>
                        <button onClick={() => copyAddress(item.address)} className="text-gray-500 hover:text-white">
                          <Copy size={14} />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="info">{item.network}</Badge>
                    </td>
                    <td className="px-4 py-3 text-white">{item.label || '-'}</td>
                    <td className="px-4 py-3">
                      <Badge variant={item.status === 'active' ? 'success' : 'default'}>
                        {item.status === 'active' ? '启用' : '停用'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {item.is_default ? (
                        <Star className="text-yellow-400" size={18} />
                      ) : (
                        <button
                          onClick={() => handleSetDefault(item.id)}
                          className="text-gray-500 hover:text-yellow-400"
                          title="设为默认"
                        >
                          <StarOff size={18} />
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleToggleStatus(item.id, item.status)}
                          className="p-1.5 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30"
                          title="切换状态"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.address)}
                          className="p-1.5 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30"
                          title="删除"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {addresses.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-400">
                      暂无收款地址，点击"添加地址"创建
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* 添加弹窗 */}
        {showAdd && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-[#12182b] border border-gray-800 rounded-2xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">添加收款地址</h2>
                <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-white">
                  <X size={24} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-white text-sm font-medium block mb-1">地址</label>
                  <Input
                    value={formData.address}
                    onChange={(e: any) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="TA1k..."
                    className="bg-[#1a1f35] border-gray-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-white text-sm font-medium block mb-1">网络</label>
                  <select
                    value={formData.network}
                    onChange={(e) => setFormData({ ...formData, network: e.target.value })}
                    className="w-full px-4 py-2 bg-[#1a1f35] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="TRC20">TRC20</option>
                    <option value="ERC20">ERC20</option>
                    <option value="BEP20">BEP20</option>
                  </select>
                </div>
                <div>
                  <label className="text-white text-sm font-medium block mb-1">标签</label>
                  <Input
                    value={formData.label}
                    onChange={(e: any) => setFormData({ ...formData, label: e.target.value })}
                    placeholder="例如: 主钱包"
                    className="bg-[#1a1f35] border-gray-700 text-white"
                  />
                </div>
                <Button className="w-full" onClick={handleAdd}>添加</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
