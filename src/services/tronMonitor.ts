import { supabase } from '../lib/supabase'

const TRONGRID_API = 'https://api.trongrid.io'
const USDT_CONTRACT = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t'
const API_KEY = import.meta.env.VITE_TRONGRID_API_KEY || ''

export const getTransactions = async (address: string, limit: number = 20) => {
  try {
    const headers: HeadersInit = {}
    if (API_KEY) {
      headers['Authorization'] = `Bearer ${API_KEY}`
    }

    const response = await fetch(
      `${TRONGRID_API}/v1/accounts/${address}/transactions/trc20?limit=${limit}&only_confirmed=true&contract_address=${USDT_CONTRACT}`,
      { headers }
    )
    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error('获取交易失败:', error)
    return []
  }
}

export const getBalance = async (address: string) => {
  try {
    const headers: HeadersInit = {}
    if (API_KEY) {
      headers['Authorization'] = `Bearer ${API_KEY}`
    }

    const response = await fetch(
      `${TRONGRID_API}/v1/accounts/${address}`,
      { headers }
    )
    const data = await response.json()
    if (data.data && data.data.length > 0) {
      const trc20 = data.data[0].trc20 || []
      for (const item of trc20) {
        if (item[USDT_CONTRACT]) {
          return parseFloat(item[USDT_CONTRACT]) / 1e6
        }
      }
    }
    return 0
  } catch (error) {
    console.error('获取余额失败:', error)
    return 0
  }
}

export const checkRechargeOrders = async () => {
  const { data: orders } = await supabase
    .from('recharge_orders')
    .select('*')
    .in('status', ['pending', 'paid'])
    .order('created_at', { ascending: false })

  if (!orders || orders.length === 0) return

  for (const order of orders) {
    const balance = await getBalance(order.address)
    
    if (balance >= order.amount) {
      await supabase
        .from('recharge_orders')
        .update({
          status: 'completed',
          confirmed_at: new Date().toISOString()
        })
        .eq('id', order.id)

      const { data: wallet } = await supabase
        .from('wallets')
        .select('points')
        .eq('user_id', order.user_id)
        .single()

      if (wallet) {
        await supabase
          .from('wallets')
          .update({ points: wallet.points + order.points })
          .eq('user_id', order.user_id)
      }

      console.log(`✅ 充值确认: ${order.id} - ${order.amount} USDT`)
    }
  }
}

export const startMonitor = () => {
  console.log('🚀 USDT 监控已启动' + (API_KEY ? ' (已认证)' : ' (未认证)'))
  checkRechargeOrders()
  setInterval(() => {
    checkRechargeOrders()
  }, 30000)
}
