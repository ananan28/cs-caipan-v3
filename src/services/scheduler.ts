import { supabase } from '@/lib/supabase'

// 执行定时任务
export const runScheduledTasks = async () => {
  console.log('⏰ 定时任务执行:', new Date().toISOString())

  // 1. 清理过期订单（超过30分钟未支付）
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString()
  const { data: expired } = await supabase
    .from('recharge_orders')
    .update({ status: 'expired' })
    .eq('status', 'pending')
    .lt('created_at', thirtyMinutesAgo)
    .select()

  if (expired && expired.length > 0) {
    console.log(`⏰ 已过期 ${expired.length} 笔订单`)
  }

  // 2. 检查待处理的邀请
  const { data: pendingInvites } = await supabase
    .from('invites')
    .select('*')
    .eq('status', 'pending')
    .lt('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

  if (pendingInvites && pendingInvites.length > 0) {
    console.log(`📋 待处理邀请: ${pendingInvites.length} 条`)
  }

  console.log('✅ 定时任务完成')
}

// 启动定时调度器（每60秒执行一次）
export const startScheduler = () => {
  console.log('🚀 定时调度器已启动')
  runScheduledTasks()
  setInterval(() => {
    runScheduledTasks()
  }, 60000)
}
