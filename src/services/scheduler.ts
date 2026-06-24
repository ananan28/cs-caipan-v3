import { supabase } from '../lib/supabase'
import { checkRechargeOrders } from './tronMonitor'

export const runScheduledTasks = async () => {
  console.log('⏰ 定时任务执行:', new Date().toISOString())

  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString()
  await supabase
    .from('recharge_orders')
    .update({ status: 'expired' })
    .eq('status', 'pending')
    .lt('created_at', thirtyMinutesAgo)

  await checkRechargeOrders()
  console.log('✅ 定时任务完成')
}

export const startScheduler = () => {
  console.log('🚀 定时调度器已启动')
  runScheduledTasks()
  setInterval(() => {
    runScheduledTasks()
  }, 60000)
}
