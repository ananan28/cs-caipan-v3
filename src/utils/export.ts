// 导出为 CSV
export const exportToCSV = (data: any[], filename: string, headers: string[]) => {
  if (!data || data.length === 0) {
    console.warn('没有数据可导出')
    return
  }

  let csv = headers.join(',') + '\n'
  
  data.forEach(row => {
    const values = headers.map(h => {
      let val = row[h] !== undefined ? row[h] : ''
      if (typeof val === 'string') {
        val = val.replace(/"/g, '""')
        if (val.includes(',') || val.includes('"') || val.includes('\n')) {
          val = `"${val}"`
        }
      }
      return val
    })
    csv += values.join(',') + '\n'
  })

  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${filename}_${new Date().toISOString().slice(0,10)}.csv`
  link.click()
  URL.revokeObjectURL(link.href)
}

// 导出用户列表
export const exportUsers = async (supabase: any) => {
  const { data } = await supabase.from('users').select('email, username, role, status, created_at')
  if (data) exportToCSV(data, 'users', ['email', 'username', 'role', 'status', 'created_at'])
}

// 导出交易记录
export const exportTransactions = async (supabase: any) => {
  const { data } = await supabase
    .from('transactions')
    .select('user_id, type, amount, status, description, created_at')
  if (data) exportToCSV(data, 'transactions', ['user_id', 'type', 'amount', 'status', 'description', 'created_at'])
}

// 导出充值记录
export const exportRechargeOrders = async (supabase: any) => {
  const { data } = await supabase
    .from('recharge_orders')
    .select('user_id, amount, usdt_amount, rate, points, address, status, created_at')
  if (data) exportToCSV(data, 'recharge_orders', ['user_id', 'amount', 'usdt_amount', 'rate', 'points', 'address', 'status', 'created_at'])
}

// 导出任务记录
export const exportTasks = async (supabase: any) => {
  const { data } = await supabase
    .from('tasks')
    .select('user_id, platform, items, total_price, status, created_at')
  if (data) exportToCSV(data, 'tasks', ['user_id', 'platform', 'items', 'total_price', 'status', 'created_at'])
}
