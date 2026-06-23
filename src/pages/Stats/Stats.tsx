import { useState } from 'react'
import { Card } from '@/components/Common/Card'
import { Badge } from '@/components/Common/Badge'
import { Button } from '@/components/Common/Button'
import { 
  TrendingUp, TrendingDown, Users, DollarSign, 
  Activity, Calendar, Download, RefreshCw,
  BarChart3, PieChart, LineChart, AreaChart,
  ArrowUp, ArrowDown, Clock, Zap
} from 'lucide-react'
import toast from 'react-hot-toast'

export const Stats = () => {
  const [timeRange, setTimeRange] = useState('7d')

  const stats = [
    { label: '总用户', value: '1,234', change: '+12%', trend: 'up', icon: Users, color: 'text-blue' },
    { label: '总积分', value: '1,234,567', change: '+8%', trend: 'up', icon: DollarSign, color: 'text-green' },
    { label: '今日活跃', value: '89', change: '+5%', trend: 'up', icon: Activity, color: 'text-orange' },
    { label: '今日充值', value: '¥3,456', change: '+3%', trend: 'up', icon: TrendingUp, color: 'text-purple' },
  ]

  const dailyData = [
    { day: '周一', users: 120, points: 5000, recharge: 1200 },
    { day: '周二', users: 135, points: 6800, recharge: 1800 },
    { day: '周三', users: 110, points: 4500, recharge: 900 },
    { day: '周四', users: 145, points: 7200, recharge: 2200 },
    { day: '周五', users: 160, points: 8500, recharge: 2800 },
    { day: '周六', users: 130, points: 6200, recharge: 1500 },
    { day: '周日', users: 100, points: 3800, recharge: 800 },
  ]

  const topUsers = [
    { name: 'admin@cs.com', points: 99999, recharge: 5000 },
    { name: 'user@example.com', points: 45000, recharge: 2300 },
    { name: 'agent@cs.com', points: 32000, recharge: 1800 },
    { name: 'finance@cs.com', points: 28000, recharge: 1200 },
    { name: 'user@cs.com', points: 15000, recharge: 800 },
  ]

  // ✅ 导出CSV
  const exportCSV = () => {
    try {
      const data = dailyData.map(d => ({
        '日期': d.day,
        '用户数': d.users,
        '积分': d.points,
        '充值金额': d.recharge
      }))
      
      let csv = '日期,用户数,积分,充值金额\n'
      data.forEach(row => {
        csv += `${row['日期']},${row['用户数']},${row['积分']},${row['充值金额']}\n`
      })

      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `数据统计_${new Date().toISOString().slice(0, 10)}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('✅ CSV已导出')
    } catch (error) {
      toast.error('导出失败')
    }
  }

  // ✅ 导出JSON
  const exportJSON = () => {
    try {
      const data = dailyData.map(d => ({
        '日期': d.day,
        '用户数': d.users,
        '积分': d.points,
        '充值金额': d.recharge
      }))
      
      const json = JSON.stringify(data, null, 2)
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `数据统计_${new Date().toISOString().slice(0, 10)}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('✅ JSON已导出')
    } catch (error) {
      toast.error('导出失败')
    }
  }

  // ✅ 导出Excel
  const exportExcel = () => {
    try {
      const data = dailyData.map(d => ({
        '日期': d.day,
        '用户数': d.users,
        '积分': d.points,
        '充值金额': d.recharge
      }))
      
      let html = `<html><head><meta charset="UTF-8"><style>td{mso-number-format:"@"}</style></head><body><table><tr><th>日期</th><th>用户数</th><th>积分</th><th>充值金额</th></tr>`
      data.forEach(row => {
        html += `<tr><td>${row['日期']}</td><td>${row['用户数']}</td><td>${row['积分']}</td><td>${row['充值金额']}</td></tr>`
      })
      html += '</table></body></html>'
      
      const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `数据统计_${new Date().toISOString().slice(0, 10)}.xls`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('✅ Excel已导出')
    } catch (error) {
      toast.error('导出失败')
    }
  }

  // ✅ 导出PDF（打印）
  const exportPDF = () => {
    try {
      const printWindow = window.open('', '_blank')
      if (!printWindow) {
        toast.error('请允许弹出窗口')
        return
      }
      
      const data = dailyData.map(d => ({
        '日期': d.day,
        '用户数': d.users,
        '积分': d.points,
        '充值金额': d.recharge
      }))
      
      let html = `<html><head><title>数据统计</title><style>body{font-family:Arial;padding:20px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}</style></head><body><h1>数据统计报表</h1><p>生成时间: ${new Date().toLocaleString()}</p><table><tr><th>日期</th><th>用户数</th><th>积分</th><th>充值金额</th></tr>`
      data.forEach(row => {
        html += `<tr><td>${row['日期']}</td><td>${row['用户数']}</td><td>${row['积分']}</td><td>${row['充值金额']}</td></tr>`
      })
      html += '</table></body></html>'
      
      printWindow.document.write(html)
      printWindow.document.close()
      setTimeout(() => {
        printWindow.print()
      }, 300)
      toast.success('✅ PDF已发送到打印机')
    } catch (error) {
      toast.error('导出失败')
    }
  }

  const handleExport = (format: string) => {
    switch(format) {
      case 'csv': exportCSV(); break
      case 'json': exportJSON(); break
      case 'excel': exportExcel(); break
      case 'pdf': exportPDF(); break
      default: toast.error('未知格式')
    }
  }

  const maxPoints = Math.max(...dailyData.map(d => d.points))
  const maxRecharge = Math.max(...dailyData.map(d => d.recharge))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">数据统计</h1>
          <p className="text-muted text-sm">平台运营数据概览</p>
        </div>
        <div className="flex gap-2">
          <div className="flex gap-1 bg-panel/50 rounded-xl p-1">
            <button onClick={() => setTimeRange('7d')} className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${timeRange === '7d' ? 'bg-blue text-white' : 'text-muted hover:text-white'}`}>7天</button>
            <button onClick={() => setTimeRange('30d')} className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${timeRange === '30d' ? 'bg-blue text-white' : 'text-muted hover:text-white'}`}>30天</button>
            <button onClick={() => setTimeRange('90d')} className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${timeRange === '90d' ? 'bg-blue text-white' : 'text-muted hover:text-white'}`}>90天</button>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={() => handleExport('csv')}>CSV</Button>
            <Button variant="ghost" size="sm" onClick={() => handleExport('json')}>JSON</Button>
            <Button variant="ghost" size="sm" onClick={() => handleExport('excel')}>Excel</Button>
            <Button variant="ghost" size="sm" onClick={() => handleExport('pdf')}>PDF</Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted">{stat.label}</p>
                <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                <p className={`text-xs mt-1 ${stat.trend === 'up' ? 'text-green' : 'text-red'}`}>{stat.change} {stat.trend === 'up' ? '↑' : '↓'}</p>
              </div>
              <div className={`p-3 rounded-xl bg-${stat.color.split('-')[1]}/10 ${stat.color}`}><stat.icon size={24} /></div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="📊 每日数据趋势">
          <div className="space-y-3">
            {dailyData.map((d, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-sm text-muted w-10">{d.day}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="h-6 bg-blue/20 rounded-full overflow-hidden flex-1">
                      <div className="h-full bg-blue rounded-full transition-all" style={{ width: `${(d.points / maxPoints) * 100}%` }} />
                    </div>
                    <span className="text-xs text-muted w-16 text-right">{d.points}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="h-4 bg-green/20 rounded-full overflow-hidden flex-1">
                      <div className="h-full bg-green rounded-full transition-all" style={{ width: `${(d.recharge / maxRecharge) * 100}%` }} />
                    </div>
                    <span className="text-xs text-muted w-16 text-right">¥{d.recharge}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-3 text-xs text-muted">
            <span><span className="inline-block w-3 h-3 bg-blue rounded-full mr-1" /> 积分</span>
            <span><span className="inline-block w-3 h-3 bg-green rounded-full mr-1" /> 充值</span>
          </div>
        </Card>

        <Card title="🏆 用户积分排行">
          <div className="space-y-3">
            {topUsers.map((u, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-panel/50">
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-yellow/20 text-yellow' : i === 1 ? 'bg-gray/20 text-gray-300' : i === 2 ? 'bg-orange/20 text-orange' : 'bg-panel/50 text-muted'}`}>{i + 1}</span>
                  <span className="text-white text-sm">{u.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-blue font-bold">{u.points.toLocaleString()}</span>
                  <span className="text-xs text-muted ml-2">¥{u.recharge}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card title="📈 平台概览">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 rounded-xl bg-panel/50">
            <p className="text-xs text-muted">总交易</p>
            <p className="text-xl font-bold text-white">1,234</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-panel/50">
            <p className="text-xs text-muted">总充值</p>
            <p className="text-xl font-bold text-green">¥45,678</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-panel/50">
            <p className="text-xs text-muted">总消耗</p>
            <p className="text-xl font-bold text-orange">¥23,456</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-panel/50">
            <p className="text-xs text-muted">平台收入</p>
            <p className="text-xl font-bold text-purple">¥22,222</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
