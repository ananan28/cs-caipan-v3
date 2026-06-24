import { useState } from 'react'
import { Card } from '@/components/Common/Card'
import { Button } from '@/components/Common/Button'
import { supabase } from '@/lib/supabase'
import { 
  Download, Users, FileText, Wallet, TrendingUp,
  CheckSquare, RefreshCw, Loader
} from 'lucide-react'
import toast from 'react-hot-toast'
import { exportToCSV } from '../../utils/export'

export const DataExport = () => {
  const [loading, setLoading] = useState<string | null>(null)

  const exportData = async (table: string, filename: string, columns: string[]) => {
    setLoading(table)
    try {
      const { data, error } = await supabase
        .from(table)
        .select(columns.join(','))
        .order('created_at', { ascending: false })

      if (error) throw error

      if (data && data.length > 0) {
        exportToCSV(data, filename, columns)
        toast.success(`${filename} 导出成功`)
      } else {
        toast.warning('没有数据可导出')
      }
    } catch (error) {
      toast.error('导出失败: ' + (error as Error).message)
    }
    setLoading(null)
  }

  const exportItems = [
    { table: 'users', filename: '用户列表', columns: ['email', 'username', 'role', 'status', 'created_at'], icon: Users, color: 'blue' },
    { table: 'transactions', filename: '交易记录', columns: ['user_id', 'type', 'amount', 'status', 'description', 'created_at'], icon: FileText, color: 'purple' },
    { table: 'recharge_orders', filename: '充值记录', columns: ['user_id', 'amount', 'usdt_amount', 'rate', 'points', 'address', 'status', 'created_at'], icon: Wallet, color: 'green' },
    { table: 'tasks', filename: '任务记录', columns: ['user_id', 'platform', 'items', 'total_price', 'status', 'created_at'], icon: CheckSquare, color: 'orange' },
  ]

  return (
    <div className="p-6 bg-[#f0f2f5] min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">数据导出</h1>
            <p className="text-gray-500 text-sm">导出各模块数据为 CSV 文件</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {exportItems.map((item) => {
            const Icon = item.icon
            return (
              <Card key={item.table} className="border border-gray-200 hover:border-yellow-300 transition-colors">
                <div className="flex items-center justify-between p-6">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl bg-${item.color}-100`}>
                      <Icon className={`text-${item.color}-500`} size={24} />
                    </div>
                    <div>
                      <h3 className="text-gray-900 font-semibold">{item.filename}</h3>
                      <p className="text-gray-400 text-sm">导出 CSV 格式</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => exportData(item.table, item.filename, item.columns)}
                    disabled={loading === item.table}
                  >
                    {loading === item.table ? (
                      <Loader size={16} className="animate-spin mr-2" />
                    ) : (
                      <Download size={16} className="mr-2" />
                    )}
                    {loading === item.table ? '导出中...' : '导出'}
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>

        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <p className="text-yellow-800 text-sm">💡 所有导出文件为 CSV 格式，可用 Excel 打开</p>
        </div>
      </div>
    </div>
  )
}
