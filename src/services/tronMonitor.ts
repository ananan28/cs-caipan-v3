import { supabase } from '../lib/supabase'

const TRONGRID_API = 'https://api.trongrid.io'
const USDT_CONTRACT = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t'

export const getTransactions = async (address: string, limit: number = 20) => {
  try {
    const response = await fetch(
      `${TRONGRID_API}/v1/accounts/${address}/transactions/trc20?limit=${limit}&only_confirmed=true&contract_address=${USDT_CONTRACT}`
    )
    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error('获取交易失败:', error)
    return []
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
    const txs = await getTransactions(order.address, 5)
    
    for (const tx of txs) {
      const amount = parseFloat(tx.value) / 1e6
      
      if (amount >= order.amount && tx.to === order.address) {
        await supabase
          .from('recharge_orders')
          .update({
            status: 'completed',
            tx_hash: tx.transaction_id,
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

        console.log(`✅ 充值确认: ${order.id} - ${amount} USDT`)
      }
    }
  }
}

export const startMonitor = () => {
  console.log('🚀 USDT 监控已启动')
  checkRechargeOrders()
  setInterval(() => {
    checkRechargeOrders()
  }, 30000)
}
